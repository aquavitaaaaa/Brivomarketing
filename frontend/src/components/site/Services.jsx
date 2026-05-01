import { motion } from "framer-motion";
import {
  Code2,
  Search,
  Megaphone,
  Share2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const services = [
  {
    id: "web",
    icon: Code2,
    title: "Web Design & Dev",
    desc: "Conversion-tuned, custom-coded sites that load fast, rank well, and close deals.",
    tag: "01",
  },
  {
    id: "seo",
    icon: Search,
    title: "SEO & Content",
    desc: "Technical SEO, content engines, and link strategies that compound for years.",
    tag: "02",
  },
  {
    id: "ads",
    icon: Megaphone,
    title: "Paid Ads",
    desc: "Google, Meta, TikTok. We don't run ads — we build profitable acquisition systems.",
    tag: "03",
  },
  {
    id: "social",
    icon: Share2,
    title: "Social Media",
    desc: "Cultural-first content, community ops, and creator strategy that move metrics.",
    tag: "04",
  },
  {
    id: "brand",
    icon: Sparkles,
    title: "Branding & Identity",
    desc: "Visual systems and logo design built to stop scrolls and command premium pricing.",
    tag: "05",
  },
];

export default function Services({ onSelect }) {
  return (
    <section
      id="services"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 relative"
      data-testid="services-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-16">
        <div className="md:col-span-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Services
          </span>
        </div>
        <h2
          className="md:col-span-8 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
          data-testid="services-title"
        >
          Five weapons.
          <br />
          One <span className="text-stroke">ruthless</span> system.
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
        {services.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === services.length - 1;
          return (
            <motion.button
              key={s.id}
              onClick={() => onSelect(s.title)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className={`group relative bg-[#0A0A0A] p-8 md:p-10 text-left transition-all duration-500 hover:bg-[#111] ${
                isLast ? "lg:col-span-1 md:col-span-2" : ""
              }`}
              data-testid={`service-card-${s.id}`}
            >
              <div className="flex items-start justify-between mb-12">
                <div className="w-12 h-12 border border-white/15 flex items-center justify-center group-hover:border-[#CCFF00] group-hover:text-[#CCFF00] transition-all">
                  <Icon size={20} />
                </div>
                <span className="font-mono text-xs text-white/30">{s.tag}</span>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
                {s.title}
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10">
                {s.desc}
              </p>

              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-[#CCFF00] transition-colors">
                Engage
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>

              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#CCFF00]/40 pointer-events-none transition-all" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
