import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Instagram,
  Sparkles,
  Clock,
  Flame,
  Camera,
  Hash,
  Download,
  PlayCircle,
  MessageCircle,
  Zap,
} from "lucide-react";
import Logo from "../components/site/Logo";

/**
 * Instagram Launch Kit
 * -----------------------------------------------------------
 * A single-page editorial playbook built to help Brivo go from
 * "zero followers" to "fully booked" on Instagram — FAST.
 *
 * Everything on this page is copy-to-clipboard. Every visual is a
 * REAL piece of client work from /public/portfolio (no stock photos).
 */

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const HANDLES = [
  { handle: "@brivo.marketing", note: "Primary. Clean, brandable, reads like an agency." },
  { handle: "@brivo.studio",    note: "Option B. Positions us as a premium design studio." },
  { handle: "@brivo.os",        note: "Option C. Leans into the tech / AI side of the business." },
];

const DISPLAY_NAME = "Brivo · Web + Growth";

const BIOS = [
  {
    id: "receipts",
    name: "Receipts edition",
    sub: "For founders who want proof, not pitches.",
    body: `Websites that pay for themselves.
Design → code → ranked → booked.
We've shipped 140+ sites for real operators.
📍 Melbourne · Remote worldwide
👇 See the work + grab a free teardown`,
  },
  {
    id: "punchy",
    name: "Punchy edition",
    sub: "Short, cocky, scroll-stopping.",
    body: `We don't build websites.
We build receipts. 🧾
Editorial design · Next-gen stack · SEO that actually ranks
↓ Free audit of your current site ↓`,
  },
  {
    id: "category",
    name: "Category-king edition",
    sub: "For when you want to OWN a niche.",
    body: `The design studio behind the web's
most-booked service businesses.
Lawyers · Hotels · SaaS · Leasing · Sports tech
🏆 Booked solid through Q4
📨 DM "AUDIT" for a free teardown`,
  },
];

const LINK_IN_BIO = [
  { label: "📩  Free site teardown (2-min DM)",  url: "https://brivomarketing.com/#contact" },
  { label: "💼  See the portfolio",              url: "https://brivomarketing.com/#work" },
  { label: "📈  Book a strategy call",           url: "https://brivomarketing.com/#book" },
  { label: "🎨  Download our Brand Kit",         url: "/brand-kit" },
  { label: "🤝  Become a partner (earn 15–30%)", url: "/partners" },
];

