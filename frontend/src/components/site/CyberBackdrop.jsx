/**
 * CyberBackdrop — Cyberpunk hacker hero backdrop.
 *
 * Layers (back → front):
 *   1. CRT vignette
 *   2. Atmosphere glow (lime + violet bloom)
 *   3. Synthwave perspective grid floor (animated, scrolling toward viewer)
 *   4. Distant city skyline silhouette
 *   5. Matrix code rain (left + right edges only, keeps middle clean)
 *   6. Crosshair markers + tactical reticles
 *   7. Glitch bands (occasional jolt)
 *   8. Bright scanline sweep
 *   9. Static CRT scanline overlay
 *  10. Terminal HUD readouts (top-left + bottom-right)
 *
 * All edges fade to bg so hero text remains readable.
 */
import { useMemo } from "react";

// Stable per-mount column metadata so React keys don't re-shuffle.
const KATAKANA_RANGE_START = 0x30A0;
const KATAKANA_RANGE_LEN = 96;
const HEX_CHARS = "0123456789ABCDEF".split("");

function pickChar(i) {
  // Mix katakana and hex for a sharper hacker vibe
  if (i % 4 === 0) return HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
  return String.fromCharCode(
    KATAKANA_RANGE_START + Math.floor(Math.random() * KATAKANA_RANGE_LEN)
  );
}

