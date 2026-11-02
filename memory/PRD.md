# PRD — BrivoMarketing Go-Live (67.217.246.13 + brivomarketing.com)

## What this project is
BrivoMarketing: AI performance-studio marketing site (React) + FastAPI backend
(inquiries, chat, admin CRM, social auto-poster, lead engine, affiliates) +
host agent for a home Mac Mini that drives real social posting.
Repo: github.com/aquavitaaaaa/Brivomarketing (public for deploy, branch main).

## LIVE STATUS (2026-11-02, verified by testing_agent iteration_9: 5/5 pass)
- https://brivomarketing.com serves Brivo ("Brivo — AI Performance Studio").
- /login.html?next=%2F 301-redirects to / (legacy Kairos login URL retired).
- HTTP -> HTTPS redirect works. /api/ live. LE cert valid to Jan 2027.
- Zero Kairos/khaelyx/Emergent strings in visible text (partners = EVERLINE).
- Backend active on 67 (port 8201), mongo container brivo-mongo, nginx vhost.
- Inbox + autopilot CREDS on 67: email keys present (4 keys), autopilot
  enabled manual mode, posts_per_day=4, 3 queued teasers.

## What was built this session
- Side-by-side deploy on shared 67 box (own /opt/brivo, ports 8201/27027,
  mongo container, nginx vhost, systemd service) — other sites untouched.
- DNS cutover: apex + www to 67.217.246.13, DNS-only. certbot HTTPS.
- Managed email for lead alerts (from=BrivoMarketing, reply-to=hello@).
  BLOCKED on empty Emergent credit balance (402 insufficient_credits on live
  send test) — code correct, needs top-up under Universal Key Buy Credits.
- Autopilot posts_per_day (1-4, default 4) with randomized daily windows;
  caption fallback so queue never stores blanks (verified 4/4 non-empty).
- Sanitize: no customer-facing Emergent/khaelyx refs; TrustBar=EVERLINE.
- gen_sitemap repo-relative; tests point at brivomarketing.com; backend suite
  5 passed 1 skipped.

## hello@brivomarketing.com — receiving status
- MX still points to registrar forwarding (eforward registrar-servers),
  NOT Cloudflare Email Routing (status unconfigured, no addresses API).
- Saved Cloudflare token fails verify (Invalid API Token) — need fresh token
  with Zone:Edit + Email Routing:Edit to enable hello@ receiving via CF.
- Until then: lead alerts SEND to hello@ (once credits topped up) but hello@
  receiving depends on registrar forwarding config (outside this box).

## Auto-posting 4x/day — how it works + how to go live-posting
- Autopilot tick creates up to 4 posts/day at randomized slots across
  07-10 / 11-14 / 15-18 / 19-21 ET windows; manual mode = drafts for review,
  auto mode = queued for publish. Teasers generate via AI with curated
  fallback. 8-teaser batch verified locally.
- Publishing needs a paired channel: /admin/social -> pair X/IG/LinkedIn or
  the Mac Mini host agent (agent_host/). Until paired, queue builds drafts.
- To start: Admin Social -> enable autopilot auto mode -> pair channel.

## Backlog
- P0: top up Emergent credits (unblocks lead-alert emails); fresh CF token
  for Email Routing hello@ receiving.
- P1: pair social channel or Mac Mini agent; flip autopilot to auto mode.
- P2: rotate both exposed root passwords; retire KAIROS/THX vhosts if desired.
