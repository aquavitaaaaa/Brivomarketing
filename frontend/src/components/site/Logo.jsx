/**
 * BrivoMarketing — Matrix Owl Logomark
 * --------------------------------------------------------------
 * A recognizable owl (head + chest + perched wings) rendered as
 * if it were materialized out of falling matrix code.
 *
 * Composition (back → front):
 *   • Soft outer halo
 *   • Anatomical owl silhouette: ear tufts, round head, plumed
 *     chest, folded wings, talons gripping a perch
 *   • Heart-shaped facial disc with depth shading
 *   • Two large piercing lime eyes with white catchlights
 *   • Sharp curved beak
 *   • Feather texture chevrons across the chest
 *   • Vertical "matrix code rain" pattern clipped to the owl body
 *     (the digital character — the owl is built from cascading code)
 *   • Faint scanlines on the body for digital character
 */
function MatrixOwl({ accent = "#CCFF00", className = "", uid = "brivo" }) {
  // Pre-generate matrix code columns (deterministic at module load)
  const cols = [
    { x: 18, dur: 3.6, delay: 0.0, chars: ["1", "0", "ｱ", "0", "1", "ﾌ", "1", "0"] },
    { x: 25, dur: 4.2, delay: 0.7, chars: ["0", "ﾐ", "1", "0", "ﾈ", "1", "0", "1"] },
    { x: 32, dur: 3.1, delay: 1.4, chars: ["ｻ", "1", "0", "ﾔ", "0", "1", "0", "ｴ"] },
    { x: 39, dur: 4.8, delay: 0.3, chars: ["1", "0", "ﾆ", "0", "1", "ｷ", "1", "0"] },
    { x: 46, dur: 3.4, delay: 2.0, chars: ["0", "ｿ", "1", "ﾄ", "0", "1", "ﾗ", "1"] },
    { x: 53, dur: 4.0, delay: 1.0, chars: ["ﾔ", "0", "1", "0", "ｷ", "1", "0", "1"] },
    { x: 60, dur: 3.7, delay: 0.5, chars: ["1", "0", "ｾ", "1", "0", "ﾐ", "0", "1"] },
  ];

  return (
    <svg
      viewBox="0 0 80 88"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Body gradient — graphite with subtle warmth */}
        <radialGradient id={`${uid}-body`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#3A3A48" />
          <stop offset="55%" stopColor="#1B1B25" />
          <stop offset="100%" stopColor="#0C0C12" />
        </radialGradient>

        {/* Facial disc */}
        <radialGradient id={`${uid}-disc`} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#52525E" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#28283A" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0C0C12" stopOpacity="0" />
        </radialGradient>

        {/* Iris luminous gradient */}
        <radialGradient id={`${uid}-iris`} cx="38%" cy="32%" r="80%">
          <stop offset="0%" stopColor="#F8FFB8" />
          <stop offset="35%" stopColor={accent} />
          <stop offset="80%" stopColor="#A8D900" />
          <stop offset="100%" stopColor="#577300" />
        </radialGradient>

        {/* Beak gradient */}
        <linearGradient id={`${uid}-beak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="60%" stopColor={accent} />
          <stop offset="100%" stopColor="#7A9A00" />
        </linearGradient>

        {/* Halo gradient */}
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>

        {/* Eye glow filter */}
        <filter id={`${uid}-eyeGlow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* OWL BODY MASK — clips matrix rain to silhouette */}
        <clipPath id={`${uid}-owlClip`}>
          {/* tufts */}
          <path d="M22 21 L26 8 L31 21 Z" />
          <path d="M49 21 L54 8 L58 21 Z" />
          {/* head + body + wings silhouette */}
          <path
            d="M22 24
               C 22 14, 30 11, 40 11
               C 50 11, 58 14, 58 24
               L 58 42
               C 58 48, 56 52, 54 56
               L 60 64
               C 62 68, 60 72, 56 72
               L 50 70
               L 48 76
               L 44 78
               L 40 76
               L 36 78
               L 32 76
               L 30 70
               L 24 72
               C 20 72, 18 68, 20 64
               L 26 56
               C 24 52, 22 48, 22 42 Z"
          />
        </clipPath>
      </defs>

      {/* === Outer glow halo === */}
      <circle cx="40" cy="42" r="42" fill={`url(#${uid}-halo)`} />

      {/* === Ear tufts === */}
      <path d="M22 21 L26 8 L31 21 Z" fill={`url(#${uid}-body)`} />
      <path d="M49 21 L54 8 L58 21 Z" fill={`url(#${uid}-body)`} />
      <path d="M26 9 L26 21" stroke="white" strokeOpacity="0.18" strokeWidth="0.4" />
      <path d="M54 9 L54 21" stroke="white" strokeOpacity="0.18" strokeWidth="0.4" />

      {/* === Owl silhouette body === */}
      <path
        d="M22 24
           C 22 14, 30 11, 40 11
           C 50 11, 58 14, 58 24
           L 58 42
           C 58 48, 56 52, 54 56
           L 60 64
           C 62 68, 60 72, 56 72
           L 50 70
           L 48 76
           L 44 78
           L 40 76
           L 36 78
           L 32 76
           L 30 70
           L 24 72
           C 20 72, 18 68, 20 64
           L 26 56
           C 24 52, 22 48, 22 42 Z"
        fill={`url(#${uid}-body)`}
      />

      {/* === Matrix code rain clipped to body === */}
      <g clipPath={`url(#${uid}-owlClip)`} opacity="0.62">
        {cols.map((c, i) => (
          <g key={i}>
            {c.chars.map((char, j) => {
              const baseY = j * 8 + 4;
              const isHead = j === 0;
              return (
                <text
                  key={j}
                  x={c.x}
                  y={baseY}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="5.5"
                  fontWeight="700"
                  fill={isHead ? "#FFFFFF" : accent}
                  opacity={isHead ? 0.95 : Math.max(0.1, 0.85 - j * 0.12)}
                  style={
                    isHead
                      ? { filter: "drop-shadow(0 0 2px rgba(204,255,0,0.9))" }
                      : undefined
                  }
                >
                  {char}
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0 -34; 0 60`}
                    dur={`${c.dur}s`}
                    begin={`${c.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values={
                      isHead
                        ? "0;1;1;0"
                        : `0;${Math.max(0.1, 0.85 - j * 0.12)};${Math.max(
                            0.1,
                            0.85 - j * 0.12
                          )};0`
                    }
                    dur={`${c.dur}s`}
                    begin={`${c.delay}s`}
                    repeatCount="indefinite"
                  />
                </text>
              );
            })}
          </g>
        ))}
      </g>

      {/* === Subtle horizontal scanlines over body === */}
      <g clipPath={`url(#${uid}-owlClip)`} opacity="0.22">
        {[16, 22, 28, 34, 40, 46, 52, 58, 64, 70].map((y) => (
          <line
            key={y}
            x1="20"
            y1={y}
            x2="60"
            y2={y}
            stroke={accent}
            strokeWidth="0.25"
          />
        ))}
      </g>

      {/* === Body silhouette outline (lime stroke) === */}
      <path
        d="M22 24
           C 22 14, 30 11, 40 11
           C 50 11, 58 14, 58 24
           L 58 42
           C 58 48, 56 52, 54 56
           L 60 64
           C 62 68, 60 72, 56 72
           L 50 70
           L 48 76
           L 44 78
           L 40 76
           L 36 78
           L 32 76
           L 30 70
           L 24 72
           C 20 72, 18 68, 20 64
           L 26 56
           C 24 52, 22 48, 22 42 Z"
        fill="none"
        stroke={accent}
        strokeOpacity="0.55"
        strokeWidth="0.7"
      />

      {/* === Wing folds (subtle line work) === */}
      <path
        d="M22 38 C 25 50, 26 60, 24 70"
        fill="none"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="0.6"
      />
      <path
        d="M58 38 C 55 50, 54 60, 56 70"
        fill="none"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="0.6"
      />

      {/* === Facial disc === */}
      <path
        d="M28 28
           C 28 24, 31 22, 34 23
           C 36 24, 38 26, 40 26
           C 42 26, 44 24, 46 23
           C 49 22, 52 24, 52 28
           L 52 38
           C 52 47, 46 52, 40 53
           C 34 52, 28 47, 28 38 Z"
        fill={`url(#${uid}-disc)`}
      />

      {/* === Brow ridge === */}
      <path
        d="M28 28 C 32 26, 36 26, 40 27 C 44 26, 48 26, 52 28"
        fill="none"
        stroke="white"
        strokeOpacity="0.22"
        strokeWidth="0.5"
      />

      {/* === Eye sockets — recessed black === */}
      <circle cx="32" cy="33" r="5.6" fill="#050507" />
      <circle cx="48" cy="33" r="5.6" fill="#050507" />

      {/* === Iris with luminous gradient (animated pulse) === */}
      <g filter={`url(#${uid}-eyeGlow)`}>
        <circle cx="32" cy="33" r="4.7" fill={`url(#${uid}-iris)`}>
          <animate attributeName="r" values="4.5;4.85;4.5" dur="3.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="48" cy="33" r="4.7" fill={`url(#${uid}-iris)`}>
          <animate attributeName="r" values="4.5;4.85;4.5" dur="3.4s" begin="1.7s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* === Iris detail rings (AI-tech hint) === */}
      <circle cx="32" cy="33" r="3.4" fill="none" stroke="#0B0B0F" strokeOpacity="0.4" strokeWidth="0.3" />
      <circle cx="48" cy="33" r="3.4" fill="none" stroke="#0B0B0F" strokeOpacity="0.4" strokeWidth="0.3" />

      {/* === Pupils === */}
      <circle cx="32" cy="33" r="2.0" fill="#0B0B0F" />
      <circle cx="48" cy="33" r="2.0" fill="#0B0B0F" />

      {/* === Catchlights === */}
      <circle cx="30.7" cy="31.7" r="1.25" fill="white" opacity="0.95" />
      <circle cx="46.7" cy="31.7" r="1.25" fill="white" opacity="0.95" />
      <circle cx="33.4" cy="34.4" r="0.5" fill="white" opacity="0.55" />
      <circle cx="49.4" cy="34.4" r="0.5" fill="white" opacity="0.55" />

      {/* === Beak — curved hawk-style === */}
      <path
        d="M40 39 L36.5 43 C 36 45, 38 46.5, 40 47 C 42 46.5, 44 45, 43.5 43 Z"
        fill={`url(#${uid}-beak)`}
      />
      <path
        d="M40 41 L37.6 43.6 C 37.6 45, 38.8 45.8, 40 46 C 41.2 45.8, 42.4 45, 42.4 43.6 Z"
        fill="#0B0B0F"
        opacity="0.55"
      />
      <path d="M40 39 L40 47" stroke="#0B0B0F" strokeOpacity="0.5" strokeWidth="0.4" />

      {/* === Chest feather chevrons === */}
      <g stroke="white" strokeOpacity="0.22" strokeWidth="0.55" fill="none" strokeLinecap="round">
        <path d="M30 56 L34 60 L30 64" />
        <path d="M40 57 L44 61 L40 65" />
        <path d="M50 56 L46 60 L50 64" />
      </g>
      <g stroke={accent} strokeOpacity="0.4" strokeWidth="0.45" fill="none" strokeLinecap="round">
        <path d="M35 60 L39 64" />
        <path d="M45 60 L41 64" />
      </g>

      {/* === Talons (small bracket-feet) === */}
      <g fill={accent} opacity="0.85">
        <path d="M32 76 L33 80 L34 76 Z" />
        <path d="M36 78 L37 82 L38 78 Z" />
        <path d="M42 78 L43 82 L44 78 Z" />
        <path d="M46 76 L47 80 L48 76 Z" />
      </g>

      {/* === Perch — angular bar === */}
      <rect x="26" y="80" width="28" height="2" fill={accent} opacity="0.7" />
      <rect x="26" y="80" width="28" height="0.5" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

export default function Logo({ size = 44, mono = false, className = "", showWordmark = true }) {
  const accent = mono ? "#FFFFFF" : "#CCFF00";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} data-testid="brivo-logo">
      <span
        className="relative inline-block flex-shrink-0 brivo-emit"
        style={{ width: size, height: Math.round(size * 88 / 80) }}
        aria-label="BrivoMarketing — AI Performance Studio"
      >
        <MatrixOwl accent={accent} className="w-full h-full block" uid="brivo" />
      </span>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base md:text-[17px] font-black tracking-tight uppercase text-white">
            Brivo<span className="text-white/55">Marketing</span>
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.42em] text-white/55 mt-1.5 hidden md:flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.85)]" />
            AI Performance Studio · 2026
          </span>
        </span>
      )}
    </span>
  );
}
