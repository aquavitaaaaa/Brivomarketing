# Brivo — AI Performance Studio

## Problem statement
Premium dark-theme marketing-agency landing page for BrivoMarketing + a private
admin "Control Room" covering analytics, lead inbox, call logs, and a 24/7 AI
phone-agent operator (Bland.ai). Optimised for conversion — CTAs, inquiry
dialog, ROI calculator, case studies, pre-footer mega CTA.

## Users
- **Public visitors** — founders evaluating agency retainers. Must see proof,
  polish, and a low-friction inquiry flow.
- **Admin (single operator)** — in-house Brivo user. Monitors visits, leads,
  and the AI operator. Logs in at `/admin/login`.

## Core requirements — status

### Public site — DONE
- Hero with owl, marketing backdrop, animated CTAs — DONE
- Live ticker, Press shelf, ROI calculator, Case-study modal, Big CTA,
  Social-proof toaster, Crosshair cursor, Magnetic CTAs, Scroll-reveal,
  404 page, Favicon + OG meta — DONE
- Native scrolling (Lenis removed) — DONE
- Analytics beacon (POST `/api/analytics/event`) firing on every route change —
  DONE

### Backend — DONE (skeleton)
- `POST /api/inquiries` — main inquiry form → Mongo `inquiries`
- `POST /api/inquiries/roi` — ROI calculator lead → Mongo `inquiries`
  (with `roi_snapshot`)
- `POST /api/analytics/event` — anonymous pageview / CTA-click logging with UA
  parsing + best-effort IP geo (ipapi.co)
- `POST /api/auth/admin/login` + `GET /api/auth/admin/me` — JWT Bearer auth
- `GET/PATCH /api/admin/inquiries[/id]` — leads inbox with status transitions
- `GET /api/admin/analytics/summary` + `/recent` — aggregated dashboard data
- `GET /api/admin/operator/status`, `POST /toggle`, `POST /call`,
  `GET /api/admin/calls`, `POST /api/webhooks/bland` — Bland.ai plumbing
  (skeleton — raises 503 until `BLAND_API_KEY` is filled in)
- `POST /api/chat` — Brivo AI strategist (existing, untouched)
- Mongo indexes on users.email (unique), inquiries.created_at,
  analytics_events.created_at, calls.bland_call_id
- Admin seeded idempotently from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on every
  startup

### Admin dashboard (`/admin`) — DONE
- **Analytics tab** — 4 stat cards, daily chart, top countries / devices /
  browsers / OS / pages / referrers, CTA click leaderboard, 7/14/30-day range
- **Messages tab** — every chat-widget conversation. Left column: session list
  with visitor country / device / browser / IP. Right column: full transcript
  with per-message role + timestamp.
- **Leads tab** — inbox, expandable row, status transitions
  (new / contacted / qualified / won / lost), ROI snapshot surfaced
- **Agents tab** — CRUD over AI personas. Each agent: name, role
  (chat / voice / email), provider+model (whitelisted to 6 options), editable
  system prompt, temperature, enabled flag, default-for-role flag. Public
  `/api/chat` routes through whichever chat agent is marked `is_default`, so
  prompt edits go live without a redeploy.
- **Calls tab** — inbound + outbound call log with transcript + recording link
- **Operator tab** — status banner, toggle inbound on/off, outbound dial form
  (Name / Company / Custom task / Phone). Shows "Not connected" banner until
  `BLAND_API_KEY` is added. Resend email-alert indicator.
- JWT stored in `localStorage.brivo_admin_token`; expiry 7 days

## Backlog (explicitly deferred by user — "add later")

