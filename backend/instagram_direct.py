"""Direct Instagram posting — server-side login + publish via the private API
(instagrapi), routed through a user-supplied SOCKS5/HTTP proxy.

This is the "website handles everything" path the operator requested:
- Operator enters IG username + password + proxy in the admin UI.
- Backend logs in (handling 2FA), persists the instagrapi session, and can
  publish images + captions directly from the cloud.

SAFETY NOTES
- A proxy (ideally residential/mobile) is strongly recommended — Instagram
  flags datacenter-IP logins. The connect/post calls use whatever proxy the
  operator supplies per account.
- Passwords are encrypted at rest (Fernet, key derived from JWT_SECRET) so the
  server can re-login when a session expires. Never logged.
- Using the private API can violate Instagram ToS and risks challenges/bans.
  The operator opted in explicitly and supplies the proxy.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import logging
import os
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_admin

logger = logging.getLogger("instagram_direct")

router = APIRouter(prefix="/admin/social/direct")

PUBLIC_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public"


def attach(db) -> None:
    router.db = db  # type: ignore[attr-defined]


# ---------------------------------------------------------------- encryption
def _fernet() -> Fernet:
    secret = os.environ.get("JWT_SECRET", "brivo-direct-fallback-secret")
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())
    return Fernet(key)


def _enc(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def _dec(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()


def _public(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "username": doc["username"],
        "full_name": doc.get("full_name"),
        "status": doc.get("status"),
        "proxy_set": bool(doc.get("proxy")),
        "last_error": doc.get("last_error"),
        "updated_at": doc.get("updated_at"),
    }


# ---------------------------------------------------------------- instagrapi
def _new_client(proxy: Optional[str], settings: Optional[dict]):
    from instagrapi import Client

    cl = Client()
    cl.delay_range = [1, 3]  # human-like spacing between requests
    if proxy:
        cl.set_proxy(proxy)
    if settings:
        cl.set_settings(settings)
    return cl


def _login_sync(username, password, proxy=None, settings=None, verification_code=None):
    cl = _new_client(proxy, settings)
    if verification_code:
        cl.login(username, password, verification_code=str(verification_code))
    else:
        cl.login(username, password)
    info = cl.account_info()
    return cl.get_settings(), {
        "pk": str(cl.user_id),
        "username": info.username,
        "full_name": info.full_name or "",
    }


def _post_photo_sync(username, password, proxy, settings, path, caption):
    cl = _new_client(proxy, settings)
    cl.login(username, password)
    media = cl.photo_upload(Path(path), caption)
    return {"code": media.code, "pk": str(media.pk)}, cl.get_settings()


# ---------------------------------------------------------------- helpers
async def _resolve_image(image_url: str) -> Path:
    """Return a local JPEG path for a /kit-assets/... path or an https URL."""
    if image_url.startswith("/"):
        p = PUBLIC_DIR / image_url.lstrip("/")
        if not p.exists():
            raise HTTPException(400, f"Image not found: {image_url}")
        return p
    if image_url.startswith("http"):
        async with httpx.AsyncClient(timeout=40) as c:
            r = await c.get(image_url)
            r.raise_for_status()
        tmp = Path(tempfile.gettempdir()) / f"igdirect_{uuid.uuid4().hex}.jpg"
        tmp.write_bytes(r.content)
        return tmp
    raise HTTPException(400, "image_url must be a /kit-assets path or an https URL")


# ---------------------------------------------------------------- models
class ConnectBody(BaseModel):
    username: str
    password: str
    proxy: Optional[str] = None
    verification_code: Optional[str] = None


class PostBody(BaseModel):
    account_id: str
    caption: str = ""
    image_url: str


# ---------------------------------------------------------------- routes
@router.post("/connect")
async def connect(body: ConnectBody, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    from instagrapi.exceptions import (
        BadPassword,
        ChallengeRequired,
        PleaseWaitFewMinutes,
        TwoFactorRequired,
    )

    uname = body.username.strip().lstrip("@").lower()
    existing = await db.direct_accounts.find_one(
        {"platform": "instagram", "username": uname}
    )
    settings = existing.get("settings") if existing else None

    try:
        new_settings, info = await asyncio.to_thread(
            _login_sync, uname, body.password,
            body.proxy or (existing.get("proxy") if existing else None),
            settings, body.verification_code,
        )
    except TwoFactorRequired:
        return {"status": "two_factor_required",
                "message": "2FA is on. Enter the 6-digit code from your app/SMS and submit again."}
    except ChallengeRequired:
        return {"status": "challenge_required",
                "message": "Instagram sent a security check. Approve the login in the Instagram app or email, then retry. Using the proxy that matches your usual location helps."}
    except BadPassword:
        raise HTTPException(400, "Incorrect username or password.")
    except PleaseWaitFewMinutes:
        raise HTTPException(429, "Instagram asked to wait a few minutes (rate limit). Try again shortly — a residential proxy reduces this.")
    except Exception as e:  # noqa: BLE001
        msg = str(e)[:220]
        logger.warning("IG direct login failed for %s: %s", uname, msg)
        raise HTTPException(400, f"Login failed: {msg}")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "platform": "instagram",
        "username": uname,
        "password_enc": _enc(body.password),
        "proxy": body.proxy or (existing.get("proxy") if existing else None),
        "settings": new_settings,
        "status": "connected",
        "last_error": None,
        "user_pk": info["pk"],
        "full_name": info["full_name"],
        "updated_at": now,
    }
    if existing:
        await db.direct_accounts.update_one({"id": existing["id"]}, {"$set": doc})
        acc_id = existing["id"]
    else:
        doc["id"] = str(uuid.uuid4())
        doc["created_at"] = now
        await db.direct_accounts.insert_one(doc)
        acc_id = doc["id"]

    return {"status": "connected", "id": acc_id, "username": uname,
            "full_name": info["full_name"]}


@router.get("/accounts")
async def list_accounts(admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    out = []
    async for d in db.direct_accounts.find({"platform": "instagram"}).sort("created_at", 1):
        out.append(_public(d))
    return out


@router.post("/post")
async def post_now(body: PostBody, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    d = await db.direct_accounts.find_one({"id": body.account_id})
    if not d:
        raise HTTPException(404, "Account not found")

    path = await _resolve_image(body.image_url)

    try:
        result, new_settings = await asyncio.to_thread(
            _post_photo_sync, d["username"], _dec(d["password_enc"]),
            d.get("proxy"), d.get("settings"), str(path), body.caption,
        )
    except Exception as e:  # noqa: BLE001
        msg = str(e)[:220]
        logger.warning("IG direct post failed for %s: %s", d["username"], msg)
        await db.direct_accounts.update_one(
            {"id": d["id"]}, {"$set": {"status": "error", "last_error": msg}}
        )
        raise HTTPException(400, f"Post failed: {msg}")

    await db.direct_accounts.update_one(
        {"id": d["id"]},
        {"$set": {"settings": new_settings, "status": "connected",
                  "last_error": None,
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {
        "status": "posted",
        "url": f"https://www.instagram.com/p/{result['code']}/",
        "media_pk": result["pk"],
    }


@router.delete("/{acc_id}")
async def disconnect(acc_id: str, admin=Depends(get_current_admin)):
    db = router.db  # type: ignore[attr-defined]
    res = await db.direct_accounts.delete_one({"id": acc_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Account not found")
    return {"status": "deleted"}
