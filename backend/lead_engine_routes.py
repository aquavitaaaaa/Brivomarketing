"""
Admin API routes for the Autonomous Client Acquisition Engine.

Exposed under /api/admin/leads/*

Endpoints:
  GET  /admin/leads/pipeline          -> stage counts for the dashboard
  GET  /admin/leads                   -> list leads (filter by stage)
  POST /admin/leads/discover-now      -> kick off one discovery tick on demand
  POST /admin/leads/{id}/dispatch     -> manually compose+dispatch for one lead
  POST /admin/leads/{id}/reply        -> simulate inbound reply (also used by webhook)
  POST /admin/leads/{id}/stage        -> manual stage transition (admin override)
  POST /admin/leads/import            -> bulk import leads from a CSV-like array
  GET  /admin/outreach/jobs           -> list outreach jobs (for audit)
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import get_current_admin
import lead_engine

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_STAGES = {
    "discovered", "queued", "contacted", "replied",
    "qualified", "booked", "negative",
}


class ReplyPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)


class StageUpdate(BaseModel):
    stage: str


class LeadImport(BaseModel):
    leads: list[dict] = Field(default_factory=list)


@router.get("/admin/leads/pipeline")
async def get_pipeline(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    return await lead_engine.pipeline_stats(db)


@router.get("/admin/leads")
async def list_leads(
    stage: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    admin=Depends(get_current_admin),
):
    db = router.db  # type: ignore[attr-defined]
    q: dict = {}
    if stage:
        if stage not in VALID_STAGES:
            raise HTTPException(400, f"Invalid stage. Must be one of {sorted(VALID_STAGES)}")
        q["stage"] = stage
    cur = db.leads.find(q, {"_id": 0}).sort("signal_score", -1).limit(limit)
    return {"leads": await cur.to_list(length=limit)}


# NOTE: these literal routes MUST be declared before the dynamic /{lead_id} route
# below, otherwise FastAPI will route 'auto-qualify' / 'analytics' / 'discover-now'
# / 'import' as a lead_id.
@router.post("/admin/leads/discover-now")
async def discover_now(payload: dict | None = None, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    subs = None
    if payload and isinstance(payload.get("subreddits"), list):
        subs = [str(s) for s in payload["subreddits"] if s][:30]
    inserted = await lead_engine.discovery_tick(db, subreddits=subs)
    stats = await lead_engine.pipeline_stats(db)
    return {"new_leads": inserted, "pipeline": stats}


@router.post("/admin/leads/import")
async def import_leads(payload: LeadImport, admin=Depends(get_current_admin)):
    """Bulk-import leads from an array of {url, title, snippet, author, source}.

    Used for cold-list uploads (e.g. CSV of LinkedIn profiles or scraped sites).
    """
    db = router.db  # type: ignore[attr-defined]
    inserted = 0
    for raw in payload.leads:
        if not raw.get("source") or not raw.get("source_id"):
            # generate a stable source_id from url if missing
            raw.setdefault("source", "import")
            raw.setdefault("source_id", raw.get("url") or lead_engine._new_id())
        rec = await lead_engine.upsert_lead(db, raw)
        if rec:
            inserted += 1
    return {"inserted": inserted, "submitted": len(payload.leads)}


@router.post("/admin/leads/auto-qualify")
async def auto_qualify(payload: dict | None = None, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    limit = 20
    min_score = 60
    if payload:
        limit = int(payload.get("limit") or 20)
        min_score = int(payload.get("min_score") or 60)
    return await lead_engine.auto_qualify_all_discovered(db, limit=limit, min_score=min_score)


@router.get("/admin/leads/analytics")
async def get_analytics(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    return await lead_engine.outreach_analytics(db)


@router.get("/admin/leads/{lead_id}")
async def get_lead(lead_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    doc = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Lead not found")
    return doc


@router.post("/admin/leads/{lead_id}/dispatch")
async def dispatch_lead(lead_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(404, "Lead not found")
    job = await lead_engine.dispatch_one_lead(db, lead)
    if not job:
        raise HTTPException(429, "Outreach blocked (cap or spacing). Try again later.")
    return {"job": job}


@router.post("/admin/leads/{lead_id}/reply")
async def lead_reply(lead_id: str, payload: ReplyPayload, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    res = await lead_engine.handle_inbound_reply(db, lead_id, payload.message)
    return res


@router.post("/admin/leads/{lead_id}/stage")
async def update_stage(lead_id: str, payload: StageUpdate, admin=Depends(get_current_admin)):
    if payload.stage not in VALID_STAGES:
        raise HTTPException(400, f"Invalid stage. Must be one of {sorted(VALID_STAGES)}")
    db = router.db  # type: ignore[attr-defined]
    res = await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"stage": payload.stage,
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Lead not found")
    return {"ok": True, "stage": payload.stage}


@router.post("/admin/leads/{lead_id}/qualify")
async def qualify_lead_endpoint(lead_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    try:
        q = await lead_engine.qualify_lead(db, lead_id)
        return {"qualifier": q}
    except ValueError:
        raise HTTPException(404, "Lead not found")


@router.get("/admin/outreach/jobs")
async def list_outreach_jobs(
    limit: int = Query(100, ge=1, le=500),
    admin=Depends(get_current_admin),
):
    db = router.db  # type: ignore[attr-defined]
    cur = db.outreach_jobs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return {"jobs": await cur.to_list(length=limit)}


def attach(db) -> None:
    router.db = db  # type: ignore[attr-defined]
