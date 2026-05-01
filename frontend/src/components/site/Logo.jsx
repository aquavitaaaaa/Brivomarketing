export default function Logo({ size = 32, mono = false, className = "" }) {
  const accent = mono ? "#FFFFFF" : "#CCFF00";
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} data-testid="brivo-logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="BrivoMarketing"
      >
        {/* Outer frame */}
        <rect x="0.75" y="0.75" width="38.5" height="38.5" stroke="white" strokeOpacity="0.25" strokeWidth="1" />

        {/* Stylized "B" — two stacked counters forming a refined monogram */}
        <path
          d="M9 9 H21 C24.866 9 28 12.134 28 16 C28 17.6 27.46 19.07 26.55 20.25 C28.05 21.45 29 23.21 29 25.2 C29 28.85 26 31.85 22.35 31.85 H9 V9 Z M14 13.5 V18.7 H20.5 C22.05 18.7 23.3 17.5 23.3 16.1 C23.3 14.7 22.05 13.5 20.5 13.5 H14 Z M14 22.85 V27.3 H21.65 C23.05 27.3 24.2 26.2 24.2 24.85 C24.2 23.5 23.05 22.85 21.65 22.85 H14 Z"
          fill="white"
        />

        {/* Lime accent block */}
        <rect x="30" y="3" width="7" height="7" fill={accent} />

        {/* Tiny stitch detail */}
        <rect x="3" y="33" width="4" height="1" fill="white" fillOpacity="0.4" />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="font-display text-base md:text-[17px] font-black tracking-tight uppercase text-white">
          Brivo<span className="text-white/55">Marketing</span>
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-white/40 mt-1 hidden md:block">
          Performance Studio · 2026
        </span>
      </span>
    </span>
  );
}
