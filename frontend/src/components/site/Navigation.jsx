import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Insights", href: "#insights" },
];

export default function Navigation({ onCTA }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-2xl border-b border-white/10"
          : "bg-transparent"
      }`}
      data-testid="main-nav"
    >
      <div className="px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-3 h-3 bg-[#CCFF00] rotate-45" />
          <span className="font-display text-xl font-black tracking-tighter uppercase">
            BRIVO
          </span>
        </a>

        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white link-underline transition-colors"
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCTA}
            className="hidden md:inline-flex bg-[#CCFF00] text-black font-mono text-xs uppercase tracking-[0.2em] font-bold px-6 py-3 accent-glow"
            data-testid="nav-cta-start-project"
          >
            Start a Project
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white"
            aria-label="menu"
            data-testid="mobile-menu-toggle"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-2xl px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-mono text-xs uppercase tracking-[0.2em] text-white/80"
              data-testid={`mobile-nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onCTA();
            }}
            className="bg-[#CCFF00] text-black font-mono text-xs uppercase tracking-[0.2em] font-bold px-6 py-3 mt-2"
            data-testid="mobile-cta-start-project"
          >
            Start a Project
          </button>
        </div>
      )}
    </motion.nav>
  );
}
