# Brivo Marketing — PRD

## Original Problem Statement
"brivomarketing.com — build a marketing company website where we offer web design + marketing services. Sleek, stunning, shock-and-awe. Inquiries submit to backend. Goal: take large market share and secure deals."

## Architecture
- **Backend**: FastAPI + MongoDB (Motor). Pydantic v2 models with UUIDs.
- **Frontend**: React 19 + Tailwind, framer-motion, react-fast-marquee, Lenis smooth scroll, Shadcn UI for Dialog / Select / Input / Textarea, sonner for toasts.
- **AI**: emergentintegrations LlmChat with `anthropic/claude-sonnet-4-5-20250929` via EMERGENT_LLM_KEY. Chat history persisted to Mongo and replayed as context for multi-turn continuity.
- **Design**: dark cinematic, electric green (#CCFF00) accent, Cabinet Grotesk + Satoshi + JetBrains Mono fonts, asymmetric Bento layouts, grain texture, glassmorphic nav.

## User Personas
1. **Founder / CMO** evaluating agencies — needs proof of craft, pricing transparency, fast contact.
2. **Marketing manager** scoping vendors — needs services breakdown, case studies, tier comparison.
3. **Curious browser** — engaged via AI chat to qualify intent before form.

## Core Requirements (static)
- Stunning hero, services, portfolio, pricing, testimonials, blog/insights, footer
- Working inquiry form persisting to MongoDB
- AI chat assistant with multi-turn context
- Mobile responsive, no emoji icons, no Inter/Roboto fonts

## What's Implemented (Feb 2026)
- ✅ Hero with massive type + kinetic marquee + 3D background
- ✅ Stats bar, 5-card services grid, 3-step process, 4-item portfolio bento
- ✅ 3-tier pricing (Ignite / Accelerate / Dominate) with "Most Popular" highlight
- ✅ Testimonials carousel with prev/next + image swap
- ✅ Insights/blog teaser
- ✅ Massive "Ready to scale?" footer with CTA + contact
- ✅ Inquiry Dialog (Shadcn) — name, email, company, service, budget, message → POST /api/inquiries
- ✅ AI Chat Widget (floating) — POST /api/chat → Claude Sonnet 4.5 with conversation history replay
- ✅ Lenis smooth scroll, framer-motion entrance animations, magnetic underlines, accent glow buttons
- ✅ All testing-agent issues resolved (chat session continuity fixed)

## Backlog (P0 / P1 / P2)
- **P1**: Email notifications on new inquiry (Resend/SendGrid)
- **P1**: Admin dashboard (`/admin`) to view & manage inquiries
- **P1**: Real case study detail pages (currently links go to `#`)
- **P2**: Calendly / book-a-call embed
- **P2**: Newsletter signup + insights detail pages
- **P2**: Custom logo/illustration system to replace stock imagery
- **P2**: A/B testing variants for hero CTAs

## Next Tasks
1. Add Resend email notifications + admin dashboard
2. Build out case study detail pages with metrics
3. Add Calendly integration for direct booking
