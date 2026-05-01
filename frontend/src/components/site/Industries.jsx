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
  ArrowUpRight,
} from "lucide-react";

const industries = [
  {
    icon: Leaf,
    name: "Cannabis",
    note: "Compliance-first growth",
    gain: "+248% retail",
  },
  {
    icon: Stethoscope,
    name: "Healthcare",
    note: "HIPAA-aware funnels",
    gain: "+312% bookings",
  },
  {
    icon: Scale,
    name: "Legal",
    note: "Lead-quality engineered",
    gain: "+186% qualified",
  },
  {
    icon: Building2,
    name: "Real Estate",
    note: "Local domination",
    gain: "+422% listings",
  },
  {
    icon: Cpu,
    name: "SaaS / Tech",
    note: "PLG + paid hybrid",
    gain: "+5.8x ROAS",
  },
  {
    icon: ShoppingBag,
    name: "E-commerce",
    note: "DTC scaling systems",
    gain: "+318% revenue",
  },
  {
    icon: UtensilsCrossed,
    name: "Hospitality",
    note: "Reservation + brand",
    gain: "+264% covers",
  },
  {
    icon: Wallet,
    name: "Finance",
    note: "Trust-led acquisition",
    gain: "+412% leads",
  },
];

export default function Industries({ onSelect }) {
  return (
    <section
      id="industries"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 relative overflow-hidden bg-[#0B0B0F]"
      data-testid="industries-section"
    >
      <div className="absolute inset-0 gradient-mesh-soft pointer-events-none opacity-60" />

      <div className="relative grid md:grid-cols-12 gap-8 mb-16 items-end">
        <div className="md:col-span-7">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Industries
          </span>
          <h2
            className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
            data-testid="industries-title"
          >
            Regulated.
            <br />
            Niche. <span className="text-stroke">Complex.</span>
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-white/65 text-base md:text-lg leading-relaxed">
          We've built compliant, conversion-tuned systems across the most
          scrutinized industries on earth. Your business isn't too "weird" for
          us — it's our specialty.
        </p>
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
        {industries.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <motion.button
              key={ind.name}
              onClick={() => onSelect && onSelect(ind.name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative bg-[#131319] p-6 md:p-7 text-left hover:bg-[#16161E] transition-colors min-h-[180px] flex flex-col"
              data-testid={`industry-${ind.name.toLowerCase().replace(/\W/g, "-")}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 border border-white/15 flex items-center justify-center group-hover:border-[#CCFF00] group-hover:text-[#CCFF00] transition-all">
                  <Icon size={16} />
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-white/30 group-hover:text-[#CCFF00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>

              <h3 className="font-display text-xl font-bold tracking-tight text-white mb-1">
                {ind.name}
              </h3>
              <p className="text-xs text-white/50 mb-auto leading-relaxed">
                {ind.note}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#CCFF00]/85">
                <span className="w-1 h-1 bg-[#CCFF00] rounded-full" />
                {ind.gain}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
