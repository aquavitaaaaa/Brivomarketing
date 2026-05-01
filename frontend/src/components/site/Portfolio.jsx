import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    id: "obsidian",
    title: "Obsidian Apparel",
    cat: "E-commerce · Branding",
    metric: "+318% revenue, 90 days",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxkYXJrJTIwbW9kZXJuJTIwd2Vic2l0ZSUyMGRhc2hib2FyZCUyMHBvcnRmb2xpb3xlbnwwfHx8fDE3Nzc2MDkwMTR8MA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-8",
    desc: "We rebuilt Obsidian's commerce stack from the ground up — a bespoke headless storefront, thoughtful product recommendations, and a paid media system tuned to lifetime value.",
    kpis: [
      { label: "Revenue", value: "+318%", note: "90-day window" },
      { label: "Conv. rate", value: "4.8%", note: "+162% vs baseline" },
      { label: "AOV", value: "$184", note: "+44% lift" },
      { label: "ROAS", value: "6.4x", note: "Blended" },
    ],
    quote: "Brivo didn't just build us a website. They gave us a revenue engine that compounds.",
    author: "Maya K. — CEO, Obsidian Apparel",
  },
  {
    id: "neon",
    title: "Neon Lab",
    cat: "Web · SEO",
    metric: "1.2M monthly organic",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
    span: "lg:col-span-4",
    desc: "From obscurity to 1.2M monthly organic sessions in 10 months — a technical overhaul, a programmatic SEO engine, and a content machine engineered for compounding growth.",
    kpis: [
      { label: "Organic / mo", value: "1.2M", note: "+1,140%" },
      { label: "Keywords #1", value: "842", note: "Non-brand" },
      { label: "Lighthouse", value: "100", note: "All categories" },
      { label: "Domain rating", value: "68", note: "+31 in 10 mo" },
    ],
    quote: "We stopped buying traffic. Brivo made our website the channel.",
    author: "Daniel O. — Founder, Neon Lab",
  },
  {
    id: "halo",
    title: "Halo Fitness",
    cat: "Paid media · Funnels",
    metric: "5.8x ROAS, at scale",
    img: "https://images.unsplash.com/photo-1517971053567-8bde93bc6a58?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
    span: "lg:col-span-5",
    desc: "A creative-first paid media program across Meta, TikTok and YouTube. 300+ creative variants produced, tested, and scaled responsibly.",
    kpis: [
      { label: "ROAS", value: "5.8x", note: "Scaled" },
      { label: "CAC", value: "-42%", note: "YoY" },
      { label: "Monthly spend", value: "$380k", note: "Across channels" },
      { label: "Creatives / wk", value: "46", note: "With senior leads" },
    ],
    quote: "They turned our ad account into an asset. We finally have signal.",
    author: "Renee B. — Growth lead, Halo",
  },
  {
    id: "vault",
    title: "Vault Finance",
    cat: "Brand · Web",
    metric: "+412% qualified leads",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
    span: "lg:col-span-7",
    desc: "A full brand system and flagship site for a Series-B fintech. Replaced a tired marketing site with a conversion-optimised, content-rich platform.",
    kpis: [
      { label: "Qualified leads", value: "+412%", note: "MoM" },
      { label: "Demo CVR", value: "9.1%", note: "+3.4pp" },
      { label: "Time on site", value: "4m 18s", note: "+185%" },
      { label: "Pipeline added", value: "$11.4M", note: "First 6 mo" },
    ],
    quote: "The most senior, most commercial design partner we've ever worked with.",
    author: "Jordan S. — CMO, Vault Finance",
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
            Results, <em className="italic text-[#B8864C] font-[500]">in their own words.</em>
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-[#4E5C6E] text-[16px] leading-relaxed">
          A curated selection of recent partnerships. Every number is real, verified, and on the record.
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
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={p.img}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B]/70 via-[#0B1B2B]/10 to-transparent" />
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
            <div className="p-6 flex items-center justify-between">
              <span className="text-[14px] text-[#0B1B2B] font-medium">
                {p.metric}
              </span>
              <span className="text-[13px] text-[#8190A1] group-hover:text-[#B8864C] transition-colors">
                View case →
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
