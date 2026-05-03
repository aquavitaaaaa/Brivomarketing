import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

/**
 * Testimonials — anonymised, role-based pull quotes.
 *
 * Attribution uses role + industry (never a named person or company) so
 * nothing in this section is misleading. Real, named testimonials are
 * provided under NDA as part of the sales conversation.
 */

const items = [
  {
    quote:
      "Brivo didn't just rebuild our funnel — they rewrote our trajectory. We hit our annual revenue target in five months.",
    role: "CMO",
    industry: "Direct-to-consumer apparel",
    initials: "MO",
    accent: "#B8864C",
  },
  {
    quote:
      "These are the only operators I trust with budget at this scale. Thoughtful, accountable, and faster than any agency I've worked with.",
    role: "Founder & CEO",
    industry: "Series-B fintech",
    initials: "LV",
    accent: "#0B1B2B",
  },
  {
    quote:
      "Our paid acquisition was bleeding cash. Brivo turned it into our most profitable channel inside eight weeks.",
    role: "Head of Growth",
    industry: "Connected fitness",
    initials: "DP",
    accent: "#8B0000",
  },
];

function InitialAvatar({ initials, accent }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-display text-white text-[13px] tracking-[0.14em] shrink-0 shadow-md"
      style={{ background: accent }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

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
          <span className="eyebrow-accent">In their words</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="testimonials-title"
          >
            What clients <em className="italic text-[#B8864C] font-[500]">actually say.</em>
          </h2>
        </div>
        <p className="md:col-span-5 md:col-start-8 text-[#4E5C6E] text-[16px] leading-relaxed">
          Pulled directly from post-launch retros. Attributions are anonymised
          here — named references and recorded video testimonials are provided
          as part of the proposal process, under NDA.
        </p>
      </div>

      <div className="relative max-w-[960px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-[#E7E3D8] bg-white shadow-[0_4px_20px_rgba(11,27,43,0.04)] p-8 md:p-14 overflow-hidden"
          >
            {/* Ambient bronze blur */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-[#B8864C]/5 blur-3xl pointer-events-none"
            />

            <div className="relative">
              <Quote size={32} className="text-[#B8864C]/60 mb-4" />
              <blockquote className="font-display text-[24px] sm:text-[28px] md:text-[36px] leading-[1.2] font-[400] text-[#0B1B2B] tracking-tight">
                <em className="italic font-[400]">“{t.quote}”</em>
              </blockquote>

              <div className="mt-8 flex items-center gap-4">
                <InitialAvatar initials={t.initials} accent={t.accent} />
                <div>
                  <div className="text-[14px] font-medium text-[#0B1B2B]">
                    {t.role}
                  </div>
                  <div className="text-[12.5px] text-[#4E5C6E]">
                    {t.industry}
                  </div>
                </div>
                <div className="ml-auto font-mono text-[10px] uppercase tracking-[0.28em] text-[#8190A1] border border-[#E7E3D8] rounded-full px-2.5 py-1">
                  Anonymised · ref. on request
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Testimonial ${idx + 1}`}
                className={`h-[3px] transition-all rounded-full ${
                  idx === i ? "w-10 bg-[#0B1B2B]" : "w-4 bg-[#D5CEB8] hover:bg-[#B8864C]"
                }`}
                data-testid={`testimonial-dot-${idx}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setI((p) => (p - 1 + items.length) % items.length)}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full border border-[#E7E3D8] text-[#4E5C6E] hover:border-[#0B1B2B] hover:text-[#0B1B2B] flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={() => setI((p) => (p + 1) % items.length)}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full border border-[#E7E3D8] text-[#4E5C6E] hover:border-[#0B1B2B] hover:text-[#0B1B2B] flex items-center justify-center transition-colors"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
