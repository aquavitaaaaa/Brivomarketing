import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Instagram } from "lucide-react";
import HeroTechOverlay, { LivePulseBadge } from "@/components/site/HeroTechOverlay";
import HeroShowcase from "@/components/site/HeroShowcase";
import useMagneticHover from "@/hooks/useMagneticHover";

const fadeUp = {
  hidden: { y: 32, opacity: 0 },
  show: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.09 },
  }),
};

export default function Hero({ onCTA }) {
  const magneticRef = useMagneticHover({ strength: 0.25, radius: 150 });
  return (
    <section
      id="top"
      className="relative min-h-[100vh] w-full overflow-hidden bg-[#0B1B2B] text-white"
      data-testid="hero-section"
    >
      {/* ── CINEMATIC BACKGROUND (subtle, the devices are the star) ── */}
      <div className="hero-aurora-bg" aria-hidden="true">
        <div className="hero-image-layer">
          <img
            src="/hero-bg-0.jpg"
            alt=""
            className="hero-image-bg hero-image-bg-subtle"
            loading="eager"
            decoding="async"
          />
          <div className="hero-image-tint hero-image-tint-strong" />
        </div>

        {/* Horizon grid (subtle tech edge at the base) */}
        <div className="hero-horizon">
          <div className="hero-horizon-grid" />
          <div className="hero-horizon-glow" />
          <div className="hero-horizon-line" />
        </div>

        {/* Floating bokeh particles */}
        <div className="hero-aurora-particles">
          {[...Array(10)].map((_, i) => (
            <span key={i} className={`hero-bokeh hero-bokeh-${(i % 6) + 1}`} style={{
              left: `${(i * 9 + 5) % 95}%`,
              top: `${(i * 13 + 8) % 85}%`,
              animationDelay: `${(i * 0.7) % 8}s`,
              animationDuration: `${8 + (i % 5) * 2}s`,
            }} />
          ))}
        </div>

        <div className="hero-aurora-vignette" />
        <div className="hero-mesh-grain" />
      </div>

      {/* Optional: subtle tech constellation (kept for continuity) */}
      <HeroTechOverlay />

      {/* ── CONTENT: Apple/Tesla two-column layout ─────────────── */}
      <div className="relative z-10 min-h-[100vh] grid lg:grid-cols-12 gap-8 px-6 md:px-10 lg:px-14 pt-32 md:pt-36 pb-14">
        {/* LEFT: headline + CTA */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <span className="inline-flex items-center gap-2 border border-white/20 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 text-[11px] tracking-[0.22em] uppercase text-white/85 font-medium">
              <span className="relative inline-block w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-[#D4A971]" />
                <span className="absolute inset-0 rounded-full bg-[#D4A971] animate-ping opacity-70" />
              </span>
              Accepting 3 engagements for Q2
            </span>
            <LivePulseBadge className="hidden sm:inline-flex" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-display font-[400] leading-[0.98] tracking-[-0.025em] text-white text-[clamp(2.8rem,6.5vw,6.2rem)]"
            data-testid="hero-title"
            style={{ textShadow: "0 4px 40px rgba(0,0,0,0.45)" }}
          >
            Custom websites,
            <br />
            built to move{" "}
            <em style={{ fontStyle: "italic" }} className="text-[#E8C28A] font-[500] hero-shimmer">
              markets.
            </em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-8 max-w-xl text-white/85 text-[16px] md:text-[18px] leading-[1.65] font-light"
          >
            We design and build bespoke digital experiences for ambitious brands —
            from SaaS platforms to luxury storefronts. Every pixel considered.
            Every interaction intentional.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              ref={magneticRef}
              onClick={onCTA}
              className="group relative inline-flex items-center gap-3 bg-[#B8864C] hover:bg-[#C99661] text-white px-8 py-4 rounded-full text-[14px] font-medium tracking-wide transition-all overflow-hidden"
              style={{
                boxShadow:
                  "0 20px 50px -15px rgba(184,134,76,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
              data-testid="hero-cta"
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.25)_50%,transparent_70%)] -translate-x-full group-hover:translate-x-full"
                style={{ transitionProperty: "transform, opacity", transitionDuration: "900ms" }}
              />
              <span className="relative">Start a project</span>
              <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#work"
              className="group inline-flex items-center gap-3 bg-white/8 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white px-7 py-4 rounded-full text-[14px] font-medium transition-all"
              data-testid="hero-secondary-cta"
            >
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Play size={11} className="fill-white ml-0.5" />
              </span>
              See our work
            </a>
          </motion.div>

          {/* Social hint */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex items-center gap-3"
          >
            <span className="text-[11px] tracking-[0.22em] uppercase text-white/45">
              Follow our work
            </span>
            <span className="w-8 h-px bg-white/20" />
            <a
              href="https://www.instagram.com/brivomarketing/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-white/70 hover:text-[#E8C28A] transition-colors"
              data-testid="hero-instagram"
            >
              <Instagram size={15} className="transition-transform group-hover:scale-110" />
              <span className="text-[12px] tracking-wide">@brivomarketing</span>
            </a>
          </motion.div>
        </div>

        {/* RIGHT: cinematic device showcase */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end mt-6 lg:mt-0 min-h-[420px] lg:min-h-0">
          <HeroShowcase />
        </div>
      </div>

      {/* ── BOTTOM EDITORIAL STRIP (kept, refined) ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 px-6 md:px-10 lg:px-14 pb-12 -mt-4 md:-mt-6"
      >
        <div className="grid md:grid-cols-12 gap-6 items-end pt-8 border-t border-white/12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-[#D4A971] text-[#D4A971]" />
              ))}
              <span className="text-white/85 text-[13px] ml-2 font-medium">4.9 on Clutch</span>
            </div>
            <div className="text-white/65 text-[13px] leading-relaxed max-w-[280px]">
              180+ established brands across 27 industries — from SaaS to hospitality.
            </div>
          </div>

          {[
            { label: "Revenue generated", value: "$120M+" },
            { label: "Avg ROAS", value: "4.2x" },
            { label: "Client retention", value: "92%" },
            { label: "Years in craft", value: "Since '19" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`md:col-span-2 ${i === 0 ? "md:pl-6 md:border-l border-white/12" : "md:pl-4 md:border-l border-white/12"}`}
              data-testid={`hero-stat-${i}`}
            >
              <div className="font-display text-[26px] md:text-[32px] font-[500] tracking-tight text-white leading-none">
                {s.value}
              </div>
              <div className="mt-1.5 text-[11px] text-white/55 tracking-[0.14em] uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-6 right-6 md:right-10 z-10 hidden md:flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-white/45"
      >
        <span>Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent inline-block"
        />
      </motion.div>
    </section>
  );
}
