import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Discover & strategize",
    desc: "We begin with listening. A careful review of your business, customers, and market — translated into a focused plan with measurable goals.",
  },
  {
    n: "02",
    title: "Design & build",
    desc: "Our team designs, writes, and ships in tight feedback loops. Weekly reviews keep you close to the work at every stage.",
  },
  {
    n: "03",
    title: "Measure & compound",
    desc: "Launches are beginnings, not endings. We monitor, iterate, and lock in wins — turning your marketing into a long-term asset.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-[#FBFAF6] border-b border-[#E7E3D8]"
      data-testid="process-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-16 items-end">
        <div className="md:col-span-6">
          <span className="eyebrow-accent">How we work</span>
          <h2
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
            data-testid="process-title"
          >
            A simple three-step <em className="italic text-[#B8864C] font-[500]">partnership</em>.
          </h2>
        </div>
        <p className="md:col-span-5 md:col-start-8 text-[#4E5C6E] text-[17px] leading-relaxed">
          Transparent, collaborative, and designed to build long-term confidence. No surprises, no layered sign-offs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: i * 0.12 }}
            className="bg-white rounded-2xl border border-[#E7E3D8] p-8 md:p-10 card-lift"
            data-testid={`process-step-${i}`}
          >
            <div className="font-display text-[72px] md:text-[88px] font-[400] leading-none text-[#B8864C]/30 mb-6">
              {s.n}
            </div>
            <h3 className="font-display text-[24px] md:text-[28px] font-[500] text-[#0B1B2B] tracking-tight mb-4">
              {s.title}
            </h3>
            <p className="text-[#4E5C6E] text-[15px] leading-relaxed">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
