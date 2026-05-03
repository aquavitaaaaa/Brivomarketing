"""
BrivoMarketing Social Auto-Poster — agent dispatch system.

Lets the user pair a self-hosted Mac (or any machine) running our Playwright
agent (see /app/agent_host/agent.py + install.sh) with our backend over a
single outbound WebSocket. We queue posting jobs in Mongo and stream them to
the agent on demand. The agent runs the actual posting in a real logged-in
Chromium browser and reports the result back over the same socket.

Key concepts:
  - social_agents       — registered host machines (id, name, status, last_heartbeat)
  - social_posts        — content to post (caption + media + platforms + scheduled_at)
  - social_jobs         — per-platform run record (one post fans out to N jobs)
  - pair_codes          — one-time codes that exchange for a long-lived agent JWT

Endpoints
---------
Admin (Bearer JWT)
  POST /api/admin/social/agents/pair-code      -> generates a 6-digit pair code
  GET  /api/admin/social/agents                 -> list paired hosts
  DELETE /api/admin/social/agents/{id}          -> revoke an agent
  GET  /api/admin/social/posts                  -> list posts (queued/published/failed)
  POST /api/admin/social/posts                  -> create + schedule a post
  POST /api/admin/social/posts/generate         -> AI-generate a batch of posts
  POST /api/admin/social/posts/{id}/run-now     -> dispatch immediately
  DELETE /api/admin/social/posts/{id}           -> cancel
  GET  /api/admin/social/jobs                   -> recent run logs

Agent (no admin token — uses agent JWT)
  POST /api/agent/pair                          -> redeem pair code, returns JWT
  WS   /api/agent/ws?token=...                  -> bidirectional command channel

Scheduler:
  background loop runs every 30s, finds queued jobs that are due, dispatches
  to an online agent over the WS.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import secrets
import string
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from auth import get_current_admin
import social_safety
import social_content_factory

logger = logging.getLogger(__name__)

router = APIRouter()

# -------------------------------------------------------------------- config
AGENT_JWT_ALG = "HS256"
AGENT_JWT_TTL_DAYS = 365  # long-lived: it's a paired device
PAIR_CODE_TTL_MIN = 10
SUPPORTED_PLATFORMS = ["x", "instagram", "linkedin"]


def _agent_secret() -> str:
    return os.environ["JWT_SECRET"]  # reuse JWT_SECRET; agent tokens carry role=agent


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _now_dt() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return str(uuid.uuid4())


def _new_pair_code() -> str:
    return "".join(random.choices(string.digits, k=6))


def _make_agent_token(agent_id: str, name: str) -> str:
    payload = {
        "sub": agent_id,
        "name": name,
        "role": "agent",
        "exp": _now_dt() + timedelta(days=AGENT_JWT_TTL_DAYS),
        "iat": _now_dt(),
    }
    return jwt.encode(payload, _agent_secret(), algorithm=AGENT_JWT_ALG)


def _decode_agent_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, _agent_secret(), algorithms=[AGENT_JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    if payload.get("role") != "agent":
        raise HTTPException(403, "Not an agent token")
    return payload


# ------------------------------------------------------------ in-memory state
# Map agent_id -> live WebSocket connection
LIVE_AGENTS: dict[str, WebSocket] = {}
# Map job_id -> asyncio.Future awaiting agent reply
PENDING_JOBS: dict[str, asyncio.Future] = {}


# ----------------------------------------------------------------- pydantic
class PostCreate(BaseModel):
    caption: str = Field(..., min_length=1, max_length=4000)
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    platforms: list[str] = Field(default_factory=lambda: ["x"])
    scheduled_at: Optional[str] = None  # ISO 8601; null = run immediately when picked up
    theme: Optional[str] = None  # "receipts" / "teardown" / etc.

    model_config = {"extra": "ignore"}


class GenerateBatch(BaseModel):
    days: int = Field(7, ge=1, le=30)
    platforms: list[str] = Field(default_factory=lambda: ["x", "instagram", "linkedin"])
    posts_per_day: int = Field(1, ge=1, le=4)


class PairRedeem(BaseModel):
    code: str
    name: str = "Mac Mini"


# ============================================================== ADMIN ROUTES

@router.post("/admin/social/agents/pair-code")
async def admin_create_pair_code(req: dict | None = None, admin=Depends(get_current_admin)):
    """Returns a new 6-digit code. Lasts 10 minutes."""
    db = router.db  # type: ignore[attr-defined]
    code = _new_pair_code()
    expires = _now_dt() + timedelta(minutes=PAIR_CODE_TTL_MIN)
    await db.pair_codes.insert_one({
        "code": code,
        "created_by": admin["email"],
        "created_at": _now(),
        "expires_at": expires.isoformat(),
        "used": False,
    })
    return {"code": code, "expires_at": expires.isoformat()}


# ====================================================== PUBLIC PAIR INVITES
# Admin creates a one-time share link that lets a non-technical teammate pair
# their own Mac/Win/Linux host without ever seeing the admin panel. The link
# carries a cryptographically random token. Viewing the link does NOT consume
# it — only "Claim" does (which issues a fresh single-use 6-digit pair code).

PAIR_INVITE_TTL_MIN = 60  # invite link good for 60 min from issue


class PairInviteCreate(BaseModel):
    host_name_hint: Optional[str] = None
    note: Optional[str] = None


@router.post("/admin/social/pair-invite")
async def admin_create_pair_invite(
    payload: PairInviteCreate | None = None,
    admin=Depends(get_current_admin),
):
    """Create a public pair-invite token. Returns {token, url, expires_at}.

    The admin shares the URL; whoever opens it in a browser can pair their
    host with ONE click, no admin login required. Single-use: claimed tokens
    are retired and a fresh 6-digit code is issued to the claimer.
    """
    db = router.db  # type: ignore[attr-defined]
    token = secrets.token_urlsafe(24)
    now = _now_dt()
    expires = now + timedelta(minutes=PAIR_INVITE_TTL_MIN)
    doc = {
        "token": token,
        "created_by": admin["email"],
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "host_name_hint": (payload.host_name_hint if payload else None),
        "note": (payload.note if payload else None),
        "used_at": None,
        "used_code": None,
        "used_ip": None,
    }
    await db.pair_invites.insert_one(doc)
    return {
        "token": token,
        "expires_at": expires.isoformat(),
        # Relative path — frontend prefixes with origin.
        "path": f"/pair?token={token}",
    }


@router.get("/admin/social/pair-invites")
async def admin_list_pair_invites(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    cursor = db.pair_invites.find({}, {"_id": 0}).sort("created_at", -1).limit(50)
    invites = await cursor.to_list(length=50)
    return {"invites": invites}


@router.delete("/admin/social/pair-invite/{token}")
async def admin_revoke_pair_invite(token: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    res = await db.pair_invites.update_one(
        {"token": token, "used_at": None},
        {"$set": {"used_at": _now(), "used_code": None, "used_ip": "revoked"}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Invite not found or already used")
    return {"ok": True}


# ---- Public (no auth) endpoints used by the /pair wizard ----

@router.get("/public/pair-invite/{token}")
async def public_get_pair_invite(token: str):
    """Validate + return metadata for a pair invite WITHOUT consuming it.

    Returns 404 if token doesn't exist, 410 if expired or used.
    """
    db = router.db  # type: ignore[attr-defined]
    inv = await db.pair_invites.find_one({"token": token}, {"_id": 0})
    if not inv:
        raise HTTPException(404, "Invite not found")
    if inv.get("used_at"):
        raise HTTPException(410, "Invite already used")
    try:
        expires = datetime.fromisoformat(inv["expires_at"])
    except Exception:
        raise HTTPException(410, "Invite malformed")
    if expires < _now_dt():
        raise HTTPException(410, "Invite expired")
    return {
        "host_name_hint": inv.get("host_name_hint"),
        "note": inv.get("note"),
        "expires_at": inv["expires_at"],
        "issued_by_display": _mask_email(inv.get("created_by") or ""),
    }


@router.post("/public/pair-invite/{token}/claim")
async def public_claim_pair_invite(token: str, request: Request):
    """Consume the invite and return a fresh 6-digit pair code + install URLs.

    Single-use. Writes used_at + used_code on the invite so it cannot be
    redeemed twice.
    """
    db = router.db  # type: ignore[attr-defined]
    inv = await db.pair_invites.find_one({"token": token}, {"_id": 0})
    if not inv:
        raise HTTPException(404, "Invite not found")
    if inv.get("used_at"):
        raise HTTPException(410, "Invite already used")
    try:
        expires = datetime.fromisoformat(inv["expires_at"])
    except Exception:
        raise HTTPException(410, "Invite malformed")
    if expires < _now_dt():
        raise HTTPException(410, "Invite expired")

    # Issue a fresh pair code bound to the invite.
    code = _new_pair_code()
    code_expires = _now_dt() + timedelta(minutes=PAIR_CODE_TTL_MIN)
    await db.pair_codes.insert_one({
        "code": code,
        "created_by": f"invite:{inv.get('created_by')}",
        "created_at": _now(),
        "expires_at": code_expires.isoformat(),
        "used": False,
        "invite_token": token,
    })

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "")

    await db.pair_invites.update_one(
        {"token": token},
        {"$set": {
            "used_at": _now(),
            "used_code": code,
            "used_ip": (ip or "")[:80],
        }},
    )
    return {
        "code": code,
        "expires_at": code_expires.isoformat(),
        "host_name_hint": inv.get("host_name_hint"),
    }


def _mask_email(e: str) -> str:
    """'admin@brivomarketing.com' -> 'a***@brivomarketing.com' (light privacy)."""
    if not e or "@" not in e:
        return "brivo admin"
    name, _, dom = e.partition("@")
    return f"{name[:1]}***@{dom}"


@router.get("/admin/social/agents")
async def admin_list_agents(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    cursor = db.social_agents.find({}, {"_id": 0}).sort("paired_at", -1)
    agents = await cursor.to_list(length=200)
    for a in agents:
        a["online"] = a["id"] in LIVE_AGENTS
    return {"agents": agents}


@router.delete("/admin/social/agents/{agent_id}")
async def admin_revoke_agent(agent_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    await db.social_agents.update_one({"id": agent_id}, {"$set": {"revoked": True}})
    ws = LIVE_AGENTS.pop(agent_id, None)
    if ws:
        try:
            await ws.close(code=4401, reason="revoked")
        except Exception:
            pass
    return {"ok": True}


@router.get("/admin/social/posts")
async def admin_list_posts(
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    admin=Depends(get_current_admin),
):
    db = router.db  # type: ignore[attr-defined]
    q: dict = {}
    if status:
        q["status"] = status
    cursor = db.social_posts.find(q, {"_id": 0}).sort("scheduled_at", 1).limit(limit)
    return {"posts": await cursor.to_list(length=limit)}


@router.post("/admin/social/posts")
async def admin_create_post(payload: PostCreate, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    platforms = [p for p in payload.platforms if p in SUPPORTED_PLATFORMS]
    if not platforms:
        raise HTTPException(400, "No supported platform in request")
    doc = {
        "id": _new_id(),
        "caption": payload.caption,
        "image_url": payload.image_url,
        "video_url": payload.video_url,
        "platforms": platforms,
        "scheduled_at": payload.scheduled_at or _now(),
        "theme": payload.theme,
        "status": "queued",
        "created_at": _now(),
        "created_by": admin["email"],
    }
    await db.social_posts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.post("/admin/social/posts/generate")
async def admin_generate_batch(payload: GenerateBatch, admin=Depends(get_current_admin)):
    """Generate `days * posts_per_day` posts using the brand-kit cadence."""
    db = router.db  # type: ignore[attr-defined]
    from social_content import generate_post_batch  # local import to avoid cycles

    created = await generate_post_batch(
        db=db,
        days=payload.days,
        platforms=[p for p in payload.platforms if p in SUPPORTED_PLATFORMS],
        posts_per_day=payload.posts_per_day,
        admin_email=admin["email"],
    )
    return {"created": len(created), "posts": created}


@router.post("/admin/social/posts/{post_id}/run-now")
async def admin_run_now(post_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    post = await db.social_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(404, "Post not found")
    await db.social_posts.update_one(
        {"id": post_id}, {"$set": {"scheduled_at": _now(), "status": "queued"}}
    )
    return {"ok": True}


@router.delete("/admin/social/posts/{post_id}")
async def admin_cancel_post(post_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    res = await db.social_posts.update_one(
        {"id": post_id, "status": {"$in": ["queued", "scheduled"]}},
        {"$set": {"status": "cancelled", "cancelled_at": _now()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Post not found or not cancellable")
    return {"ok": True}


@router.get("/admin/social/posts/{post_id}/preview")
async def admin_preview_post(post_id: str, admin=Depends(get_current_admin)):
    """Dry-run preview: return exactly what the Playwright agent would post
    to each platform (no network I/O, no DB mutation). Lets admin eyeball
    the final output before a host is even paired."""
    db = router.db  # type: ignore[attr-defined]
    post = await db.social_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(404, "Post not found")

    caption = (post.get("caption") or "").strip()
    image_url = post.get("image_url")
    video_url = post.get("video_url")
    platforms = post.get("platforms") or []

    previews = []
    for plat in platforms:
        if plat == "x":
            body = caption
            if len(body) > 280:
                body = body[:277].rsplit(" ", 1)[0] + "…"
            previews.append({
                "platform": "x",
                "character_count": len(body),
                "character_limit": 280,
                "rendered_body": body,
                "attachment": image_url or video_url,
                "warnings": (["Truncated to 280 chars"] if len(caption) > 280 else []),
                "looks_like": "thread-free single tweet",
            })
        elif plat == "instagram":
            previews.append({
                "platform": "instagram",
                "character_count": len(caption),
                "character_limit": 2200,
                "rendered_body": caption,
                "attachment": image_url or video_url,
                "warnings": ([] if (image_url or video_url) else ["Instagram requires media — post will fail without an image/video"]),
                "looks_like": "feed post (no carousel)",
            })
        elif plat == "linkedin":
            previews.append({
                "platform": "linkedin",
                "character_count": len(caption),
                "character_limit": 3000,
                "rendered_body": caption,
                "attachment": image_url or video_url,
                "warnings": [],
                "looks_like": "text update" + (" with image" if image_url else ""),
            })
        else:
            previews.append({
                "platform": plat,
                "character_count": len(caption),
                "character_limit": None,
                "rendered_body": caption,
                "attachment": image_url or video_url,
                "warnings": ["Unknown platform — handler may not exist"],
                "looks_like": "generic",
            })

    return {
        "post_id": post_id,
        "scheduled_at": post.get("scheduled_at"),
        "theme": post.get("theme"),
        "previews": previews,
        "agent_required": True,
        "dry_run": True,
    }


@router.get("/admin/social/jobs")
async def admin_list_jobs(limit: int = Query(50, ge=1, le=200), admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    cursor = db.social_jobs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return {"jobs": await cursor.to_list(length=limit)}


@router.get("/admin/social/dashboard")
async def admin_dashboard(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    queued = await db.social_posts.count_documents({"status": "queued"})
    published = await db.social_posts.count_documents({"status": "published"})
    failed = await db.social_posts.count_documents({"status": "failed"})
    agents_total = await db.social_agents.count_documents({"revoked": {"$ne": True}})
    online = len(LIVE_AGENTS)
    last_jobs = await db.social_jobs.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    return {
        "queued": queued,
        "published": published,
        "failed": failed,
        "agents_total": agents_total,
        "agents_online": online,
        "recent_jobs": last_jobs,
    }


# ================================================= PHASE 1: SAFETY + FACTORY

class PolicyUpdate(BaseModel):
    agent_id: str
    platform: str
    max_posts_per_day: Optional[int] = None
    min_minutes_between: Optional[int] = None
    quiet_hours_start: Optional[int] = None
    quiet_hours_end: Optional[int] = None
    tz: Optional[str] = None
    failure_threshold: Optional[int] = None


class PauseAction(BaseModel):
    agent_id: str
    platform: str
    reason: Optional[str] = "manual"


class CrossPostBrief(BaseModel):
    brief: str = Field(..., min_length=4, max_length=2000)
    tone: str = "confident"
    platforms: list[str] = Field(default_factory=lambda: ["x", "instagram", "linkedin"])
    image_url: Optional[str] = None
    scheduled_at: Optional[str] = None   # ISO8601; default = now


class WinCreate(BaseModel):
    title: str
    metric: str
    detail: str
    tags: list[str] = Field(default_factory=list)
    vertical: Optional[str] = None


@router.get("/admin/social/policies")
async def admin_list_policies(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    return {"policies": await social_safety.list_policies(db)}


@router.post("/admin/social/policies/update")
async def admin_update_policy(payload: PolicyUpdate, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    fields = {k: v for k, v in payload.model_dump().items()
              if v is not None and k not in ("agent_id", "platform")}
    if not fields:
        raise HTTPException(400, "No fields to update")
    doc = await social_safety.set_policy_override(
        db, payload.agent_id, payload.platform, **fields
    )
    return {"policy": doc}


@router.post("/admin/social/policies/pause")
async def admin_pause(payload: PauseAction, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    doc = await social_safety.pause(db, payload.agent_id, payload.platform, payload.reason or "manual")
    return {"policy": doc}


@router.post("/admin/social/policies/unpause")
async def admin_unpause(payload: PauseAction, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    doc = await social_safety.unpause(db, payload.agent_id, payload.platform)
    return {"policy": doc}


@router.get("/admin/social/hooks")
async def admin_list_hooks(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    docs = await db.hook_library.find({}, {"_id": 0}).sort("score", -1).to_list(length=200)
    return {"hooks": docs}


@router.get("/admin/social/wins")
async def admin_list_wins(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    docs = await db.client_wins.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=200)
    return {"wins": docs}


@router.post("/admin/social/wins")
async def admin_create_win(payload: WinCreate, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    doc = {
        "id": _new_id(),
        **payload.model_dump(),
        "uses": 0,
        "last_used_at": None,
        "created_at": _now(),
    }
    await db.client_wins.insert_one(doc)
    doc.pop("_id", None)
    return {"win": doc}


@router.delete("/admin/social/wins/{win_id}")
async def admin_delete_win(win_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    await db.client_wins.delete_one({"id": win_id})
    return {"ok": True}


@router.post("/admin/social/posts/multi")
async def admin_cross_post(payload: CrossPostBrief, admin=Depends(get_current_admin)):
    """Q: single brief -> one platform-tailored post per platform."""
    db = router.db  # type: ignore[attr-defined]
    plats = [p for p in payload.platforms if p in SUPPORTED_PLATFORMS] or SUPPORTED_PLATFORMS
    created = await social_content_factory.multi_platform_from_brief(
        db,
        brief=payload.brief,
        tone=payload.tone,
        platforms=plats,
        admin_email=admin.get("email", "admin"),
        schedule_at_iso=payload.scheduled_at,
        image_url=payload.image_url,
    )
    return {"created": created}


@router.post("/admin/social/wins/recycle-now")
async def admin_recycle_now(admin=Depends(get_current_admin)):
    """Manually trigger the wins recycler (useful before first post or for tests)."""
    db = router.db  # type: ignore[attr-defined]
    win = await social_content_factory.pick_least_recent_win(db)
    if not win:
        raise HTTPException(400, "No client wins on file — add one first")
    post = await social_content_factory.draft_post_from_win(db, win)
    return {"post": post, "source_win": win["title"]}


@router.get("/admin/social/safety-summary")
async def admin_safety_summary(admin=Depends(get_current_admin)):
    """Lightweight rollup: per-platform warm-up + ban risk + paused status."""
    db = router.db  # type: ignore[attr-defined]
    policies = await social_safety.list_policies(db)
    agents = await db.social_agents.find({"revoked": {"$ne": True}}, {"_id": 0}).to_list(length=100)
    by_agent_name = {a["id"]: a.get("name", a["id"][:8]) for a in agents}
    # Queue floor info
    from social_content_factory import queue_floor_low, QUEUE_FLOOR, QUEUE_FLOOR_HORIZON_HRS
    low = await queue_floor_low(db)
    total_wins = await db.client_wins.count_documents({})
    total_hooks = await db.hook_library.count_documents({})
    return {
        "policies": [{**p, "agent_name": by_agent_name.get(p["agent_id"], "?")} for p in policies],
        "queue_floor": {
            "threshold": QUEUE_FLOOR,
            "horizon_hours": QUEUE_FLOOR_HORIZON_HRS,
            "currently_low": low,
        },
        "totals": {
            "wins": total_wins,
            "hooks": total_hooks,
        },
    }



# ============================================================ AGENT PAIRING

@router.post("/agent/pair")
async def agent_pair(payload: PairRedeem):
    db = router.db  # type: ignore[attr-defined]
    code_doc = await db.pair_codes.find_one({"code": payload.code, "used": False})
    if not code_doc:
        raise HTTPException(400, "Invalid or used code")
    expires_at = datetime.fromisoformat(code_doc["expires_at"])
    if expires_at < _now_dt():
        raise HTTPException(400, "Code expired")

    agent_id = _new_id()
    await db.social_agents.insert_one({
        "id": agent_id,
        "name": payload.name,
        "paired_at": _now(),
        "paired_by": code_doc["created_by"],
        "last_heartbeat": None,
        "platform": "darwin",  # the agent updates this on first hello
        "revoked": False,
    })
    await db.pair_codes.update_one(
        {"_id": code_doc["_id"]},
        {"$set": {"used": True, "used_at": _now(), "agent_id": agent_id}},
    )
    token = _make_agent_token(agent_id, payload.name)
    # Kick off the warm-up clock for every supported platform on this host.
    try:
        await social_safety.start_warmup(db, agent_id, SUPPORTED_PLATFORMS)
    except Exception:
        logger.exception("start_warmup failed (non-fatal)")
    return {"agent_id": agent_id, "token": token, "name": payload.name}


# ============================================================ AGENT WEBSOCKET

@router.websocket("/agent/ws")
async def agent_ws(ws: WebSocket, token: str = Query(...)):
    """Single bidirectional command channel.

    Messages from agent -> backend:
      { "type": "hello", "version": "1.0", "platforms": ["x"] }
      { "type": "heartbeat" }
      { "type": "job_result", "job_id": "...", "ok": true,
        "posted_url": "...", "screenshot_b64": "..." }

    Messages from backend -> agent:
      { "type": "job", "id": "...", "kind": "post_x",
        "caption": "...", "image_url": "...", "video_url": "..." }
      { "type": "ping" }
    """
    db = router.db  # type: ignore[attr-defined]
    try:
        payload = _decode_agent_token(token)
    except HTTPException:
        await ws.close(code=4401)
        return

    agent_id = payload["sub"]
    rec = await db.social_agents.find_one({"id": agent_id, "revoked": {"$ne": True}})
    if not rec:
        await ws.close(code=4403)
        return

    await ws.accept()
    LIVE_AGENTS[agent_id] = ws
    await db.social_agents.update_one(
        {"id": agent_id},
        {"$set": {"last_heartbeat": _now(), "online_since": _now()}},
    )
    logger.info("Agent %s (%s) connected", rec.get("name"), agent_id)

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            kind = msg.get("type")

            if kind == "hello":
                await db.social_agents.update_one(
                    {"id": agent_id},
                    {"$set": {
                        "version": msg.get("version"),
                        "capabilities": msg.get("platforms", []),
                        "platform": msg.get("platform", "darwin"),
                        "sessions": msg.get("sessions", {}),
                        "last_heartbeat": _now(),
                    }},
                )

            elif kind == "heartbeat":
                update = {"last_heartbeat": _now()}
                if msg.get("sessions"):
                    update["sessions"] = msg["sessions"]
                await db.social_agents.update_one(
                    {"id": agent_id}, {"$set": update}
                )

            elif kind == "job_result":
                jid = msg.get("job_id")
                fut = PENDING_JOBS.pop(jid, None)
                if fut and not fut.done():
                    fut.set_result(msg)
                # also persist
                await db.social_jobs.update_one(
                    {"id": jid},
                    {"$set": {
                        "status": "succeeded" if msg.get("ok") else "failed",
                        "completed_at": _now(),
                        "posted_url": msg.get("posted_url"),
                        "error": msg.get("error"),
                        "screenshot_b64": msg.get("screenshot_b64"),
                    }},
                )

    except WebSocketDisconnect:
        logger.info("Agent %s disconnected", agent_id)
    except Exception as e:
        logger.exception("Agent ws error: %s", e)
    finally:
        LIVE_AGENTS.pop(agent_id, None)
        await db.social_agents.update_one(
            {"id": agent_id}, {"$set": {"online_since": None}}
        )


# ================================================================ DISPATCHER

async def dispatch_job_to_agent(agent_id: str, job: dict, timeout_s: int = 180) -> dict:
    """Send a job over WS and await the agent's reply (with timeout)."""
    ws = LIVE_AGENTS.get(agent_id)
    if ws is None:
        raise RuntimeError("Agent offline")
    fut: asyncio.Future = asyncio.get_event_loop().create_future()
    PENDING_JOBS[job["id"]] = fut
    await ws.send_text(json.dumps({"type": "job", **job}))
    try:
        return await asyncio.wait_for(fut, timeout=timeout_s)
    except asyncio.TimeoutError:
        PENDING_JOBS.pop(job["id"], None)
        raise RuntimeError("Agent timed out")


