import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * BigCtaCard — premium pre-footer CTA card on the light ivory section,
 * rendered as a deep-navy card with a warm gold accent. Calm, confident.
 */
export default function BigCtaCard({ onCTA }) {
  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-20 md:py-28 bg-[#FBFAF6]"
      data-testid="big-cta-card"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-[#0B1B2B] text-white"
        style={{
          boxShadow: "0 30px 80px -25px rgba(11,27,43,0.45)",
        }}
      >
        {/* Soft gold aura */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#B8864C]/20 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#B8864C]/10 blur-[120px]" />

        {/* Faint grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative px-6 py-16 md:px-16 md:py-24 lg:py-28 flex flex-col items-center text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-[#B8864C]/40 blur-3xl rounded-full scale-110" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-[#B8864C]/60">
              <img
                src="/owl-logo.jpg"
                alt="Brivo"
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>
          </div>

          <span className="text-[11px] tracking-[0.3em] uppercase text-[#B8864C] mb-6">
            Let&apos;s begin
          </span>

          <h2
            className="font-display text-[40px] sm:text-[52px] md:text-[72px] font-[400] leading-[1.04] tracking-tight max-w-4xl"
            data-testid="big-cta-title"
          >
            Ready to move your business <em className="italic text-[#B8864C] font-[500]">forward?</em>
          </h2>

          <p className="mt-7 max-w-xl text-white/70 text-[16px] md:text-[17px] leading-relaxed">
            A 30-minute conversation. We review your funnel, audit your competitors, and show you exactly where to focus next. No pitch, no obligation.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button
              onClick={onCTA}
              className="group inline-flex items-center gap-2 bg-[#B8864C] text-white rounded-full px-8 py-4 text-[14px] font-medium hover:bg-[#8E6535] transition-all"
              data-testid="big-cta-book"
            >
              Book a 30-min audit
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#services"
              className="inline-flex items-center gap-2 border border-white/25 text-white rounded-full px-8 py-4 text-[14px] font-medium hover:bg-white/5 transition-all"
            >
              Explore services
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-[12px] tracking-[0.15em] uppercase text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8864C]" />
            7 audit slots remaining this month
          </div>
        </div>
      </motion.div>
    </section>
  );
}
