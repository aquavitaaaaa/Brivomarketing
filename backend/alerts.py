"""Instant alerts — email (Resend) + SMS (Twilio) for new inquiries and hot leads.

Env (all optional; channels without keys are skipped and logged as 'skipped'):
  RESEND_API_KEY, SENDER_EMAIL, NOTIFY_EMAIL (comma-separated ok)
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
  ALERT_SMS_TO            — your mobile in E.164, comma-separated ok
  HOT_LEAD_THRESHOLD      — signal_score that counts as "hot" (default 75)
  HOT_LEAD_DAILY_CAP      — max hot-lead alerts per rolling day (default 20)
"""
import os
import asyncio
import logging
import html as html_lib
import uuid
from datetime import datetime, timezone, timedelta

import httpx
from fastapi import APIRouter, Depends

import email_client
from auth import get_current_admin

logger = logging.getLogger("alerts")
router = APIRouter(prefix="/admin/alerts")


def attach(db) -> None:
    router.db = db  # type: ignore[attr-defined]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sms_configured() -> bool:
    return all(os.environ.get(k, "").strip() for k in
               ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER", "ALERT_SMS_TO"))


async def send_sms(body: str) -> dict:
    if not sms_configured():
        return {"ok": False, "error": "Twilio not configured"}
    sid = os.environ["TWILIO_ACCOUNT_SID"].strip()
    token = os.environ["TWILIO_AUTH_TOKEN"].strip()
    sender = os.environ["TWILIO_FROM_NUMBER"].strip()
    targets = [t.strip() for t in os.environ["ALERT_SMS_TO"].split(",") if t.strip()]
    errors = []
    async with httpx.AsyncClient(timeout=20) as c:
        for to in targets:
            try:
                r = await c.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                    auth=(sid, token),
                    data={"From": sender, "To": to, "Body": body[:1500]},
                )
                if r.status_code >= 300:
                    errors.append(f"{to}: {r.text[:120]}")
            except Exception as e:
                errors.append(f"{to}: {str(e)[:100]}")
    return {"ok": not errors, "error": "; ".join(errors) or None}


def _esc(v) -> str:
    return html_lib.escape(str(v)) if v is not None else ""


def _wrap(title: str, rows_html: str) -> str:
    return f"""<!doctype html><html><body style="margin:0;background:#0b0b0f;font-family:-apple-system,Segoe UI,sans-serif;">
<table width="100%" style="padding:28px 0;"><tr><td align="center">
<table width="600" style="background:#13131c;border:1px solid #2a2a36;border-radius:4px;color:#e7e7f0;">
<tr><td style="padding:26px 28px 6px;"><div style="font-family:monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#CCFF00;">/ Brivo alert</div>
<h1 style="margin:10px 0 0;font-size:24px;color:#fff;">{_esc(title)}</h1></td></tr>
<tr><td style="padding:14px 28px 26px;font-size:14px;line-height:1.6;">{rows_html}</td></tr></table></td></tr></table></body></html>"""


async def _record(db, kind: str, title: str, detail: str, email_res: dict, sms_res: dict, ref=None) -> dict:
    doc = {
        "id": str(uuid.uuid4()), "kind": kind, "title": title, "detail": detail,
        "ref_id": ref, "created_at": _now(), "read": False,
        "email": "sent" if email_res.get("ok") else f"skipped: {email_res.get('error')}",
        "sms": "sent" if sms_res.get("ok") else f"skipped: {sms_res.get('error')}",
    }
    await db.alerts.insert_one(dict(doc))
    return doc


async def notify_inquiry(db, inquiry: dict) -> None:
    """New inbound inquiry: rich lead email (existing) + SMS ping + dashboard alert."""
    try:
        email_res = {"ok": False, "error": "RESEND_API_KEY not set"}
        if email_client.is_configured():
            await email_client.send_new_lead_notification(inquiry)
            email_res = {"ok": True}
        name = inquiry.get("name") or "Someone"
        svc = inquiry.get("service_interest") or "inquiry"
        sms_res = await send_sms(
            f"NEW LEAD: {name} ({inquiry.get('email')}) - {svc}. "
            f"Budget: {inquiry.get('budget') or 'n/a'}. Reply fast, first responder wins."
        )
        await _record(db, "inquiry", f"New lead · {name}", f"{svc} · {inquiry.get('email')}",
                      email_res, sms_res, inquiry.get("id"))
    except Exception:
        logger.exception("notify_inquiry failed")


