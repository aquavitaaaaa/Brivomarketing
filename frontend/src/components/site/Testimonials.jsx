import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const items = [
  {
    quote:
      "Brivo didn't just rebuild our funnel — they rewrote our trajectory. We hit our annual revenue target in five months.",
    name: "Maya Okonkwo",
    role: "CMO, Obsidian Apparel",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  },
  {
    quote:
      "These are the only operators I trust with budget at this scale. Thoughtful, accountable, and faster than any agency I've worked with.",
    name: "Lena Vasquez",
    role: "Founder, Vault Finance",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  },
  {
    quote:
      "Our paid acquisition was bleeding cash. Brivo turned it into our most profitable channel within two months.",
    name: "Daniel Park",
    role: "CEO, Halo Fitness",
    img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const t = items[i];

  return (
    <section
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-[#FBFAF6] border-b border-[#E7E3D8]"
      data-testid="testimonials-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-16 items-end">
        <div className="md:col-span-6">
          <span className="eyebrow-accent">Testimonials</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="testimonials-title"
          >
            In the <em className="italic text-[#B8864C] font-[500]">words</em> of our partners.
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
        <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#E7E3D8]">
          <AnimatePresence mode="wait">
            <motion.img
              key={t.img}
              src={t.img}
              alt={t.name}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>

        <div className="md:col-span-7">
          <div className="font-display text-[64px] leading-none text-[#B8864C] mb-6">“</div>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={t.quote}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="font-display text-[24px] md:text-[32px] lg:text-[38px] font-[400] leading-[1.3] tracking-tight text-[#0B1B2B] italic"
              data-testid="testimonial-quote"
            >
              {t.quote}
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between flex-wrap gap-6 pt-6 border-t border-[#E7E3D8]">
            <div>
              <div className="font-display text-[19px] font-[500] text-[#0B1B2B]" data-testid="testimonial-name">
                {t.name}
              </div>
              <div className="text-[13px] text-[#8190A1] mt-1">
                {t.role}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setI((i - 1 + items.length) % items.length)}
                className="w-11 h-11 rounded-full border border-[#E7E3D8] flex items-center justify-center text-[#0B1B2B] hover:bg-[#0B1B2B] hover:text-white hover:border-[#0B1B2B] transition-all"
                aria-label="Previous"
                data-testid="testimonial-prev"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                onClick={() => setI((i + 1) % items.length)}
                className="w-11 h-11 rounded-full border border-[#E7E3D8] flex items-center justify-center text-[#0B1B2B] hover:bg-[#0B1B2B] hover:text-white hover:border-[#0B1B2B] transition-all"
                aria-label="Next"
                data-testid="testimonial-next"
              >
                <ArrowRight size={15} />
              </button>
              <span className="text-[12px] text-[#8190A1] ml-2">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
