import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AnalyticsCard from "@/components/site/AnalyticsCard";

const fadeUp = {
  hidden: { y: 28, opacity: 0 },
  show: (i = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 + i * 0.08 },
  }),
};

export default function Hero({ onCTA }) {
  return (
    <section
      id="top"
      className="relative min-h-[100vh] overflow-hidden flex flex-col bg-[#FBFAF6]"
      data-testid="hero-section"
    >
      {/* Soft ambient backdrop */}
      <div className="absolute inset-0 soft-aura pointer-events-none" />
      <div className="absolute inset-0 grid-faint pointer-events-none opacity-70" />

      <div className="relative z-10 flex-1 px-6 md:px-10 lg:px-16 pt-32 md:pt-36 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left column — copy */}
          <div className="lg:col-span-7">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-3"
            >
              <span className="chip">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8864C]" />
                Marketing &amp; Web Studio · Est. 2019
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-7 font-display text-[2.6rem] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[5rem] xl:text-[5.6rem] font-[400] leading-[1.02] tracking-[-0.02em] text-[#0B1B2B]"
              data-testid="hero-title"
            >
              Marketing that moves
              <br />
              your business
              <br />
              <em className="font-[500] italic text-[#B8864C] not-italic-ua" style={{ fontStyle: "italic" }}>forward.</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-8 max-w-xl text-[#4E5C6E] text-[17px] md:text-[18px] leading-[1.65]"
            >
              We design thoughtful websites and measurable marketing systems for established brands — with the discipline of a consultancy and the creative edge of a studio.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={onCTA}
                className="group btn-primary"
                data-testid="hero-cta"
              >
                Start a project
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
              <a
                href="#work"
                className="btn-ghost"
                data-testid="hero-secondary-cta"
              >
                See our work
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-12 grid sm:grid-cols-2 gap-5 max-w-lg"
            >
              {[
                "Trusted by 180+ established brands",
                "Transparent pricing. No long contracts.",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#B8864C] mt-0.5 flex-shrink-0" />
                  <span className="text-[14px] text-[#0B1B2B]/75 leading-relaxed">
                    {t}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column — analytics card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <AnalyticsCard />
          </motion.div>
        </div>
      </div>

      {/* Bottom hairline stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="relative z-10 px-6 md:px-10 lg:px-16 pb-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#E7E3D8]">
          {[
            { label: "Revenue generated", value: "$120M+" },
            { label: "Brands partnered", value: "180+" },
            { label: "Average ROAS", value: "4.2x" },
            { label: "Client retention", value: "92%" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`py-6 md:py-7 ${i > 0 ? "md:border-l border-[#E7E3D8]" : ""} ${i > 0 && i < 2 ? "border-l border-[#E7E3D8]" : ""} md:pl-6 ${i > 1 && "pt-0 md:pt-7 border-t md:border-t-0 border-[#E7E3D8]"}`}
              data-testid={`hero-stat-${i}`}
            >
              <div className="font-display text-3xl md:text-4xl font-[500] text-[#0B1B2B] tracking-tight">
                {s.value}
              </div>
              <div className="mt-2 text-[12px] text-[#8190A1] tracking-[0.05em]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
