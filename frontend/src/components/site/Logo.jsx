/**
 * BrivoMarketing — Owl Crest Logomark
 * --------------------------------------------------------------
 * Uses the user's bespoke owl crest artwork (public/owl-logo.jpg)
 * presented as a circular badge with:
 *   • Soft lime emission halo
 *   • Brand-tinted outer ring
 *   • Subtle inner stroke for depth
 */
export default function Logo({ size = 44, mono = false, className = "", showWordmark = true }) {
  const ringColor = mono ? "rgba(255,255,255,0.55)" : "rgba(204,255,0,0.55)";
  const glow = mono
    ? "0 0 0 1px rgba(255,255,255,0.25), 0 0 16px rgba(255,255,255,0.18)"
    : "0 0 0 1px rgba(204,255,0,0.4), 0 0 18px rgba(204,255,0,0.30), 0 0 36px rgba(204,255,0,0.12)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} data-testid="brivo-logo">
      <span
        className="relative inline-block flex-shrink-0 rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          boxShadow: glow,
          border: `1px solid ${ringColor}`,
        }}
        aria-label="BrivoMarketing — AI Performance Studio"
      >
        <img
          src="/owl-logo.jpg"
          alt="BrivoMarketing"
          className="w-full h-full object-cover"
          draggable="false"
        />
        {/* subtle inner highlight ring */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 0 18px rgba(0,0,0,0.35)" }}
        />
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
