import { useEffect, useState } from "react";

/**
 * HeroTechOverlay — subtle "upbeat tech" layer on top of the cinematic
 * background image. Renders:
 *   • animated constellation network (drifting gold particles + fine lines)
 *   • orbiting glow orbs
 *   • soft scanning beam
 *
 * Designed to feel premium and alive without going hacker / cyberpunk.
 * All motion uses CSS animations + a single SVG paint pass for cheap GPU work.
 */

// Deterministic but varied particle positions so layout is stable across renders
const PARTICLES = Array.from({ length: 26 }).map((_, i) => {
  const seed = i * 37 + 7;
  return {
    id: i,
    x: ((seed * 13) % 100) + ((seed * 7) % 7) * 0.5,
    y: ((seed * 31) % 100) + ((seed * 11) % 5) * 0.3,
    r: 1 + ((seed * 5) % 5) * 0.4,
    delay: ((seed * 3) % 30) / 10,
    dur: 8 + ((seed * 9) % 10),
    op: 0.35 + ((seed * 7) % 50) / 100,
  };
});

// Network "lines" — link particles that fall close together horizontally
function buildLinks() {
  const links = [];
  for (let i = 0; i < PARTICLES.length; i++) {
    for (let j = i + 1; j < PARTICLES.length; j++) {
      const a = PARTICLES[i];
      const b = PARTICLES[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 22 && Math.random() > 0.55) {
        links.push({ a, b, op: Math.max(0, 0.18 - d / 200) });
      }
    }
  }
  return links;
}

const LINKS = buildLinks();

export default function HeroTechOverlay() {
  return (
    <div
      className="absolute inset-0 z-[5] pointer-events-none overflow-hidden"
      aria-hidden="true"
      data-testid="hero-tech-overlay"
    >
      {/* Soft animated glow orbs (depth + warmth) */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Constellation SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A971" stopOpacity="0" />
            <stop offset="50%" stopColor="#D4A971" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D4A971" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="particleGrad">
            <stop offset="0%" stopColor="#F5D7A4" stopOpacity="1" />
            <stop offset="60%" stopColor="#D4A971" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D4A971" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Constellation links */}
        {LINKS.map((l, i) => (
          <line
            key={`l-${i}`}
            x1={l.a.x}
            y1={l.a.y}
            x2={l.b.x}
            y2={l.b.y}
            stroke="url(#lineGrad)"
            strokeWidth="0.08"
            strokeOpacity={l.op}
            style={{
              animation: `linePulse 4s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}

        {/* Particles */}
        {PARTICLES.map((p) => (
          <g
            key={`p-${p.id}`}
            style={{
              animation: `particleDrift ${p.dur}s ease-in-out ${p.delay}s infinite`,
              transformOrigin: `${p.x}% ${p.y}%`,
            }}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r * 0.18}
              fill="url(#particleGrad)"
              opacity={p.op}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r * 0.5}
              fill="#D4A971"
              opacity={p.op * 0.18}
            />
          </g>
        ))}
      </svg>

      {/* Scanning beam — a slow, single sweep that cycles */}
      <div className="hero-scan-beam" />

      {/* Faint horizontal data line near bottom — tech, not hacker */}
      <svg
        className="absolute left-0 right-0 bottom-[18%] w-full h-[60px] opacity-50"
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="signalGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A971" stopOpacity="0" />
            <stop offset="20%" stopColor="#D4A971" stopOpacity="0.55" />
            <stop offset="80%" stopColor="#D4A971" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D4A971" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 Q80,30 110,30 T200,30 T260,15 T310,30 T380,30 T440,40 T500,30 T560,30 T620,18 T680,30 T780,30 T840,38 T900,30 T1000,30"
          fill="none"
          stroke="url(#signalGrad)"
          strokeWidth="1"
          strokeLinecap="round"
          style={{ animation: "signalShift 7s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}

/* Live counter pill — shows a counter animating up to feel "alive" */
export function LivePulseBadge({ className = "" }) {
  const [count, setCount] = useState(2847);
  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => c + Math.max(1, Math.floor(Math.random() * 3)));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-3 bg-white/8 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 ${className}`}
      data-testid="live-pulse-badge"
    >
      <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-emerald-400" />
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
      </span>
      <span className="text-[11px] tracking-[0.2em] uppercase text-white/65 font-medium">
        Live
      </span>
      <span className="text-white/85 text-[12px] font-medium tabular-nums">
        {count.toLocaleString()}{" "}
        <span className="text-white/50">conversions tracked today</span>
      </span>
    </div>
  );
}
