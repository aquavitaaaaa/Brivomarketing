import { useMemo, useState } from "react";
import { TrendingUp, Sparkles } from "lucide-react";

const PLANS = [
  { id: "ignite", label: "IGNITE — $2,500/mo", mrr: 2500 },
  { id: "accelerate", label: "ACCELERATE — $7,500/mo", mrr: 7500 },
  { id: "dominate", label: "DOMINATE — $15,000/mo", mrr: 15000 },
];

function tierFor(active) {
  if (active >= 25) return { id: "platinum", name: "Platinum", rate: 0.3 };
  if (active >= 10) return { id: "gold", name: "Gold", rate: 0.25 };
  if (active >= 4) return { id: "silver", name: "Silver", rate: 0.2 };
  return { id: "bronze", name: "Bronze", rate: 0.15 };
}

const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

export default function EarningsCalculator() {
  const [planId, setPlanId] = useState("accelerate");
  const [count, setCount] = useState(5);
  const [retention, setRetention] = useState(18);

  const plan = PLANS.find((p) => p.id === planId) || PLANS[1];
  const tier = useMemo(() => tierFor(count), [count]);

  const monthly = count * plan.mrr * tier.rate;
  const annual = monthly * 12;
  const lifetime = monthly * retention;
  const signingBonus = count * plan.mrr * tier.rate;

  return (
    <section className="bg-[#FBFAF6] py-24 px-6 md:px-10 lg:px-16" id="calc">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#B8864C] font-medium">
              Earnings calculator
            </span>
            <h2 className="font-display text-[36px] md:text-[52px] leading-[1.05] tracking-tight mt-3 text-[#0B1B2B]">
              Run the math. It&rsquo;s real.
            </h2>
          </div>
          <p className="text-[15px] text-[#4E5C6E] max-w-[420px]">
            Drag the sliders to see what your monthly recurring payout looks like as you grow your active book of clients.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-7">
          {/* Inputs */}
          <div className="bg-white border border-[#E7E3D8] rounded-2xl p-7 md:p-9">
            <div className="space-y-9">
              <div>
                <Label>Plan you bring most</Label>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlanId(p.id)}
                      data-testid={`calc-plan-${p.id}`}
                      className={`text-[12px] tracking-[0.16em] uppercase font-medium px-3 py-3 rounded-lg border transition-all ${
                        planId === p.id
                          ? "bg-[#0B1B2B] text-white border-[#0B1B2B]"
                          : "bg-white text-[#0B1B2B] border-[#E7E3D8] hover:border-[#B8864C]"
                      }`}
                    >
                      {p.label.split(" — ")[0]}
                      <span className="block font-mono text-[10px] mt-1 opacity-70">
                        {p.label.split(" — ")[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Active paying clients you refer</Label>
                  <span className="font-display text-[24px] text-[#0B1B2B]">{count}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10))}
                  data-testid="calc-clients"
                  className="w-full mt-3 accent-[#B8864C]"
                />
                <div className="flex justify-between text-[10px] tracking-[0.2em] uppercase text-[#8190A1] mt-2">
                  <span>Bronze</span><span>Silver</span><span>Gold</span><span>Platinum</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Avg client retention (months)</Label>
                  <span className="font-display text-[24px] text-[#0B1B2B]">{retention}</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={48}
                  step={1}
                  value={retention}
                  onChange={(e) => setRetention(parseInt(e.target.value, 10))}
                  data-testid="calc-retention"
                  className="w-full mt-3 accent-[#B8864C]"
                />
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="relative bg-[#0B1B2B] text-white rounded-2xl p-7 md:p-9 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(184,134,76,0.22),transparent_55%)]" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#E8C28A]">
                <Sparkles size={13} /> Your tier
              </div>
              <div className="font-display text-[40px] md:text-[52px] tracking-tight mt-2">
                {tier.name}
                <span className="text-[#E8C28A] ml-3">{Math.round(tier.rate * 100)}%</span>
              </div>
              <div className="text-[13px] text-white/65 mt-1">
                {count} active client{count > 1 ? "s" : ""} &middot; {plan.label}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-9">
                <PayoutCard label="Monthly recurring" value={fmt(monthly)} />
                <PayoutCard label="Annualized" value={fmt(annual)} />
                <PayoutCard label="Signing bonus" value={fmt(signingBonus)} hint="one-time, on close" />
                <PayoutCard
                  label={`Over ${retention} mo`}
                  value={fmt(lifetime + signingBonus)}
                  hint="all-in lifetime payout"
                  highlight
                />
              </div>

              <div className="mt-8 inline-flex items-center gap-2 text-[12px] text-white/65">
                <TrendingUp size={14} className="text-[#E8C28A]" />
                Add 1 more client &rarr; {fmt(plan.mrr * tierFor(count + 1).rate)} / mo more
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="text-[11px] tracking-[0.22em] uppercase text-[#8190A1] font-medium">
      {children}
    </label>
  );
}

function PayoutCard({ label, value, hint, highlight }) {
  return (
    <div
      className={`rounded-xl px-5 py-4 border ${
        highlight
          ? "border-[#E8C28A]/50 bg-[#E8C28A]/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="text-[10px] tracking-[0.22em] uppercase text-white/55">
        {label}
      </div>
      <div className={`font-display text-[28px] mt-1 ${highlight ? "text-[#E8C28A]" : "text-white"}`}>
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-white/45 mt-1">{hint}</div>
      )}
    </div>
  );
}
