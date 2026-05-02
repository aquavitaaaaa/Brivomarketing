import { motion } from "framer-motion";
import { ArrowRight, Sparkles, DollarSign, Infinity as InfinityIcon } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1585229259079-05ab82f93c7b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwxfHxlbnRyZXByZW5ldXIlMjBsYXB0b3B8ZW58MHx8fGJsYWNrfDE3Nzc3NDA3ODV8MA&ixlib=rb-4.1.0&q=85";

export default function PartnersHero({ onApply }) {
  return (
    <section
      id="top"
      className="relative min-h-[100vh] flex items-end overflow-hidden text-white"
      data-testid="partners-hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1B2B]/80 via-[#0B1B2B]/85 to-[#0B1B2B]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,134,76,0.18),transparent_55%)]" />

      <div className="relative z-10 px-6 md:px-10 lg:px-16 pb-24 pt-40 max-w-[1480px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 border border-[#D4A971]/40 bg-[#0B1B2B]/40 backdrop-blur px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={13} className="text-[#E8C28A]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#E8C28A] font-medium">
              Brivo Partner Program
            </span>
          </div>
          <h1 className="font-display text-[44px] md:text-[72px] lg:text-[88px] leading-[0.95] tracking-tight max-w-[1100px]">
            Work for yourself.
            <br />
            Get paid <span className="text-[#E8C28A]">every month</span>.
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/75 mt-7 max-w-[700px] leading-relaxed">
            Refer companies to Brivo. We close them. You earn lifetime
            recurring commission &mdash; for as long as they pay us. The
            harder you work, the higher you climb &mdash; up to{" "}
            <span className="text-[#E8C28A] font-semibold">30 % every month, forever.</span>
          </p>

          <div className="flex flex-wrap gap-4 mt-9">
            <button
              onClick={onApply}
              data-testid="partners-hero-apply"
              className="inline-flex items-center gap-2 bg-[#B8864C] hover:bg-[#C99661] text-white text-[14px] font-medium px-7 py-4 rounded-full transition-all shadow-[0_10px_30px_rgba(184,134,76,0.35)]"
            >
              Apply to partner <ArrowRight size={15} />
            </button>
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white text-[14px] font-medium px-7 py-4 rounded-full transition-all"
            >
              See commission tiers
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-[900px]">
            <Stat icon={<DollarSign size={16} />} label="Top commission" value="30%" />
            <Stat icon={<InfinityIcon size={16} />} label="Duration" value="Lifetime" />
            <Stat label="Avg client MRR" value="$7,500" />
            <Stat label="Top earner pace" value="$22k/mo" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="border-l border-[#D4A971]/40 pl-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#E8C28A]/85">
        {icon} {label}
      </div>
      <div className="font-display text-[28px] md:text-[34px] mt-2 text-white">
        {value}
      </div>
    </div>
  );
}
