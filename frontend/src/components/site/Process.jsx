import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Audit & Strategy",
    desc: "Deep-dive into your funnel, competitors, and market gaps. We map every leak before we build.",
  },
  {
    n: "02",
    title: "Execute Relentlessly",
    desc: "Design, code, launch. Daily ops, weekly reporting, monthly performance reviews. No surprises.",
  },
  {
    n: "03",
    title: "Dominate the Market",
    desc: "Compound wins with creative testing, scaling channels, and locking in your category position.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-[#070707] border-y border-white/10"
      data-testid="process-section"
    >
      <div className="grid md:grid-cols-12 gap-8 mb-20">
        <div className="md:col-span-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Process
          </span>
        </div>
        <h2
          className="md:col-span-8 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
          data-testid="process-title"
        >
          Three moves.
          <br />
          Zero excuses.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
            className="bg-[#0A0A0A] p-8 md:p-12 relative"
            data-testid={`process-step-${i}`}
          >
            <div className="text-stroke font-display text-7xl md:text-9xl font-black leading-none mb-8">
              {s.n}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
              {s.title}
            </h3>
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
