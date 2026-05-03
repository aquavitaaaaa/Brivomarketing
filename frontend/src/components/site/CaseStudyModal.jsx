import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useEffect } from "react";

/**
 * CaseStudyModal — elegant light-theme modal for in-depth case studies.
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
          className="fixed inset-0 z-[100] bg-[#0B1B2B]/45 backdrop-blur-md flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl bg-white border border-[#E7E3D8] rounded-3xl overflow-hidden my-auto"
            style={{ boxShadow: "0 40px 100px -20px rgba(11,27,43,0.35)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white border border-[#E7E3D8] flex items-center justify-center text-[#0B1B2B] hover:bg-[#0B1B2B] hover:text-white hover:border-[#0B1B2B] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Hero image */}
            <div className="relative aspect-[16/9] overflow-hidden bg-[#FBFAF6]">
              <img
                src={project.img}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2B]/75 via-[#0B1B2B]/15 to-transparent" />
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-white/95 text-[#0B1B2B] rounded-full px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8864C]" />
                Case study
              </div>
              <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                <span className="text-[11px] tracking-[0.22em] uppercase text-white/80">
                  {project.cat}
                </span>
                <h3 className="mt-2 font-display text-[28px] md:text-[44px] font-[500] tracking-tight leading-tight">
                  {project.title}
                </h3>
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1.5">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-white/70">
                    Headline result
                  </span>
                  <span className="text-[13px] text-[#B8864C] font-semibold">
                    {project.metric}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-10">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {(project.kpis || []).map((k, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="rounded-xl border border-[#E7E3D8] p-5 bg-[#FBFAF6]"
                  >
                    <div className="text-[10px] tracking-[0.18em] uppercase text-[#8190A1]">
                      {k.label}
                    </div>
                    <div className="mt-2 font-display text-[24px] md:text-[28px] font-[500] text-[#B8864C] leading-none">
                      {k.value}
                    </div>
                    <div className="mt-2 text-[11px] tracking-wider text-[#8190A1]">
                      {k.note}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Description */}
              {project.desc && (
                <p className="text-[#4E5C6E] text-[16px] md:text-[17px] leading-[1.7] max-w-3xl">
                  {project.desc}
                </p>
              )}

              {/* Summary — short editorial line, rendered when no testimonial quote exists */}
              {project.summary && !project.quote && (
                <div className="mt-8 p-6 md:p-8 border-l-4 border-[#B8864C] bg-[#FBFAF6] rounded-r-xl">
                  <p className="font-display text-[20px] md:text-[24px] italic font-[400] leading-snug text-[#0B1B2B]">
                    {project.summary}
                  </p>
                </div>
              )}

              {/* Quote */}
              {project.quote && (
                <div className="mt-10 p-6 md:p-8 border-l-4 border-[#B8864C] bg-[#FBFAF6] rounded-r-xl">
                  <div className="text-[#B8864C] font-display text-[36px] leading-none mb-2">“</div>
                  <p className="font-display text-[20px] md:text-[24px] italic font-[400] leading-snug text-[#0B1B2B]">
                    {project.quote}
                  </p>
                  <div className="mt-4 text-[11px] tracking-[0.22em] uppercase text-[#8190A1]">
                    — {project.author}
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-3 items-center justify-between">
                <button
                  onClick={() => {
                    onCTA?.(project.title);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full text-[14px] font-medium px-7 py-3.5 hover:bg-[#14283F] transition-all"
                >
                  Start a similar project
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={onClose}
                  className="text-[13px] text-[#8190A1] hover:text-[#0B1B2B] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
