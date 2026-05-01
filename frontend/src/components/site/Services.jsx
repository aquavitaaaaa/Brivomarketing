import { motion } from "framer-motion";
import {
  Code2,
  Search,
  Megaphone,
  Share2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    id: "web",
    icon: Code2,
    title: "Web design & development",
    desc: "Conversion-focused websites, thoughtfully designed and beautifully built for the long term.",
    tag: "01",
    metrics: ["Custom design systems", "Headless architecture", "Accessibility first"],
  },
  {
    id: "seo",
    icon: Search,
    title: "SEO & content strategy",
    desc: "Technical SEO and editorial content engines that compound visibility for years — not weeks.",
    tag: "02",
    metrics: ["Technical audits", "Editorial planning", "Authority building"],
  },
  {
    id: "ads",
    icon: Megaphone,
    title: "Paid media",
    desc: "Measured, efficient acquisition across Google, Meta and LinkedIn — engineered for sustainable ROAS.",
    tag: "03",
    metrics: ["Full-funnel strategy", "Creative testing", "Attribution clarity"],
  },
  {
    id: "social",
    icon: Share2,
    title: "Social & content",
    desc: "Brand-forward social programs and creative production that earn attention and build community.",
    tag: "04",
    metrics: ["Monthly editorial", "Creator partnerships", "Community ops"],
  },
  {
    id: "brand",
    icon: Sparkles,
    title: "Brand & identity",
    desc: "Identity systems that signal quality and command the pricing your business deserves.",
    tag: "05",
    metrics: ["Naming & positioning", "Visual identity", "Brand guidelines"],
  },
];

export default function Services({ onSelect }) {
  return (
    <section
      id="services"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-white border-b border-[#E7E3D8]"
      data-testid="services-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-16 items-end">
        <div className="md:col-span-6">
          <span className="eyebrow-accent">Our services</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="services-title"
          >
            A complete studio, <em className="italic text-[#B8864C] font-[500]">under one roof.</em>
          </h2>
        </div>
        <p className="md:col-span-5 md:col-start-8 text-[#4E5C6E] text-[17px] leading-relaxed">
          Five connected disciplines, delivered by senior operators. We bring them together so you don&apos;t have to manage five different vendors.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              onClick={() => onSelect(s.title)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className="group relative text-left bg-[#FBFAF6] rounded-2xl border border-[#E7E3D8] p-8 md:p-10 card-lift"
              data-testid={`service-card-${s.id}`}
            >
              <div className="flex items-start justify-between mb-10">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E7E3D8] flex items-center justify-center text-[#B8864C] group-hover:bg-[#0B1B2B] group-hover:text-[#B8864C] group-hover:border-[#0B1B2B] transition-all">
                  <Icon size={18} />
                </div>
                <span className="font-display text-sm font-[500] text-[#8190A1]">
                  {s.tag}
                </span>
              </div>

              <h3 className="font-display text-[26px] md:text-[28px] font-[500] text-[#0B1B2B] tracking-tight leading-[1.15] mb-4">
                {s.title}
              </h3>
              <p className="text-[#4E5C6E] text-[15px] leading-relaxed mb-7">
                {s.desc}
              </p>

              <ul className="space-y-2 mb-8">
                {s.metrics.map((m) => (
                  <li
                    key={m}
                    className="flex items-center gap-2 text-[13px] text-[#0B1B2B]/75"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#B8864C]" />
                    {m}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-[13px] font-medium text-[#0B1B2B] group-hover:text-[#B8864C] transition-colors">
                Learn more
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
