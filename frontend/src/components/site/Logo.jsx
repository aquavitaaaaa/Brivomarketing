/**
 * BrivoMarketing — Owl Sigil Logomark
 * --------------------------------------------------------------
 * A circular badge reminiscent of a heraldic owl crest, modernized:
 *
 *   • Sleek dark face with radial-gradient feather rendering
 *   • Heart-shaped facial disc highlight
 *   • Two large piercing lime-glow eyes with white catchlights
 *   • Sharp angular beak in brand lime
 *   • Outer luxe ring with brand gradient + 4-compass tick marks
 *   • Subtle ear tufts that double as upward growth chevrons
 *   • Soft outer halo and slow eye-pulse animation
 *
 * Reads as: intelligence · vigilance · premium · only-ours.
 */
function OwlMark({ accent = "#CCFF00", className = "", uid = "brivo" }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#1F1F2A" />
          <stop offset="60%" stopColor="#0F0F15" />
          <stop offset="100%" stopColor="#06060A" />
        </radialGradient>

        <radialGradient id={`${uid}-head`} cx="50%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#34343F" />
          <stop offset="55%" stopColor="#1A1A22" />
          <stop offset="100%" stopColor="#0A0A0E" />
        </radialGradient>

        <radialGradient id={`${uid}-disc`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#46465A" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#22222C" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0A0A0E" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${uid}-iris`} cx="38%" cy="32%" r="80%">
          <stop offset="0%" stopColor="#F8FFB0" />
          <stop offset="35%" stopColor={accent} />
          <stop offset="80%" stopColor="#A8D900" />
          <stop offset="100%" stopColor="#5C7A00" />
        </radialGradient>

        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor="#6F4FFF" stopOpacity="0.6" />
        </linearGradient>

        <linearGradient id={`${uid}-beak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFF66" />
          <stop offset="60%" stopColor={accent} />
          <stop offset="100%" stopColor="#88B800" />
        </linearGradient>

        <filter id={`${uid}-eyeGlow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer halo (very soft) */}
      <circle cx="40" cy="40" r="39" fill="none" stroke={accent} strokeOpacity="0.10" strokeWidth="1.6" />

      {/* badge body */}
      <circle cx="40" cy="40" r="37" fill={`url(#${uid}-bg)`} stroke={`url(#${uid}-ring)`} strokeWidth="1.4" />

      {/* inner luxe ring */}
      <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="0.4" />

      {/* compass tick marks */}
      <g stroke={accent} strokeWidth="1.1" strokeLinecap="round">
        <line x1="40" y1="3.5" x2="40" y2="6.5" />
        <line x1="40" y1="73.5" x2="40" y2="76.5" />
        <line x1="3.5" y1="40" x2="6.5" y2="40" />
        <line x1="73.5" y1="40" x2="76.5" y2="40" />
      </g>
      {/* diagonal accent ticks */}
      <g stroke={accent} strokeWidth="0.7" strokeOpacity="0.55" strokeLinecap="round">
        <line x1="13" y1="13" x2="15.5" y2="15.5" />
        <line x1="65" y1="13" x2="62.5" y2="15.5" />
        <line x1="13" y1="67" x2="15.5" y2="64.5" />
        <line x1="65" y1="67" x2="62.5" y2="64.5" />
      </g>

      {/* ear tufts — sleek triangular */}
      <path d="M22 22 L26 11 L31 22 Z" fill={`url(#${uid}-head)`} />
      <path d="M49 22 L54 11 L58 22 Z" fill={`url(#${uid}-head)`} />
      {/* tuft accents */}
      <path d="M26.5 12 L26 22" stroke="white" strokeOpacity="0.18" strokeWidth="0.5" />
      <path d="M53.5 12 L53 22" stroke="white" strokeOpacity="0.18" strokeWidth="0.5" />

      {/* head silhouette */}
      <path
        d="M22 26
           C 22 16, 30 13, 40 13
           C 50 13, 58 16, 58 26
           L 58 44
           C 58 58, 50 64, 40 64
           C 30 64, 22 58, 22 44 Z"
        fill={`url(#${uid}-head)`}
      />

      {/* facial disc (heart-shape highlight) */}
      <path
        d="M28 30
           C 28 26, 31 24, 34 25
           C 36 26, 38 28, 40 28
           C 42 28, 44 26, 46 25
           C 49 24, 52 26, 52 30
           L 52 40
           C 52 49, 46 54, 40 55
           C 34 54, 28 49, 28 40 Z"
        fill={`url(#${uid}-disc)`}
      />

      {/* facial-disc edge highlight */}
      <path
        d="M28 30 C 28 26, 31 24, 34 25 C 36 26, 38 28, 40 28 C 42 28, 44 26, 46 25 C 49 24, 52 26, 52 30"
        fill="none"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="0.5"
      />

      {/* eye sockets — recessed dark */}
      <circle cx="32" cy="35" r="6" fill="#050507" />
      <circle cx="48" cy="35" r="6" fill="#050507" />

      {/* iris (luminous) */}
      <g filter={`url(#${uid}-eyeGlow)`}>
        <circle cx="32" cy="35" r="5" fill={`url(#${uid}-iris)`}>
          <animate attributeName="r" values="4.85;5.1;4.85" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="48" cy="35" r="5" fill={`url(#${uid}-iris)`}>
          <animate attributeName="r" values="4.85;5.1;4.85" dur="3.2s" begin="1.6s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* iris fine-detail rings (signal AI) */}
      <circle cx="32" cy="35" r="3.6" fill="none" stroke="#0B0B0F" strokeOpacity="0.35" strokeWidth="0.3" />
      <circle cx="48" cy="35" r="3.6" fill="none" stroke="#0B0B0F" strokeOpacity="0.35" strokeWidth="0.3" />

      {/* pupils */}
      <circle cx="32" cy="35" r="2.1" fill="#0B0B0F" />
      <circle cx="48" cy="35" r="2.1" fill="#0B0B0F" />

      {/* primary catchlights */}
      <circle cx="30.7" cy="33.7" r="1.3" fill="white" opacity="0.95" />
      <circle cx="46.7" cy="33.7" r="1.3" fill="white" opacity="0.95" />
      {/* secondary tiny catchlights */}
      <circle cx="33.4" cy="36.5" r="0.55" fill="white" opacity="0.55" />
      <circle cx="49.4" cy="36.5" r="0.55" fill="white" opacity="0.55" />

      {/* beak — sleek angular diamond */}
      <path d="M40 41 L35.5 46 L40 51 L44.5 46 Z" fill={`url(#${uid}-beak)`} />
      <path d="M40 43 L37.5 46 L40 49 L42.5 46 Z" fill="#0B0B0F" opacity="0.55" />
      <path d="M40 41 L40 51" stroke="#0B0B0F" strokeOpacity="0.35" strokeWidth="0.4" />

      {/* chest feather chevrons */}
      <g stroke="white" strokeOpacity="0.14" strokeWidth="0.55" fill="none" strokeLinecap="round">
        <path d="M30 56 L34 60" />
        <path d="M37 57 L40 60.5" />
        <path d="M50 56 L46 60" />
        <path d="M43 57 L40 60.5" />
      </g>

      {/* tiny brand mark under beak */}
      <text
        x="40" y="71.5"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="700"
        fontSize="3.4"
        fill={accent}
        opacity="0.85"
        letterSpacing="0.4"
      >
        BR · VO
      </text>
    </svg>
  );
}

export default function Logo({ size = 40, mono = false, className = "", showWordmark = true }) {
  const accent = mono ? "#FFFFFF" : "#CCFF00";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} data-testid="brivo-logo">
      <span
        className="relative inline-block flex-shrink-0 brivo-emit"
        style={{ width: size, height: size }}
        aria-label="BrivoMarketing — AI Performance Studio"
      >
        <OwlMark accent={accent} className="w-full h-full block" uid="brivo" />
      </span>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base md:text-[17px] font-black tracking-tight uppercase text-white">
            Brivo<span className="text-white/55">Marketing</span>
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.42em] text-white/45 mt-1.5 hidden md:flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
            AI Performance Studio · 2026
          </span>
        </span>
      )}
    </span>
  );
}
