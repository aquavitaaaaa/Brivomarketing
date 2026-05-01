import { motion } from "framer-motion";
import { TrendingUp, ArrowUp } from "lucide-react";

// Clean light-theme analytics card — gives visual interest without neon vibes.
export default function AnalyticsCard() {
  const points = [10, 18, 14, 26, 22, 38, 34, 48, 44, 62, 58, 78, 70, 92];
  const w = 280;
  const h = 100;
  const stepX = w / (points.length - 1);
  const maxY = Math.max(...points);
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${i * stepX} ${h - (p / maxY) * (h - 10) - 6}`
    )
    .join(" ");
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[460px] bg-white rounded-2xl border border-[#E7E3D8] overflow-hidden"
      style={{
        boxShadow:
          "0 30px 60px -25px rgba(11,27,43,0.20), 0 10px 25px -10px rgba(11,27,43,0.08)",
      }}
      data-testid="analytics-card"
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <div className="text-[11px] text-[#8190A1] tracking-[0.12em] uppercase">
            Last 30 days · Revenue
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl md:text-[34px] font-[500] tracking-tight text-[#0B1B2B]">
              $1,284,720
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF3EC] text-[#3B7B5A] text-[11px] font-semibold">
          <ArrowUp size={11} /> 38.4%
        </div>
      </div>

      <div className="px-6">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[110px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaFillLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8864C" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#B8864C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#areaFillLight)" />
          <path d={path} fill="none" stroke="#B8864C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle
            cx={w}
            cy={h - (points[points.length - 1] / maxY) * (h - 10) - 6}
            r="4"
            fill="#B8864C"
          />
          <circle
            cx={w}
            cy={h - (points[points.length - 1] / maxY) * (h - 10) - 6}
            r="9"
            fill="#B8864C"
            fillOpacity="0.18"
          />
          {[0.33, 0.66].map((p) => (
            <line
              key={p}
              x1="0"
              y1={h * p}
              x2={w}
              y2={h * p}
              stroke="#0B1B2B"
              strokeOpacity="0.05"
              strokeDasharray="2 4"
            />
          ))}
        </svg>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-0 mt-2 border-t border-[#EFECE3]">
        {[
          { label: "ROAS", value: "5.8x" },
          { label: "Avg. CAC", value: "$42" },
          { label: "Conv. rate", value: "8.4%", accent: true },
        ].map((k, i) => (
          <div
            key={k.label}
            className={`px-5 py-4 ${i > 0 ? "border-l border-[#EFECE3]" : ""}`}
          >
            <div className="text-[10px] text-[#8190A1] tracking-[0.14em] uppercase">
              {k.label}
            </div>
            <div
              className={`font-display text-[22px] font-[500] mt-1 ${
                k.accent ? "text-[#B8864C]" : "text-[#0B1B2B]"
              }`}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Floating chip */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: -8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute -top-4 -left-3 hidden md:flex items-center gap-2 bg-white border border-[#E7E3D8] px-3 py-2 rounded-full"
        style={{ boxShadow: "0 8px 20px -8px rgba(11,27,43,0.15)" }}
      >
        <TrendingUp size={12} className="text-[#B8864C]" />
        <span className="text-[11px] text-[#4E5C6E] font-medium">
          +$2,840 · New conversion
        </span>
      </motion.div>
    </motion.div>
  );
}
