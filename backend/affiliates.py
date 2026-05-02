"""
BrivoMarketing — Affiliate / Partner Program
============================================

Public flow:
    1. Job seeker applies via POST /api/affiliates/apply
    2. Admin reviews application and approves it -> Affiliate doc is created
       with a unique ref_code and a default Bronze tier.
    3. Approved affiliate shares their ref link:
            https://brivomarketing.com/?ref=<CODE>
    4. When an inquiry is submitted with a ref_code (or with the cookie set
       by /partners landing), an AffiliateReferral row is created and tied
       to the affiliate.
    5. Admin marks the referred lead as 'won' once the client signs up and
       pays their first month. This locks in the client_mrr ($) and triggers
       a signing bonus + the first recurring commission.
    6. Each month the admin (or a cron) calls /commissions/run which
       inserts a new "recurring" commission entry for every still-active
       referral. Commissions can then be marked paid.

Tier ladder (incentive-stacking — harder you work, more you earn):
    Bronze   1-3   active clients   15% recurring
    Silver   4-9   active clients   20% recurring
    Gold     10-24 active clients   25% recurring  + $500 milestone @10
    Platinum 25+   active clients   30% recurring  + $2,500 quarterly bonus

All percentages apply to the client's monthly MRR for as long as the client
remains active. A signing bonus equal to the recurring rate is paid on the
client's first month.
"""

from __future__ import annotations

import os
import re
import secrets
import string
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from auth import get_current_admin

# ------------------------------------------------------------------------
# Tier configuration
# ------------------------------------------------------------------------
TIERS: List[Dict[str, Any]] = [
    {
        "id": "bronze",
        "name": "Bronze",
        "min_active": 1,
        "max_active": 3,
        "rate": 0.15,                 # 15 %
        "signing_bonus_rate": 0.15,
        "milestone_bonus": 0,
        "perks": [
            "15% recurring commission for the lifetime of every client",
            "15% signing bonus on the first month",
            "Personal referral link + tracking dashboard",
        ],
    },
    {
        "id": "silver",
        "name": "Silver",
        "min_active": 4,
        "max_active": 9,
        "rate": 0.20,
        "signing_bonus_rate": 0.20,
        "milestone_bonus": 0,
        "perks": [
            "20% recurring commission, lifetime",
            "20% signing bonus",
            "Co-branded sales collateral & decks",
        ],
    },
    {
        "id": "gold",
        "name": "Gold",
        "min_active": 10,
        "max_active": 24,
        "rate": 0.25,
        "signing_bonus_rate": 0.25,
        "milestone_bonus": 500,        # one-time at first jump into Gold
        "perks": [
            "25% recurring commission, lifetime",
            "25% signing bonus",
            "$500 one-time bonus when you hit Gold",
            "Direct strategist on every deal",
        ],
    },
    {
        "id": "platinum",
        "name": "Platinum",
        "min_active": 25,
        "max_active": 10_000,
        "rate": 0.30,
        "signing_bonus_rate": 0.30,
        "milestone_bonus": 2500,       # one-time at first jump into Platinum
        "perks": [
            "30% recurring commission, lifetime",
            "30% signing bonus",
            "$2,500 quarterly performance bonus",
            "White-label portal & priority pipeline",
            "Equity / advisory consideration",
        ],
    },
]


def tier_for(active_clients: int) -> Dict[str, Any]:
    for t in TIERS:
        if t["min_active"] <= active_clients <= t["max_active"]:
            return t
    return TIERS[0]


# ------------------------------------------------------------------------
# Models
# ------------------------------------------------------------------------
class AffiliateApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    channels: Optional[str] = None             # "linkedin, instagram, network"
    audience_size: Optional[str] = None
    portfolio_url: Optional[str] = None
    expected_clients_per_month: Optional[str] = None
    why_join: Optional[str] = None
    referral_source: Optional[str] = None      # how they heard about us


class AffiliateApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    channels: Optional[str] = None
    audience_size: Optional[str] = None
    portfolio_url: Optional[str] = None
    expected_clients_per_month: Optional[str] = None
    why_join: Optional[str] = None
    referral_source: Optional[str] = None
    status: str = "pending"                    # pending | approved | rejected
    notes: Optional[str] = None
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class WonRequest(BaseModel):
    client_mrr: float
    client_company: Optional[str] = None
    notes: Optional[str] = None


class StageRequest(BaseModel):
    stage: str   # qualified | won | lost | churned


class CommissionUpdate(BaseModel):
    status: str  # pending | paid | void
    payout_method: Optional[str] = None
    payout_reference: Optional[str] = None


# ------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------
REF_ALPHABET = string.ascii_uppercase + string.digits  # no easily-confused chars


def _generate_ref_code(name: str = "") -> str:
    """BRV-<initials><6 random>. e.g. BRV-JD9X4K2"""
    initials = "".join(re.findall(r"[A-Za-z]", (name or ""))[:2]).upper() or "BR"
    suffix = "".join(secrets.choice(REF_ALPHABET) for _ in range(6))
    return f"BRV-{initials}{suffix}"


async def _ensure_unique_ref(db, code: str, attempt_name: str = "") -> str:
    for _ in range(8):
        existing = await db.affiliates.find_one({"ref_code": code})
        if not existing:
            return code
        code = _generate_ref_code(attempt_name)
    raise RuntimeError("Could not generate unique ref_code")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _period_key(dt: Optional[datetime] = None) -> str:
    dt = dt or datetime.now(timezone.utc)
    return dt.strftime("%Y-%m")


async def _refresh_affiliate_stats(db, affiliate_id: str) -> Dict[str, Any]:
    """Recompute active_clients / tier / earnings for one affiliate."""
    affiliate = await db.affiliates.find_one({"id": affiliate_id})
    if not affiliate:
        return {}

    referrals = await db.affiliate_referrals.find(
        {"affiliate_id": affiliate_id}
    ).to_list(2000)

    active_clients = sum(1 for r in referrals if r.get("stage") == "won")
    total_referred = len(referrals)

    commissions = await db.affiliate_commissions.find(
        {"affiliate_id": affiliate_id}
    ).to_list(5000)
    total_earned = sum(c.get("amount", 0.0) for c in commissions)
    total_paid = sum(
        c.get("amount", 0.0) for c in commissions if c.get("status") == "paid"
    )
    total_pending = sum(
        c.get("amount", 0.0) for c in commissions if c.get("status") == "pending"
    )

    tier = tier_for(active_clients)
    prev_tier = affiliate.get("tier") or "bronze"

    update = {
        "active_clients": active_clients,
        "total_referred": total_referred,
        "total_earned": round(total_earned, 2),
        "total_paid": round(total_paid, 2),
        "total_pending": round(total_pending, 2),
        "tier": tier["id"],
        "tier_name": tier["name"],
        "rate": tier["rate"],
        "updated_at": _now_iso(),
    }

    # Milestone bonus on first arrival into a tier with one
    tier_order = ["bronze", "silver", "gold", "platinum"]
    if (
        tier["milestone_bonus"]
        and tier_order.index(tier["id"]) > tier_order.index(prev_tier)
    ):
        existing_milestone = await db.affiliate_commissions.find_one({
            "affiliate_id": affiliate_id,
            "type": "milestone",
            "tier": tier["id"],
        })
        if not existing_milestone:
            await db.affiliate_commissions.insert_one({
                "id": str(uuid.uuid4()),
                "affiliate_id": affiliate_id,
                "referred_lead_id": None,
                "period": _period_key(),
                "amount": float(tier["milestone_bonus"]),
                "percentage": 0,
                "type": "milestone",
                "tier": tier["id"],
                "status": "pending",
                "note": f"Milestone bonus for reaching {tier['name']} tier",
                "created_at": _now_iso(),
            })

    await db.affiliates.update_one({"id": affiliate_id}, {"$set": update})
    affiliate.update(update)
    affiliate.pop("_id", None)
    return affiliate


