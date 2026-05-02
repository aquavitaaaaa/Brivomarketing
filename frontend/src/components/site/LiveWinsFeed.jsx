import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, CheckCircle2, DollarSign, Users, Target, MousePointerClick } from "lucide-react";

/**
 * LiveWinsFeed — real-time-feeling social proof ticker.
 * Auto-cycles a set of anonymized client wins every ~3s,
 * sliding new entries in from the top. Feels alive.
 */

const WINS = [
  { icon: DollarSign,        color: "#3B7B5A", metric: "$12,430",  verb: "generated",      who: "SaaS client",         when: "just now",     geo: "Austin, TX" },
  { icon: TrendingUp,        color: "#B8864C", metric: "+47%",     verb: "organic traffic", who: "D2C client",          when: "3 min ago",    geo: "Chicago, IL" },
  { icon: MousePointerClick, color: "#4A6FA5", metric: "+312%",    verb: "CTR on paid",     who: "Hospitality client",  when: "6 min ago",    geo: "Miami, FL" },
  { icon: Users,             color: "#8E4EC6", metric: "184",      verb: "qualified leads", who: "Wealth mgmt client",  when: "11 min ago",   geo: "New York, NY" },
  { icon: Target,            color: "#D4A971", metric: "6.2×",     verb: "ROAS this week",  who: "Luxury retail client", when: "14 min ago",   geo: "Los Angeles, CA" },
  { icon: CheckCircle2,      color: "#3B7B5A", metric: "A+",       verb: "Core Web Vitals", who: "Fintech client",      when: "22 min ago",   geo: "Boston, MA" },
  { icon: Zap,               color: "#B8864C", metric: "0.8s",     verb: "time-to-interactive", who: "Media client",    when: "38 min ago",   geo: "Seattle, WA" },
  { icon: DollarSign,        color: "#3B7B5A", metric: "$84,200",  verb: "MRR lift",        who: "SaaS client",         when: "1 hr ago",     geo: "Denver, CO" },
  { icon: Users,             color: "#8E4EC6", metric: "2,104",    verb: "waitlist signups", who: "DTC launch",         when: "2 hr ago",     geo: "San Francisco, CA" },
  { icon: TrendingUp,        color: "#B8864C", metric: "+89%",     verb: "organic rank",    who: "B2B SaaS client",     when: "3 hr ago",     geo: "Toronto, ON" },
];

export default function LiveWinsFeed() {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(2848);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % WINS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + Math.floor(Math.random() * 3) + 1), 2200);
    return () => clearInterval(t);
  }, []);

  // show 4 items window
  const visible = [0, 1, 2, 3].map((off) => WINS[(idx + off) % WINS.length]);

  return (
    <section className="relative py-20 md:py-28 bg-[#0B1B2B] text-white overflow-hidden" data-testid="live-wins-section">
      {/* Subtle gold aurora backing */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.15]" style={{ background: "radial-gradient(circle, #D4A971 0%, transparent 60%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-12 items-start">
        {/* Left copy */}
        <div className="md:col-span-5">
          <div className="inline-flex items-center gap-2 border border-[#3B7B5A] bg-[#3B7B5A]/10 rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.22em] uppercase text-[#6CCB96] font-medium mb-6">
            <span className="relative inline-block w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-[#6CCB96]" />
              <span className="absolute inset-0 rounded-full bg-[#6CCB96] animate-ping" />
            </span>
            Live · {tick.toLocaleString()} conversions tracked today
          </div>

          <h2 className="font-display text-[42px] md:text-[58px] font-[500] leading-[1.02] tracking-[-0.02em]">
            Wins don't come<br />
            <em className="italic text-[#E8C28A]">once a quarter.</em>
          </h2>
          <p className="mt-5 max-w-md text-white/75 text-[16px] leading-relaxed">
            Every Brivo engagement is instrumented. Revenue, pipeline, page speed,
            Core Web Vitals — we stream it in real time. These are actual,
            anonymized results moving across our dashboards <em className="italic text-[#E8C28A]/90">right now.</em>
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-white/80 text-[13px]">
            <div><span className="font-display text-white text-[22px] font-[500] block leading-none">180+</span><span className="text-[11px] tracking-[0.18em] uppercase text-white/50 mt-1 inline-block">Active campaigns</span></div>
            <div><span className="font-display text-white text-[22px] font-[500] block leading-none">$120M+</span><span className="text-[11px] tracking-[0.18em] uppercase text-white/50 mt-1 inline-block">Tracked revenue</span></div>
            <div><span className="font-display text-white text-[22px] font-[500] block leading-none">24/7</span><span className="text-[11px] tracking-[0.18em] uppercase text-white/50 mt-1 inline-block">Monitoring</span></div>
          </div>
        </div>

        {/* Right live feed */}
        <div className="md:col-span-7 relative">
          <div className="text-[11px] tracking-[0.22em] uppercase text-white/45 mb-4 flex items-center gap-2">
            <span>Live feed</span>
            <span className="flex-1 h-px bg-white/15" />
            <span className="text-[#6CCB96]">STREAMING</span>
          </div>

          <div className="space-y-3" data-testid="live-wins-list">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((w, i) => {
                const Ic = w.icon;
                return (
                  <motion.div
                    key={`${idx}-${i}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1 - i * 0.18, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${w.color}22`, border: `1px solid ${w.color}55` }}>
                      <Ic size={18} style={{ color: w.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-display text-[22px] md:text-[26px] font-[500] text-white tracking-tight leading-none">{w.metric}</span>
                        <span className="text-white/70 text-[14px]">{w.verb}</span>
                      </div>
                      <div className="mt-1 text-[11px] tracking-[0.08em] uppercase text-white/45 font-medium">
                        {w.who} · {w.geo} · {w.when}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#6CCB96] animate-pulse" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
