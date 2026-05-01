import { motion } from "framer-motion";
import { Zap, Target, Layers, Brain, Trophy, Rocket } from "lucide-react";

const cards = [
  {
    icon: Zap,
    label: "Speed",
    title: "Ship in days, not quarters.",
    desc: "Our pods deploy faster than your competitors can hold a meeting. Average kickoff-to-launch: 21 days.",
    span: "md:col-span-7",
    accent: true,
  },
  {
    icon: Brain,
    label: "Intelligence",
    title: "AI-augmented every step.",
    desc: "Creative + analytics teams paired with proprietary AI tooling. We test 10x more variations than legacy shops.",
    span: "md:col-span-5",
  },
  {
    icon: Target,
    label: "Precision",
    title: "Targeted to the dollar.",
    desc: "Attribution down to the keyword and creative asset.",
    span: "md:col-span-4",
  },
  {
    icon: Trophy,
    label: "Results",
    title: "$120M+ in client revenue tracked.",
    desc: "Every retainer comes with a performance guarantee. We don't grow if you don't.",
    span: "md:col-span-5",
  },
  {
    icon: Rocket,
    label: "Scale",
    title: "From $0 to $50M ARR.",
    desc: "Stage-aware operators across DTC, SaaS, B2B, and consumer.",
    span: "md:col-span-3",
  },
];

export default function Differentiators() {
  return (
    <section
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 relative overflow-hidden"
      data-testid="differentiators-section"
    >
      <div className="absolute inset-0 gradient-mesh-soft pointer-events-none" />

      <div className="relative grid md:grid-cols-12 gap-8 mb-16 items-end">
        <div className="md:col-span-6">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Why Brivo
          </span>
          <h2
            className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
            data-testid="differentiators-title"
          >
            Built different.
            <br />
            <span className="text-stroke">Priced fair.</span>
          </h2>
        </div>
        <p className="md:col-span-5 md:col-start-8 text-white/60 text-base md:text-lg leading-relaxed">
          We're not your dad's agency. No bloated retainers, no junior account
          manager black holes. Senior operators. Real metrics. Brutal honesty.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className={`hover-ring group relative border border-white/10 bg-[#131319] p-6 md:p-8 overflow-hidden ${c.span} ${
                c.accent ? "min-h-[260px]" : "min-h-[200px]"
              }`}
              data-testid={`differentiator-${i}`}
            >
              {c.accent && (
                <>
                  <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#CCFF00]/10 blur-3xl rounded-full pointer-events-none" />
                  <div className="absolute inset-0 stripes opacity-30 pointer-events-none" />
                </>
              )}

              <div className="relative flex items-start justify-between mb-8">
                <div
                  className={`w-11 h-11 border flex items-center justify-center transition-all ${
                    c.accent
                      ? "border-[#CCFF00]/40 text-[#CCFF00] bg-black/30"
                      : "border-white/15 text-white/80 group-hover:text-[#CCFF00] group-hover:border-[#CCFF00]"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {c.label}
                </span>
              </div>

              <h3 className="relative font-display text-xl md:text-2xl font-bold tracking-tight mb-3 leading-tight">
                {c.title}
              </h3>
              <p className="relative text-sm text-white/55 leading-relaxed">
                {c.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