async def notify_call(db, caller: str, direction: str, length) -> None:
    try:
        title = f"{direction.title()} AI-operator call · {caller}"
        detail = f"Duration {length}s. Transcript in Control Room → Calls."
        email_res = await email_client.send_email(
            os.environ.get("NOTIFY_EMAIL", ""), title,
            _wrap(title, f"<p>{_esc(detail)}</p>"))
        sms_res = await send_sms(f"AI operator call from {caller} ({length}s). Check Control Room > Calls.")
        await _record(db, "call", title, detail, email_res, sms_res)
    except Exception:
        logger.exception("notify_call failed")


def _threshold() -> int:
    return int(os.environ.get("HOT_LEAD_THRESHOLD", "75"))


async def _alert_hot_leads(db) -> int:
    cap = int(os.environ.get("HOT_LEAD_DAILY_CAP", "20"))
    since = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    sent_today = await db.alerts.count_documents({"kind": "hot_lead", "created_at": {"$gte": since}})
    room = cap - sent_today
    if room <= 0:
        return 0
    leads = await db.leads.find(
        {"signal_score": {"$gte": _threshold()}, "hot_alerted_at": {"$exists": False},
         "stage": {"$nin": ["dead", "rejected", "lost"]}},
        {"_id": 0},
    ).sort("signal_score", -1).limit(min(5, room)).to_list(length=5)
    if not leads:
        return 0
    ids = [l["id"] for l in leads]
    await db.leads.update_many({"id": {"$in": ids}}, {"$set": {"hot_alerted_at": _now()}})

    rows = "".join(
        f"""<div style="padding:12px 0;border-top:1px solid #2a2a36;">
<strong style="color:#CCFF00;">{_esc(l.get('signal_score'))}/100</strong> · {_esc(l.get('source'))}<br/>
<span style="color:#fff;">{_esc(l.get('title'))}</span><br/>
<a href="{_esc(l.get('url') or '#')}" style="color:#7aff00;">{_esc(l.get('url') or '')}</a></div>"""
        for l in leads)
    top = leads[0]
    title = f"{len(leads)} hot lead{'s' if len(leads) > 1 else ''} discovered"
    email_res = await email_client.send_email(
        os.environ.get("NOTIFY_EMAIL", ""), f"HOT LEAD · {top.get('title', '')[:70]}", _wrap(title, rows))
    sms_res = await send_sms(
        f"HOT LEAD ({top.get('signal_score')}/100, {top.get('source')}): {top.get('title', '')[:110]}"
        + (f" +{len(leads) - 1} more" if len(leads) > 1 else "") + f" {top.get('url') or ''}")
    await _record(db, "hot_lead", title, " | ".join(l.get("title", "")[:80] for l in leads),
                  email_res, sms_res, top["id"])
    logger.info("Hot-lead alert dispatched for %d lead(s)", len(leads))
    return len(leads)


async def hot_lead_alert_loop(db) -> None:
    logger.info("Hot-lead alert loop started (threshold=%d)", _threshold())
    while True:
        try:
            await _alert_hot_leads(db)
        except Exception:
            logger.exception("hot-lead alert tick failed")
        await asyncio.sleep(90)


@router.get("/status")
async def alerts_status(admin=Depends(get_current_admin)):
    return {
        "email_configured": email_client.is_configured(),
        "notify_email": os.environ.get("NOTIFY_EMAIL", ""),
        "sender_email": os.environ.get("SENDER_EMAIL", "") or "onboarding@resend.dev",
        "sms_configured": sms_configured(),
        "sms_to": os.environ.get("ALERT_SMS_TO", ""),
        "hot_threshold": _threshold(),
        "daily_cap": int(os.environ.get("HOT_LEAD_DAILY_CAP", "20")),
        "bland_configured": bool(os.environ.get("BLAND_API_KEY", "").strip()),
        "bland_inbound_number": bool(os.environ.get("BLAND_INBOUND_NUMBER", "").strip()),
        "instagram_graph": all(os.environ.get(k, "").strip() for k in ("META_ACCESS_TOKEN", "IG_BUSINESS_ACCOUNT_ID")),
    }


@router.get("")
async def list_alerts(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    items = await db.alerts.find({}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(length=100)
    unread = await db.alerts.count_documents({"read": False})
    return {"alerts": items, "unread": unread}


@router.post("/read")
async def mark_read(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    await db.alerts.update_many({"read": False}, {"$set": {"read": True}})
    return {"ok": True}


@router.post("/test")
async def send_test(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    email_res = await email_client.send_email(
        os.environ.get("NOTIFY_EMAIL", ""), "Brivo test alert",
        _wrap("Test alert", "<p>If you can read this, lead notifications are wired up correctly.</p>"))
    sms_res = await send_sms("Brivo test alert: SMS lead notifications are wired up.")
    rec = await _record(db, "test", "Test alert", "Manual test from Control Room", email_res, sms_res)
    return {"email": email_res, "sms": sms_res, "alert": {k: v for k, v in rec.items() if k != "_id"}}
