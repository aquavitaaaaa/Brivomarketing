import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import HeroVisual from "@/components/site/HeroVisual";
import AnalyticsCard from "@/components/site/AnalyticsCard";

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.08 },
  }),
};

const liveStats = [
  { label: "Revenue tracked", value: "$120M+", trend: "+38% YoY" },
  { label: "Brands scaled", value: "180+", trend: "Active retainers" },
  { label: "Avg. ROAS", value: "4.2x", trend: "Verified" },
];

export default function Hero({ onCTA }) {
  return (
    <section
      id="top"
      className="relative min-h-[100vh] grain overflow-hidden flex flex-col"
      data-testid="hero-section"
    >
      {/* Refined background — subtle mesh + grid, no blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#CCFF00]/[0.05] blur-[140px] animate-drift" />
        <div className="absolute top-1/4 -right-60 w-[700px] h-[700px] rounded-full bg-[#6F4FFF]/[0.09] blur-[160px] animate-drift2" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0B0F]" />
      </div>

      {/* Right-side composition: precision visual behind + analytics card on top */}
      <div className="hidden lg:flex absolute right-12 lg:right-20 top-1/2 -translate-y-1/2 w-[520px] xl:w-[600px] aspect-square pointer-events-none z-[1] items-center justify-center">
        <div className="absolute inset-0 opacity-50">
          <HeroVisual />
        </div>
        <div className="relative pointer-events-auto">
          <AnalyticsCard />
        </div>
      </div>

      <div className="relative z-10 flex-1 px-6 md:px-12 lg:px-24 pt-32 md:pt-40 pb-12">
        <div className="max-w-[860px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="flex items-center gap-3 mb-8 flex-wrap"
          >
            <span className="relative w-2 h-2">
              <span className="absolute inset-0 bg-[#CCFF00] rounded-full" />
              <span className="absolute inset-0 bg-[#CCFF00] rounded-full animate-ping opacity-75" />
            </span>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/70">
              BrivoMarketing
            </span>
            <span className="text-white/25">/</span>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/45">
              Performance Studio · Q2 2026
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-display text-[3rem] sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8.5rem] font-black uppercase leading-[0.86] tracking-[-0.045em]"
            data-testid="hero-title"
          >
            Dominate
            <br />
            the digital
            <br />
            <span className="text-[#CCFF00]">noise.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-10 max-w-xl text-white/70 text-base md:text-lg leading-relaxed"
          >
            We engineer high-converting websites and ruthless marketing systems
            for brands that refuse to be ignored. Less fluff. More market share.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <button
              onClick={onCTA}
              className="group relative inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-8 py-5 accent-glow overflow-hidden"
              data-testid="hero-cta"
            >
              <span className="relative flex items-center gap-3 z-10">
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
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex items-center gap-3 pt-6 border-t border-white/10 max-w-md"
          >
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1774481528970-41e591147018?w=60&h=60&fit=crop&crop=faces&q=70",
                "https://images.unsplash.com/photo-1762635696772-0ed637b1a3a7?w=60&h=60&fit=crop&crop=faces&q=70",
                "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=60&h=60&fit=crop&q=70",
              ].map((src, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#0B0B0F] overflow-hidden"
                >
                  <img src={src} alt="" className="w-full h-full object-cover grayscale" />
                </div>
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
              Trusted by 180+ founders worldwide
            </span>
          </motion.div>
        </div>
      </div>

      {/* Live stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="relative z-10 px-6 md:px-12 lg:px-24"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 backdrop-blur-xl">
          {liveStats.map((s, i) => (
            <div
              key={s.label}
              className="bg-[#0E0E14] px-6 py-5 flex items-center gap-5 group hover:bg-[#131319] transition-colors"
              data-testid={`hero-stat-${i}`}
            >
              <div className="w-10 h-10 border border-white/15 flex items-center justify-center text-[#CCFF00] flex-shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
                  {s.label}
                </div>
                <div className="font-display text-2xl md:text-3xl font-black tracking-tight mt-1">
                  {s.value}
                </div>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 text-right hidden md:block">
                {s.trend}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Service marquee */}
      <div className="relative z-10 mt-12 lg:mt-16 border-y border-white/10 py-6 marquee-mask bg-black/30 backdrop-blur-xl">
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
