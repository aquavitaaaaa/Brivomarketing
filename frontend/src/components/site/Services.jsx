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
    metrics: ["+412% leads", "0.9s LCP", "100/100 Lighthouse"],
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&w=600&q=70",
  },
  {
    id: "seo",
    icon: Search,
    title: "SEO & Content",
    desc: "Technical SEO, content engines, and link strategies that compound for years.",
    tag: "02",
    metrics: ["1.2M organic", "Top 3 keywords", "DR 70+"],
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&w=600&q=70",
  },
  {
    id: "ads",
    icon: Megaphone,
    title: "Paid Ads",
    desc: "Google, Meta, TikTok. We don't run ads — we build profitable acquisition systems.",
    tag: "03",
    metrics: ["5.8x ROAS", "-42% CAC", "$30M tracked"],
    img: "https://images.unsplash.com/photo-1771931342240-2c277b33905f?crop=entropy&cs=srgb&fm=jpg&w=600&q=70",
  },
  {
    id: "social",
    icon: Share2,
    title: "Social Media",
    desc: "Cultural-first content, community ops, and creator strategy that move metrics.",
    tag: "04",
    metrics: ["+820% reach", "Viral hits", "Creator network"],
    img: "https://images.unsplash.com/photo-1602475063211-3d98d60e3b1f?crop=entropy&cs=srgb&fm=jpg&w=600&q=70",
  },
  {
    id: "brand",
    icon: Sparkles,
    title: "Branding & Identity",
    desc: "Visual systems and logo design built to stop scrolls and command premium pricing.",
    tag: "05",
    metrics: ["Premium pricing", "Brand books", "Full systems"],
    img: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?crop=entropy&cs=srgb&fm=jpg&w=600&q=70",
  },
];

export default function Services({ onSelect }) {
  return (
    <section
      id="services"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 relative bg-[#0B0B0F]"
      data-testid="services-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-16 items-end">
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
          One <span className="text-stroke-accent">ruthless</span> system.
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
              className={`group relative bg-[#131319] p-8 md:p-10 text-left transition-all duration-500 hover:bg-[#181821] overflow-hidden ${
                isLast ? "lg:col-span-1 md:col-span-2" : ""
              }`}
              data-testid={`service-card-${s.id}`}
            >
              {/* Hover image reveal */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <img
                  src={s.img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/40" />
              </div>

              {/* Accent corner glow on hover */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#CCFF00]/0 group-hover:bg-[#CCFF00]/15 blur-3xl rounded-full transition-all duration-700" />

              <div className="relative flex items-start justify-between mb-12">
                <div className="w-12 h-12 border border-white/15 flex items-center justify-center group-hover:border-[#CCFF00] group-hover:text-[#CCFF00] group-hover:bg-black/40 transition-all">
                  <Icon size={20} />
                </div>
                <span className="font-mono text-xs text-white/30 group-hover:text-[#CCFF00] transition-colors">
                  {s.tag}
                </span>
              </div>

              <h3 className="relative font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
                {s.title}
              </h3>
              <p className="relative text-white/60 text-sm md:text-base leading-relaxed mb-6 group-hover:text-white/80 transition-colors">
                {s.desc}
              </p>

              <div className="relative flex flex-wrap gap-2 mb-10">
                {s.metrics.map((m) => (
                  <span
                    key={m}
                    className="font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 border border-white/15 text-white/60 group-hover:border-[#CCFF00]/40 group-hover:text-[#CCFF00] transition-all"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div className="relative flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-[#CCFF00] transition-colors">
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
