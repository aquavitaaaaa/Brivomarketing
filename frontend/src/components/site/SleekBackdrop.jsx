/**
 * SleekBackdrop — Premium, Tesla-inspired hero backdrop.
 *
 * Quiet luxury. No matrix rain, no scanlines, no glitch.
 *
 * Layers (back → front):
 *   1. Deep ambient gradient (subtle vertical vignette)
 *   2. Aurora bloom — three large, slow-drifting soft glows
 *   3. Faint blueprint micro-grid
 *   4. Subtle horizon line (precision detail)
 *   5. Architectural perspective floor (very faint vector lines)
 *   6. Floating particles (3-4 lime "data stars" with drift)
 *   7. Corner registration marks (Tesla-precision)
 *   8. Floor fade so content stays readable
 */
import { motion } from "framer-motion";

const PARTICLES = [
  { top: "22%", left: "18%", size: 3, delay: 0 },
  { top: "34%", left: "8%", size: 2, delay: 1.4 },
  { top: "62%", left: "14%", size: 2.5, delay: 2.6 },
  { top: "18%", right: "26%", size: 2, delay: 0.8 },
  { top: "70%", right: "12%", size: 2.5, delay: 1.9 },
  { top: "44%", right: "6%", size: 3, delay: 3.2 },
];

export default function SleekBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 1. Deep ambient gradient — LIGHTER, more atmospheric */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1F1F2C] via-[#191925] to-[#13131C]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(111,79,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(204,255,0,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)]" />

      {/* 2. Aurora bloom — larger, brighter softer */}
      <motion.div
        className="absolute -top-1/4 left-[10%] w-[1000px] h-[800px] rounded-full bg-[#CCFF00]/[0.10] blur-[160px]"
        animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-1/4 right-[6%] w-[1100px] h-[800px] rounded-full bg-[#6F4FFF]/[0.18] blur-[180px]"
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[1300px] h-[600px] rounded-full bg-[#CCFF00]/[0.08] blur-[140px]"
        animate={{ x: [-20, 20, -20], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-[#36F1CD]/[0.09] blur-[140px]"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute top-[20%] right-[30%] w-[500px] h-[500px] rounded-full bg-[#FF6FA8]/[0.08] blur-[140px]"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* 3. Faint blueprint micro-grid */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* 4. Subtle horizon line */}
      <div className="absolute inset-x-0" style={{ top: "60%" }}>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#CCFF00]/25 to-transparent" />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/05 to-transparent mt-px" />
      </div>

      {/* 5. Architectural perspective floor */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full h-[44vh] opacity-60"
        viewBox="0 0 1600 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.07" />
          </linearGradient>
          <linearGradient id="hFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.07" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Vertical vanishing lines */}
        {Array.from({ length: 17 }).map((_, i) => {
          const x = (i / 16) * 1600;
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1="0"
              x2="800"
              y2="600"
              stroke="url(#vFade)"
              strokeWidth="0.6"
            />
          );
        })}
        {/* Horizontal floor lines (logarithmic spacing for perspective feel) */}
        {[60, 140, 240, 360, 490].map((y, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={y}
            x2="1600"
            y2={y}
            stroke="url(#hFade)"
            strokeWidth="0.6"
            strokeOpacity={0.4 + i * 0.15}
          />
        ))}
        {/* Glowing horizon */}
        <line x1="0" y1="0" x2="1600" y2="0" stroke="#CCFF00" strokeOpacity="0.45" strokeWidth="0.6" />
      </svg>

      {/* 6. Floating data stars */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: p.size,
            height: p.size,
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        >
          <span
            className="block w-full h-full rounded-full bg-[#CCFF00]"
            style={{ boxShadow: "0 0 12px rgba(204,255,0,0.85), 0 0 28px rgba(204,255,0,0.35)" }}
          />
        </motion.div>
      ))}

      {/* 7. Corner registration marks (Tesla-precision) */}
      {[
        { className: "top-6 left-6", rotate: 0 },
        { className: "top-6 right-6", rotate: 90 },
        { className: "bottom-6 right-6", rotate: 180 },
        { className: "bottom-6 left-6", rotate: 270 },
      ].map((c, i) => (
        <div key={`reg-${i}`} className={`absolute ${c.className} opacity-30`}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ transform: `rotate(${c.rotate}deg)` }}>
            <line x1="0" y1="0" x2="14" y2="0" stroke="#CCFF00" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="14" stroke="#CCFF00" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="#CCFF00" />
          </svg>
        </div>
      ))}

      {/* 8. Floor fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#13131C]" />
    </div>
  );
}
