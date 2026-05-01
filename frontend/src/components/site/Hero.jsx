import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowUpRight } from "lucide-react";

const HERO_BG =
  "https://images.unsplash.com/photo-1770031079091-c6356e82ea9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMGRhcmslMjBnbGFzc21vcnBoaXNtJTIwM2R8ZW58MHx8fHwxNzc3NjA5MDE0fDA&ixlib=rb-4.1.0&q=85";

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.08 },
  }),
};

export default function Hero({ onCTA }) {
  return (
    <section
      id="top"
      className="relative min-h-[100vh] grain overflow-hidden flex flex-col justify-end pb-12"
      data-testid="hero-section"
    >
      <motion.img
        src={HERO_BG}
        alt=""
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(204,255,0,0.08),transparent_60%)]" />

      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-40">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex items-center gap-3 mb-8"
        >
          <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
            Brivo Marketing — Est. 2026 / Worldwide
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
          <span className="text-[#CCFF00]">noise.</span>
        </motion.h1>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-10 grid md:grid-cols-12 gap-8 items-end"
        >
          <p className="md:col-span-5 md:col-start-7 text-white/70 text-base md:text-lg leading-relaxed">
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
            className="group inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-8 py-5 accent-glow"
            data-testid="hero-cta"
          >
            Start a Project
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
          <a
            href="#work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white link-underline"
            data-testid="hero-secondary-cta"
          >
            See the work
          </a>
        </motion.div>
      </div>

      <div className="relative z-10 mt-20 border-y border-white/10 py-6 marquee-mask">
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
            <span key={i} className="font-display text-3xl md:text-5xl uppercase font-black tracking-tighter mx-10 flex items-center">
              {w}
              <span className="w-2 h-2 rotate-45 bg-[#CCFF00] ml-10" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
