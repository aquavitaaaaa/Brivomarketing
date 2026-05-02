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
- 2026-02 — **Brand kit PDF rebuild.** Replaced the 16 MB 11-page placeholder
  PDF with a 4 MB 13-page editorial lookbook generated by
  `/app/scripts/generate_brand_kit_pdf.py` (ReportLab + Fraunces/Inter).
  Pages: full-bleed cover, TOC, manifesto, logo system, color system,
  typography, do/don't, Instagram-in-context (phone mockup), X/LinkedIn/
  YouTube covers, voice & tone, social playbook (weekly cadence + caption
  formula), asset index with clickable URLs, and a cinematic back cover
  with CTA. `BrandKit.jsx` hero redesigned with a stacked-page PDF preview,
  page-thumbnail strip, and 13/10/7 stat row. Pre-rendered preview images
  saved under `/app/frontend/public/kit-assets/brand-kit-*.png`.
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
- 2026-02 — Upgraded `/brand-kit` from a 13-page kit into a full 17-page
  **Press Kit** (8.1 MB). New sections wired into
  `/app/scripts/generate_brand_kit_pdf.py`: Fact Sheet, Featured In
  (TechCrunch / Forbes / Fast Company / Bloomberg / WSJ), Awards, and
  Case Studies (+318% Obsidian / +412% Vault / +227% Meridian). Instagram
  takeover now a real 3×3 grid built from `/app/scripts/prepare_ig_tiles.py`
  (9 tiles: wordmark posters, stat plates, testimonial quotes, real IG
  post/cover/story crops, "As featured in" tile). Frontend hero copy,
  counters, CTA label, PDF cover pill, and thumbnail strip all updated to
  reflect the 17-page press kit and showcase Awards + Case Studies + IG
  grid pages. Visual audit via `analyze_file_tool` passed: every page
  flagged "visually striking", zero bland or placeholder pages.

## Roadmap
- 2026-02 — Built **Social Auto-Poster** end-to-end: Mac-host browser-automation
  architecture (Playwright + persistent Chromium profile + outbound WebSocket
  to backend), one-click installers for **macOS / Windows / Linux** at
  `/app/agent_host/install.sh`, `install.ps1`, `install-linux.sh`. Agent
  script at `/app/agent_host/agent.py` (publicly served at
  `/agent-host/install.{sh,ps1}` and `/agent-host/agent.py`). Backend:
  `social_agent.py` (pair codes, agent JWT, WebSocket, job dispatcher,
  scheduler loop), `social_content.py` (Gemini caption + Nano Banana image
  factory with brand-kit weekly rhythm + graceful fallback templates when
  EMERGENT_LLM_KEY budget exceeded). Admin UI at `/admin/social` with
  OS-tabbed pair flow (Mac/Win/Linux), host status with per-platform login
  dots (X / IG / LinkedIn), content queue, manual post composer, "Generate
  next 14 days" AI batch, recent runs feed with click-to-view-screenshot
  modal. Posting handlers shipped for X, Instagram, LinkedIn (real
  Playwright DOM automation in agent.py).
- 2026-05-02 — **Social Phase 1 Safety + Content Factory** (DONE).
  `social_safety.py` enforces account warm-up (7-day tiered limits), cadence
  guardrails (max-posts/day, min-minutes-between, quiet hours), and
  failure auto-pause (3 consecutive fails → platform paused). `hook_library`
  + `client_wins` collections seeded. Cross-poster (`/api/admin/social/posts/multi`)
  with graceful LLM fallback (deterministic stub variants when budget exhausted).
  Admin UI: Safety Panel, Wins Manager, Cross-poster — all wired.
