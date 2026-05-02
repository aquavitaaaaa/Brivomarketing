import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * HeroShowcase — Apple/Tesla-tier product hero.
 * A cinematic floating MacBook that auto-rotates through client-work screens,
 * with a companion iPhone mockup floating to its lower-left.
 *
 * The MacBook IS the product. The websites on screen ARE the work.
 */

const SCREENS = [
  { src: "/mockup-saas.jpg",       label: "SaaS dashboard" },
  { src: "/mockup-ecom.jpg",       label: "Luxury e-commerce" },
  { src: "/mockup-agency.jpg",     label: "Creative agency" },
  { src: "/mockup-restaurant.jpg", label: "Fine dining" },
];

const ROTATE_MS = 4200;

export default function HeroShowcase() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCREENS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hero-showcase" aria-hidden="true" data-testid="hero-showcase">
      {/* Ambient warm glow behind the devices */}
      <div className="hero-showcase-glow" />

      {/* ── MacBook ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        className="hero-macbook"
      >
        {/* Screen */}
        <div className="hero-macbook-screen">
          <div className="hero-macbook-bezel">
            <div className="hero-macbook-notch" />
            <div className="hero-macbook-display">
              <AnimatePresence mode="wait">
                <motion.img
                  key={SCREENS[idx].src}
                  src={SCREENS[idx].src}
                  alt=""
                  loading="eager"
                  decoding="async"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="hero-macbook-img"
                />
              </AnimatePresence>

              {/* Subtle screen reflection overlay */}
              <div className="hero-macbook-reflection" />
            </div>
          </div>
        </div>

        {/* Base / hinge */}
        <div className="hero-macbook-hinge" />
        <div className="hero-macbook-base" />
      </motion.div>

      {/* ── iPhone (companion device) ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
        className="hero-iphone"
      >
        <div className="hero-iphone-frame">
          <div className="hero-iphone-notch" />
          <img
            src="/mockup-mobile.jpg"
            alt=""
            loading="eager"
            decoding="async"
            className="hero-iphone-img"
          />
          <div className="hero-iphone-reflection" />
        </div>
      </motion.div>

      {/* Rotating dot indicator */}
      <div className="hero-showcase-dots" role="tablist" aria-label="Showcase slides">
        {SCREENS.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setIdx(i)}
            className={`hero-showcase-dot ${i === idx ? "is-active" : ""}`}
            aria-label={s.label}
            data-testid={`hero-showcase-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