async def _pick_agent() -> Optional[str]:
    """Pick the first online, non-revoked agent. Round-robin would be nicer."""
    if not LIVE_AGENTS:
        return None
    return next(iter(LIVE_AGENTS.keys()))


async def _process_due_posts(db) -> None:
    """Find posts whose scheduled_at <= now and dispatch one job per platform."""
    now_iso = _now()
    cursor = db.social_posts.find(
        {"status": "queued", "scheduled_at": {"$lte": now_iso}},
        {"_id": 0},
    ).limit(20)
    posts = await cursor.to_list(length=20)
    if not posts:
        return

    agent_id = await _pick_agent()
    if not agent_id:
        logger.info("Posts due but no agent online — skipping cycle")
        return

    for post in posts:
        await db.social_posts.update_one(
            {"id": post["id"]}, {"$set": {"status": "running", "started_at": _now()}}
        )
        any_failure = False
        any_success = False
        any_deferred = False
        deferred_until: Optional[str] = None
        skipped_platforms: list[str] = []
        for platform in post["platforms"]:
            # ---- Phase 1 safety gate (R/S/T) ----
            try:
                ok_gate, reason, defer_until = await social_safety.check_can_post(
                    db, agent_id, platform
                )
            except Exception as e:
                logger.exception("safety gate error: %s", e)
                ok_gate, reason, defer_until = True, "gate_bypass_on_error", None
            if not ok_gate:
                logger.info("Gate blocked post=%s plat=%s reason=%s defer=%s",
                            post["id"], platform, reason, defer_until)
                skipped_platforms.append(platform)
                # Record a non-dispatched job for auditability
                await db.social_jobs.insert_one({
                    "id": _new_id(),
                    "post_id": post["id"],
                    "agent_id": agent_id,
                    "kind": f"post_{platform}",
                    "platform": platform,
                    "caption": post["caption"],
                    "status": "deferred" if defer_until else "blocked",
                    "reason": reason,
                    "defer_until": defer_until,
                    "created_at": _now(),
                    "completed_at": _now(),
                })
                if defer_until:
                    any_deferred = True
                    # Track the latest defer time across platforms
                    if not deferred_until or defer_until > deferred_until:
                        deferred_until = defer_until
                else:
                    any_failure = True
                continue

            job_id = _new_id()
            job_doc = {
                "id": job_id,
                "post_id": post["id"],
                "agent_id": agent_id,
                "kind": f"post_{platform}",
                "platform": platform,
                "caption": post["caption"],
                "image_url": post.get("image_url"),
                "video_url": post.get("video_url"),
                "status": "running",
                "created_at": _now(),
            }
            await db.social_jobs.insert_one(job_doc)
            job_doc.pop("_id", None)
            try:
                result = await dispatch_job_to_agent(agent_id, job_doc, timeout_s=240)
                if result.get("ok"):
                    any_success = True
                    await social_safety.record_post_attempt(db, agent_id, platform, True)
                else:
                    any_failure = True
                    await social_safety.record_post_attempt(
                        db, agent_id, platform, False, error=result.get("error")
                    )
            except Exception as e:
                any_failure = True
                await db.social_jobs.update_one(
                    {"id": job_id},
                    {"$set": {"status": "failed", "error": str(e), "completed_at": _now()}},
                )
                try:
                    await social_safety.record_post_attempt(
                        db, agent_id, platform, False, error=str(e)
                    )
                except Exception:
                    logger.exception("record_post_attempt failed")

        # Decide post-level status
        if any_success and not any_failure and not any_deferred:
            new_status = "published"
            update: dict = {"status": new_status, "completed_at": _now()}
        elif any_success:
            new_status = "partial"
            update = {"status": new_status, "completed_at": _now()}
        elif any_deferred and not any_failure:
            # Fully deferred — put it back on the queue at the latest defer time
            new_status = "queued"
            update = {
                "status": new_status,
                "scheduled_at": deferred_until or _now(),
                "last_deferred_at": _now(),
                "deferred_reason": "cadence/warmup/quiet",
                "skipped_platforms": skipped_platforms,
            }
        else:
            new_status = "failed"
            update = {"status": new_status, "completed_at": _now()}
        await db.social_posts.update_one({"id": post["id"]}, {"$set": update})


async def scheduler_loop(db) -> None:
    """Run forever — every 30s look for due posts."""
    logger.info("Social scheduler loop started")
    while True:
        try:
            await _process_due_posts(db)
        except Exception:
            logger.exception("scheduler tick failed")
        await asyncio.sleep(30)


# Allow server.py to attach the db once it's created.
def attach(db) -> None:
    router.db = db  # type: ignore[attr-defined]
