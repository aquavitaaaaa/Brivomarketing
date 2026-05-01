import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    id: "ignite",
    name: "Ignite",
    price: "$2,500",
    sub: "/month",
    tagline: "For early-stage brands launching with focus and momentum.",
    features: [
      "One marketing channel managed",
      "Conversion-focused landing site",
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
    tagline: "Most chosen. Multi-channel growth with a dedicated strategist.",
    features: [
      "Three channels managed",
      "Custom website (up to 12 pages)",
      "Weekly reporting &amp; reviews",
      "Dedicated senior strategist",
      "Creative production included",
      "Priority Slack support",
    ],
    highlight: true,
  },
  {
    id: "dominate",
    name: "Partner",
    price: "$15K+",
    sub: "/month",
    tagline: "Full-service execution for established category leaders.",
    features: [
      "All channels — fully managed",
      "Unlimited site &amp; landing pages",
      "Daily operations &amp; reporting",
      "Brand + creative studio access",
      "Quarterly strategy offsite",
      "24/7 priority support",
    ],
    highlight: false,
  },
];

export default function Pricing({ onSelect }) {
  return (
    <section
      id="pricing"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-white border-b border-[#E7E3D8]"
      data-testid="pricing-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-16 items-end">
        <div className="md:col-span-7">
          <span className="eyebrow-accent">Engagements</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="pricing-title"
          >
            Clear, predictable <em className="italic text-[#B8864C] font-[500]">retainers.</em>
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-[#4E5C6E] text-[16px] leading-relaxed">
          Transparent monthly partnerships. No hourly billing. Cancel any time after the first 90 days.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {tiers.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className={`relative rounded-2xl p-8 md:p-10 flex flex-col ${
              t.highlight
                ? "bg-[#0B1B2B] text-white border border-[#0B1B2B] md:scale-[1.02]"
                : "bg-[#FBFAF6] text-[#0B1B2B] border border-[#E7E3D8]"
            }`}
            data-testid={`pricing-tier-${t.id}`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-8 bg-[#B8864C] text-white text-[11px] uppercase tracking-[0.18em] font-medium px-3 py-1.5 rounded-full">
                Most popular
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-display text-[30px] font-[500] tracking-tight mb-2">
                {t.name}
              </h3>
              <p className={`text-[14px] leading-relaxed mb-8 ${t.highlight ? "text-white/65" : "text-[#4E5C6E]"}`}>
                {t.tagline}
              </p>

              <div className="flex items-baseline gap-1 mb-10">
                <span className="font-display text-[48px] font-[500] tracking-tight">
                  {t.price}
                </span>
                <span className={`text-[14px] ${t.highlight ? "text-white/50" : "text-[#8190A1]"}`}>
                  {t.sub}
                </span>
              </div>

              <ul className="space-y-3.5 mb-10">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-3 text-[14px] ${t.highlight ? "text-white/85" : "text-[#0B1B2B]/80"}`}
                  >
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${t.highlight ? "text-[#B8864C]" : "text-[#B8864C]"}`}
                    />
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onSelect(`${t.name} Tier`)}
              className={`rounded-full text-[14px] font-medium px-6 py-3.5 transition-all ${
                t.highlight
                  ? "bg-[#B8864C] text-white hover:bg-[#8E6535]"
                  : "bg-[#0B1B2B] text-white hover:bg-[#14283F]"
              }`}
              data-testid={`pricing-cta-${t.id}`}
            >
              Choose {t.name}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
