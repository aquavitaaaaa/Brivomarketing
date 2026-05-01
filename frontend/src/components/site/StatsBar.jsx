import { motion } from "framer-motion";
import CountUp from "@/components/site/CountUp";

const stats = [
  { prefix: "$", to: 120, suffix: "M+", label: "Revenue generated for clients" },
  { to: 180, suffix: "+", label: "Brands partnered with" },
  { to: 4.2, suffix: "x", label: "Average return on ad spend" },
  { to: 27, label: "Industries served worldwide" },
];

export default function StatsBar() {
  return (
    <section
      className="relative px-6 md:px-10 lg:px-16 py-20 md:py-28 border-b border-[#E7E3D8] bg-[#FBFAF6]"
      data-testid="stats-bar"
    >
      <div className="max-w-3xl mb-14">
        <span className="eyebrow-accent">By the numbers</span>
        <h2 className="mt-5 font-display text-3xl md:text-[42px] leading-[1.1] font-[400] text-[#0B1B2B] tracking-tight">
          A decade of measurable growth, across industries.
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-10 md:gap-x-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="border-t border-[#0B1B2B] pt-6"
            data-testid={`stat-${i}`}
          >
            <div className="font-display text-[42px] md:text-[56px] font-[500] text-[#0B1B2B] tracking-tight leading-none">
              <CountUp
                to={s.to}
                prefix={s.prefix || ""}
                suffix={s.suffix || ""}
                duration={2.2}
              />
            </div>
            <div className="mt-4 text-sm text-[#4E5C6E] leading-relaxed max-w-[220px]">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
