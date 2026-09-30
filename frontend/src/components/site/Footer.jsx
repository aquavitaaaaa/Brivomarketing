import { motion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Twitter, Dribbble } from "lucide-react";
import Logo from "@/components/site/Logo";

export default function Footer({ onCTA }) {
  return (
    <footer
      className="relative bg-[#0B1B2B] text-white px-6 md:px-10 lg:px-16 pt-24 md:pt-28 pb-10 overflow-hidden"
      data-testid="footer"
    >
      {/* soft aura */}
      <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-[#B8864C]/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-12 gap-10 mb-20">
        <div className="md:col-span-8">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#B8864C]">
            Get in touch
          </span>
          <motion.h2
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-5 font-display text-[44px] sm:text-[60px] md:text-[80px] font-[400] leading-[1.02] tracking-tight"
            data-testid="footer-cta-title"
          >
            Let&apos;s build something
            <br />
            <em className="italic text-[#B8864C] font-[500]">worth remembering.</em>
          </motion.h2>
        </div>
        <div className="md:col-span-4 flex md:items-end">
          <button
            onClick={onCTA}
            className="group inline-flex items-center gap-2 bg-[#B8864C] text-white rounded-full px-7 py-4 text-[14px] font-medium hover:bg-[#8E6535] transition-all"
            data-testid="footer-cta"
          >
            Start a project
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="relative z-10 grid md:grid-cols-12 gap-10 pt-12 border-t border-white/10">
        <div className="md:col-span-4">
          <Logo size={40} mono />
          <p className="mt-5 text-white/60 text-[14px] max-w-xs leading-relaxed">
            A modern performance studio for established brands. Web, marketing, and measurement under one roof.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="text-[11px] tracking-[0.2em] uppercase text-white/45 mb-4">
            Studio
          </div>
          <ul className="space-y-3 text-[14px] text-white/80">
            <li><a className="link-underline" href="#services">Services</a></li>
            <li><a className="link-underline" href="#work">Work</a></li>
            <li><a className="link-underline" href="#process">Process</a></li>
            <li><a className="link-underline" href="#pricing">Pricing</a></li>
            <li><a className="link-underline" href="/web-design/home-service-contractors" data-testid="footer-industry-contractors">Web design for contractors</a></li>
            <li><a className="link-underline" href="/web-design/restaurants" data-testid="footer-industry-restaurants">Restaurant web design</a></li>
            <li><a className="link-underline" href="/work/dwj-home-services" data-testid="footer-case-dwj">DWJ case study</a></li>
            <li><a className="link-underline" href="/work/loba-catskill-restaurant" data-testid="footer-case-loba">LOBA case study</a></li>
            <li><a className="link-underline" href="/brand-kit" data-testid="footer-brand-kit-link">Brand kit</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="text-[11px] tracking-[0.2em] uppercase text-white/45 mb-4">
            Contact
          </div>
          <a
            href="mailto:hello@brivomarketing.com"
            className="block font-display text-[20px] md:text-[22px] font-[500] link-underline hover:text-[#B8864C] transition-colors"
            data-testid="footer-email"
          >
            hello@brivomarketing.com
          </a>
          <p className="mt-3 text-white/55 text-[13px]">Worldwide · EST time zone</p>
        </div>

        <div className="md:col-span-3">
          <div className="text-[11px] tracking-[0.2em] uppercase text-white/45 mb-4">
            Connect
          </div>
          <ul className="space-y-3 text-[14px] text-white/80">
            <li>
              <a
                href="https://www.instagram.com/brivomarketing/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 link-underline hover:text-[#D4A971] transition-colors"
                data-testid="footer-instagram"
              >
                <Instagram size={15} />
                @brivomarketing
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 link-underline hover:text-[#D4A971] transition-colors"
              >
                <Linkedin size={15} />
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 link-underline hover:text-[#D4A971] transition-colors"
              >
                <Twitter size={15} />
                X · Twitter
              </a>
            </li>
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 link-underline hover:text-[#D4A971] transition-colors"
              >
                <Dribbble size={15} />
                Dribbble
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 mt-16 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4 text-[12px] text-white/45">
        <span>© 2026 BrivoMarketing — All rights reserved</span>
        <span>Designed and engineered with care.</span>
      </div>
    </footer>
  );
}
