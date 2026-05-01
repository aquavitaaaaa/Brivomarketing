// Static client wordmark row — calm, not scrolling.
const LOGOS = [
  { name: "OBSIDIAN", style: "font-display tracking-[0.1em]" },
  { name: "VAULT", style: "font-display tracking-[0.2em]" },
  { name: "Halo", style: "font-display italic tracking-tight" },
  { name: "NEONLAB", style: "font-display tracking-[0.15em]" },
  { name: "Aura", style: "font-display italic tracking-tight" },
  { name: "MERIDIAN", style: "font-display tracking-[0.1em]" },
  { name: "Forge", style: "font-display tracking-tight" },
  { name: "Strata", style: "font-display italic tracking-tight" },
];

export default function TrustBar() {
  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-14 md:py-16 border-y border-[#E7E3D8] bg-white"
      data-testid="trust-bar"
    >
      <div className="text-center mb-10">
        <span className="eyebrow">Trusted by leading brands across 27 industries</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-y-8 gap-x-6 items-center">
        {LOGOS.map((l, i) => (
          <div
            key={i}
            className="flex items-center justify-center group"
          >
            <span
              className={`text-xl md:text-[22px] font-[600] ${l.style} text-[#0B1B2B]/35 group-hover:text-[#0B1B2B] transition-colors duration-500`}
            >
              {l.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
