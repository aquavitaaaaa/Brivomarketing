import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "@/components/site/Logo";

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
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBFAF6]/90 backdrop-blur-xl border-b border-[#E7E3D8]"
          : "bg-transparent"
      }`}
      data-testid="main-nav"
    >
      <div className="px-6 md:px-10 lg:px-16 h-20 flex items-center justify-between">
        <a href="#top" data-testid="brand-logo">
          <Logo size={36} />
        </a>

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[14px] text-[#0B1B2B]/75 hover:text-[#0B1B2B] link-underline transition-colors"
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCTA}
            className="hidden md:inline-flex items-center gap-2 bg-[#0B1B2B] text-white text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-[#14283F] transition-all"
            data-testid="nav-cta-start-project"
          >
            Start a project
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-[#0B1B2B]"
            aria-label="menu"
            data-testid="mobile-menu-toggle"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#E7E3D8] bg-[#FBFAF6] px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[15px] text-[#0B1B2B]/80"
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
            className="bg-[#0B1B2B] text-white text-[13px] font-medium px-6 py-3 rounded-full mt-2 inline-flex items-center justify-center gap-2"
            data-testid="mobile-cta-start-project"
          >
            Start a project <ArrowRight size={14} />
          </button>
        </div>
      )}
    </motion.nav>
  );
}
