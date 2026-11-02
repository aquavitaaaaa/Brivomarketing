"""
Managed email helper — new-lead notifications via Emergent managed email.

Sends are transactional only (new-lead alerts to the owner inbox).
From address is platform-managed; display name is BrivoMarketing (G1).
Reply-To is hello@brivomarketing.com so owners can reply.

Env:
  EMERGENT_EMAIL_KEY — provisioned per-app key (server-side only)
  EMAIL_FROM_NAME    — BrivoMarketing (required, own brand)
  EMAIL_REPLY_TO     — hello@brivomarketing.com (owner inbox)
  NOTIFY_EMAIL       — destination for lead alerts (default hello@brivomarketing.com)

If EMERGENT_EMAIL_KEY is empty we silently skip (skeleton mode).
"""
import os
import re
import ipaddress
import asyncio
import logging
import html as html_lib
from html.parser import HTMLParser
from urllib.parse import urlparse
from typing import Dict, Any

import httpx

logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "").strip()
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "").strip()
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO", "").strip()


def is_configured() -> bool:
    return bool(EMAIL_KEY and EMAIL_FROM_NAME)


def _escape(v: Any) -> str:
    return html_lib.escape(str(v)) if v is not None else ""


_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} does not match link host {real!r} (G3)")


def _inquiry_email_html(inquiry: Dict[str, Any]) -> str:
    roi = inquiry.get("roi_snapshot") or {}
    roi_row = ""
    if roi:
        roi_row = f"""
        <tr><td style="padding:16px 0;border-top:1px solid #2a2a36;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7aff00;margin-bottom:8px;">ROI snapshot</div>
          <div style="color:#e7e7f0;font-size:14px;line-height:1.6;">
            Revenue: <strong>${float(roi.get('revenue', 0)):,.0f}</strong><br/>
            Current ROAS: <strong>{roi.get('roas', '-')}x</strong><br/>
            Monthly spend: <strong>${float(roi.get('spend', 0)):,.0f}</strong><br/>
            Projected lift: <strong style="color:#7aff00;">+${float(roi.get('lift', 0)):,.0f}/yr</strong>
          </div>
        </td></tr>
        """
    return f"""
    <!doctype html>
    <html><body style="margin:0;padding:0;background:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0f;padding:32px 0;">
        <tr><td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#13131c;border:1px solid #2a2a36;border-radius:4px;">
            <tr><td style="padding:28px 28px 0 28px;">
              <div style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#CCFF00;">/ New lead · BrivoMarketing</div>
              <h1 style="margin:12px 0 4px 0;font-size:26px;line-height:1.15;color:#ffffff;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;">{_escape(inquiry.get('name'))}</h1>
              <div style="color:#b5b5c5;font-size:14px;">{_escape(inquiry.get('service_interest'))}</div>
            </td></tr>
            <tr><td style="padding:20px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="color:#e7e7f0;font-size:14px;line-height:1.6;">
                <tr><td style="padding:10px 0;border-top:1px solid #2a2a36;"><strong style="color:#CCFF00;">Email</strong><br/><a href="mailto:{_escape(inquiry.get('email'))}" style="color:#ffffff;text-decoration:none;">{_escape(inquiry.get('email'))}</a></td></tr>
                {'<tr><td style="padding:10px 0;border-top:1px solid #2a2a36;"><strong style="color:#CCFF00;">Company</strong><br/>' + _escape(inquiry.get('company')) + '</td></tr>' if inquiry.get('company') else ''}
                {'<tr><td style="padding:10px 0;border-top:1px solid #2a2a36;"><strong style="color:#CCFF00;">Budget</strong><br/>' + _escape(inquiry.get('budget')) + '</td></tr>' if inquiry.get('budget') else ''}
                <tr><td style="padding:10px 0;border-top:1px solid #2a2a36;"><strong style="color:#CCFF00;">Source</strong><br/>{_escape(inquiry.get('source') or 'manual')}</td></tr>
                <tr><td style="padding:10px 0;border-top:1px solid #2a2a36;"><strong style="color:#CCFF00;">Brief</strong><br/><span style="white-space:pre-wrap;">{_escape(inquiry.get('message'))}</span></td></tr>
                {roi_row}
              </table>
            </td></tr>
            <tr><td style="padding:0 28px 24px 28px;">
              <a href="https://brivomarketing.com/admin" style="display:inline-block;background:#CCFF00;color:#0b0b0f;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Open Control Room</a>
              <div style="font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a7a88;border-top:1px solid #2a2a36;padding-top:16px;margin-top:16px;">
                Lead id {_escape(inquiry.get('id'))} · received {_escape(inquiry.get('created_at'))}
              </div>
              <div style="font-size:12px;color:#7a7a88;margin-top:8px;">Sent by BrivoMarketing. We never ask for your password or card details by email.</div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """


def _recipients(raw: str) -> list:
    return [e.strip() for e in (raw or "").split(",") if e.strip()]


async def _send_via_proxy(*, to: str, subject: str, html: str) -> str:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json=payload,
        )
    if resp.status_code in (402, 403, 409):
        try:
            code = resp.json().get("code", "")
            msg = resp.json().get("message", "")
        except ValueError:
            code, msg = "", ""
        if code in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logger.warning("Email paused: %s (%s): %s", code, resp.status_code, msg)
            raise RuntimeError(f"email_paused:{code}")
    resp.raise_for_status()
    return resp.json().get("id")


async def send_new_lead_notification(inquiry: Dict[str, Any]) -> None:
    """Fire-and-forget. Never raises — always logs on failure."""
    if not is_configured():
        return
    notify_to = os.environ.get("NOTIFY_EMAIL", "hello@brivomarketing.com").strip()
    if not notify_to:
        return
    subject = f"New lead · {inquiry.get('name')} · {inquiry.get('service_interest')}"
    html = _inquiry_email_html(inquiry)
    try:
        await _send_via_proxy(to=notify_to.split(",")[0].strip(), subject=subject, html=html)
        logger.info("Lead email sent to %s for %s", notify_to, inquiry.get("email"))
    except Exception:
        logger.exception("Failed to send lead notification email")


async def send_email(to_email: str, subject: str, html: str) -> dict:
    """Generic send. Returns {ok, error?}. Never raises."""
    if not is_configured():
        return {"ok": False, "error": "Email not configured"}
    if not _recipients(to_email):
        return {"ok": False, "error": "NOTIFY_EMAIL not set"}
    try:
        await _send_via_proxy(to=to_email.split(",")[0].strip(), subject=subject, html=html)
        return {"ok": True}
    except Exception as e:
        logger.exception("send_email failed")
        return {"ok": False, "error": str(e)[:200]}
