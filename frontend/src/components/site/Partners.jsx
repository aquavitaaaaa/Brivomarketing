import { ShieldCheck } from "lucide-react";

// Platform partners / certifications. Plain wordmarks styled appropriately.
const partners = [
  { name: "Google Premier Partner", short: "Google", style: "font-display font-black tracking-tight" },
  { name: "Meta Business Partner", short: "Meta", style: "font-display font-black tracking-tight italic" },
  { name: "HubSpot Solutions", short: "HubSpot", style: "font-display font-black tracking-tight" },
  { name: "Shopify Partner", short: "Shopify", style: "font-display font-black tracking-tight" },
  { name: "Klaviyo Master", short: "Klaviyo", style: "font-display font-black tracking-tighter" },
  { name: "TikTok Marketing Partner", short: "TikTok", style: "font-display font-black tracking-tight" },
];

export default function Partners() {
  return (
    <section
      className="px-6 md:px-12 lg:px-24 py-16 md:py-20 border-t border-white/10 bg-[#0B0B0F]"
      data-testid="partners-section"
    >
      <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-[#CCFF00]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
            Certified Platform Partners
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
          Active certifications · Renewed Q1 2026
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 border border-white/10">
        {partners.map((p) => (
          <div
            key={p.short}
            className="bg-[#131319] px-5 py-7 flex flex-col items-start justify-between min-h-[120px] hover:bg-[#16161E] transition-colors group"
            data-testid={`partner-${p.short.toLowerCase()}`}
          >
            <span className={`text-2xl text-white/75 group-hover:text-white transition-colors ${p.style}`}>
              {p.short}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mt-3">
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
