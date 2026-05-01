import { motion } from "framer-motion";
import { TrendingUp, ArrowUp, MousePointerClick } from "lucide-react";

// Realistic analytics dashboard card — gives instant "real results" credibility
export default function AnalyticsCard() {
  // Build a smooth ascending curve as SVG path
  const points = [10, 18, 14, 26, 22, 38, 34, 48, 44, 62, 58, 78, 70, 92];
  const w = 280;
  const h = 90;
  const stepX = w / (points.length - 1);
  const maxY = Math.max(...points);
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * stepX} ${h - (p / maxY) * (h - 8) - 4}`
    )
    .join(" ");
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[420px] bg-[#131319] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      data-testid="analytics-card"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0F0F15]">
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
        <div className="flex-1 mx-3 px-3 py-1 bg-[#1A1A22] border border-white/10 font-mono text-[10px] text-white/50 truncate">
          dashboard.brivomarketing.com / live
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-[#36F1CD] animate-pulse" />
      </div>

      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
            Last 30 Days · Revenue Attribution
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#CCFF00]">
            <ArrowUp size={10} /> 38.4%
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display text-3xl font-black tracking-tight text-white">
            $1,284,720
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            tracked
          </span>
        </div>

        {/* Chart */}
        <div className="mt-4 relative">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[90px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#areaFill)" />
            <path d={path} fill="none" stroke="#CCFF00" strokeWidth="1.5" />
            {/* end dot */}
            <circle
              cx={w}
              cy={h - (points[points.length - 1] / maxY) * (h - 8) - 4}
              r="3"
              fill="#CCFF00"
            />
            {/* horizontal grid */}
            {[0.25, 0.5, 0.75].map((p) => (
              <line
                key={p}
                x1="0"
                y1={h * p}
                x2={w}
                y2={h * p}
                stroke="white"
                strokeOpacity="0.05"
                strokeDasharray="2 4"
              />
            ))}
          </svg>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              ROAS
            </div>
            <div className="font-display text-base font-black text-white mt-0.5">
              5.8x
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              CAC
            </div>
            <div className="font-display text-base font-black text-white mt-0.5">
              $42
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              CVR
            </div>
            <div className="font-display text-base font-black text-[#CCFF00] mt-0.5">
              8.4%
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        className="absolute -bottom-6 -right-6 hidden md:flex items-center gap-3 bg-[#0E0E14] border border-[#CCFF00]/40 px-4 py-3 shadow-[0_20px_50px_-10px_rgba(204,255,0,0.25)]"
      >
        <div className="w-8 h-8 bg-[#CCFF00] flex items-center justify-center text-black">
          <TrendingUp size={14} />
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
            New conversion
          </div>
          <div className="font-display text-xs font-bold text-white">
            +$2,840 · Q2 campaign
          </div>
        </div>
      </motion.div>

      {/* Floating metric chip */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.0, duration: 0.7 }}
        className="absolute -top-5 -left-5 hidden md:flex items-center gap-2 bg-[#0E0E14] border border-white/15 px-3 py-2 shadow-xl"
      >
        <MousePointerClick size={12} className="text-[#36F1CD]" />
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
          12,486 clicks today
        </div>
      </motion.div>
    </motion.div>
  );
}
