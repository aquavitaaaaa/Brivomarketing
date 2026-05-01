# Brivo — AI Performance Studio (Landing)

## Problem statement
Build a premium, "Tesla/Apple-keynote tier" marketing agency landing page for
BrivoMarketing with a dark, neon lime/violet aesthetic. Owl logo provided by
user (public/owl-logo.jpg). Must convert — hero CTA, inquiry dialog, case
studies, pricing, pre-footer mega CTA.

## Users
Founders of high-growth brands considering an agency retainer. Expect
substance (real KPIs, receipts) and motion/interaction polish on par with
top design studios.

## Core requirements — status
- Hero with owl branding, animated headline, live-stats, service marquee — DONE
- Marketing backdrop with floating browser/dashboard mockups — DONE
- Press shelf ("As featured in" typographic wordmarks + quotes) — DONE (`PressShelf`)
- ROI calculator with 3 sliders + email-capture → Inquiry dialog — DONE (`RoiCalculator`)
- Portfolio grid that opens case-study modal (hero, KPI grid, quote, CTA) — DONE (`Portfolio` → `CaseStudyModal`)
- Big pre-footer CTA card with owl crest — DONE (`BigCtaCard`)
- Live results ticker strip with marquee — DONE (`LiveTicker`)
- Social-proof toaster (bottom-left, rotating messages) — DONE (`SocialProofToaster`)
- Magnetic CTA effect on primary buttons — DONE (`MagneticCta` wraps Hero / Footer / BigCTA / ROI / CaseStudy)
- Crosshair cursor (desktop only, scopes-up on interactives) — DONE (`CrosshairCursor`)
- Scroll-reveal wrappers on StatsBar and Insights — DONE (`ScrollReveal`)
- 404 "Lost in the noise." page with owl — DONE (`/app/frontend/src/pages/NotFound.jsx`, route `*`)
- Favicon + OG + Twitter meta + correct page title — DONE (`public/index.html`)
- "Made with Emergent" badge removed — DONE
- Owl logo (user-provided `owl-logo.jpg`) everywhere — DONE

## Changelog
- 2026-02-XX — Wired all 10 orphaned enhancement components into App.js,
  Portfolio, Hero, Footer. Added `@keyframes marquee`, `.animate-marquee`,
  `.custom-cursor-on`, `.roi-slider` CSS. Added favicon, OG/Twitter meta,
  updated page title to "Brivo — AI Performance Studio". Hero CTA and Footer
  CTA wrapped in MagneticCta. Portfolio cards open CaseStudyModal with KPIs +
  quote. ROI email submit opens Inquiry dialog pre-populated.
- Tested by frontend testing agent (iteration_2.json) → 100% pass, zero bugs,
  zero console errors.
- Follow-up polish: hid MarketingBackdrop on mobile (<md) to fix H1
  readability; AnalyticsCard now hidden below md instead of lg.

## Architecture
```
/app/frontend/
├── public/
│   ├── index.html            # favicon, OG tags, title = "Brivo — AI Performance Studio"
│   └── owl-logo.jpg          # user-provided logo (referenced everywhere)
└── src/
    ├── App.js                # routes: "/" Home + "*" NotFound; mounts CrosshairCursor, SocialProofToaster, CaseStudyModal globally
    ├── index.css             # added marquee keyframes, cursor utility, roi-slider thumb
    ├── pages/NotFound.jsx
    └── components/site/
        ├── Hero.jsx                 (hero-cta wrapped in MagneticCta; backdrop hidden on mobile)
        ├── MarketingBackdrop.jsx
        ├── LiveTicker.jsx           (between Hero and PressShelf)
        ├── PressShelf.jsx           (replaces PressBar in App.js; PressBar.jsx unused)
        ├── Portfolio.jsx            (buttons -> onOpen(project))
        ├── CaseStudyModal.jsx       (global, controlled by App.activeCase)
        ├── RoiCalculator.jsx        (onSubmitLead -> openInquiry)
        ├── BigCtaCard.jsx           (pre-footer)
        ├── Footer.jsx               (footer-cta wrapped in MagneticCta)
        ├── SocialProofToaster.jsx   (global, hidden md:block)
        ├── CrosshairCursor.jsx      (global, pointer:fine only)
        ├── MagneticCta.jsx
        └── ScrollReveal.jsx         (wraps StatsBar, Insights in App.js)
```

## Backlog / P1-P2
- Replace typographic press wordmarks with real authorised press logos (needs legal sign-off)
- Real case-study pages (`/work/:slug`) with richer narrative, gallery, attachments
- Blog/Insights real content (currently static card grid in `Insights.jsx`)
- Connect Inquiry form → email (Resend) or CRM webhook
- Connect ROI lead-capture → same backend endpoint; store in Mongo
- `PressBar.jsx` is now unused — delete on next refactor pass

## Dev notes for next agent
- User is highly visual-driven. Keep Tesla/Apple tier polish; avoid generic
  SaaS tropes and "AI slop" purple gradients.
- Do not revert the owl logo to an SVG. The `owl-logo.jpg` in `public/` is
  deliberate and user-provided.
- Backend exists (`/app/backend`) but the Inquiry dialog is currently
  frontend-only (no POST). Hooking it to `/api/inquiries` is the next
  logical backend task.
