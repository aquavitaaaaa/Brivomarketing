import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * HeroShowcase — Apple/Tesla-tier product hero.
 *
 * The MacBook auto-rotates through real client work (Koa, KeeperCache,
 * InstaLease). The iPhone cycles through paired mobile captures of the
 * same sites — in lock-step with the laptop when available, otherwise
 * falls back to its own rotation.
 *
 * Zero URLs are rendered on the page. Labels are human-readable.
 */

const SCREENS = [
  { src: "/portfolio/koa-desktop.jpg",         mobileSrc: "/portfolio/koa-mobile.jpg",         label: "Outdoor hospitality · booking engine" },
  { src: "/portfolio/keepercache-desktop.jpg", mobileSrc: "/portfolio/keepercache-mobile.jpg", label: "Sports management OS" },
  { src: "/portfolio/instalease-desktop.jpg",  mobileSrc: "/portfolio/instalease-mobile.jpg",  label: "Premium commercial leasing" },
  { src: "/portfolio/sportbotai-desktop.jpg",  mobileSrc: "/portfolio/sportbotai-mobile.jpg",  label: "AI sports analytics" },
  { src: "/portfolio/lawyer-desktop.jpg",      mobileSrc: "/portfolio/lawyer-mobile.jpg",      label: "Legal operations OS" },
  { src: "/portfolio/ta-desktop.jpg",          mobileSrc: "/portfolio/ta-mobile.jpg",          label: "Education operating system" },
  { src: "/portfolio/loric-desktop.jpg",       mobileSrc: "/portfolio/loric-mobile.jpg",       label: "Applied AI platform" },
];

const ROTATE_MS = 4200;

export default function HeroShowcase() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCREENS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const current = SCREENS[idx];

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
                  key={current.src}
                  src={current.src}
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
          <AnimatePresence mode="wait">
            <motion.img
              key={current.mobileSrc}
              src={current.mobileSrc}
              alt=""
              loading="eager"
              decoding="async"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="hero-iphone-img"
            />
          </AnimatePresence>
          <div className="hero-iphone-reflection" />
        </div>
      </motion.div>

      {/* Rotating dot indicator */}
      <div className="hero-showcase-dots" role="tablist" aria-label="Showcase slides">
        {SCREENS.map((s, i) => (
          <button
            key={s.src + i}
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
