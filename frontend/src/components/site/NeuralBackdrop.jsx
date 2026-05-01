/**
 * NeuralBackdrop — A subtle, premium neural-network constellation that
 * sits behind the hero. Communicates: AI-powered, connected intelligence,
 * always-on monitoring. Designed to captivate without distracting.
 *
 * Perf: All SVG, no canvas. ~28 nodes. Pure CSS animation on a few pulses.
 */
import { motion } from "framer-motion";

// Pre-computed node positions (deterministic, looks composed not random).
// Coordinates are in a 1600x900 viewBox.
const NODES = [
  { x: 120, y: 140, r: 2.6, hi: false },
  { x: 280, y: 80, r: 1.8, hi: false },
  { x: 420, y: 220, r: 3.2, hi: true },
  { x: 540, y: 120, r: 2, hi: false },
  { x: 680, y: 260, r: 2.4, hi: false },
  { x: 820, y: 90, r: 1.8, hi: false },
  { x: 980, y: 220, r: 3.4, hi: true },
  { x: 1120, y: 140, r: 2, hi: false },
  { x: 1260, y: 280, r: 2.2, hi: false },
  { x: 1420, y: 160, r: 1.8, hi: false },
  { x: 1520, y: 320, r: 2.6, hi: false },

  { x: 80, y: 380, r: 2, hi: false },
  { x: 240, y: 480, r: 3, hi: true },
  { x: 380, y: 420, r: 1.8, hi: false },
  { x: 560, y: 520, r: 2.2, hi: false },
  { x: 720, y: 440, r: 1.8, hi: false },
  { x: 880, y: 540, r: 2.6, hi: false },
  { x: 1020, y: 460, r: 1.8, hi: false },
  { x: 1180, y: 540, r: 3.2, hi: true },
  { x: 1340, y: 440, r: 2, hi: false },
  { x: 1500, y: 540, r: 1.8, hi: false },

  { x: 160, y: 700, r: 2.4, hi: false },
  { x: 340, y: 780, r: 1.8, hi: false },
  { x: 520, y: 720, r: 2.8, hi: true },
  { x: 700, y: 800, r: 1.8, hi: false },
  { x: 880, y: 740, r: 2, hi: false },
  { x: 1080, y: 800, r: 2.4, hi: false },
  { x: 1260, y: 720, r: 1.8, hi: false },
  { x: 1440, y: 800, r: 2.6, hi: true },
];

// Connections — only between nearby nodes for an organic mesh look.
const MAX_DIST = 260;
const buildConnections = () => {
  const out = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const dx = NODES[i].x - NODES[j].x;
      const dy = NODES[i].y - NODES[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX_DIST) {
        out.push({ a: i, b: j, d });
      }
    }
  }
  return out;
};
const CONNECTIONS = buildConnections();

// A few "data packet" lines that animate between hi nodes
const DATA_PACKETS = [
  { from: 2, to: 6 },
  { from: 6, to: 18 },
  { from: 12, to: 23 },
  { from: 18, to: 28 },
  { from: 23, to: 6 },
];

export default function NeuralBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Soft radial vignette behind everything */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.04),transparent_55%)]" />

      <motion.svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      >
        <defs>
          <linearGradient id="netLineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#36F1CD" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6F4FFF" stopOpacity="0.30" />
          </linearGradient>
          <radialGradient id="hiNodeGlow">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <stop offset="60%" stopColor="#CCFF00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
          </radialGradient>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Connection mesh */}
        <g opacity="0.55">
          {CONNECTIONS.map((c, i) => {
            const a = NODES[c.a];
            const b = NODES[c.b];
            const opacity = 0.04 + (1 - c.d / MAX_DIST) * 0.22;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#netLineGrad)"
                strokeOpacity={opacity}
                strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* Animated data packets traversing the network */}
        {DATA_PACKETS.map((p, i) => {
          const a = NODES[p.from];
          const b = NODES[p.to];
          return (
            <g key={`pkt-${i}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#CCFF00"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <circle r="2.6" fill="#CCFF00">
                <animate
                  attributeName="cx"
                  values={`${a.x};${b.x};${a.x}`}
                  dur={`${6 + i * 1.4}s`}
                  begin={`${i * 0.8}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`${a.y};${b.y};${a.y}`}
                  dur={`${6 + i * 1.4}s`}
                  begin={`${i * 0.8}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur={`${6 + i * 1.4}s`}
                  begin={`${i * 0.8}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Highlighted (hi) glow halos */}
        {NODES.filter((n) => n.hi).map((n, i) => (
          <circle
            key={`hi-${i}`}
            cx={n.x}
            cy={n.y}
            r="22"
            fill="url(#hiNodeGlow)"
            filter="url(#softBlur)"
          >
            <animate
              attributeName="r"
              values="18;30;18"
              dur={`${4 + i * 0.6}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.95;0.5"
              dur={`${4 + i * 0.6}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Nodes */}
        <g>
          {NODES.map((n, i) => (
            <g key={`n-${i}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r + 2}
                fill={n.hi ? "#CCFF00" : "white"}
                opacity={n.hi ? 0.18 : 0.06}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.hi ? "#CCFF00" : "white"}
                opacity={n.hi ? 1 : 0.55}
              >
                {n.hi && (
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur={`${2.6 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            </g>
          ))}
        </g>
      </motion.svg>

      {/* Floor fade so content stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#0B0B0F]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0B0B0F]/40 via-transparent to-transparent" />
    </div>
  );
}
