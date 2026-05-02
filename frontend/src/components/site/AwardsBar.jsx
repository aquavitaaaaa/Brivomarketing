import { motion } from "framer-motion";

/**
 * AwardsBar — typographic awards lockup (no logo files required).
 * A cinematic horizontal strip showcasing industry recognition.
 */

const AWARDS = [
  { name: "AWWWARDS",        detail: "Site of the Day · 4×" },
  { name: "CSS DESIGN AWARDS", detail: "UI / UX Finalist" },
  { name: "THE WEBBY",       detail: "Honoree · 2024" },
  { name: "RED DOT",         detail: "Brand Design · Winner" },
  { name: "CLUTCH",          detail: "Top 1% · Performance Marketing" },
  { name: "BEHANCE",         detail: "Featured · 7×" },
];

export default function AwardsBar() {
  return (
    <section className="relative bg-[#0B1B2B] text-white py-14 md:py-16 overflow-hidden border-y border-white/10" data-testid="awards-bar">
      {/* faint gold underglow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(212,169,113,0.10) 0%, transparent 60%)" }} />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex items-center gap-4 mb-10 md:mb-14">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#D4A971] font-medium">Recognition</div>
          <div className="flex-1 h-px bg-white/12" />
          <div className="text-[11px] tracking-[0.22em] uppercase text-white/40 hidden md:block">Industry awards · 2020 — Present</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          {AWARDS.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
              data-testid={`award-${a.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="font-display text-[20px] md:text-[22px] font-[500] text-white tracking-[0.04em] leading-tight">
                {a.name}
              </div>
              <div className="mt-2 text-[11px] tracking-[0.10em] uppercase text-white/55">
                {a.detail}
              </div>
              <div className="mt-4 w-10 h-px bg-[#D4A971] transition-all duration-500 group-hover:w-16" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
