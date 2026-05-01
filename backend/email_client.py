"""
Resend email helper — fire-and-forget new-lead notifications.

Configure via /app/backend/.env:
  RESEND_API_KEY   — from https://resend.com → API Keys
  SENDER_EMAIL     — verified sender (e.g., "Brivo <leads@brivomarketing.com>")
                     or "onboarding@resend.dev" while testing.
  NOTIFY_EMAIL     — destination for new-lead alerts (default hello@brivomarketing.com)

If RESEND_API_KEY is empty we silently skip (skeleton mode).
"""
import os
import asyncio
import logging
import html as html_lib
import resend
from typing import Dict, Any

logger = logging.getLogger(__name__)


def is_configured() -> bool:
    return bool(os.environ.get("RESEND_API_KEY", "").strip())


def _escape(v: Any) -> str:
    return html_lib.escape(str(v)) if v is not None else ""


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
              <div style="font-family:monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#CCFF00;">/ New lead · Brivo</div>
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
              <div style="font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7a7a88;border-top:1px solid #2a2a36;padding-top:16px;">
                Lead id {_escape(inquiry.get('id'))} · received {_escape(inquiry.get('created_at'))}
              </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """


def _send_sync(to_email: str, subject: str, html: str) -> None:
    resend.api_key = os.environ["RESEND_API_KEY"]
    sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
    resend.Emails.send({
        "from": sender,
        "to": [to_email],
        "subject": subject,
        "html": html,
    })


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
        await asyncio.to_thread(_send_sync, notify_to, subject, html)
        logger.info(f"Lead email sent to {notify_to} for {inquiry.get('email')}")
    except Exception:
        logger.exception("Failed to send lead notification email")
