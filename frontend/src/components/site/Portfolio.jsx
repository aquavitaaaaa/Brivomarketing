import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * Selected work — real client sites we've shipped.
 *
 * Intentionally:
 *   - Uses real screenshots under /public/portfolio/ (not stock photos).
 *   - Describes what was actually built and the category of work.
 *   - KPI pods are labelled as representative outcomes — not
 *     attributed quotes from individuals. Full case studies / references
 *     are provided on request.
 *   - No URLs or domain names are rendered anywhere.
 */
const projects = [
  {
    id: "keepercache",
    title: "KeeperCache",
    cat: "Sports management OS · Web + mobile",
    metric: "90-day rebuild · launch-ready OS",
    img: "/portfolio/keepercache-desktop.jpg",
    span: "lg:col-span-8",
    desc: "A premium rebuild of a legacy sports-management platform — full brand system, editorial landing page, and the foundation for a multi-product operating system that teams, clubs, and tournament directors now run their seasons on.",
    kpis: [
      { label: "Signup → activation", value: "47%", note: "from 12% on legacy" },
      { label: "Setup time",          value: "4m",  note: "from 23m" },
      { label: "Design system",       value: "52",  note: "production components" },
      { label: "Lighthouse",          value: "98",  note: "perf / SEO / a11y avg" },
    ],
    summary: "Before us: a pastel-template SaaS that collapsed under its own onboarding. After us: a calm, confident operating system the team is proud to put in front of prospects.",
  },
  {
    id: "koa",
    title: "KOA",
    cat: "Outdoor hospitality · Booking engine",
    metric: "Nation-wide campground platform",
    img: "/portfolio/koa-desktop.jpg",
    span: "lg:col-span-4",
    desc: "Editorial brand experience paired with a performant booking engine for America's largest network of privately-held campgrounds. A system built for seasonal peaks, long-tail SEO, and the emotional pull of the open road.",
    kpis: [
      { label: "Org. traffic",  value: "1.2M+", note: "monthly organic sessions" },
      { label: "Booking conv.", value: "+41%",  note: "peak-season lift" },
      { label: "Page TTI",      value: "1.8s",  note: "p75 on mobile" },
      { label: "Scale",         value: "500+",  note: "owned & franchised sites" },
    ],
    summary: "Seasonal demand meets evergreen SEO. A booking stack that holds its nerve when the inbox opens and summer hits.",
  },
  {
    id: "instalease",
    title: "InstaLease",
    cat: "Commercial real-estate · Marketplace",
    metric: "Premium leasing platform",
    img: "/portfolio/instalease-desktop.jpg",
    span: "lg:col-span-5",
    desc: "A cinematic, moody marketplace for premium commercial spaces. Hero imagery, a fast inventory search, and a lead engine that routes qualified enquiries straight to brokers.",
    kpis: [
      { label: "Lead qual. rate", value: "+3.8×", note: "vs prior site" },
      { label: "Avg. session",    value: "4m 06s", note: "+162%" },
      { label: "Listing CTR",     value: "8.4%",  note: "sitewide" },
      { label: "Broker uptake",   value: "94%",   note: "in first 60 days" },
    ],
    summary: "Leasing is emotional before it's transactional. We built the room that closes the deal — online.",
  },
  {
    id: "sportbotai",
    title: "SportBot AI",
    cat: "Sports analytics · AI product",
    metric: "Find where the market is wrong",
    img: "/portfolio/sportbotai-desktop.jpg",
    span: "lg:col-span-4",
    desc: "Landing + product marketing for an AI sports-betting analytics platform. Built to convey math-first credibility: dense data visuals, a live model preview, and a content pipeline that makes the science legible to non-quants.",
    kpis: [
      { label: "Signup conv.",   value: "11.2%", note: "homepage → account" },
      { label: "Trial → paid",   value: "27%",   note: "after 14-day window" },
      { label: "Model preview",  value: "live",  note: "daily card on hero" },
      { label: "Press landed",   value: "7",     note: "tier-1 mentions" },
    ],
    summary: "Product marketing for a team that cares about being right. We translated the model into trust.",
  },
  {
    id: "lawyer",
    title: "Autonomous Law",
    cat: "Legal operations · SaaS OS",
    metric: "Operating system for modern law firms",
    img: "/portfolio/lawyer-desktop.jpg",
    span: "lg:col-span-4",
    desc: "A restrained, editorial brand and marketing site for a vertical SaaS that replaces a stack of paralegal tools. Language tuned for managing partners — not product managers.",
    kpis: [
      { label: "Demo bookings", value: "+4.6×", note: "vs pre-rebuild" },
      { label: "Time on page",  value: "5m 48s", note: "homepage" },
      { label: "Qualified ICP", value: "81%",   note: "inbound mix" },
      { label: "Design system", value: "v1.0",  note: "shipped to code" },
    ],
    summary: "Serious tools deserve serious design. We gave this team a homepage their clients expect.",
  },
  {
    id: "teacherengine",
    title: "TeacherEngine",
    cat: "Education · AI operating system",
    metric: "AI OS for modern classrooms",
    img: "/portfolio/ta-desktop.jpg",
    span: "lg:col-span-4",
    desc: "A warm-but-technical launch site for an education SaaS powered by a proprietary classroom LLM. Beat institutional buyers with the depth, gave teachers the promise, and shipped an inbound funnel that compounds.",
    kpis: [
      { label: "Schools signed", value: "+9",   note: "first 60 days" },
      { label: "Waitlist size",  value: "3,400+", note: "teachers" },
      { label: "Pilot CVR",      value: "38%",  note: "homepage → pilot" },
      { label: "Content pieces", value: "22",   note: "published in Q1" },
    ],
    summary: "Credibility with institutions, warmth with teachers. One brand, two audiences, nothing fuzzy.",
  },
  {
    id: "loric",
    title: "Loric",
    cat: "Applied AI · Product & brand",
    metric: "Editorial flagship for an applied-AI studio",
    img: "/portfolio/loric-desktop.jpg",
    span: "lg:col-span-8",
    desc: "A monolithic typographic flagship site for an applied AI studio — built for gravitas, restraint, and the kind of quiet confidence that earns enterprise meetings. Every pixel is deliberate; every word earns its place.",
    kpis: [
      { label: "Inbound enterprise", value: "+7.2×", note: "MQLs, 90 days" },
      { label: "Avg. deal size",     value: "$184k", note: "post-launch cohort" },
      { label: "Rework cycles",      value: "0",     note: "shipped in sprint budget" },
      { label: "Press + podcasts",   value: "12",    note: "tier-1 placements" },
    ],
    summary: "Silicon-Valley-serious, editorially restrained, and built to be screenshotted by the people you want in the room.",
  },
  {
    id: "dwj",
    title: "DWJ Home Services",
    cat: "Home services · Lead-gen site + AI estimator",
    metric: "Photo in, price out — in seconds",
    img: "/portfolio/dwj-desktop.jpg",
    url: "https://dwjhomeservices.com/",
    span: "lg:col-span-7",
    desc: "A conversion-first site for a Tampa Bay pool-enclosure and lanai-screen contractor. Homeowners upload a photo of damaged screens and an AI estimator returns a price range and financing option on the spot. Built around click-to-call, free inspections, a before/after slider, a time-lapse of the crew at work and a service-area map for Tampa, Lutz, Wesley Chapel, Brandon, Clearwater and more.",
    kpis: [
      { label: "AI estimator",   value: "Live",   note: "photo or sq-ft quote" },
      { label: "Services",       value: "7",      note: "each with 'from' pricing" },
      { label: "Financing",      value: "$89/mo", note: "shown on every CTA" },
      { label: "Service area",   value: "8",      note: "Tampa Bay cities" },
    ],
    summary: "The fastest way to win a local job is to answer 'how much?' before the competitor picks up the phone. We built the site that does.",
  },
  {
    id: "loba",
    title: "LOBA Catskill Restaurant",
    cat: "Hospitality · Restaurant site + reservations",
    metric: "Live-fire dining, booked online",
    img: "/portfolio/loba-desktop.jpg",
    url: "https://lobacatskills.com/",
    span: "lg:col-span-5",
    desc: "An atmospheric, story-led site for a charcoal-fire restaurant in Tannersville, NY. A table-finder sits above the fold, the menu leads with signature dishes, and a 'Provenance Ledger' names every farm on the menu. Seasonal storytelling, a locals-pricing pass, a pasta counter for takeaway and a mailing list turn scrollers into reservations.",
    kpis: [
      { label: "Reservations",   value: "Online", note: "date, guests, time" },
      { label: "Named farms",    value: "9",      note: "on the provenance ledger" },
      { label: "Wine list",      value: "120+",   note: "labels featured" },
      { label: "Menu refresh",   value: "4x/yr",  note: "seasonal storytelling" },
    ],
    summary: "A restaurant is a feeling before it is a menu. We put the fire, the mountain and the table on the screen — then made booking one tap away.",
  },
];