- 2026-05-02 — **Autonomous Client Acquisition Engine** (DONE — P0).
  `lead_engine.py` runs three background loops:
    1. Lead discovery (every 30 min) — scans Reddit `new.json` across
       small-business / Entrepreneur / marketing / startups / Restaurants /
       ecommerce / shopify / FBA / DigitalMarketing / WebDev for 10 buying-
       signal regex patterns; computes a heuristic 0-100 signal score per lead.
    2. Outreach dispatch (every minute) — picks the highest-scoring discovered
       leads, composes a hyper-personalised opener via Gemini (with
       deterministic fallback when LLM is down), inserts an outreach_jobs doc,
       attempts to send via the paired Playwright agent (best-effort: stays
       queued if agent offline). Daily cap (DEFAULT 25/day) + 4-min spacing.
    3. Reply nurturer — `POST /api/admin/leads/{id}/reply` runs the AI SDR
       turn-by-turn, qualifies, and either books (Calendly link from
       `CALENDLY_LINK` env) or escalates.
  Admin endpoints: `/api/admin/leads/pipeline`, `/leads`, `/leads/{id}`,
  `/leads/discover-now`, `/leads/{id}/dispatch`, `/leads/{id}/reply`,
  `/leads/{id}/stage`, `/leads/import`, `/outreach/jobs`.
  Frontend: `AdminLeadEngine.jsx` at `/admin/leads` — pipeline tiles, stage
  filters, lead list with score, lead drawer with full conversation, AI
  Nurturer reply box, manual stage transitions, Quick Import (paste JSON),
  Outreach Jobs audit log. Linked from main admin nav.
  Tests: 21/21 PASS in `/app/backend/tests/test_lead_engine.py`.
- 2026-05-02 — `/api/chat` (public visitor chat) hardened with the same
  graceful fallback pattern when EMERGENT_LLM_KEY budget is exhausted —
  visitors now get a friendly "AI is recharging, leave your email" handoff
  instead of a 502.
- 2026-05-02 — **Tesla-style Admin redesign + AI Auto-Qualifier + Outreach
  Analytics** (DONE — P0). New X11-Gray (#bebebe) chassis with embedded
  black "screen" panels, telemetry strip with live AI status + clock,
  battery-style score bars on every lead, big tabular telemetry numbers.
  AdminLogin, AdminDashboard, and AdminLeadEngine fully redesigned.
  New endpoints:
    - `POST /api/admin/leads/{id}/qualify` — single-lead LLM rescore
    - `POST /api/admin/leads/auto-qualify` — batch rescore all `discovered`
    - `GET  /api/admin/leads/analytics`    — funnel + rates + 7d outreach
  Route ordering fix: literal routes declared before /{lead_id} dynamic.
  34/34 backend tests pass.

## Backlog (Phase 2 → 4)
- **P1 Phase 2 — Engagement Flywheel**: Auto-DM responder using paired
  Playwright agent (DM agent already seeded), Comment auto-likes + AI
  reply, Thread builder (multi-tweet long-form), Auto-repurpose loop
  (one piece → 5 platforms × 3 formats).
- **P1 Phase 2.5 — Lead Engine v2**: real LinkedIn + X scraping channels
  (currently MVP is Reddit-only); per-channel daily caps; bulk-importer
  CSV upload UI; Calendly OAuth for real booking; webhook for inbound
  reply detection (currently only the simulate-reply path).
- **P2 Phase 3 — Growth Engines**: Trend hijacker (Reddit/X trending +
  cosine-similarity to Brivo niches), RSS/news repurposer, Best-time-to-
  post AI from analytics, Live engagement dashboard.
- **P3 Phase 4 — Advanced**: Mention magnet, Drip DM campaigns, BTS
  auto-capture, UGC mining, Multi-account broadcast, Threads / Reddit
  posting / YouTube Shorts handlers.
- P1: Allow regenerating any single brand-kit asset from the UI (admin-only).
- P1: Add PNG + SVG variants alongside each JPG for higher-quality placement.
- P2: Scheduler integration — share a single kit-assets link to Later/Buffer.
- P2: Video reel hero variant via Sora 2 for even more "money" feel.
- Refactor: move messages out of the lead doc into a `lead_messages`
  collection before any lead exceeds 100+ turns (Mongo 16MB doc limit).
- Refactor: move social_agent + lead_engine into `/app/backend/routes/`.