def _scrub(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


# ------------------------------------------------------------------------
# Router
# ------------------------------------------------------------------------
router = APIRouter()
_db = None


def attach(db) -> None:
    global _db
    _db = db


def _require_db():
    if _db is None:
        raise HTTPException(status_code=500, detail="Affiliate routes not initialised")
    return _db


# ---------- public ----------
@router.get("/affiliates/program")
async def get_program():
    """Public commission structure for the /partners landing page."""
    return {
        "tiers": TIERS,
        "headline": "Refer clients. Get paid every month they stay.",
        "subheadline": (
            "Lifetime recurring commissions on every paying client you bring. "
            "No cap. Climb tiers and earn more on every deal."
        ),
        "examples": [
            {
                "tier": "Bronze",
                "client_plan": "IGNITE",
                "client_mrr": 2500,
                "monthly_payout": round(2500 * 0.15, 2),
                "annualized": round(2500 * 0.15 * 12, 2),
            },
            {
                "tier": "Silver",
                "client_plan": "ACCELERATE",
                "client_mrr": 7500,
                "monthly_payout": round(7500 * 0.20, 2),
                "annualized": round(7500 * 0.20 * 12, 2),
            },
            {
                "tier": "Gold",
                "client_plan": "ACCELERATE × 10",
                "client_mrr": 75000,
                "monthly_payout": round(75000 * 0.25, 2),
                "annualized": round(75000 * 0.25 * 12, 2),
            },
            {
                "tier": "Platinum",
                "client_plan": "DOMINATE × 25",
                "client_mrr": 375000,
                "monthly_payout": round(375000 * 0.30, 2),
                "annualized": round(375000 * 0.30 * 12, 2),
            },
        ],
    }


@router.post("/affiliates/apply", response_model=AffiliateApplication)
async def submit_application(payload: AffiliateApplicationCreate, request: Request):
    db = _require_db()
    # Simple rate-limit: same email cannot reapply if pending or approved
    email = payload.email.lower().strip()
    existing = await db.affiliate_applications.find_one({"email": email})
    if existing and existing.get("status") in ("pending", "approved"):
        raise HTTPException(
            status_code=409,
            detail="You already have an application on file. We'll be in touch.",
        )

    application = AffiliateApplication(**{**payload.model_dump(), "email": email})
    doc = application.model_dump()
    doc["ip"] = request.client.host if request.client else None
    doc["ua"] = request.headers.get("user-agent")
    await db.affiliate_applications.insert_one(doc)
    return application


@router.get("/affiliates/track")
async def track_ref_click(ref: str = Query(...), request: Request = None):
    """Bumps click counter for a ref_code (used as <img src=...> beacon)."""
    db = _require_db()
    ref = ref.upper().strip()
    affiliate = await db.affiliates.find_one({"ref_code": ref})
    if not affiliate:
        return {"ok": False}
    await db.affiliates.update_one(
        {"id": affiliate["id"]},
        {"$inc": {"clicks": 1}, "$set": {"last_click_at": _now_iso()}},
    )
    return {"ok": True}


# ---------- admin: applications ----------
@router.get("/admin/affiliates/applications")
async def list_applications(
    status: Optional[str] = None,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    q = {"status": status} if status else {}
    docs = await db.affiliate_applications.find(
        q, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return {"applications": docs}


@router.post("/admin/affiliates/applications/{app_id}/approve")
async def approve_application(
    app_id: str,
    body: Optional[Dict[str, Any]] = None,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    app_doc = await db.affiliate_applications.find_one({"id": app_id})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    if app_doc.get("status") == "approved":
        affiliate = await db.affiliates.find_one(
            {"application_id": app_id}, {"_id": 0}
        )
        return {"affiliate": affiliate, "already": True}

    code = await _ensure_unique_ref(
        db, _generate_ref_code(app_doc.get("name", "")), app_doc.get("name", "")
    )

    affiliate = {
        "id": str(uuid.uuid4()),
        "application_id": app_id,
        "name": app_doc.get("name"),
        "email": app_doc.get("email"),
        "phone": app_doc.get("phone"),
        "ref_code": code,
        "tier": "bronze",
        "tier_name": "Bronze",
        "rate": TIERS[0]["rate"],
        "active_clients": 0,
        "total_referred": 0,
        "total_earned": 0.0,
        "total_paid": 0.0,
        "total_pending": 0.0,
        "clicks": 0,
        "status": "active",
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.affiliates.insert_one(affiliate)
    await db.affiliate_applications.update_one(
        {"id": app_id},
        {"$set": {
            "status": "approved",
            "approved_at": _now_iso(),
            "ref_code": code,
        }},
    )
    affiliate.pop("_id", None)
    return {"affiliate": affiliate, "already": False}


@router.post("/admin/affiliates/applications/{app_id}/reject")
async def reject_application(
    app_id: str,
    body: Optional[Dict[str, Any]] = None,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    note = (body or {}).get("note")
    res = await db.affiliate_applications.update_one(
        {"id": app_id},
        {"$set": {"status": "rejected", "rejected_at": _now_iso(), "note": note}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"ok": True}


# ---------- admin: affiliates ----------
@router.get("/admin/affiliates")
async def list_affiliates(admin: dict = Depends(get_current_admin)):
    db = _require_db()
    docs = await db.affiliates.find({}, {"_id": 0}).sort("total_earned", -1).to_list(500)

    pending_apps = await db.affiliate_applications.count_documents({"status": "pending"})
    total_active_clients = sum(d.get("active_clients", 0) for d in docs)
    total_paid = sum(d.get("total_paid", 0) for d in docs)
    total_pending_payout = sum(d.get("total_pending", 0) for d in docs)

    return {
        "affiliates": docs,
        "totals": {
            "affiliates": len(docs),
            "pending_applications": pending_apps,
            "active_clients": total_active_clients,
            "paid_out": round(total_paid, 2),
            "pending_payout": round(total_pending_payout, 2),
        },
    }


@router.get("/admin/affiliates/{affiliate_id}")
async def get_affiliate_detail(
    affiliate_id: str, admin: dict = Depends(get_current_admin)
):
    db = _require_db()
    affiliate = await db.affiliates.find_one({"id": affiliate_id}, {"_id": 0})
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    referrals = await db.affiliate_referrals.find(
        {"affiliate_id": affiliate_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    commissions = await db.affiliate_commissions.find(
        {"affiliate_id": affiliate_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return {
        "affiliate": affiliate,
        "referrals": referrals,
        "commissions": commissions,
    }


@router.post("/admin/affiliates/{affiliate_id}/suspend")
async def suspend_affiliate(
    affiliate_id: str,
    body: Optional[Dict[str, Any]] = None,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    new_status = (body or {}).get("status", "suspended")
    res = await db.affiliates.update_one(
        {"id": affiliate_id}, {"$set": {"status": new_status, "updated_at": _now_iso()}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return {"ok": True, "status": new_status}


# ---------- admin: referrals ----------
@router.post("/admin/affiliates/referrals/{ref_id}/stage")
async def update_referral_stage(
    ref_id: str,
    payload: StageRequest,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    if payload.stage not in {"referred", "qualified", "won", "lost", "churned"}:
        raise HTTPException(status_code=400, detail="Invalid stage")
    referral = await db.affiliate_referrals.find_one({"id": ref_id})
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")

    update = {"stage": payload.stage, "updated_at": _now_iso()}
    if payload.stage == "won":
        update["won_at"] = _now_iso()
    if payload.stage == "churned":
        update["churned_at"] = _now_iso()
    await db.affiliate_referrals.update_one({"id": ref_id}, {"$set": update})
    await _refresh_affiliate_stats(db, referral["affiliate_id"])
    return {"ok": True, "stage": payload.stage}


@router.post("/admin/affiliates/referrals/{ref_id}/win")
async def mark_referral_won(
    ref_id: str,
    payload: WonRequest,
    admin: dict = Depends(get_current_admin),
):
    """Lock client_mrr, mark referral 'won', emit signing bonus + first recurring."""
    db = _require_db()
    referral = await db.affiliate_referrals.find_one({"id": ref_id})
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    if payload.client_mrr <= 0:
        raise HTTPException(status_code=400, detail="client_mrr must be > 0")

    affiliate = await db.affiliates.find_one({"id": referral["affiliate_id"]})
    if not affiliate:
        raise HTTPException(status_code=404, detail="Affiliate missing")

    # Compute the affiliate's tier *before* counting this new client
    tier = tier_for(affiliate.get("active_clients", 0) + 1)
    rate = tier["rate"]
    bonus_rate = tier["signing_bonus_rate"]
    period = _period_key()

    update = {
        "stage": "won",
        "client_mrr": float(payload.client_mrr),
        "client_company": payload.client_company,
        "won_at": _now_iso(),
        "updated_at": _now_iso(),
        "locked_rate": rate,
        "notes": payload.notes,
    }
    await db.affiliate_referrals.update_one({"id": ref_id}, {"$set": update})

    # Signing bonus
    await db.affiliate_commissions.insert_one({
        "id": str(uuid.uuid4()),
        "affiliate_id": affiliate["id"],
        "referred_lead_id": ref_id,
        "period": period,
        "amount": round(payload.client_mrr * bonus_rate, 2),
        "percentage": bonus_rate,
        "type": "signing_bonus",
        "status": "pending",
        "note": f"Signing bonus — {payload.client_company or referral.get('lead_email', '')}",
        "created_at": _now_iso(),
    })
    # First recurring commission for this period
    await db.affiliate_commissions.insert_one({
        "id": str(uuid.uuid4()),
        "affiliate_id": affiliate["id"],
        "referred_lead_id": ref_id,
        "period": period,
        "amount": round(payload.client_mrr * rate, 2),
        "percentage": rate,
        "type": "recurring",
        "status": "pending",
        "note": f"{period} recurring — {payload.client_company or referral.get('lead_email', '')}",
        "created_at": _now_iso(),
    })

    await _refresh_affiliate_stats(db, affiliate["id"])
    return {"ok": True}


# ---------- admin: commissions ----------
@router.post("/admin/affiliates/commissions/run")
async def run_monthly_commissions(
    body: Optional[Dict[str, Any]] = None,
    admin: dict = Depends(get_current_admin),
):
    """Idempotently insert recurring commissions for the current period.

    For every active referral (stage='won', client_mrr > 0) ensure a
    'recurring' commission exists for the given period at the locked rate.
    Defaults to the current calendar month.
    """
    db = _require_db()
    period = (body or {}).get("period") or _period_key()
    inserted = 0
    skipped = 0

    referrals = await db.affiliate_referrals.find({
        "stage": "won",
        "client_mrr": {"$gt": 0},
    }).to_list(5000)

    for r in referrals:
        existing = await db.affiliate_commissions.find_one({
            "referred_lead_id": r["id"],
            "period": period,
            "type": "recurring",
        })
        if existing:
            skipped += 1
            continue
        rate = r.get("locked_rate")
        if rate is None:
            affiliate = await db.affiliates.find_one({"id": r["affiliate_id"]})
            rate = affiliate.get("rate", TIERS[0]["rate"]) if affiliate else TIERS[0]["rate"]
        amount = round(float(r["client_mrr"]) * float(rate), 2)
        await db.affiliate_commissions.insert_one({
            "id": str(uuid.uuid4()),
            "affiliate_id": r["affiliate_id"],
            "referred_lead_id": r["id"],
            "period": period,
            "amount": amount,
            "percentage": rate,
            "type": "recurring",
            "status": "pending",
            "note": f"{period} recurring — {r.get('client_company') or r.get('lead_email', '')}",
            "created_at": _now_iso(),
        })
        inserted += 1

    # Refresh totals
    aff_ids = list({r["affiliate_id"] for r in referrals})
    for aid in aff_ids:
        await _refresh_affiliate_stats(db, aid)

    return {"period": period, "inserted": inserted, "skipped": skipped}


@router.get("/admin/affiliates/commissions/all")
async def list_all_commissions(
    status: Optional[str] = None,
    period: Optional[str] = None,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    if period:
        q["period"] = period
    docs = await db.affiliate_commissions.find(
        q, {"_id": 0}
    ).sort("created_at", -1).to_list(2000)
    # Hydrate affiliate names
    aff_ids = list({d["affiliate_id"] for d in docs})
    affiliates = await db.affiliates.find(
        {"id": {"$in": aff_ids}}, {"_id": 0, "id": 1, "name": 1, "email": 1, "ref_code": 1}
    ).to_list(2000)
    by_id = {a["id"]: a for a in affiliates}
    for d in docs:
        a = by_id.get(d["affiliate_id"])
        if a:
            d["affiliate_name"] = a["name"]
            d["affiliate_email"] = a["email"]
            d["affiliate_ref_code"] = a["ref_code"]
    return {"commissions": docs}


@router.patch("/admin/affiliates/commissions/{commission_id}")
async def update_commission(
    commission_id: str,
    payload: CommissionUpdate,
    admin: dict = Depends(get_current_admin),
):
    db = _require_db()
    if payload.status not in {"pending", "paid", "void"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    update: Dict[str, Any] = {"status": payload.status, "updated_at": _now_iso()}
    if payload.status == "paid":
        update["paid_at"] = _now_iso()
        update["payout_method"] = payload.payout_method
        update["payout_reference"] = payload.payout_reference
    res = await db.affiliate_commissions.update_one(
        {"id": commission_id}, {"$set": update}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commission not found")
    commission = await db.affiliate_commissions.find_one(
        {"id": commission_id}, {"_id": 0}
    )
    if commission:
        await _refresh_affiliate_stats(db, commission["affiliate_id"])
    return {"ok": True, "commission": commission}


# ------------------------------------------------------------------------
# Inquiry attribution helper (called from server.py when an inquiry lands)
# ------------------------------------------------------------------------
async def attach_inquiry_to_affiliate(
    db, *, ref_code: Optional[str], inquiry: Dict[str, Any]
) -> Optional[str]:
    """If ref_code matches an active affiliate, create a referral row.
    Returns the referral id or None.
    """
    if not ref_code:
        return None
    code = ref_code.strip().upper()
    affiliate = await db.affiliates.find_one(
        {"ref_code": code, "status": "active"}
    )
    if not affiliate:
        return None
    referral_id = str(uuid.uuid4())
    await db.affiliate_referrals.insert_one({
        "id": referral_id,
        "affiliate_id": affiliate["id"],
        "ref_code": code,
        "inquiry_id": inquiry.get("id"),
        "lead_email": inquiry.get("email"),
        "lead_name": inquiry.get("name"),
        "lead_company": inquiry.get("company"),
        "service_interest": inquiry.get("service_interest"),
        "stage": "referred",
        "client_mrr": None,
        "created_at": _now_iso(),
    })
    await db.affiliates.update_one(
        {"id": affiliate["id"]},
        {"$inc": {"total_referred": 1}, "$set": {"updated_at": _now_iso()}},
    )
    return referral_id


# Indexes
async def ensure_indexes(db):
    try:
        await db.affiliate_applications.create_index("email")
        await db.affiliate_applications.create_index("status")
        await db.affiliate_applications.create_index("created_at")
        await db.affiliates.create_index("ref_code", unique=True)
        await db.affiliates.create_index("email")
        await db.affiliate_referrals.create_index("affiliate_id")
        await db.affiliate_referrals.create_index("ref_code")
        await db.affiliate_referrals.create_index("stage")
        await db.affiliate_referrals.create_index("inquiry_id")
        await db.affiliate_commissions.create_index("affiliate_id")
        await db.affiliate_commissions.create_index("status")
        await db.affiliate_commissions.create_index("period")
    except Exception:
        pass