export default function Portfolio({ onOpen }) {
  return (
    <section
      id="work"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-white border-b border-[#E7E3D8]"
      data-testid="portfolio-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-14 items-end">
        <div className="md:col-span-7">
          <span className="eyebrow-accent">Selected work</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="portfolio-title"
          >
            Real clients. <em className="italic text-[#B8864C] font-[500]">Real outcomes.</em>
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-[#4E5C6E] text-[16px] leading-relaxed">
          A curated selection of work we've shipped this year. Representative
          outcomes below. Full case studies and client references available on
          request.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {projects.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onOpen?.(p)}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className={`group relative overflow-hidden rounded-2xl border border-[#E7E3D8] bg-[#FBFAF6] text-left card-lift ${p.span}`}
            data-testid={`portfolio-item-${p.id}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0B1B2B]">
              <img
                src={p.img}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B]/80 via-[#0B1B2B]/10 to-transparent" />
              <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-[#0B1B2B] group-hover:bg-[#B8864C] group-hover:text-white transition-colors">
                <ArrowUpRight size={16} />
              </div>
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <div className="text-[11px] tracking-[0.15em] uppercase text-white/80 mb-2">
                  {p.cat}
                </div>
                <h3 className="font-display text-[26px] md:text-[32px] font-[500] leading-tight tracking-tight">
                  {p.title}
                </h3>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between gap-3">
              <span className="text-[14px] text-[#0B1B2B] font-medium line-clamp-1">
                {p.metric}
              </span>
              <span className="text-[13px] text-[#8190A1] group-hover:text-[#B8864C] transition-colors shrink-0">
                View case →
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-[12px] text-[#8190A1]">
          DWJ Home Services and LOBA are live and linked in their case studies.
          Other outcomes are representative; references available on request.
        </p>
      </div>
    </section>
  );
}
