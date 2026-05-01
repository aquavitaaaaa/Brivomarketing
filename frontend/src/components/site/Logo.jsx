/**
 * BrivoMarketing — refined light-theme logomark.
 * Circular crest + navy wordmark + subtle gold dot accent.
 */
export default function Logo({ size = 40, mono = false, className = "", showWordmark = true }) {
  const ringColor = mono ? "rgba(255,255,255,0.35)" : "rgba(184,134,76,0.55)";
  const shadow = mono
    ? "0 0 0 1px rgba(255,255,255,0.15)"
    : "0 4px 14px -4px rgba(11,27,43,0.18), 0 0 0 1px rgba(184,134,76,0.25)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} data-testid="brivo-logo">
      <span
        className="relative inline-block flex-shrink-0 rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          boxShadow: shadow,
          border: `1px solid ${ringColor}`,
        }}
        aria-label="BrivoMarketing"
      >
        <img
          src="/owl-logo.jpg"
          alt="BrivoMarketing"
          className="w-full h-full object-cover"
          draggable="false"
        />
      </span>

      {showWordmark && (
        <span className="flex flex-col leading-tight">
          <span className={`font-display text-[19px] md:text-[20px] font-semibold tracking-tight ${mono ? "text-white" : "text-[#0B1B2B]"}`}>
            Brivo<span className={mono ? "text-white/65" : "text-[#0B1B2B]/55"}>Marketing</span>
          </span>
          <span className={`text-[10px] tracking-[0.22em] uppercase mt-0.5 flex items-center gap-1.5 ${mono ? "text-white/55" : "text-[#8190A1]"}`}>
            <span className="inline-block w-1 h-1 rounded-full bg-[#B8864C]" />
            Performance Studio
          </span>
        </span>
      )}
    </span>
  );
}
