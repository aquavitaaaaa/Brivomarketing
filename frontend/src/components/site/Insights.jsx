import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const articles = [
  {
    date: "Feb 12, 2026",
    cat: "Paid Ads",
    title: "Why your CAC is lying to you (and the math that actually matters).",
  },
  {
    date: "Feb 04, 2026",
    cat: "Web Dev",
    title: "Stop A/B testing colors. Test offers, copy, and load time first.",
  },
  {
    date: "Jan 28, 2026",
    cat: "Branding",
    title: "Premium pricing isn't a tactic — it's a brand decision encoded in design.",
  },
];

export default function Insights() {
  return (
    <section
      id="insights"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32"
      data-testid="insights-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-14 items-end">
        <div className="md:col-span-8">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Insights
          </span>
          <h2
            className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
            data-testid="insights-title"
          >
            Field notes from
            <br />
            the front line.
          </h2>
        </div>
        <a
          href="#"
          className="md:col-span-4 md:justify-self-end font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-[#CCFF00] inline-flex items-center gap-2"
          data-testid="insights-view-all"
        >
          View All <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="border-t border-white/10">
        {articles.map((a, i) => (
          <motion.a
            key={i}
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group grid md:grid-cols-12 gap-6 py-8 border-b border-white/10 hover:bg-white/[0.02] transition-colors px-2"
            data-testid={`insight-item-${i}`}
          >
            <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              {a.date}
            </div>
            <div className="md:col-span-2 font-mono text-xs uppercase tracking-[0.2em] text-[#CCFF00]">
              {a.cat}
            </div>
            <div className="md:col-span-7 font-display text-xl md:text-2xl font-bold tracking-tight group-hover:text-[#CCFF00] transition-colors">
              {a.title}
            </div>
            <div className="md:col-span-1 md:justify-self-end self-center">
              <ArrowUpRight
                size={22}
                className="text-white/40 group-hover:text-[#CCFF00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
              />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
