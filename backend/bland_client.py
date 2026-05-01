"""
Bland.ai skeleton client.

All external calls are thin wrappers around the Bland REST API. If BLAND_API_KEY
is not configured, functions raise a clear HTTP 503 so the admin UI can show
"Operator not connected — add keys in .env".

Reference: https://docs.bland.ai
"""
import os
import hmac
import hashlib
import httpx
from typing import Optional
from fastapi import HTTPException


BLAND_API_URL = "https://api.bland.ai"


def _api_key() -> str:
    key = os.environ.get("BLAND_API_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=503,
            detail="Bland.ai not configured. Set BLAND_API_KEY in backend/.env",
        )
    return key


def is_configured() -> bool:
    return bool(os.environ.get("BLAND_API_KEY", "").strip())


def verify_webhook_signature(raw_body: bytes, signature: Optional[str]) -> bool:
    """Return True if the webhook signature matches (HMAC-SHA256).
    If no BLAND_WEBHOOK_SECRET is configured we accept the webhook
    (skeleton mode — user will add the secret later)."""
    secret = os.environ.get("BLAND_WEBHOOK_SECRET", "").strip()
    if not secret:
        return True
    if not signature:
        return False
    expected = hmac.new(
        secret.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def start_outbound_call(
    phone_number: str,
    task: str,
    pathway_id: Optional[str] = None,
    voice: str = "maya",
    webhook_url: Optional[str] = None,
    from_number: Optional[str] = None,
    max_duration: int = 10,
) -> dict:
    payload = {
        "phone_number": phone_number,
        "task": task,
        "voice": voice,
        "record": True,
        "max_duration": max_duration,
    }
    if pathway_id:
        payload["pathway_id"] = pathway_id
    if webhook_url:
        payload["webhook"] = webhook_url
    if from_number:
        payload["from"] = from_number

    headers = {
        "Content-Type": "application/json",
        "authorization": _api_key(),
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{BLAND_API_URL}/v1/calls", headers=headers, json=payload
        )
    if r.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Bland.ai call failed: {r.status_code} — {r.text}",
        )
    return r.json()


async def configure_inbound_number(
    phone_number: str,
    pathway_id: Optional[str],
    webhook_url: str,
    voice: str = "maya",
    prompt: Optional[str] = None,
) -> dict:
    if not phone_number:
        raise HTTPException(status_code=400, detail="BLAND_INBOUND_NUMBER not set")
    formatted = phone_number.replace("+", "").lstrip("1")

    payload = {
        "webhook": webhook_url,
        "voice": voice,
        "record": True,
        "max_duration": 10,
    }
    if pathway_id:
        payload["pathway_id"] = pathway_id
    if prompt:
        payload["prompt"] = prompt

    headers = {
        "Content-Type": "application/json",
        "authorization": _api_key(),
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{BLAND_API_URL}/v1/inbound/{formatted}",
            headers=headers,
            json=payload,
        )
    if r.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Bland.ai inbound config failed: {r.status_code} — {r.text}",
        )
    return r.json()
