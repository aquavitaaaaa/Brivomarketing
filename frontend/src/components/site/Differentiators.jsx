import { motion } from "framer-motion";
import { Zap, Target, Layers, Brain, Trophy, Rocket } from "lucide-react";

const cards = [
  {
    icon: Zap,
    label: "Speed",
    title: "Ship in days, not quarters.",
    desc: "Senior pods deploy quickly. Average kickoff-to-launch: 21 days.",
    span: "md:col-span-7",
    highlight: true,
  },
  {
    icon: Brain,
    label: "Craft",
    title: "Thoughtful work, every detail.",
    desc: "We blend analytical rigor with design craft — nothing ships until it&apos;s right.",
    span: "md:col-span-5",
  },
  {
    icon: Target,
    label: "Precision",
    title: "Measured to the dollar.",
    desc: "Attribution down to the keyword and creative asset.",
    span: "md:col-span-4",
  },
  {
    icon: Trophy,
    label: "Accountability",
    title: "$120M+ tracked for clients.",
    desc: "Every engagement comes with a performance guarantee. We grow when you grow.",
    span: "md:col-span-5",
  },
  {
    icon: Rocket,
    label: "Scale",
    title: "$0 → $50M ARR.",
    desc: "Stage-aware operators across DTC, SaaS, and B2B.",
    span: "md:col-span-3",
  },
];

export default function Differentiators() {
  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-white border-b border-[#E7E3D8]"
      data-testid="differentiators-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-14 items-end">
        <div className="md:col-span-6">
          <span className="eyebrow-accent">Why Brivo</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="differentiators-title"
          >
            A calmer, more <em className="italic text-[#B8864C] font-[500]">accountable</em> way to grow.
          </h2>
        </div>
        <p className="md:col-span-5 md:col-start-8 text-[#4E5C6E] text-[17px] leading-relaxed">
          We&apos;re not a traditional agency. No bloated retainers, no layered account management. Senior operators, clear metrics, and honest conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className={`card-lift relative border rounded-2xl p-7 md:p-9 overflow-hidden ${c.span} ${
                c.highlight
                  ? "bg-[#0B1B2B] border-[#0B1B2B] text-white min-h-[260px]"
                  : "bg-[#FBFAF6] border-[#E7E3D8] min-h-[210px]"
              }`}
              data-testid={`differentiator-${i}`}
            >
              {c.highlight && (
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#B8864C]/20 blur-3xl pointer-events-none" />
              )}

              <div className="relative flex items-start justify-between mb-8">
                <div
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                    c.highlight
                      ? "bg-white/10 border-white/20 text-[#B8864C]"
                      : "bg-white border-[#E7E3D8] text-[#B8864C]"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <span className={`text-[11px] tracking-[0.18em] uppercase ${c.highlight ? "text-white/60" : "text-[#8190A1]"}`}>
                  {c.label}
                </span>
              </div>

              <h3 className={`relative font-display text-[22px] md:text-[26px] font-[500] leading-[1.18] tracking-tight mb-3 ${c.highlight ? "text-white" : "text-[#0B1B2B]"}`}
                  dangerouslySetInnerHTML={{ __html: c.title }} />
              <p className={`relative text-[14px] leading-relaxed ${c.highlight ? "text-white/70" : "text-[#4E5C6E]"}`}
                 dangerouslySetInnerHTML={{ __html: c.desc }} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
