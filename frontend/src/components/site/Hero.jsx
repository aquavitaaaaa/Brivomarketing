import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowUpRight, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.08 },
  }),
};

const FloatingChip = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.8 + delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className={`absolute hidden lg:flex items-center gap-2 backdrop-blur-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 ${className}`}
  >
    {children}
  </motion.div>
);

export default function Hero({ onCTA }) {
  return (
    <section
      id="top"
      className="relative min-h-[100vh] grain overflow-hidden flex flex-col justify-end pb-12"
      data-testid="hero-section"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#CCFF00]/10 blur-[120px] animate-drift" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-[#6F4FFF]/15 blur-[120px] animate-drift2" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[#36F1CD]/8 blur-[120px] animate-drift" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glowing orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute right-[6%] top-[18%] w-[460px] h-[460px] hidden md:block animate-float-y"
      >
        <div className="glow-orb absolute inset-0 rounded-full" />
        <div className="absolute inset-12 rounded-full border border-[#CCFF00]/30" />
        <div className="absolute inset-24 rounded-full border border-white/10" />
        <div className="absolute inset-36 rounded-full bg-[#CCFF00]/40 blur-2xl" />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0B0F]" />

      {/* Floating credibility chips */}
      <FloatingChip className="top-[26%] left-[42%]" delay={0}>
        <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
          +318% revenue / Obsidian
        </span>
      </FloatingChip>
      <FloatingChip className="top-[42%] right-[12%]" delay={0.15}>
        <Sparkles size={12} className="text-[#CCFF00]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
          5.8x ROAS — Halo
        </span>
      </FloatingChip>
      <FloatingChip className="top-[58%] left-[38%]" delay={0.3}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
          $120M+ tracked
        </span>
      </FloatingChip>

      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 md:pt-40">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex items-center gap-3 mb-8"
        >
          <span className="relative w-2 h-2">
            <span className="absolute inset-0 bg-[#CCFF00] rounded-full" />
            <span className="absolute inset-0 bg-[#CCFF00] rounded-full animate-ping opacity-75" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/70">
            Brivo Marketing
          </span>
          <span className="text-white/30">/</span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Available — Q2 2026
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black uppercase leading-[0.85] tracking-[-0.05em] max-w-[1200px]"
          data-testid="hero-title"
        >
          Dominate
          <br />
          the digital
          <br />
          <span className="relative inline-block">
            <span className="text-[#CCFF00]">noise.</span>
            <span className="absolute -inset-x-2 -bottom-2 h-[6px] bg-[#CCFF00]/30 blur-md" />
          </span>
        </motion.h1>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-10 grid md:grid-cols-12 gap-8 items-end"
        >
          <p className="md:col-span-5 md:col-start-7 text-white/75 text-base md:text-lg leading-relaxed">
            We engineer high-converting websites and ruthless marketing systems
            for brands that refuse to be ignored. Less fluff. More market share.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-12 flex flex-wrap items-center gap-5"
        >
          <button
            onClick={onCTA}
            className="group relative inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-8 py-5 accent-glow overflow-hidden"
            data-testid="hero-cta"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-[#CCFF00] via-white to-[#CCFF00] transition-transform duration-700" />
            <span className="relative flex items-center gap-3">
              Start a Project
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </span>
            <span className="absolute inset-0 overflow-hidden pointer-events-none">
              <span className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/40 skew-x-[-20deg] shine-sweep" />
            </span>
          </button>
          <a
            href="#work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white link-underline"
            data-testid="hero-secondary-cta"
          >
            See the work →
          </a>
          <div className="hidden md:flex items-center gap-3 ml-4 pl-6 border-l border-white/15">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1774481528970-41e591147018?w=40&h=40&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1762635696772-0ed637b1a3a7?w=40&h=40&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=40&h=40&fit=crop",
              ].map((src, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0B0B0F] overflow-hidden"
                >
                  <img src={src} alt="" className="w-full h-full object-cover grayscale" />
                </div>
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
              180+ founders shipped
            </span>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mt-20 border-y border-white/10 py-6 marquee-mask bg-black/30 backdrop-blur-xl">
        <Marquee gradient={false} speed={50} pauseOnHover>
          {[
            "WEB DESIGN",
            "SEO",
            "PAID ADS",
            "SOCIAL MEDIA",
            "BRANDING",
            "CRO",
            "WEB DEV",
            "CONTENT",
          ].map((w, i) => (
            <span
              key={i}
              className="font-display text-3xl md:text-5xl uppercase font-black tracking-tighter mx-10 flex items-center"
            >
              {w}
              <span className="w-2 h-2 rotate-45 bg-[#CCFF00] ml-10" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