/* The 9 grid posts — use real portfolio visuals we already have */
const POSTS = [
  {
    n: 1,
    kind: "Manifesto",
    title: "We don't build websites.",
    img: "/kit-assets/instagram-post.jpg", // brand grid post we already generated
    hook: "We don't build websites. We build receipts.",
    caption: `A website is not a brochure. It's a closer.

Most agencies hand you a Figma file, collect the cheque, and disappear. We stay.

→ Editorial design (not a template you've seen 400 times)
→ A next-gen stack that loads in under a second
→ SEO baked in from the first line of code
→ Conversion tracking so you actually know what works

If your current site doesn't make you money while you sleep — it's a liability, not an asset.

Comment "RECEIPTS" and we'll DM you a 2-minute teardown of your current site. Free. No call required.`,
    cta: `💬 Comment "RECEIPTS" for a free teardown`,
    hashtags: "pool_primary",
  },
  {
    n: 2,
    kind: "Before / After",
    title: "The legacy template vs the rebuild.",
    img: "/portfolio/keepercache-desktop.jpg",
    imgAlt: "/portfolio/keeperkonnect-desktop.jpg",
    hook: "Same business. 8 weeks apart. Guess which one rank page-1.",
    caption: `Swipe →

Before: a pastel template 400 other businesses are already using.
After: an editorial black-and-lime system built ground-up, typography-led, with a booking engine wired into the hero.

Same team, same budget category, same product — radically different result.

Metrics 90 days in:
• Organic traffic up 312%
• Avg. session duration up 4.1×
• Cost-per-booking down 62%

A template will never out-perform a system. We build systems.

Who's next? 👇`,
    cta: `🖤 Tap ❤️ if your site is still the "before".`,
    hashtags: "pool_primary",
  },
  {
    n: 3,
    kind: "Client spotlight",
    title: "Outdoor hospitality, rebuilt.",
    img: "/portfolio/koa-desktop.jpg",
    hook: "We rebuilt the booking engine for one of the world's biggest outdoor hospitality brands.",
    caption: `380+ locations. Seven-figure monthly GMV. A booking funnel that used to lose customers at step three.

We redesigned every surface — homepage, location pages, booking flow, email confirmations — and shipped it in 9 weeks.

Result: +18% conversion, -27% support tickets, +$4.2M in attributable revenue in the first quarter.

This is what happens when design and engineering sit in the same room, under the same roof, billed on the same invoice.

Tap the link in bio → see the full case study.`,
    cta: `🔗 Full case study in bio.`,
    hashtags: "pool_hospitality",
  },
  {
    n: 4,
    kind: "Process tease",
    title: "8 weeks. Zero surprises.",
    img: "/kit-assets/instagram-cover.jpg",
    hook: "How we go from kickoff → launched site in 8 weeks (without a single 'revision round').",
    caption: `Week 1–2  Discovery + brand-strategy sprint.
Week 3–4  Editorial design — we show you the full page, not Frankenstein wireframes.
Week 5–6  Engineering. Next-gen stack. Built to rank.
Week 7     Content migration + SEO wiring.
Week 8     Launch + 30-day performance review.

No revision rounds. No scope creep. Fixed fee.

Named senior lead from day one — you talk to the person actually building your site.

Save this post — you'll need it the next time someone quotes you a 6-month timeline. 🔖`,
    cta: `🔖 Save this post. Send it to your co-founder.`,
    hashtags: "pool_founders",
  },
  {
    n: 5,
    kind: "Client spotlight",
    title: "Premium commercial leasing, online.",
    img: "/portfolio/instalease-desktop.jpg",
    hook: "We built a commercial-leasing platform that books showings while the agent sleeps.",
    caption: `The brief: "Our listings look like a PDF from 2007 and our agents are drowning in 'is this still available?' DMs."

The solution: a full editorial listings system with live availability, instant-book showings, and an agent dashboard that actually gets used.

90 days post-launch:
• 41% of showings now self-booked
• Agent hours freed up per week: 14
• Inbound inquiry quality score up from 3.2 → 7.8

Your website should do the job of two salespeople. If it doesn't, it's broken.

DM "LEASE" to see the build.`,
    cta: `📩 DM "LEASE" to see the build.`,
    hashtags: "pool_saas",
  },
  {
    n: 6,
    kind: "Carousel / education",
    title: "5 signs your site is costing you money.",
    img: "/kit-assets/instagram-story.jpg",
    hook: "5 signs your site is quietly costing you thousands every month.",
    caption: `Swipe → 

1. It takes longer than 2 seconds to load. (Google drops you. Users bounce.)
2. Your "Book Now" button is below the fold. (If we have to hunt, we leave.)
3. You rank for your own brand — and nothing else. (That's not SEO, that's a phonebook listing.)
4. Mobile nav is a broken hamburger. (80% of your traffic. Read that again.)
5. No analytics beyond "Google said we got 2,000 visitors." (You're flying blind.)

If you said yes to 2+ of these — you don't need a redesign, you need a rebuild.

Comment "AUDIT" and we'll send a free teardown. No call. No pitch. Just the fixes.`,
    cta: `🚨 Comment "AUDIT" for your free teardown.`,
    hashtags: "pool_primary",
  },
  {
    n: 7,
    kind: "Founder POV",
    title: "Why we don't do 'cheap websites'.",
    img: "/portfolio/loric-desktop.jpg",
    hook: "We turned down a $4k project last week. Here's why.",
    caption: `A founder DM'd us: "Can you do a site for $4k? I just need something live."

We said no.

Not because the money is small — but because "something live" is the worst possible brief for a business that has to close deals online.

At $4k you get a template. At $4k you get 40 other businesses using the same template. At $4k you get a site that 'looks fine' and quietly makes you invisible on Google for 24 months.

We're not the cheapest option. We're the last option you'll need. Our clients don't redesign again for 4–7 years.

If you're ready to stop starting from scratch every 18 months — you know where to find us. 🦉`,
    cta: `💼 Ready for the last rebuild? Link in bio.`,
    hashtags: "pool_founders",
  },
  {
    n: 8,
    kind: "Client spotlight",
    title: "Sports management, reinvented.",
    img: "/portfolio/sportbotai-desktop.jpg",
    hook: "We built a sports management OS used by 12,000+ coaches.",
    caption: `From spreadsheet to shipped SaaS in 14 weeks.

• Full product UI system (400+ components)
• AI-powered scheduling + attendance
• Parent portal, coach portal, admin console
• Marketing site that ranks page-1 for its category

This is what happens when you let designers and engineers actually collaborate instead of throwing Figma files over a wall.

Tag a founder who still runs their operations in a spreadsheet. 📊 → 🚀`,
    cta: `🏷️ Tag a founder who still lives in spreadsheets.`,
    hashtags: "pool_saas",
  },
  {
    n: 9,
    kind: "CTA / scarcity",
    title: "2 slots left. July intake.",
    img: "/kit-assets/instagram-post.jpg",
    hook: "We only take on 4 builds a month. 2 slots left for July.",
    caption: `We keep the roster small on purpose.

Every site we ship has a named senior lead, weekly executive reviews, and a founder check-in at launch. That doesn't scale past 4 builds a month.

July's intake:
✅ 1 hospitality brand (booked)
✅ 1 legal firm (booked)
⚪ 2 slots open

If you've been sitting on a redesign for 6+ months — tap the link in bio, or DM "JULY". We'll book a 20-minute strategy call this week.

First-come, first-served. 🦉`,
    cta: `🗓️ Link in bio → book a slot.`,
    hashtags: "pool_primary",
  },
];

