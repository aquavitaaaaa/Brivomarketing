import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Footer({ onCTA }) {
  return (
    <footer
      className="relative bg-[#050505] border-t border-white/10 px-6 md:px-12 lg:px-24 pt-24 md:pt-32 pb-12 grain overflow-hidden"
      data-testid="footer"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(204,255,0,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-12 gap-10 mb-20">
        <div className="md:col-span-8">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Let's Build
          </span>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-6 font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-[-0.05em]"
            data-testid="footer-cta-title"
          >
            Ready to
            <br />
            <span className="text-[#CCFF00]">scale?</span>
          </motion.h2>
        </div>
        <div className="md:col-span-4 flex md:items-end">
          <button
            onClick={onCTA}
            className="group inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold px-8 py-5 accent-glow"
            data-testid="footer-cta"
          >
            Start a Project
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>

      <div className="relative z-10 grid md:grid-cols-12 gap-10 pt-12 border-t border-white/10">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#CCFF00] rotate-45" />
            <span className="font-display text-xl font-black tracking-tighter uppercase">
              BRIVO
            </span>
          </div>
          <p className="mt-5 text-white/60 text-sm max-w-xs leading-relaxed">
            A high-performance digital marketing & web design agency. Built for
            founders who refuse average.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">
            Studio
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li><a className="link-underline" href="#services">Services</a></li>
            <li><a className="link-underline" href="#work">Work</a></li>
            <li><a className="link-underline" href="#process">Process</a></li>
            <li><a className="link-underline" href="#pricing">Pricing</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">
            Contact
          </div>
          <a
            href="mailto:hello@brivomarketing.com"
            className="block font-display text-xl md:text-2xl font-bold link-underline hover:text-[#CCFF00] transition-colors"
            data-testid="footer-email"
          >
            hello@brivomarketing.com
          </a>
          <p className="mt-3 text-white/50 text-sm">Worldwide • EST time zone</p>
        </div>

        <div className="md:col-span-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">
            Social
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li><a className="link-underline" href="#">Instagram</a></li>
            <li><a className="link-underline" href="#">LinkedIn</a></li>
            <li><a className="link-underline" href="#">X / Twitter</a></li>
            <li><a className="link-underline" href="#">Dribbble</a></li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 mt-16 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        <span>© 2026 Brivo Marketing — All rights reserved</span>
        <span>Crafted with obsession</span>
      </div>
    </footer>
  );
}
