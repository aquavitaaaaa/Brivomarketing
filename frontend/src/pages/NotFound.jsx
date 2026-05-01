import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#CCFF00]/[0.10] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] rounded-full bg-[#6F4FFF]/[0.15] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-[#CCFF00]/50 mb-8"
          style={{
            boxShadow:
              "0 0 0 1px rgba(204,255,0,0.3), 0 0 60px rgba(204,255,0,0.4)",
          }}
        >
          <img
            src="/owl-logo.jpg"
            alt="Brivo owl"
            className="w-full h-full object-cover"
          />
        </div>

        <span className="font-mono text-xs uppercase tracking-[0.4em] text-[#CCFF00]">
          / 404 · Off the radar
        </span>

        <h1 className="mt-6 font-display text-7xl md:text-9xl font-black uppercase leading-none tracking-[-0.04em]">
          Lost in
          <br />
          the <span className="text-[#CCFF00]">noise.</span>
        </h1>

        <p className="mt-6 max-w-md mx-auto text-white/55 leading-relaxed">
          Even our owl doesn't see this one. Let's get you back to signal.
        </p>

        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-8 py-4 accent-glow cursor-target"
        >
          Back to base
          <ArrowUpRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
