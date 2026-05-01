/**
 * BrivoMarketing — Custom Owl Logomark
 * --------------------------------------------------------------
 * Symbolism: The owl = vision, wisdom, vigilance — translated into
 * an AI-marketing identity. The eyes are scoped "neural pupils" with
 * a pulsing lime core (the AI is always watching the data). Ear tufts
 * read as upward arrows (growth). Subtle precision frame + crosshair
 * tick = engineering rigor. Purpose: trust + premium + smarter than peers.
 */
export default function Logo({ size = 36, mono = false, className = "", showWordmark = true }) {
  const accent = mono ? "#FFFFFF" : "#CCFF00";
  const stroke = "white";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} data-testid="brivo-logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="BrivoMarketing — AI Performance Studio"
      >
        <defs>
          <radialGradient id="brivoEyePulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="brivoBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.78" />
          </linearGradient>
        </defs>

        {/* precision frame */}
        <rect x="0.75" y="0.75" width="46.5" height="46.5" stroke={stroke} strokeOpacity="0.18" strokeWidth="1" />
        {/* corner crosshair ticks */}
        <line x1="3" y1="3" x2="7" y2="3" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" />
        <line x1="3" y1="3" x2="3" y2="7" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" />
        <line x1="45" y1="45" x2="41" y2="45" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" />
        <line x1="45" y1="45" x2="45" y2="41" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" />

        {/* lime accent block (kept from prior identity for brand continuity) */}
        <rect x="40" y="3" width="5" height="5" fill={accent} />

        {/* OWL — head + body silhouette */}
        <g>
          {/* ear tufts (sharp upward chevrons = growth arrows) */}
          <path d="M12.5 13 L15 7.5 L17.5 13 Z" fill="url(#brivoBodyGrad)" />
          <path d="M30.5 13 L33 7.5 L35.5 13 Z" fill="url(#brivoBodyGrad)" />

          {/* head */}
          <path
            d="M10 18 C10 11.5 16 9 24 9 C32 9 38 11.5 38 18 L38 27 C38 33.5 32 38 24 38 C16 38 10 33.5 10 27 Z"
            fill="url(#brivoBodyGrad)"
          />

          {/* eye sockets — knockouts to bg */}
          <circle cx="18.5" cy="22" r="5.2" fill="#0B0B0F" />
          <circle cx="29.5" cy="22" r="5.2" fill="#0B0B0F" />

          {/* AI neural rings around each eye */}
          <circle cx="18.5" cy="22" r="3.6" stroke={accent} strokeOpacity="0.55" strokeWidth="0.8" fill="none" />
          <circle cx="29.5" cy="22" r="3.6" stroke={accent} strokeOpacity="0.55" strokeWidth="0.8" fill="none" />

          {/* pulsing AI pupils */}
          <circle cx="18.5" cy="22" r="3" fill="url(#brivoEyePulse)">
            <animate attributeName="r" values="2.4;3.2;2.4" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="29.5" cy="22" r="3" fill="url(#brivoEyePulse)">
            <animate attributeName="r" values="2.4;3.2;2.4" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
          </circle>
          {/* solid pupil core */}
          <circle cx="18.5" cy="22" r="1.3" fill={accent} />
          <circle cx="29.5" cy="22" r="1.3" fill={accent} />

          {/* neural link between eyes (suggests connected intelligence) */}
          <line
            x1="22.4"
            y1="22"
            x2="25.6"
            y2="22"
            stroke={accent}
            strokeOpacity="0.6"
            strokeWidth="0.8"
            strokeDasharray="1 1.3"
          />

          {/* beak — diamond, lime tipped */}
          <path d="M24 27 L21.5 30.5 L24 33 L26.5 30.5 Z" fill="#0B0B0F" />
          <path d="M24 28.4 L22.7 30.4 L24 31.6 L25.3 30.4 Z" fill={accent} />

          {/* feather / chest chevrons */}
          <path
            d="M14.5 33.5 L17.5 36.2 M19 34.5 L21 36.8 M29 34.5 L27 36.8 M33.5 33.5 L30.5 36.2"
            stroke="#0B0B0F"
            strokeOpacity="0.35"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </g>

        {/* underline data-tick (precision detail) */}
        <line x1="14" y1="42.5" x2="34" y2="42.5" stroke={stroke} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="2 2" />
      </svg>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base md:text-[17px] font-black tracking-tight uppercase text-white">
            Brivo<span className="text-white/55">Marketing</span>
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-white/45 mt-1 hidden md:flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-[#CCFF00] animate-pulse" />
            AI Performance Studio · 2026
          </span>
        </span>
      )}
    </span>
  );
}