function MatrixColumn({ x, delay, duration, length = 22, brightHead = true }) {
  const chars = useMemo(
    () => Array.from({ length }, (_, i) => pickChar(i)),
    [length]
  );
  return (
    <div
      className="absolute top-0 matrix-col font-mono text-[12px] leading-[1.1] tracking-tight"
      style={{
        left: `${x}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {chars.map((c, i) => {
        const isHead = brightHead && i === 0;
        const opacity = isHead ? 1 : Math.max(0.05, 0.85 - (i / chars.length) * 0.92);
        const color = isHead ? "#FFFFFF" : "#CCFF00";
        return (
          <span
            key={i}
            style={{
              opacity,
              color,
              textShadow: isHead
                ? "0 0 6px rgba(204,255,0,0.9), 0 0 12px rgba(204,255,0,0.5)"
                : "0 0 4px rgba(204,255,0,0.35)",
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
}

const LEFT_COLS = [
  { x: 8, delay: 0.0, duration: 7.5 },
  { x: 36, delay: 1.4, duration: 9.0 },
  { x: 66, delay: 0.6, duration: 6.5 },
  { x: 96, delay: 2.2, duration: 8.0 },
];

const RIGHT_COLS = [
  { x: 6, delay: 0.3, duration: 7.0 },
  { x: 36, delay: 1.8, duration: 8.5 },
  { x: 66, delay: 0.9, duration: 6.2 },
  { x: 96, delay: 2.6, duration: 9.4 },
  { x: 126, delay: 0.4, duration: 7.6 },
  { x: 156, delay: 3.0, duration: 8.8 },
];

export default function CyberBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 1. CRT vignette */}
      <div className="absolute inset-0 crt-vignette" />

      {/* 2. Atmosphere bloom */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-[#6F4FFF]/[0.10] via-[#6F4FFF]/[0.04] to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#CCFF00]/[0.08] blur-[140px]" />
      <div className="absolute top-[15%] right-[8%] w-[420px] h-[420px] rounded-full bg-[#FF2D7E]/[0.10] blur-[140px]" />
      <div className="absolute bottom-[5%] left-[8%] w-[420px] h-[420px] rounded-full bg-[#36F1CD]/[0.08] blur-[140px]" />

      {/* 3. Synthwave grid floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[55vh] [perspective:600px] overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 cyber-grid"
          style={{ width: "260%", height: "260%", bottom: "-150%" }}
        />
        {/* horizon glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[#CCFF00]/80 shadow-[0_0_32px_8px_rgba(204,255,0,0.5)]" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#CCFF00]/70 to-transparent" />
        {/* fade to bg */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[#0B0B0F]" />
      </div>

      {/* 4. City skyline silhouette */}
      <svg
        viewBox="0 0 1600 200"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 w-full h-[160px] opacity-70"
        style={{ bottom: "calc(55vh - 60px)" }}
      >
        <defs>
          <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B0B0F" stopOpacity="0" />
            <stop offset="40%" stopColor="#0B0B0F" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0B0B0F" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M0 200 L0 140 L40 140 L40 110 L80 110 L80 95 L130 95 L130 130 L170 130 L170 80 L210 80 L210 100 L260 100 L260 60 L300 60 L300 90 L350 90 L350 70 L400 70 L400 110 L460 110 L460 85 L510 85 L510 50 L560 50 L560 90 L610 90 L610 75 L660 75 L660 110 L720 110 L720 60 L770 60 L770 100 L820 100 L820 80 L880 80 L880 50 L930 50 L930 90 L980 90 L980 70 L1030 70 L1030 110 L1090 110 L1090 85 L1140 85 L1140 95 L1200 95 L1200 60 L1250 60 L1250 100 L1300 100 L1300 70 L1360 70 L1360 110 L1420 110 L1420 90 L1470 90 L1470 130 L1520 130 L1520 110 L1560 110 L1560 140 L1600 140 L1600 200 Z"
          fill="url(#cityGrad)"
          stroke="#CCFF00"
          strokeWidth="0.8"
          strokeOpacity="0.45"
        />
        {/* random window lights */}
        {[
          [50, 130], [85, 105], [140, 115], [180, 90], [220, 92], [275, 75],
          [310, 80], [365, 85], [410, 100], [475, 95], [520, 65], [575, 80],
          [625, 85], [680, 95], [735, 75], [790, 90], [840, 90], [895, 65],
          [945, 80], [995, 85], [1045, 95], [1100, 95], [1160, 90], [1215, 75],
          [1265, 90], [1315, 85], [1380, 95], [1440, 100], [1495, 115], [1540, 120],
        ].map(([cx, cy], i) => (
          <rect
            key={i}
            x={cx}
            y={cy}
            width="2"
            height="2"
            fill="#CCFF00"
            opacity={0.4 + (i % 3) * 0.2}
          />
        ))}
      </svg>

      {/* 5a. Matrix rain — LEFT */}
      <div className="absolute top-0 bottom-0 left-0 w-[140px] overflow-hidden mix-blend-screen">
        {LEFT_COLS.map((c, i) => (
          <MatrixColumn key={`L-${i}`} {...c} brightHead={i % 2 === 0} />
        ))}
        {/* fade-out edge into content area */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-[#0B0B0F]" />
      </div>

      {/* 5b. Matrix rain — RIGHT */}
      <div className="absolute top-0 bottom-0 right-0 w-[200px] overflow-hidden mix-blend-screen">
        {RIGHT_COLS.map((c, i) => (
          <MatrixColumn key={`R-${i}`} {...c} brightHead={i % 2 === 1} />
        ))}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-l from-transparent to-[#0B0B0F]" />
      </div>

      {/* 6. Tactical crosshair markers */}
      {[
        ["20%", "16%", 0.35],
        ["8%", "62%", 0.25],
        ["72%", "20%", 0.30],
        ["86%", "78%", 0.30],
        ["44%", "82%", 0.20],
      ].map(([top, left, op], i) => (
        <div
          key={`cx-${i}`}
          className="absolute font-mono text-[#CCFF00]"
          style={{ top, left, opacity: op }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" strokeWidth="1" />
            <line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="1" />
            <line x1="2" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1" />
            <line x1="15" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
        </div>
      ))}

      {/* 7. Glitch bands */}
      <div
        className="absolute left-0 right-0 h-[2px] glitch-band"
        style={{
          top: "32%",
          background: "linear-gradient(90deg, transparent, #CCFF00 20%, #FFFFFF 50%, #CCFF00 80%, transparent)",
        }}
      />
      <div
        className="absolute left-0 right-0 h-[3px] glitch-band"
        style={{
          top: "68%",
          background: "linear-gradient(90deg, transparent, #FF2D7E 30%, #6F4FFF 70%, transparent)",
          animationDelay: "3.2s",
          animationDuration: "8.5s",
        }}
      />

      {/* 8. Bright scanline sweep */}
      <div
        className="absolute inset-x-0 scan-sweep pointer-events-none"
        style={{
          height: "80px",
          top: 0,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(204,255,0,0.12) 40%, rgba(204,255,0,0.55) 50%, rgba(204,255,0,0.12) 60%, transparent 100%)",
        }}
      />

      {/* 9. Static CRT scanlines */}
      <div className="absolute inset-0 cyber-scanlines" />

      {/* 10a. Terminal HUD — TOP LEFT */}
      <div className="absolute top-24 right-6 md:top-28 md:right-12 lg:right-24 font-mono text-[10px] uppercase tracking-[0.18em] text-[#CCFF00]/85 hidden md:block text-right z-[2] data-flicker">
        <div className="text-white/45">// brivo.terminal v2.6.4 //</div>
        <div>$ scan --target=market --vector=growth</div>
        <div className="text-white/55">▶ tunneling 0xC9F4...A21B <span className="term-cursor">▊</span></div>
        <div className="text-[#36F1CD]">[OK] target acquired · LIVE</div>
      </div>

      {/* 10b. Terminal HUD — BOTTOM LEFT */}
      <div className="absolute bottom-44 left-6 md:left-12 lg:left-24 font-mono text-[10px] uppercase tracking-[0.18em] hidden lg:block z-[2]">
        <div className="text-white/35">[ NETWORK · NODE 0xBR1V0 ]</div>
        <div className="text-[#CCFF00]/90 data-flicker">SYS · LOCKED · ROAS 4.2X</div>
        <div className="text-white/55">channels 5/5 — uptime 99.998%</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/35">PWR</span>
          <span className="inline-flex gap-[2px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="block w-[3px] h-[8px]"
                style={{
                  background: i < 10 ? "#CCFF00" : "rgba(255,255,255,0.18)",
                  boxShadow: i < 10 ? "0 0 6px rgba(204,255,0,0.7)" : "none",
                }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* 11. Floor fade so content stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[#0B0B0F]/40 to-[#0B0B0F]" />
    </div>
  );
}
