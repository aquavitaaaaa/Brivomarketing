import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    id: "obsidian",
    title: "Obsidian Apparel",
    cat: "E-commerce / Branding",
    metric: "+318% revenue in 90 days",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxkYXJrJTIwbW9kZXJuJTIwd2Vic2l0ZSUyMGRhc2hib2FyZCUyMHBvcnRmb2xpb3xlbnwwfHx8fDE3Nzc2MDkwMTR8MA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-8",
  },
  {
    id: "neon",
    title: "Neon Lab Co.",
    cat: "Web Dev / SEO",
    metric: "1.2M organic / mo",
    img: "https://images.unsplash.com/photo-1771931342240-2c277b33905f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwbmVvbiUyMGdyZWVuJTIwZ2xvd2luZyUyMGRhcmt8ZW58MHx8fHwxNzc3NjA5MDE0fDA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-4",
  },
  {
    id: "halo",
    title: "Halo Fitness",
    cat: "Paid Ads / Funnels",
    metric: "5.8x ROAS scaled",
    img: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwb2ZmaWNlJTIwZGFyayUyMG5pZ2h0fGVufDB8fHx8MTc3NzYwOTAxMHww&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-5",
  },
  {
    id: "vault",
    title: "Vault Finance",
    cat: "Branding / Web",
    metric: "+412% lead volume",
    img: "https://images.unsplash.com/photo-1602475063211-3d98d60e3b1f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxkYXJrJTIwZ3JhaW4lMjB0ZXh0dXJlJTIwYmxhY2t8ZW58MHx8fHwxNzc3NjA5MDE0fDA&ixlib=rb-4.1.0&q=85",
    span: "lg:col-span-7",
  },
];

export default function Portfolio() {
  return (
    <section
      id="work"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40"
      data-testid="portfolio-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-16 items-end">
        <div className="md:col-span-7">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Selected Work
          </span>
          <h2
            className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
            data-testid="portfolio-title"
          >
            Receipts,
            <br />
            not promises.
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-white/60 text-base leading-relaxed">
          A curated slice of brands we've helped scale. Every number is real,
          every project shipped on time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {projects.map((p, i) => (
          <motion.a
            key={p.id}
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className={`group relative overflow-hidden border border-white/10 bg-[#0A0A0A] aspect-[4/3] ${p.span}`}
            data-testid={`portfolio-item-${p.id}`}
          >
            <img
              src={p.img}
              alt={p.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative z-10 h-full p-6 md:p-10 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                  {p.cat}
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-white/60 group-hover:text-[#CCFF00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                />
              </div>

              <div>
                <h3 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight">
                  {p.title}
                </h3>
                <div className="mt-3 inline-block bg-[#CCFF00] text-black font-mono text-xs px-3 py-1 uppercase tracking-wider">
                  {p.metric}
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
