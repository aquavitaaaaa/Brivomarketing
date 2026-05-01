import { motion } from "framer-motion";
import CountUp from "@/components/site/CountUp";

const stats = [
  { prefix: "$", to: 120, suffix: "M+", label: "Revenue generated for clients" },
  { to: 180, suffix: "+", label: "Brands scaled" },
  { to: 4.2, suffix: "x", label: "Average ROAS delivered" },
  { to: 27, label: "Industries dominated" },
];

export default function StatsBar() {
  return (
    <section
      className="relative px-6 md:px-12 lg:px-24 py-16 md:py-24 border-b border-white/10 overflow-hidden bg-[#0E0E14]"
      data-testid="stats-bar"
    >
      <div className="absolute inset-y-0 right-0 w-1/2 gradient-mesh-soft pointer-events-none" />
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="border-l border-white/10 pl-5 md:pl-6 group"
            data-testid={`stat-${i}`}
          >
            <div className="font-mono text-4xl md:text-6xl font-bold text-white tracking-tight group-hover:text-[#CCFF00] transition-colors">
              <CountUp
                to={s.to}
                prefix={s.prefix || ""}
                suffix={s.suffix || ""}
                duration={2.2}
              />
            </div>
            <div className="mt-3 text-xs md:text-sm text-white/55 uppercase tracking-wider max-w-[200px]">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
