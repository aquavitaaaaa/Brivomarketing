import { motion } from "framer-motion";

// Refined precision-instrument visual — concentric rings, scanning radial,
// data points, ticker readouts. NO blob/orb. Fortune 500 dashboard aesthetic.
export default function HeroVisual() {
  return (
    <div className="relative w-full h-full">
      {/* Outer ring with rotating tick marks */}
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#CCFF00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6F4FFF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="midGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#36F1CD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#CCFF00" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="coreGrad">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="1" />
            <stop offset="60%" stopColor="#CCFF00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* rotating outer ring */}
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="200" cy="200" r="195" stroke="white" strokeOpacity="0.08" strokeWidth="1" fill="none" />
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1="200"
              y1="5"
              x2="200"
              y2={i % 5 === 0 ? "18" : "11"}
              stroke="white"
              strokeOpacity={i % 5 === 0 ? 0.45 : 0.18}
              strokeWidth="1"
              transform={`rotate(${i * 6} 200 200)`}
            />
          ))}
        </motion.g>

        {/* mid arc — gradient stroke */}
        <motion.circle
          cx="200"
          cy="200"
          r="155"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

        {/* inner solid ring */}
        <circle cx="200" cy="200" r="120" stroke="white" strokeOpacity="0.12" strokeWidth="1" fill="none" />

        {/* counter-rotating dashed inner */}
        <motion.circle
          cx="200"
          cy="200"
          r="92"
          fill="none"
          stroke="url(#midGrad)"
          strokeWidth="1"
          strokeDasharray="2 6"
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* radial scanlines */}
        {[0, 45, 90, 135].map((rot, i) => (
          <line
            key={i}
            x1="200"
            y1="60"
            x2="200"
            y2="340"
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="1"
            transform={`rotate(${rot} 200 200)`}
          />
        ))}

        {/* core */}
        <circle cx="200" cy="200" r="60" fill="url(#coreGrad)" />
        <circle cx="200" cy="200" r="22" fill="#CCFF00" fillOpacity="0.85" />
        <circle cx="200" cy="200" r="6" fill="#0B0B0F" />

        {/* orbiting accent dot */}
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="200" cy="45" r="5" fill="#CCFF00" />
          <circle cx="200" cy="45" r="9" fill="#CCFF00" fillOpacity="0.25" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="200" cy="80" r="3" fill="#36F1CD" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="200" cy="108" r="2" fill="white" fillOpacity="0.7" />
        </motion.g>

        {/* corner tick marks for precision feel */}
        {[
          [20, 20, 0],
          [380, 20, 90],
          [380, 380, 180],
          [20, 380, 270],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <line x1="0" y1="0" x2="14" y2="0" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="14" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
          </g>
        ))}
      </motion.svg>

      {/* HUD readouts */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 text-right space-y-1"
      >
        <div>SYS · ACTIVE</div>
        <div className="text-[#CCFF00]">↗ 04.2X · LIVE</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 space-y-1"
      >
        <div>VECTOR · 22°N</div>
        <div className="text-white/70">CHANNELS · 5/5</div>
      </motion.div>
    </div>
  );
}