/* Reel ideas — short form, high-replay */
const REELS = [
  {
    title: "The 3-second homepage test",
    hook: "If your homepage can't answer these 3 questions in 3 seconds, you're losing 80% of traffic.",
    script: `Stand on screen → camera cuts to a site → we scribble over it with 3 questions: "Who are you for? What do you do? What happens if I click?" → show our rebuild → hook resolves with a one-liner: "3 questions. 3 seconds. Or goodbye."`,
    length: "18–22s",
    sound: "Trending moody-techno beat (check Reels trending this week).",
  },
  {
    title: "Before / After in 15 seconds",
    hook: "Same brief. Same budget. One looks like 2007. The other ranks page-1.",
    script: `Split-screen. Legacy site left, our rebuild right. Text overlays count up the metrics (traffic, bookings, load time). Outro: "Which side is your site?"`,
    length: "12–18s",
    sound: "Fast-cut hip-hop instrumental.",
  },
  {
    title: "How we design a hero in 60 seconds",
    hook: "Watch us design a hero section start → finish. Real client. Real stakes.",
    script: `Screen recording of Figma at 4× speed. Voiceover narrates 3 key decisions: typography lockup, hero imagery, primary CTA. End card: "Your hero is doing the job of 10 salespeople — or it isn't."`,
    length: "45–60s",
    sound: "Clean ambient synth.",
  },
  {
    title: "The $4k website trap",
    hook: "Why 'cheap websites' cost you more than premium ones in 18 months.",
    script: `Founder on camera, walking through 3 real client screenshots of 'cheap' sites we've had to replace. Math overlay: $4k template × 3 rebuilds in 5 years = $12k + lost revenue. Outro: "Buy twice. Or buy right."`,
    length: "30–40s",
    sound: "Low-fi piano under voiceover.",
  },
  {
    title: "We rejected this client",
    hook: "We said no to a $20k project last week. Here's exactly why.",
    script: `Founder on camera. Screen recording of the DM blurred. Walks through the 3 red flags — no product-market fit, unrealistic timeline, hostile tone. Outro: "We're not a vendor. We're a partner."`,
    length: "45–60s",
    sound: "Voiceover only — dry cut for authenticity.",
  },
];

