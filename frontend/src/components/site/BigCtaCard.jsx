import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import MagneticCta from "@/components/site/MagneticCta";

/**
 * BigCtaCard — pre-footer mega CTA with the owl re-introduced.
 * Designed to capture attention and drive booking conversions.
 */
export default function BigCtaCard({ onCTA }) {
  return (
    <section
      className="px-6 md:px-12 lg:px-24 py-20 md:py-28 bg-[#0B0B0F] relative"
      data-testid="big-cta-card"
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-[#CCFF00]/30"
        style={{
          background:
            "linear-gradient(135deg, #1F1F2C 0%, #15151E 50%, #13131C 100%)",
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 80px rgba(204,255,0,0.10)",
        }}
      >
        {/* Aurora glows */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[#CCFF00]/[0.18] blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#6F4FFF]/[0.20] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.4)_100%)]" />

        {/* Faint blueprint grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative px-6 py-16 md:px-16 md:py-24 lg:py-28 flex flex-col items-center text-center">
          {/* Owl crest */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-10"
          >
            <div className="absolute inset-0 bg-[#CCFF00] blur-3xl opacity-30 rounded-full scale-110" />
            <div
              className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#CCFF00]/60"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(204,255,0,0.4), 0 0 50px rgba(204,255,0,0.45)",
              }}
            >
              <img
                src="/owl-logo.jpg"
                alt="Brivo"
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>
          </motion.div>

          <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#CCFF00] mb-6">
            / Engage
          </span>

          <h2
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-[-0.04em] max-w-5xl"
            data-testid="big-cta-title"
          >
            Ready to dominate
            <br />
            the <span className="text-[#CCFF00]">digital noise?</span>
          </h2>

          <p className="mt-8 max-w-2xl text-white/65 text-base md:text-lg leading-relaxed">
            30 minutes. We audit your funnel, dissect your competitors, and tell
            you exactly where the leaks are.
            <br className="hidden md:block" />
            <span className="text-white/45">No pitch. No fluff.</span>
          </p>

          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <MagneticCta>
              <button
                onClick={onCTA}
                className="group inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-10 py-5 accent-glow cursor-target"
                data-testid="big-cta-book"
              >
                Book a 30-min audit
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </button>
            </MagneticCta>
            <a
              href="#services"
              className="inline-flex items-center gap-3 border border-white/20 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] text-white font-mono text-sm uppercase tracking-[0.2em] font-bold px-10 py-5 transition-colors cursor-target"
            >
              Explore services
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/45">
            <span className="relative w-2 h-2">
              <span className="absolute inset-0 bg-[#CCFF00] rounded-full" />
              <span className="absolute inset-0 bg-[#CCFF00] rounded-full animate-ping opacity-70" />
            </span>
            7 audit slots remaining this month
          </div>
        </div>
      </motion.div>
    </section>
  );
}
