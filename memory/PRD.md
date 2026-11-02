# PRD — BrivoMarketing Go-Live (67.217.246.13 + brivomarketing.com)

## What this project is
BrivoMarketing: AI performance-studio marketing site (React) + FastAPI backend
(inquiries, chat, admin CRM, social auto-poster, lead engine, affiliates) +
host agent for a home Mac Mini that drives real social posting.
Repo: github.com/aquavitaaaaa/Brivomarketing (private, branch main).
PUSHED to GitHub 2026-11-02 (commit 680e785, origin/main in sync).

## Where things stand (2026-11-02)
- GitHub project is on this box and RUNNING: backend live, admin login
  verified, inquiry validation verified, frontend serving
  "Brivo — AI Performance Studio".
- Fixed on this box: resend added to venv, ADMIN seed crash hardened,
  react-helmet-async installed, hero horizontal-overflow fixed (desktop +
  mobile re-verified), .env files untracked + gitignored, crash dumps
  removed from history, frontend/yarn.lock tracked.
- PUSHED: scripts/deploy-67.sh, backend/.env.example, domain sitemap +
  robots.txt, overflow fixes.

## GitHub vs this box — inventory
- Remote == local (0 ahead, 0 behind). Remote: 26 backend .py files, 246
  frontend files, 14 pages, admin suite, agent_host, scripts, backend tests.
- Neither 74.208.113.74 nor 67.217.246.13 hosts Brivo today (.74 = solar +
  GivBux; .13 = game dashboard + KAIROS deck). brivomarketing.com = Cloudflare
  1034 Edge IP Restricted (domain parked, not attached to any server).

## What remains: deploy to 67 + connect domain (needs box access)
1. OWNER — 67 box: rotate exposed root password in IONOS console first.
2. SSH into 67 and run (as root):
     git clone https://github.com/aquavitaaaaa/Brivomarketing.git /opt/brivo
     bash /opt/brivo/scripts/deploy-67.sh brivomarketing.com
   Script installs Mongo/nginx, builds frontend with
   REACT_APP_BACKEND_URL=https://brivomarketing.com, configures nginx
   (frontend + /api/ proxy + /agent-host/), systemd backend, certbot HTTPS.
   NOTE: script clones via HTTPS — needs repo access from the box
   (deploy key or public repo) OR copy /opt/brivo over manually.
3. On 67: cp backend/.env.example backend/.env, set ADMIN_PASSWORD
   (strong), JWT_SECRET (32+ random). Optional empty = skeleton mode:
   RESEND_API_KEY, EMERGENT_LLM_KEY (chat 500s until set), Meta/Bland/X.
4. DNS (Cloudflare): A @ to 67.217.246.13, A www to 67.217.246.13,
   DNS-only until certbot succeeds, then orange-cloud + Full/Strict.
   Then re-run deploy script if certbot first failed.
5. Post-deploy: verify https://brivomarketing.com + /api/, submit sitemap
   in Search Console, set BOOKING_URL in frontend/src/lib/config.js,
   pair Mac Mini via /admin/social, change default admin password.

## Test status
- PASS: backend root, admin login + JWT, inquiry validation, frontend
  title + desktop/mobile screenshots, production yarn build.
- KNOWN-GAP: /api/chat 500s without EMERGENT_LLM_KEY (by design).
- NOT done: e2e testing-agent, anything ON the 67 box (no SSH used —
  only public HTTP/HTTPS/banner probes per approved read-only plan).

## Backlog
- P0: deploy-67.sh run on 67; DNS cutover; HTTPS verify.
- P1: EMERGENT_LLM_KEY + RESEND keys; verify chat + lead emails live.
- P2: rotate both exposed root passwords; retire KAIROS/THX-Scout vhosts.
