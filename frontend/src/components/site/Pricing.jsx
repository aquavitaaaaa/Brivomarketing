import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    id: "ignite",
    name: "Ignite",
    price: "$2,500",
    sub: "/month",
    tagline: "For early-stage brands ready to launch with momentum.",
    features: [
      "1 marketing channel managed",
      "Conversion-tuned landing site",
      "Monthly performance report",
      "Email support",
      "30-day strategy sprint",
    ],
    highlight: false,
  },
  {
    id: "accelerate",
    name: "Accelerate",
    price: "$7,500",
    sub: "/month",
    tagline: "Most chosen. Multi-channel scale with a dedicated strategist.",
    features: [
      "3 channels managed",
      "Custom website (up to 12 pages)",
      "Weekly reporting + reviews",
      "Dedicated strategist",
      "Creative production included",
      "Priority Slack support",
    ],
    highlight: true,
  },
  {
    id: "dominate",
    name: "Dominate",
    price: "$15K+",
    sub: "/month",
    tagline: "Full-stack execution for category leaders. We become your team.",
    features: [
      "All channels — fully managed",
      "Unlimited site & landing pages",
      "Daily ops, daily reporting",
      "Brand + creative studio access",
      "Quarterly market strategy offsite",
      "24/7 support",
    ],
    highlight: false,
  },
];

export default function Pricing({ onSelect }) {
  return (
    <section
      id="pricing"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 bg-[#070707] border-y border-white/10"
      data-testid="pricing-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-16">
        <div className="md:col-span-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Pricing
          </span>
        </div>
        <div className="md:col-span-8">
          <h2
            className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
            data-testid="pricing-title"
          >
            Pick your <span className="text-[#CCFF00]">tier</span>.
            <br />
            We handle the rest.
          </h2>
          <p className="mt-6 text-white/60 max-w-xl">
            Transparent retainers. No hourly games. Cancel any time after your
            first 90 days.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
        {tiers.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className={`relative bg-[#0A0A0A] p-8 md:p-10 flex flex-col ${
              t.highlight ? "md:scale-[1.02] md:-my-1 z-10" : ""
            }`}
            data-testid={`pricing-tier-${t.id}`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-8 bg-[#CCFF00] text-black font-mono text-[10px] uppercase tracking-[0.25em] font-bold px-3 py-1.5">
                Most Popular
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-display text-3xl font-black uppercase tracking-tight mb-2">
                {t.name}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                {t.tagline}
              </p>

              <div className="flex items-baseline gap-1 mb-10 font-mono">
                <span className="text-5xl font-bold text-white">{t.price}</span>
                <span className="text-white/40 text-sm">{t.sub}</span>
              </div>

              <ul className="space-y-4 mb-10">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-white/80"
                  >
                    <Check
                      size={16}
                      className={
                        t.highlight ? "text-[#CCFF00] mt-0.5 flex-shrink-0" : "text-white/60 mt-0.5 flex-shrink-0"
                      }
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onSelect(`${t.name} Tier`)}
              className={`font-mono text-xs uppercase tracking-[0.2em] font-bold px-6 py-4 transition-all ${
                t.highlight
                  ? "bg-[#CCFF00] text-black accent-glow"
                  : "border border-white/20 text-white hover:border-[#CCFF00] hover:text-[#CCFF00]"
              }`}
              data-testid={`pricing-cta-${t.id}`}
            >
              Choose {t.name}
            </button>

            {t.highlight && (
              <div className="absolute inset-0 border border-[#CCFF00]/40 pointer-events-none" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