### P1 — Bland.ai live config
User will later add these to `/app/backend/.env`:
- `BLAND_API_KEY` (from https://app.bland.ai → API Keys)
- `BLAND_WEBHOOK_SECRET` (Account Settings → Keys → Replace Secret)
- `BLAND_INBOUND_NUMBER` (E.164 number purchased on Bland)
- `BLAND_PATHWAY_ID` (optional — if a pathway is built)
- `BLAND_FROM_NUMBER` (optional — caller ID for outbound)

Once added, the Operator tab flips to live automatically. No code changes
required.

### P1 — Lead email notifications (Resend)
Skeleton does not email on new lead. Hook required in `create_inquiry` +
`create_roi_lead`. User has not shared a Resend key yet.

### P2 — Social-media automation
Entirely deferred to a later session per user ("build skeleton for now").

### P2 — Refactor / maintainability
- Split `server.py` into router files (`inquiries.py`, `admin.py`,
  `operator.py`, `webhooks.py`) once skeleton stabilises
- `CORS_ORIGINS` is `*` with `allow_credentials=True` — fine for Bearer auth,
  but tighten before any cookie-based auth
- `analytics_utils.parse_user_agent` has a minor operator-precedence quirk for
  Android tablets (non-blocking)
- `bland_client.configure_inbound_number` only handles US-style numbers;
  broaden for international E.164 before going live in other regions
- Rate-limit or bot-filter `/api/analytics/event` before production
- `PressBar.jsx` is unused — delete on next cleanup

## Architecture

```
/app/backend/
├── server.py              # all routes + mongo + LLM chat
├── auth.py                # JWT + bcrypt + seed_admin
├── bland_client.py        # Bland.ai HTTP skeleton (503 if unconfigured)
├── analytics_utils.py     # UA parser + IP → country/city (best-effort)
├── .env                   # MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL,
│                          # ADMIN_PASSWORD, BLAND_* placeholders
├── requirements.txt
└── tests/backend_test.py  # 20 pytest cases (100% pass as of iteration_3)

/app/frontend/src/
├── App.js                 # routes: /, /admin/login, /admin, *
├── lib/api.js             # all public + admin API client helpers
├── pages/
│   ├── NotFound.jsx
│   ├── AdminLogin.jsx
│   └── AdminDashboard.jsx
├── components/admin/
│   ├── AnalyticsTab.jsx
│   ├── LeadsTab.jsx
│   ├── CallsTab.jsx
│   └── OperatorTab.jsx
└── components/site/       # (unchanged — landing page UI)
```

## Admin credentials
See `/app/memory/test_credentials.md` (seeded from env, re-synced on every
backend start).

## Changelog
- 2026-02 — Shipped admin skeleton: backend auth + leads + analytics + Bland
  operator skeleton + full admin dashboard UI. Removed Lenis smooth-scroll.
  Wired InquiryDialog + RoiCalculator to Mongo-backed endpoints. 20/20 pytest
  pass, 0 frontend regressions (see `/app/test_reports/iteration_3.json`).
- 2026-02 — Landing page visual redesign: cyberpunk → editorial light theme
  (ivory/navy/gold, Fraunces + Inter). All site components rewritten. Instagram
  integration added across nav, hero, mobile menu, footer.
- 2026-02 — Hero redesigned as an Apple/Tesla-style product showcase:
  `HeroShowcase.jsx` renders a floating MacBook + iPhone that auto-rotate
  through 5 Gemini-generated UI mockups (SaaS dashboard, luxury e-commerce,
  creative agency, fine dining, wellness mobile) every 4.2s. Background toned
  down to a subtle stage so devices are the star. Headline: "Custom websites,
  built to move markets."
- 2026-02 — Instagram nav icon shifted to gold treatment so it pops against
  both the dark hero and light scrolled nav.
- 2026-02 — Shipped `/brand-kit` social media blitz download page. 10 Gemini-
  generated assets (avatars dark/light, Instagram story/post/cover,
  X/Twitter header, YouTube banner, LinkedIn cover, horizontal logo
  lockups dark/light). Page renders palette + type reference + per-asset
  download + copy-link buttons. Linked from footer under "Studio".
  Assets live in `/app/frontend/public/kit-assets/`.

## Roadmap
- P1: Allow regenerating any single brand-kit asset from the UI (admin-only).
- P1: Add PNG + SVG variants alongside each JPG for higher-quality placement.
- P2: Scheduler integration — share a single kit-assets link to Later/Buffer.
- P2: Video reel hero variant via Sora 2 for even more "money" feel.
