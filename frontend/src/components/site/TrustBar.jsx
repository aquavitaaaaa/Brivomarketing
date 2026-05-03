// Static client wordmark row — calm, not scrolling.
// Editorial rhythm: mix of bold/italic/tracked variants so it reads as
// a curated roster, not a logo dump.
const LOGOS = [
  { name: "INSTALEASE",        style: "font-display tracking-[0.14em]" },
  { name: "VAULT13",           style: "font-display tracking-[0.2em]" },
  { name: "Halo",              style: "font-display italic tracking-tight" },
  { name: "KOA",               style: "font-display tracking-[0.22em]" },
  { name: "NEONLAB",           style: "font-display tracking-[0.15em]" },
  { name: "Aura",              style: "font-display italic tracking-tight" },
  { name: "Obsidian",          style: "font-display tracking-tight" },
  { name: "MERIDIAN",          style: "font-display tracking-[0.12em]" },
  { name: "khaelyx holdings",  style: "font-display italic tracking-tight lowercase" },
  { name: "Strata",            style: "font-display italic tracking-tight" },
];

export default function TrustBar() {
  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-14 md:py-16 border-y border-[#E7E3D8] bg-white"
      data-testid="trust-bar"
    >
      <div className="text-center mb-10">
        <span className="eyebrow">
          Trusted by leading brands across 27 industries
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-6 items-center max-w-[1240px] mx-auto">
        {LOGOS.map((l, i) => (
          <div
            key={i}
            className="flex items-center justify-center group"
          >
            <span
              className={`text-lg sm:text-xl md:text-[22px] font-[600] whitespace-nowrap ${l.style} text-[#0B1B2B]/35 group-hover:text-[#0B1B2B] transition-colors duration-500`}
            >
              {l.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
