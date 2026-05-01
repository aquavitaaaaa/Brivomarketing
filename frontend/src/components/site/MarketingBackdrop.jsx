/**
 * MarketingBackdrop — A premium parallax composition that shows the
 * marketing work the agency delivers: dashboards, websites, social
 * campaigns floating behind the hero.
 *
 * Each tile renders as a "browser-window mockup" with:
 *   • Window chrome (dots + URL pill + LIVE indicator)
 *   • A real image inside (campaigns, dashboards, sites, social)
 *   • Bottom strip with tag + metric
 *   • Lime accent corner + soft outer glow
 *   • Slow drift + breathing rotation animation
 *   • Cards angled in 3D for depth
 */
import { motion } from "framer-motion";

const TILES = [
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBkYXNoYm9hcmR8ZW58MHx8fGJsYWNrfDE3Nzc2MTQwNjF8MA&ixlib=rb-4.1.0&q=85&w=600",
    url: "dash.brivomarketing.com",
    tag: "GROWTH OS",
    metric: "+38.4% MoM",
    metricColor: "#CCFF00",
    pos: { top: "6%", left: "1%" },
    width: 320,
    rotate: -7,
    drift: { x: [0, 8, 0], y: [0, -6, 0] },
    duration: 14,
    delay: 0,
    z: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1720962158883-b0f2021fb51e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHx3ZWJzaXRlJTIwdWl8ZW58MHx8fGJsYWNrfDE3Nzc2MTQwNjF8MA&ixlib=rb-4.1.0&q=85&w=600",
    url: "luminflow.io",
    tag: "BRAND SITE",
    metric: "Lighthouse 98",
    metricColor: "#36F1CD",
    pos: { top: "52%", left: "0%" },
    width: 280,
    rotate: 5,
    drift: { x: [0, -6, 0], y: [0, 6, 0] },
    duration: 16,
    delay: 1.4,
    z: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1611262588024-d12430b98920?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxzb2NpYWwlMjBtZWRpYXxlbnwwfHx8YmxhY2t8MTc3NzYxNDA2MXww&ixlib=rb-4.1.0&q=85&w=600",
    url: "campaigns/q2-launch",
    tag: "SOCIAL OPS",
    metric: "38M REACH",
    metricColor: "#CCFF00",
    pos: { bottom: "4%", left: "16%" },
    width: 260,
    rotate: -4,
    drift: { x: [0, 6, 0], y: [0, -8, 0] },
    duration: 18,
    delay: 2.1,
    z: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1646193186138-148d07f84b13?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHdlYnNpdGUlMjB1aXxlbnwwfHx8YmxhY2t8MTc3NzYxNDA2MXww&ixlib=rb-4.1.0&q=85&w=600",
    url: "kestral.studio",
    tag: "PRODUCT SITE",
    metric: "+212% CVR",
    metricColor: "#CCFF00",
    pos: { top: "4%", right: "1%" },
    width: 320,
    rotate: 6,
    drift: { x: [0, -10, 0], y: [0, 8, 0] },
    duration: 15,
    delay: 0.6,
    z: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1620794511798-d7ba5299a087?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxzb2NpYWwlMjBtZWRpYXxlbnwwfHx8YmxhY2t8MTc3NzYxNDA2MXww&ixlib=rb-4.1.0&q=85&w=600",
    url: "ads.meta.com/brivo",
    tag: "PAID MEDIA",
    metric: "ROAS 5.8x",
    metricColor: "#CCFF00",
    pos: { top: "52%", right: "2%" },
    width: 280,
    rotate: -5,
    drift: { x: [0, 8, 0], y: [0, -6, 0] },
    duration: 17,
    delay: 1.8,
    z: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1656275805269-ee5955b8da81?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHw0fHx3ZWJzaXRlJTIwdWl8ZW58MHx8fGJsYWNrfDE3Nzc2MTQwNjF8MA&ixlib=rb-4.1.0&q=85&w=600",
    url: "axiom.fund",
    tag: "FINTECH SITE",
    metric: "$120M TRACKED",
    metricColor: "#36F1CD",
    pos: { bottom: "3%", right: "16%" },
    width: 260,
    rotate: 4,
    drift: { x: [0, -6, 0], y: [0, 8, 0] },
    duration: 19,
    delay: 2.4,
    z: 1,
  },
];

