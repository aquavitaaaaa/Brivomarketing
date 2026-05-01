import { motion } from "framer-motion";

/**
 * ScrollReveal — fade-up + stagger wrapper for any section content.
 * Usage:
 *   <ScrollReveal><h2>Title</h2></ScrollReveal>
 *   <ScrollReveal delay={0.1} y={40}>...</ScrollReveal>
 */
export default function ScrollReveal({
  children,
  delay = 0,
  y = 30,
  duration = 0.7,
  once = true,
  className = "",
  as = "div",
}) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}
