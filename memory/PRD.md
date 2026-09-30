# Brivo — AI Performance Studio

## Problem statement
Premium marketing-agency landing page for BrivoMarketing + private admin "Control Room" (analytics, leads, calls, Bland.ai AI phone operator, lead engine, social auto-poster, affiliates). Goal: more exposure and more clients.

## Implemented
- Public site, ROI calc, chat, case-study modal, analytics, admin dashboard, lead engine, social agent/direct IG poster (pre-existing).
- 2026-09-30: env restored (backend/.env, frontend/.env), app running in preview.
- 2026-09-30: Alerts — `backend/alerts.py`: new inquiry/ROI/audit/AI-call -> Resend email + Twilio SMS + dashboard feed; hot lead (signal_score >= HOT_LEAD_THRESHOLD, default 75, cap 20/day) batched every 90s. Admin "Alerts" tab with channel checklist + test button. Keys blank in backend/.env -> channels show "skipped" until set.
- 2026-09-30: Instagram autopilot — `backend/social_autopilot.py` + `AutopilotPanel.jsx` (in /admin/social). Modes auto / timed / manual(draft+approve), timezone, post-now, editable drafts, 12 branded social shots (`scripts/make_social_cards.py` -> public/kit-assets/social). Channels: Graph API (META_ACCESS_TOKEN + IG_BUSINESS_ACCOUNT_ID + PUBLIC_BASE_URL) > direct account > paired host.
- 2026-09-30: Portfolio: added DWJ Home Services (dwjhomeservices.com) and LOBA Catskill Restaurant (lobacatskills.com) case studies with "Visit live site" link; seeded as client wins for the recycler.
- Bland webhook URL now uses PUBLIC_BASE_URL; phone leads alert.

## Keys the user must add in /app/backend/.env
RESEND_API_KEY, SENDER_EMAIL, NOTIFY_EMAIL; TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ALERT_SMS_TO; BLAND_API_KEY, BLAND_INBOUND_NUMBER, BLAND_PATHWAY_ID, BLAND_WEBHOOK_SECRET; META_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID. Set PUBLIC_BASE_URL to the production domain after deploy.

## Backlog
P1: Verify email/SMS/Bland/IG with real keys; deploy + custom domain. P2: real screenshots of client sites, testimonials, case-study pages/SEO, Reels/carousel autopilot.
