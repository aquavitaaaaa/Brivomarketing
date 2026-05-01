import { motion } from "framer-motion";
import {
  Leaf,
  Stethoscope,
  Scale,
  Building2,
  Cpu,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
  ArrowRight,
} from "lucide-react";

const industries = [
  { icon: Stethoscope, name: "Healthcare", note: "HIPAA-aware acquisition funnels" },
  { icon: Wallet, name: "Financial services", note: "Trust-led, compliant growth" },
  { icon: Scale, name: "Professional services", note: "Qualified lead pipelines" },
  { icon: Building2, name: "Real estate", note: "Local brand &amp; inbound" },
  { icon: Cpu, name: "B2B SaaS", note: "Product-led + paid hybrid" },
  { icon: ShoppingBag, name: "Retail &amp; e-commerce", note: "DTC scaling systems" },
  { icon: UtensilsCrossed, name: "Hospitality", note: "Reservations &amp; brand" },
  { icon: Leaf, name: "Regulated industries", note: "Compliance-first growth" },
];

export default function Industries({ onSelect }) {
  return (
    <section
      id="industries"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-[#FBFAF6] border-b border-[#E7E3D8]"
      data-testid="industries-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-14 items-end">
        <div className="md:col-span-7">
          <span className="eyebrow-accent">Industries we serve</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="industries-title"
          >
            Built for <em className="italic text-[#B8864C] font-[500]">regulated</em> and specialised markets.
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-[#4E5C6E] text-[16px] leading-relaxed">
          From healthcare to finance, we&apos;ve built compliant, conversion-focused systems across some of the most scrutinised industries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <motion.button
              key={ind.name}
              onClick={() => onSelect && onSelect(ind.name.replace(/&amp;/g, "&"))}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative bg-white rounded-2xl border border-[#E7E3D8] p-6 md:p-7 text-left min-h-[170px] flex flex-col card-lift"
              data-testid={`industry-${ind.name.toLowerCase().replace(/\W+/g, "-")}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FBFAF6] border border-[#E7E3D8] flex items-center justify-center text-[#B8864C] group-hover:bg-[#0B1B2B] group-hover:text-white group-hover:border-[#0B1B2B] transition-all">
                  <Icon size={16} />
                </div>
                <ArrowRight
                  size={14}
                  className="text-[#8190A1] group-hover:text-[#B8864C] group-hover:translate-x-0.5 transition-all"
                />
              </div>

              <h3 className="font-display text-[19px] font-[500] text-[#0B1B2B] leading-snug mb-1"
                  dangerouslySetInnerHTML={{ __html: ind.name }} />
              <p
                className="text-[13px] text-[#4E5C6E] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: ind.note }}
              />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
