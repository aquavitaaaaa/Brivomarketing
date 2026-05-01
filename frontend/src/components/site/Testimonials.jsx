import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

const items = [
  {
    quote:
      "Brivo didn't just rebuild our funnel — they rewrote our trajectory. We hit our annual revenue target in five months.",
    name: "Maya Okonkwo",
    role: "CMO, Obsidian Apparel",
    img: "https://images.unsplash.com/photo-1774481528970-41e591147018?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMHBvcnRyYWl0JTIwZGFya3xlbnwwfHx8fDE3Nzc2MDkwMTB8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote:
      "These are the only operators I trust with budget at this scale. Sharp, accountable, and faster than any agency I've worked with.",
    name: "Lena Vasquez",
    role: "Founder, Vault Finance",
    img: "https://images.unsplash.com/photo-1762635696772-0ed637b1a3a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMHBvcnRyYWl0JTIwZGFya3xlbnwwfHx8fDE3Nzc2MDkwMTB8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote:
      "Our paid acquisition was bleeding cash. Brivo turned it into our most profitable channel within two months. Period.",
    name: "Daniel Park",
    role: "CEO, Halo Fitness",
    img: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwb2ZmaWNlJTIwZGFyayUyMG5pZ2h0fGVufDB8fHx8MTc3NzYwOTAxMHww&ixlib=rb-4.1.0&q=85",
  },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const t = items[i];

  return (
    <section
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40"
      data-testid="testimonials-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-16">
        <div className="md:col-span-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Testimonials
          </span>
        </div>
        <h2
          className="md:col-span-8 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
          data-testid="testimonials-title"
        >
          What founders
          <br />
          actually say.
        </h2>
      </div>

      <div className="grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden border border-white/10">
          <AnimatePresence mode="wait">
            <motion.img
              key={t.img}
              src={t.img}
              alt={t.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
        </div>

        <div className="md:col-span-7 md:pl-10">
          <Quote size={42} className="text-[#CCFF00] mb-8" />
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={t.quote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="font-display text-2xl md:text-4xl lg:text-5xl font-medium italic leading-tight tracking-tight text-white"
              data-testid="testimonial-quote"
            >
              "{t.quote}"
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="font-display text-xl font-bold uppercase tracking-tight" data-testid="testimonial-name">
                {t.name}
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
                {t.role}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setI((i - 1 + items.length) % items.length)}
                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
                aria-label="Previous"
                data-testid="testimonial-prev"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => setI((i + 1) % items.length)}
                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
                aria-label="Next"
                data-testid="testimonial-next"
              >
                <ArrowRight size={16} />
              </button>
              <span className="font-mono text-xs text-white/40 ml-2">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
