import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export default function CountUp({ to, duration = 2, prefix = "", suffix = "", className = "" }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (Number.isInteger(to)) return Math.round(v).toLocaleString();
    return v.toFixed(1);
  });

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [to, duration]);

  return (
    <span className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
