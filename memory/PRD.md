# PRD — BrivoMarketing Go-Live (67.217.246.13 + brivomarketing.com)

## What this project is
BrivoMarketing: AI performance-studio marketing site (React) + FastAPI backend
(inquiries, chat, admin CRM, social auto-poster, lead engine, affiliates) +
host agent for a home Mac Mini that drives real social posting.
Repo: github.com/aquavitaaaaa/Brivomarketing (private, branch main).

## Where things stand (2026-11-02)
- GitHub project is on this box and RUNNING: backend live, admin login
  verified, inquiry validation verified, frontend serving
  "Brivo — AI Performance Studio".
- Fixed on this box: resend added to venv, ADMIN seed crash hardened
  (backend starts without ADMIN creds), react-helmet-async installed,
  hero horizontal-overflow fixed (desktop + mobile re-verified).
- Go-live artifacts committed locally (bee9f42, NOT yet pushed — GitHub
  returns 403 "Write access not granted" for the saved PAT despite the API
  reporting push:true; owner must re-issue token or grant write):
  - scripts/deploy-67.sh — one-command prod deploy for 67.217.246.13
    (system deps, venv, nginx, systemd, certbot HTTPS, sitemap regen)
  - backend/.env.example — full env template for the live box
  - sitemap.xml + robots.txt regenerated for https://brivomarketing.com
  - frontend/yarn.lock now tracked for reproducible builds

## GitHub (remote) vs this box (local) — inventory
- Remote: full BrivoMarketing app — 26 backend .py files (server, auth,
  social suite, lead engine, affiliates, IG direct), 246 frontend files
  (site components, 14 pages, admin), agent_host (Mac Mini poster),
  scripts (incl. gen_sitemap.py), backend tests.
- Local: identical to remote PLUS the go-live commit above.
- Neither 74.208.113.74 nor 67.217.246.13 hosts Brivo today (.74 = solar +
  GivBux apps; .13 = game dashboard + KAIROS deck). Real brivo.com is WP
  Engine (unrelated). brivomarketing.com currently 403 "Edge IP Restricted"
  (Cloudflare 1034 — domain not attached to any hosting; DNS points at
  Cloudflare IPs waiting for a server).

## What's needed to port this to 67 + get it on the domain
1. OWNER — GitHub: re-issue PAT with Contents write (or invite
   collaborator), then push bee9f42. Nothing deploys until this lands.
2. OWNER — 67 box: rotate the exposed root password, then run
   scripts/deploy-67.sh as root (needs fresh secure access; we never SSH'd).
   Script installs Mongo/nginx, builds frontend with
   REACT_APP_BACKEND_URL=https://brivomarketing.com, issues HTTPS via
   certbot, serves /agent-host/ for the Mac Mini installer.
3. OWNER — env on 67: copy backend/.env.example to backend/.env and set
   ADMIN_EMAIL/ADMIN_PASSWORD (strong), JWT_SECRET (32+ random), CORS_ORIGINS
   + PUBLIC_BASE_URL to https://brivomarketing.com (+www). Optional keys can
   stay empty (skeleton mode): RESEND_API_KEY, EMERGENT_LLM_KEY (chat returns
   500 "LLM key not configured" until set — verified), Meta/Bland/X/Twilio.
4. OWNER — DNS (Cloudflare): A @ to 67.217.246.13, A www to 67.217.246.13
   (DNS-only first, then orange-cloud + Full/Strict SSL after certbot).
   This clears the current 1034 Edge-IP-Restricted error.
5. Post-deploy: submit sitemap in Search Console, set BOOKING_URL in
   frontend/src/lib/config.js if a scheduler link exists, pair the Mac Mini
   via /admin/social, change default admin password.

## Test status
- PASS: backend root, admin login + JWT, inquiry validation (4xx on bad
  email/missing fields), frontend title + desktop/mobile screenshots,
  production yarn build.
- KNOWN-GAP (not a bug): /api/chat returns 500 "LLM key not configured"
  until EMERGENT_LLM_KEY is set on the box. Test file expects chat to work;
  set the key or accept fallback before calling it done.
- NOT done: testing-agent e2e (backend suite run directly instead),
  push to GitHub (blocked on 403), anything on the 67 box (no access used).

## Backlog
- P0: push bee9f42 once token fixed; deploy-67.sh run; DNS cutover.
- P1: set EMERGENT_LLM_KEY + RESEND keys; verify chat + lead emails live.
- P2: rotate both exposed root passwords; retire KAIROS/THX-Scout vhosts.
