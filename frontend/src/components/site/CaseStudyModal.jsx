import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import MagneticCta from "@/components/site/MagneticCta";

/**
 * CaseStudyModal — sleek modal that opens from a portfolio card.
 * Shows hero image, KPI grid, narrative, testimonial, CTA.
 */
export default function CaseStudyModal({ open, project, onClose, onCTA }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl bg-[#13131C] border border-white/10 rounded-2xl overflow-hidden my-auto shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-colors cursor-target"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Hero image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={project.img}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13131C] via-[#13131C]/40 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2 bg-[#CCFF00] text-black font-mono text-[10px] uppercase tracking-[0.25em] font-bold px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Case Study
              </div>
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">
                  {project.cat}
                </span>
                <h3 className="mt-2 font-display text-3xl md:text-5xl font-black uppercase tracking-[-0.03em]">
                  {project.title}
                </h3>
                <div className="mt-3 inline-flex items-center gap-2 bg-black/60 border border-[#CCFF00]/30 px-3 py-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
                    Headline result
                  </span>
                  <span className="font-mono text-xs text-[#CCFF00] font-bold">
                    {project.metric}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-10">
              {/* KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {(project.kpis || []).map((k, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="border border-white/10 p-5 hover:border-[#CCFF00]/40 transition-colors"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
                      {k.label}
                    </div>
                    <div className="mt-2 font-display text-2xl md:text-3xl font-black text-[#CCFF00] leading-none">
                      {k.value}
                    </div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {k.note}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              {project.desc && (
                <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-3xl">
                  {project.desc}
                </p>
              )}

              {/* Quote */}
              {project.quote && (
                <div className="mt-10 p-6 md:p-8 border-l-2 border-[#CCFF00] bg-white/[0.03]">
                  <div className="text-[#CCFF00] font-display text-3xl leading-none mb-2">“</div>
                  <p className="font-display text-lg md:text-xl italic leading-snug">
                    {project.quote}
                  </p>
                  <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                    — {project.author}
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3 items-center justify-between">
                <MagneticCta>
                  <button
                    onClick={() => {
                      onCTA?.(project.title);
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-6 py-3.5 accent-glow cursor-target"
                  >
                    Start a similar project
                    <ArrowUpRight size={14} />
                  </button>
                </MagneticCta>
                <button
                  onClick={onClose}
                  className="font-mono text-xs uppercase tracking-[0.25em] text-white/45 hover:text-white transition-colors cursor-target"
                >
                  Close —
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
