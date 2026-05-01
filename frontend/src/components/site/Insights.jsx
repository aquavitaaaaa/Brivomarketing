import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const articles = [
  {
    date: "February 12, 2026",
    cat: "Paid media",
    title: "Why your customer acquisition cost is lying to you — and the math that actually matters.",
  },
  {
    date: "February 4, 2026",
    cat: "Web",
    title: "Stop A/B testing colors. Test offers, copy, and load time first.",
  },
  {
    date: "January 28, 2026",
    cat: "Brand",
    title: "Premium pricing isn’t a tactic — it’s a brand decision, encoded in every design choice.",
  },
];

export default function Insights() {
  return (
    <section
      id="insights"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-white border-b border-[#E7E3D8]"
      data-testid="insights-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-14 items-end">
        <div className="md:col-span-8">
          <span className="eyebrow-accent">Field notes</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="insights-title"
          >
            Insights from the <em className="italic text-[#B8864C] font-[500]">front line.</em>
          </h2>
        </div>
        <a
          href="#"
          className="md:col-span-4 md:justify-self-end text-[14px] font-medium text-[#0B1B2B] hover:text-[#B8864C] inline-flex items-center gap-2"
          data-testid="insights-view-all"
        >
          View all writing
          <ArrowUpRight size={14} />
        </a>
      </div>

      <div>
        {articles.map((a, i) => (
          <motion.a
            key={i}
            href="#"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group grid md:grid-cols-12 gap-6 py-8 border-t border-[#E7E3D8] hover:bg-[#FBFAF6] transition-colors px-2"
            data-testid={`insight-item-${i}`}
          >
            <div className="md:col-span-2 text-[12px] tracking-[0.08em] text-[#8190A1]">
              {a.date}
            </div>
            <div className="md:col-span-2 text-[12px] tracking-[0.12em] uppercase text-[#B8864C] font-medium">
              {a.cat}
            </div>
            <div className="md:col-span-7 font-display text-[22px] md:text-[26px] font-[500] tracking-tight text-[#0B1B2B] group-hover:text-[#B8864C] transition-colors leading-snug">
              {a.title}
            </div>
            <div className="md:col-span-1 md:justify-self-end self-center">
              <ArrowUpRight
                size={22}
                className="text-[#8190A1] group-hover:text-[#B8864C] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
              />
            </div>
          </motion.a>
        ))}
        <div className="border-t border-[#E7E3D8]" />
      </div>
    </section>
  );
}
