import { motion } from "framer-motion";

/**
 * PressShelf — "As featured in" credibility row with stylized
 * publication name lockups (typographic, not real logos).
 */
const PRESS = [
  { name: "TechCrunch", style: "font-display font-black uppercase tracking-tight", color: "text-white" },
  { name: "Forbes", style: "font-display italic font-black", color: "text-white", before: null },
  { name: "Fast Company", style: "font-display font-black uppercase tracking-[-0.04em]", color: "text-white" },
  { name: "Bloomberg", style: "font-display italic font-black", color: "text-white" },
  { name: "Inc.", style: "font-display italic font-black", color: "text-white" },
  { name: "WSJ", style: "font-display font-black tracking-tight", color: "text-white" },
];

export default function PressShelf() {
  return (
    <section
      className="relative bg-[#0B0B0F] border-y border-white/8 overflow-hidden"
      data-testid="press-shelf"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.03),transparent_55%)]" />

      <div className="relative px-6 md:px-12 lg:px-24 py-12 md:py-16">
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <span className="flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-[#CCFF00]">
            <span className="w-1 h-1 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.85)]" />
            As Featured In
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 items-center">
          {PRESS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className="flex items-center justify-center group"
            >
              <div
                className={`text-2xl md:text-[28px] ${p.style} ${p.color} opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500`}
              >
                {p.name === "WSJ" ? (
                  <span>
                    <span className="text-[#CCFF00]">W</span>
                    <span>SJ</span>
                  </span>
                ) : p.name === "TechCrunch" ? (
                  <span>
                    Tech<span className="text-[#CCFF00]">Crunch</span>
                  </span>
                ) : p.name === "Forbes" ? (
                  <span>Forbes</span>
                ) : (
                  <span>{p.name}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 md:mt-12 grid md:grid-cols-3 gap-6 pt-8 border-t border-white/8">
          <Quote
            text="Brivo is rewriting the rules of how AI agencies operate."
            source="TechCrunch"
          />
          <Quote
            text="The performance studio every founder wishes they'd hired sooner."
            source="Forbes"
          />
          <Quote
            text="A surgical approach to growth. The numbers speak for themselves."
            source="Fast Company"
          />
        </div>
      </div>
    </section>
  );
}

function Quote({ text, source }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[#CCFF00] font-display text-2xl leading-none">“</div>
      <p className="text-white/75 text-sm leading-relaxed">{text}</p>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        — {source}
      </span>
    </div>
  );
}
