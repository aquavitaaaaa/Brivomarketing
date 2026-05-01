import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    id: "obsidian",
    title: "Obsidian Apparel",
    cat: "E-commerce / Branding",
    metric: "+318% revenue in 90 days",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxkYXJrJTIwbW9kZXJuJTIwd2Vic2l0ZSUyMGRhc2hib2FyZCUyMHBvcnRmb2xpb3xlbnwwfHx8fDE3Nzc2MDkwMTR8MA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-8",
    desc: "We rebuilt Obsidian's commerce stack from the ground up — a bespoke headless storefront, AI‑driven product recommendations, and a paid media system tuned to LTV instead of vanity metrics. The result: a 3x lift on conversion and a repeatable playbook for every new drop.",
    kpis: [
      { label: "Revenue", value: "+318%", note: "90-day window" },
      { label: "CVR", value: "4.8%", note: "+162% vs baseline" },
      { label: "AOV", value: "$184", note: "+44% lift" },
      { label: "ROAS", value: "6.4x", note: "Blended" },
    ],
    quote: "Brivo didn't just ship a website. They gave us a revenue machine that compounds.",
    author: "Maya K. — CEO, Obsidian Apparel",
  },
  {
    id: "neon",
    title: "Neon Lab Co.",
    cat: "Web Dev / SEO",
    metric: "1.2M organic / mo",
    img: "https://images.unsplash.com/photo-1771931342240-2c277b33905f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwbmVvbiUyMGdyZWVuJTIwZ2xvd2luZyUyMGRhcmt8ZW58MHx8fHwxNzc3NjA5MDE0fDA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-4",
    desc: "From obscurity to 1.2M monthly organic sessions in 10 months. A technical overhaul, a programmatic SEO engine, and a content machine powered by in-house models — engineered for compounding growth.",
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
    cat: "Paid Ads / Funnels",
    metric: "5.8x ROAS scaled",
    img: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwb2ZmaWNlJTIwZGFyayUyMG5pZ2h0fGVufDB8fHx8MTc3NzYwOTAxMHww&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-5",
    desc: "A creative-first paid media system across Meta, TikTok and YouTube. 300+ creative variants produced, AI-tested, and scaled. Halo 2x'd its spend without losing efficiency.",
    kpis: [
      { label: "ROAS", value: "5.8x", note: "Scaled" },
      { label: "CAC", value: "-42%", note: "YoY" },
      { label: "Monthly spend", value: "$380k", note: "Across channels" },
      { label: "Creatives / wk", value: "46", note: "AI-assisted" },
    ],
    quote: "They turned our ad account into an asset. We finally have signal.",
    author: "Renee B. — Growth lead, Halo",
  },
  {
    id: "vault",
    title: "Vault Finance",
    cat: "Branding / Web",
    metric: "+412% lead volume",
    img: "https://images.unsplash.com/photo-1602475063211-3d98d60e3b1f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxkYXJrJTIwZ3JhaW4lMjB0ZXh0dXJlJTIwYmxhY2t8ZW58MHx8fHwxNzc3NjA5MDE0fDA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-7",
    desc: "A full brand system and flagship site for a Series-B fintech. Replaced a sleepy marketing site with a conversion-optimised, content-heavy platform. Lead volume quadrupled without increasing spend.",
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
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40"
      data-testid="portfolio-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-16 items-end">
        <div className="md:col-span-7">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Selected Work
          </span>
          <h2
            className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
            data-testid="portfolio-title"
          >
            Receipts,
            <br />
            not promises.
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-white/60 text-base leading-relaxed">
          A curated slice of brands we've helped scale. Every number is real,
          every project shipped on time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {projects.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onOpen?.(p)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className={`group relative overflow-hidden border border-white/10 bg-[#0A0A0A] aspect-[4/3] text-left cursor-target ${p.span}`}
            data-testid={`portfolio-item-${p.id}`}
          >
            <img
              src={p.img}
              alt={p.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative z-10 h-full p-6 md:p-10 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  {p.cat}
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-white/60 group-hover:text-[#CCFF00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                />
              </div>

              <div>
                <h3 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight">
                  {p.title}
                </h3>
                <div className="mt-3 inline-block bg-[#CCFF00] text-black font-mono text-xs px-3 py-1 uppercase tracking-wider">
                  {p.metric}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
