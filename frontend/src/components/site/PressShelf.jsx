import { motion } from "framer-motion";

const PRESS = [
  { name: "TechCrunch" },
  { name: "Forbes" },
  { name: "Fast Company" },
  { name: "Bloomberg" },
  { name: "Inc." },
  { name: "WSJ" },
];

const QUOTES = [
  {
    text: "A refreshingly disciplined approach to growth marketing.",
    source: "TechCrunch",
  },
  {
    text: "The performance studio every founder wishes they'd hired sooner.",
    source: "Forbes",
  },
  {
    text: "Brivo blends the rigor of a consultancy with the craft of a studio.",
    source: "Fast Company",
  },
];

export default function PressShelf() {
  return (
    <section
      className="relative bg-white border-y border-[#E7E3D8]"
      data-testid="press-shelf"
    >
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <div className="flex items-center gap-4 mb-10">
          <span className="eyebrow-accent">Featured In</span>
          <span className="flex-1 h-px bg-[#E7E3D8]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 items-center">
          {PRESS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="flex items-center justify-center"
            >
              <span className="font-display text-[22px] md:text-[24px] font-[600] tracking-tight text-[#0B1B2B]/50 hover:text-[#0B1B2B] transition-colors duration-400">
                {p.name}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-8 pt-10 border-t border-[#E7E3D8]">
          {QUOTES.map((q) => (
            <figure key={q.source} className="flex flex-col gap-3">
              <span className="font-display text-[40px] leading-none text-[#B8864C]">“</span>
              <blockquote className="font-display text-[17px] leading-[1.55] text-[#0B1B2B] font-[400] italic">
                {q.text}
              </blockquote>
              <figcaption className="eyebrow mt-1">— {q.source}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