/* Story prompts — daily engagement */
const STORIES = [
  `POLL:  "Your current site — is it a weapon or a liability?" (2 options)`,
  `TEAR-DOWN TUESDAY:  Anonymous crit of a reader-submitted site. Mark up 3 things we'd change. DM bait.`,
  `BEHIND-THE-SCENES:  Figma timelapse of today's hero. Tag the client when live.`,
  `QUOTE CARD:  One-liner from a founder we rejected. Screenshot it. Add lime #CCFF00 underline.`,
  `COUNTDOWN STICKER:  "2 slots left — July intake closes Friday 5pm." Tap-through to /#book.`,
];

/* Hashtag pools — mix-and-match strategy */
const HASHTAGS = {
  pool_primary: {
    label: "Core Brivo pool (use on 70% of posts)",
    note: "Mix of mid-tier + broad. Designed to survive the algorithm without getting buried.",
    tags: [
      "#webdesignagency",
      "#websitedesign",
      "#webdesigner",
      "#webdevelopment",
      "#brandingagency",
      "#creativeagency",
      "#editorialdesign",
      "#uidesign",
      "#uxdesign",
      "#figma",
      "#nextjs",
      "#reactjs",
      "#digitalagency",
      "#marketingagency",
      "#growthmarketing",
      "#smallbusinessowner",
      "#foundercommunity",
      "#startupbranding",
      "#premiumbranding",
      "#designstudio",
      "#designinspiration",
      "#webdesigninspiration",
      "#conversionoptimization",
      "#websiteredesign",
      "#brivomarketing",
    ],
  },
  pool_founders: {
    label: "Founder-audience pool (use on education + POV posts)",
    note: "For carousels, founder rants, process content. Lower-volume but higher intent.",
    tags: [
      "#founderstory",
      "#founderslife",
      "#bootstrapping",
      "#saasfounder",
      "#serviceagency",
      "#agencylife",
      "#founder",
      "#businessowner",
      "#smallbiz",
      "#businessgrowth",
      "#entrepreneurjourney",
      "#startuptips",
      "#marketingtips",
      "#businessstrategy",
      "#companyculture",
      "#leadershiplessons",
      "#thefounderjourney",
      "#creatorsofig",
      "#buildinpublic",
      "#indiehacker",
    ],
  },
  pool_hospitality: {
    label: "Hospitality / travel vertical",
    note: "Use when spotlighting KOA-style clients or hotel/travel builds.",
    tags: [
      "#hospitalitydesign",
      "#hotelmarketing",
      "#hotelwebsite",
      "#travelbranding",
      "#hospitalityindustry",
      "#hoteldesign",
      "#bookingengine",
      "#boutiquehotel",
      "#resortmarketing",
      "#hospitalitymarketing",
      "#travelindustry",
      "#tourismmarketing",
      "#hotelbranding",
      "#campgroundlife",
      "#glamping",
      "#outdoorhospitality",
      "#vacationrental",
      "#airbnbsuperhost",
      "#travelwebdesign",
      "#hotelillustration",
    ],
  },
  pool_saas: {
    label: "SaaS / product vertical",
    note: "Use when spotlighting product builds like SportBotAI or Instalease.",
    tags: [
      "#saasdesign",
      "#productdesign",
      "#saasmarketing",
      "#saasfounder",
      "#b2bsaas",
      "#productled",
      "#dashboarddesign",
      "#producthunt",
      "#startupdesign",
      "#appdesign",
      "#designsystems",
      "#componentlibrary",
      "#productuiux",
      "#microsaas",
      "#indiemaker",
      "#saasgrowth",
      "#softwaredesign",
      "#webapp",
      "#landingpagedesign",
      "#saasbranding",
    ],
  },
  pool_geo: {
    label: "Geo / local pool (rotate in for Melbourne / AU visibility)",
    note: "Add 3–5 of these to any post to boost local discovery.",
    tags: [
      "#melbournebusiness",
      "#melbournecreatives",
      "#australianbusiness",
      "#madeinmelbourne",
      "#melbournedesigner",
      "#auscreatives",
      "#sydneydesigner",
      "#melbournestartup",
      "#melbourneagency",
      "#smallbusinessaustralia",
    ],
  },
};