function BrowserTile({ tile }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        ...tile.pos,
        width: tile.width,
        zIndex: tile.z,
        rotate: `${tile.rotate}deg`,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        x: tile.drift.x,
        y: tile.drift.y,
      }}
      transition={{
        opacity: { duration: 1.2, delay: tile.delay * 0.4 },
        x: { duration: tile.duration, repeat: Infinity, ease: "easeInOut", delay: tile.delay },
        y: { duration: tile.duration, repeat: Infinity, ease: "easeInOut", delay: tile.delay },
      }}
    >
      <div
        className="rounded-xl overflow-hidden border border-white/10 bg-[#15151E]"
        style={{
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(204,255,0,0.06), 0 0 60px rgba(111,79,255,0.18)",
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1B1B26] border-b border-white/8">
          <span className="flex gap-1.5">
            <span className="block w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="block w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="block w-2.5 h-2.5 rounded-full bg-white/15" />
          </span>
          <div className="flex-1 ml-2 px-2.5 py-1 rounded-md bg-[#0F0F18] border border-white/8 text-[9px] font-mono text-white/55 truncate">
            <span className="text-[#CCFF00]">●</span>&nbsp;&nbsp;{tile.url}
          </div>
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#CCFF00]/70">LIVE</span>
        </div>

        {/* Image body */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={tile.src}
            alt={tile.tag}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable="false"
          />
          {/* dark gradient + lime tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0F]/40 via-transparent to-[#6F4FFF]/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15151E] via-transparent to-transparent" />
          {/* lime corner accent */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.9)]" />
        </div>

        {/* Footer strip */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#15151E] border-t border-white/8">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/65">
            {tile.tag}
          </span>
          <span
            className="font-mono text-[10px] font-bold tracking-tight"
            style={{ color: tile.metricColor }}
          >
            {tile.metric}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketingBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Base lighter ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1F1F2C] via-[#191925] to-[#13131C]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(111,79,255,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(204,255,0,0.10),transparent_50%)]" />

      {/* Aurora bloom drift */}
      <motion.div
        className="absolute -top-1/4 left-[10%] w-[1000px] h-[800px] rounded-full bg-[#CCFF00]/[0.08] blur-[160px]"
        animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-1/4 right-[6%] w-[1100px] h-[800px] rounded-full bg-[#6F4FFF]/[0.16] blur-[180px]"
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Faint blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* === Floating marketing tiles (the portfolio) === */}
      <div className="absolute inset-0">
        {TILES.map((tile, i) => (
          <BrowserTile key={i} tile={tile} />
        ))}
      </div>

      {/* Center spotlight to keep headline readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(19,19,28,0.78)_0%,rgba(19,19,28,0.55)_30%,transparent_60%)]" />

      {/* Corner registration marks */}
      {[
        { className: "top-6 left-6", rotate: 0 },
        { className: "top-6 right-6", rotate: 90 },
        { className: "bottom-6 right-6", rotate: 180 },
        { className: "bottom-6 left-6", rotate: 270 },
      ].map((c, i) => (
        <div key={`reg-${i}`} className={`absolute ${c.className} opacity-40`}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ transform: `rotate(${c.rotate}deg)` }}>
            <line x1="0" y1="0" x2="14" y2="0" stroke="#CCFF00" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="14" stroke="#CCFF00" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="#CCFF00" />
          </svg>
        </div>
      ))}

      {/* Floor fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[#13131C]" />
    </div>
  );
}
