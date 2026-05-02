import { Check, Crown, Trophy, Award, Medal } from "lucide-react";

const TIER_VISUAL = {
  bronze: { Icon: Medal, accent: "#A86B3A", grad: "from-[#3A2616] to-[#1A0F08]" },
  silver: { Icon: Award, accent: "#B7C0CB", grad: "from-[#1F2933] to-[#0F1620]" },
  gold: { Icon: Trophy, accent: "#E8C28A", grad: "from-[#3A2C13] to-[#1A130A]" },
  platinum: { Icon: Crown, accent: "#E8E1D2", grad: "from-[#0B1B2B] to-[#040A12]" },
};

const FALLBACK = [
  {
    id: "bronze",
    name: "Bronze",
    min_active: 1,
    max_active: 3,
    rate: 0.15,
    perks: [
      "15% recurring commission for the lifetime of every client",
      "15% signing bonus on the first month",
      "Personal referral link + tracking dashboard",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    min_active: 4,
    max_active: 9,
    rate: 0.2,
    perks: ["20% recurring commission, lifetime", "20% signing bonus", "Co-branded sales decks"],
  },
  {
    id: "gold",
    name: "Gold",
    min_active: 10,
    max_active: 24,
    rate: 0.25,
    perks: [
      "25% recurring commission, lifetime",
      "25% signing bonus",
      "$500 milestone bonus when you hit Gold",
      "Direct strategist on every deal",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    min_active: 25,
    max_active: 9999,
    rate: 0.3,
    perks: [
      "30% recurring commission, lifetime",
      "30% signing bonus",
      "$2,500 quarterly performance bonus",
      "White-label portal & priority pipeline",
      "Equity / advisory consideration",
    ],
  },
];

export default function CommissionTiers({ tiers }) {
  const data = tiers && tiers.length ? tiers : FALLBACK;
  return (
    <section
      id="tiers"
      className="bg-[#0B1B2B] text-white py-24 px-6 md:px-10 lg:px-16"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#E8C28A] font-medium">
            Commission tiers
          </span>
          <h2 className="font-display text-[38px] md:text-[58px] leading-[1.02] tracking-tight mt-3">
            The harder you work, the more you make.
          </h2>
          <p className="text-white/65 text-[15px] mt-4 max-w-[680px] mx-auto">
            Tiers update automatically based on how many active paying clients you have. No paperwork. No quotas. Pure performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.map((t) => {
            const v = TIER_VISUAL[t.id] || TIER_VISUAL.bronze;
            const Icon = v.Icon;
            return (
              <div
                key={t.id}
                data-testid={`tier-${t.id}`}
                className={`relative rounded-2xl border border-white/10 bg-gradient-to-b ${v.grad} p-7 hover:border-[#E8C28A]/50 transition-all`}
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon size={26} style={{ color: v.accent }} />
                  <span
                    className="font-mono text-[10px] tracking-[0.28em] uppercase"
                    style={{ color: v.accent }}
                  >
                    {t.min_active}
                    {t.max_active < 1000 ? `–${t.max_active}` : "+"} clients
                  </span>
                </div>
                <h3
                  className="font-display text-[28px] tracking-tight"
                  style={{ color: v.accent }}
                >
                  {t.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-[52px] leading-none text-white">
                    {Math.round(t.rate * 100)}%
                  </span>
                  <span className="text-[12px] tracking-[0.18em] uppercase text-white/55">
                    monthly, forever
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-[13.5px] text-white/80">
                  {(t.perks || []).map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: v.accent }} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
