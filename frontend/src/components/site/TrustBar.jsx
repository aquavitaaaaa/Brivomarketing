import Marquee from "react-fast-marquee";

const LOGOS = [
  "OBSIDIAN", "VAULT", "HALO", "NEONLAB", "AURA", "MERIDIAN",
  "CIRRUS", "NORTHBLK", "FORGE", "PARALLAX", "ARCH&CO", "STRATA",
];

export default function TrustBar() {
  return (
    <section
      className="relative py-12 md:py-16 border-y border-white/10 bg-[#0E0E14] overflow-hidden"
      data-testid="trust-bar"
    >
      <div className="absolute inset-0 gradient-mesh-soft pointer-events-none" />
      <div className="relative px-6 md:px-12 lg:px-24 mb-8 flex items-center gap-3">
        <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
          Trusted by 180+ category leaders
        </span>
      </div>
      <div className="marquee-mask">
        <Marquee gradient={false} speed={40}>
          {LOGOS.map((l, i) => (
            <div
              key={i}
              className="mx-10 md:mx-14 flex items-center gap-3 group"
            >
              <span className="w-1.5 h-1.5 rotate-45 bg-white/40 group-hover:bg-[#CCFF00] transition-colors" />
              <span className="font-display text-2xl md:text-3xl font-black uppercase tracking-tighter text-white/40 group-hover:text-white transition-colors">
                {l}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