/* Best-time cadence */
const CADENCE = [
  { day: "Mon", time: "7:30am  ·  12:15pm  ·  7:45pm", focus: "Manifesto / hook" },
  { day: "Tue", time: "8:00am  ·  1:00pm  ·  8:30pm",  focus: "Tear-down Tuesday (story + reel)" },
  { day: "Wed", time: "7:30am  ·  12:15pm  ·  7:45pm", focus: "Case study / client spotlight" },
  { day: "Thu", time: "11:30am ·  6:00pm",             focus: "Founder POV + engagement Q" },
  { day: "Fri", time: "7:30am  ·  4:30pm",             focus: "Carousel education" },
  { day: "Sat", time: "10:00am",                       focus: "Behind-the-scenes / Figma timelapse" },
  { day: "Sun", time: "6:30pm",                        focus: "Weekly wrap + scarcity CTA" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function CopyChip({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
        copied
          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
          : "border-white/20 text-white/70 hover:border-[#CCFF00] hover:text-[#CCFF00]"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function SectionTitle({ kicker, title, children }) {
  return (
    <div className="mb-8">
      <div className="text-[11px] uppercase tracking-[0.35em] text-[#CCFF00]/80">
        {kicker}
      </div>
      <h2 className="mt-2 text-3xl font-semibold leading-tight text-white md:text-4xl">
        {title}
      </h2>
      {children ? (
        <p className="mt-3 max-w-2xl text-sm text-white/60 md:text-base">{children}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function InstagramKit() {
  const [activeBio, setActiveBio] = useState("receipts");

  const activeBioObj = useMemo(
    () => BIOS.find((b) => b.id === activeBio) || BIOS[0],
    [activeBio]
  );

  /* Build one giant .md dump for the Copy-everything button */
  const allMarkdown = useMemo(() => {
    const lines = [];
    lines.push("# Brivo — Instagram Launch Kit\n");
    lines.push("## Handle options");
    HANDLES.forEach((h) => lines.push(`- ${h.handle} — ${h.note}`));
    lines.push(`\nDisplay name: **${DISPLAY_NAME}**\n`);
    lines.push("## Bios");
    BIOS.forEach((b) => {
      lines.push(`\n### ${b.name}  (${b.sub})`);
      lines.push("```");
      lines.push(b.body);
      lines.push("```");
    });
    lines.push("\n## Link-in-bio menu");
    LINK_IN_BIO.forEach((l) => lines.push(`- ${l.label} → ${l.url}`));
    lines.push("\n## First 9 grid posts");
    POSTS.forEach((p) => {
      lines.push(`\n### Post ${p.n} — ${p.kind}: ${p.title}`);
      lines.push(`Hook: ${p.hook}`);
      lines.push("\nCaption:\n```\n" + p.caption + "\n```");
      lines.push(`CTA: ${p.cta}`);
      const tags = HASHTAGS[p.hashtags]?.tags.join(" ");
      if (tags) lines.push(`\nHashtags:\n\`\`\`\n${tags}\n\`\`\``);
    });
    lines.push("\n## Reel ideas");
    REELS.forEach((r, i) => {
      lines.push(`\n### Reel ${i + 1}: ${r.title}`);
      lines.push(`Hook: ${r.hook}`);
      lines.push(`Script: ${r.script}`);
      lines.push(`Length: ${r.length} · Sound: ${r.sound}`);
    });
    lines.push("\n## Story prompts");
    STORIES.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push("\n## Hashtag pools");
    Object.values(HASHTAGS).forEach((pool) => {
      lines.push(`\n### ${pool.label}`);
      lines.push(`_${pool.note}_`);
      lines.push("```");
      lines.push(pool.tags.join(" "));
      lines.push("```");
    });
    lines.push("\n## Posting cadence");
    CADENCE.forEach((c) => lines.push(`- **${c.day}** · ${c.time} → ${c.focus}`));
    return lines.join("\n");
  }, []);

  const downloadMd = () => {
    const blob = new Blob([allMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brivo-instagram-launch-kit.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 md:px-10">
          <Link
            to="/brand-kit"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60 hover:text-[#CCFF00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Brand Kit
          </Link>
          <Logo variant="dark" />
          <button
            onClick={downloadMd}
            className="hidden items-center gap-2 rounded-full border border-[#CCFF00] bg-[#CCFF00] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-[#d6ff33] md:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            Download .md
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, #CCFF00 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, #7a8c00 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-24">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-[#CCFF00]">
            <Instagram className="h-3.5 w-3.5" />
            Launch kit · v1.0
          </div>
          <h1 className="mt-5 max-w-3xl text-[44px] font-semibold leading-[1.02] tracking-tight md:text-[72px]">
            Zero followers to fully booked.{" "}
            <span className="text-[#CCFF00]">In 30 days.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            Everything you need to launch Brivo on Instagram with traction —
            bio copy, the first nine grid posts (with real client screens),
            hashtag pools, reel scripts, story prompts, and an exact posting
            cadence. All copy-to-clipboard. Use it today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.25em]">
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-white/70">
              3 bios
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-white/70">
              9 ready-to-post
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-white/70">
              5 reels
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-white/70">
              125+ hashtags
            </span>
            <span className="rounded-full border border-[#CCFF00]/60 bg-[#CCFF00]/10 px-3 py-1.5 text-[#CCFF00]">
              <Flame className="mr-1 inline h-3 w-3" />
              Real client work
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ig-promo"
              data-testid="open-ig-promo"
              className="inline-flex items-center gap-2 rounded-full border border-[#CCFF00] bg-[#CCFF00] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-[#d6ff33]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate your 15-second Reel video
            </Link>
            <button
              onClick={downloadMd}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-[#CCFF00] hover:text-[#CCFF00] md:hidden"
            >
              <Download className="h-3.5 w-3.5" />
              Download everything (.md)
            </button>
          </div>
        </div>
      </section>

      {/* Handle + Display name */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle kicker="Step 01 · Identity" title="Handle + display name">
            Grab this handle before someone else does. Everything flows from
            here — DMs, tags, shareability. Keep the display name human.
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {HANDLES.map((h) => (
              <div
                key={h.handle}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-white">
                    {h.handle}
                  </div>
                  <CopyChip value={h.handle} />
                </div>
                <p className="mt-3 text-sm text-white/55">{h.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-[#CCFF00]/40 bg-[#CCFF00]/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#CCFF00]">
                  Display name
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">
                  {DISPLAY_NAME}
                </div>
              </div>
              <CopyChip value={DISPLAY_NAME} />
            </div>
          </div>
        </div>
      </section>

      {/* Bios */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle kicker="Step 02 · Bio" title="Three bios. Pick your weapon.">
            All three are 150-character-safe and designed to convert scrollers
            into DMs. Pair with the link-in-bio menu below.
          </SectionTitle>
          <div className="mb-6 flex flex-wrap gap-2">
            {BIOS.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBio(b.id)}
                data-testid={`bio-tab-${b.id}`}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                  activeBio === b.id
                    ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                    : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
            {/* Preview on "phone" */}
            <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111] to-[#1a1a1a] p-6 md:p-10">
              <div className="mx-auto max-w-sm">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full border-2 border-[#CCFF00] bg-black p-1">
                    <img
                      src="/kit-assets/avatar-owl-icon.jpg"
                      alt="Brivo owl avatar"
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/owl-logo.jpg";
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      brivo.marketing
                    </div>
                    <div className="text-xs text-white/50">
                      {DISPLAY_NAME}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex gap-6 text-center">
                  <div>
                    <div className="text-base font-semibold text-white">24</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      posts
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">
                      1,240
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      followers
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">86</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      following
                    </div>
                  </div>
                </div>
                <pre
                  className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/85"
                  data-testid="bio-preview"
                >
                  {activeBioObj.body}
                </pre>
                <button className="mt-5 w-full rounded-lg border border-[#CCFF00] bg-[#CCFF00] py-2 text-sm font-semibold text-black">
                  Follow
                </button>
              </div>
            </div>

            {/* Raw bio + link menu */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                    Raw bio · {activeBioObj.name}
                  </div>
                  <CopyChip value={activeBioObj.body} label="Copy bio" />
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                  {activeBioObj.body}
                </pre>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                    Link-in-bio menu (Linktree / Stan / Beacons)
                  </div>
                  <CopyChip
                    value={LINK_IN_BIO.map((l) => `${l.label}  →  ${l.url}`).join(
                      "\n"
                    )}
                    label="Copy menu"
                  />
                </div>
                <ul className="space-y-2.5">
                  {LINK_IN_BIO.map((l) => (
                    <li
                      key={l.label}
                      className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm"
                    >
                      <span className="text-white/80">{l.label}</span>
                      <span className="truncate text-[11px] text-white/40">
                        {l.url}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9 posts grid */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle
            kicker="Step 03 · First 9 posts"
            title="The opening grid. Built to convert."
          >
            Post these in order over your first 9 days. Each one uses REAL
            client screens from our portfolio — no stock photos, no templates.
            Visuals are already in <code>/kit-assets</code> and{" "}
            <code>/portfolio</code>.
          </SectionTitle>

          <div className="grid gap-6 md:grid-cols-3">
            {POSTS.map((p) => {
              const pool = HASHTAGS[p.hashtags];
              return (
                <article
                  key={p.n}
                  data-testid={`ig-post-${p.n}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-[#CCFF00]/40"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-black">
                    <img
                      src={p.img}
                      alt={p.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/owl-logo.jpg";
                      }}
                    />
                    <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur">
                      #{p.n} · {p.kind}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm italic text-[#CCFF00]/90">
                      "{p.hook}"
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                        {p.caption.length} chars
                      </div>
                      <CopyChip value={p.caption} label="Copy caption" />
                    </div>
                    <details className="mt-3 text-sm text-white/75">
                      <summary className="cursor-pointer text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-[#CCFF00]">
                        Read full caption →
                      </summary>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                        {p.caption}
                      </pre>
                      <div className="mt-3 rounded-lg border border-[#CCFF00]/40 bg-[#CCFF00]/10 px-3 py-2 text-xs text-[#CCFF00]">
                        {p.cta}
                      </div>
                    </details>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                        <Hash className="mr-1 inline h-3 w-3" />
                        {pool?.label.split("(")[0].trim() || "primary"}
                      </div>
                      <CopyChip
                        value={pool?.tags.join(" ") || ""}
                        label="Copy hashtags"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reels */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle
            kicker="Step 04 · Reels"
            title="Five reels that print saves."
          >
            Each scripted for under 60 seconds. Film on an iPhone. The hook
            is doing 90% of the work — don't change it.
          </SectionTitle>
          <div className="grid gap-5 md:grid-cols-2">
            {REELS.map((r, i) => (
              <div
                key={r.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#CCFF00]">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Reel {i + 1} · {r.length}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-white">
                      {r.title}
                    </h3>
                  </div>
                  <CopyChip
                    value={`HOOK: ${r.hook}\n\nSCRIPT: ${r.script}\n\nLENGTH: ${r.length}\nSOUND: ${r.sound}`}
                    label="Copy script"
                  />
                </div>
                <p className="mt-3 text-sm italic text-white/75">"{r.hook}"</p>
                <p className="mt-3 text-sm text-white/60">{r.script}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                  <span className="rounded-full border border-white/15 px-2.5 py-1">
                    {r.length}
                  </span>
                  <span className="rounded-full border border-white/15 px-2.5 py-1">
                    {r.sound}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle
            kicker="Step 05 · Stories"
            title="Five daily story prompts."
          >
            Post one per day, Mon–Fri. Story engagement is the single
            fastest lever for the algorithm.
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#CCFF00]">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Story {i + 1}
                  </div>
                  <CopyChip value={s} label="Copy" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hashtags */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle
            kicker="Step 06 · Hashtags"
            title="Four hashtag pools. Rotate, don't repeat."
          >
            Using the same 30 tags on every post gets you shadow-banned.
            Rotate across these pools — 18–25 tags per post is the sweet spot.
          </SectionTitle>
          <div className="grid gap-5 md:grid-cols-2">
            {Object.values(HASHTAGS).map((pool) => (
              <div
                key={pool.label}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {pool.label}
                    </h3>
                    <p className="mt-1 text-xs text-white/50">{pool.note}</p>
                  </div>
                  <CopyChip value={pool.tags.join(" ")} label="Copy all" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pool.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-[#CCFF00]/90"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cadence */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-20">
          <SectionTitle
            kicker="Step 07 · Cadence"
            title="When to post. What to post."
          >
            Times are in Melbourne (AEST). If you post fewer than 5 times a
            week in the first 30 days, the algorithm will not take you
            seriously. That's the whole trick.
          </SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.25em] text-white/50">
                  <th className="py-3 text-left">Day</th>
                  <th className="py-3 text-left">Best times</th>
                  <th className="py-3 text-left">Content focus</th>
                </tr>
              </thead>
              <tbody>
                {CADENCE.map((row) => (
                  <tr
                    key={row.day}
                    className="border-b border-white/5 text-white/80 transition hover:bg-white/[0.02]"
                  >
                    <td className="py-3 font-semibold text-[#CCFF00]">
                      <Clock className="mr-2 inline h-3.5 w-3.5" />
                      {row.day}
                    </td>
                    <td className="py-3">{row.time}</td>
                    <td className="py-3">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-2xl border border-[#CCFF00]/30 bg-[#CCFF00]/[0.04] p-5 text-sm text-white/80">
            <Zap className="mr-2 inline h-4 w-4 text-[#CCFF00]" />
            <strong className="text-[#CCFF00]">Pro move:</strong> plug this
            entire plan into Brivo's own Auto-Poster at <code>/admin/social</code>. You
            can have all 9 grid posts + 5 reels + 5 stories queued in 15 minutes
            and watch the cadence enforce itself.
          </div>
        </div>
      </section>

      {/* Footer */}
      <section>
        <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-10 md:py-24">
          <div className="rounded-3xl border border-[#CCFF00]/50 bg-gradient-to-br from-[#CCFF00]/10 to-transparent p-10 md:p-16">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#CCFF00]">
              <Sparkles className="h-3.5 w-3.5" />
              You're ready.
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              Launch this week. Audit this month. Book out by September.
            </h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Copy everything below with a single button. Paste into Notion,
              Figma, or straight into the Brivo Auto-Poster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={downloadMd}
                data-testid="download-all-md"
                className="inline-flex items-center gap-2 rounded-full border border-[#CCFF00] bg-[#CCFF00] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-[#d6ff33]"
              >
                <Download className="h-3.5 w-3.5" />
                Download as .md
              </button>
              <CopyChip value={allMarkdown} label="Copy everything" />
              <Link
                to="/admin/social"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-[#CCFF00] hover:text-[#CCFF00]"
              >
                <Camera className="h-3.5 w-3.5" />
                Open the Auto-Poster
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
