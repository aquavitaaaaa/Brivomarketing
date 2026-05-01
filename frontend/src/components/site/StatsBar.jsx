import { motion } from "framer-motion";

const stats = [
  { num: "$120M+", label: "Revenue generated for clients" },
  { num: "180+", label: "Brands scaled" },
  { num: "4.2x", label: "Average ROAS" },
  { num: "27", label: "Industries dominated" },
];

export default function StatsBar() {
  return (
    <section
      className="px-6 md:px-12 lg:px-24 py-16 md:py-20 border-b border-white/10"
      data-testid="stats-bar"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="border-l border-white/10 pl-5"
            data-testid={`stat-${i}`}
          >
            <div className="font-mono text-4xl md:text-5xl font-bold text-white tracking-tight">
              {s.num}
            </div>
            <div className="mt-3 text-xs md:text-sm text-white/60 uppercase tracking-wider">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
