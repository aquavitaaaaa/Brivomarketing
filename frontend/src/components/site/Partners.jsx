import { ShieldCheck } from "lucide-react";

const partners = [
  { name: "Google Premier Partner", short: "Google" },
  { name: "Meta Business Partner", short: "Meta" },
  { name: "HubSpot Solutions Partner", short: "HubSpot" },
  { name: "Shopify Plus Partner", short: "Shopify" },
  { name: "Klaviyo Master Partner", short: "Klaviyo" },
  { name: "TikTok Marketing Partner", short: "TikTok" },
];

export default function Partners() {
  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-20 md:py-24 bg-[#FBFAF6] border-b border-[#E7E3D8]"
      data-testid="partners-section"
    >
      <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-[#B8864C]" />
          <span className="eyebrow">Certified platform partners</span>
        </div>
        <span className="text-[11px] text-[#8190A1] tracking-wider">
          Active certifications · Renewed Q1 2026
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {partners.map((p) => (
          <div
            key={p.short}
            className="bg-white rounded-xl border border-[#E7E3D8] px-5 py-6 flex flex-col items-start justify-between min-h-[110px] hover:border-[#B8864C] transition-colors group"
            data-testid={`partner-${p.short.toLowerCase()}`}
          >
            <span className="font-display text-[22px] font-[600] text-[#0B1B2B]/75 group-hover:text-[#0B1B2B] transition-colors tracking-tight">
              {p.short}
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#8190A1] mt-3">
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
