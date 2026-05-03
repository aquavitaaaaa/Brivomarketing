import { motion } from "framer-motion";
import { Check, Clock, ArrowUpRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Discover & strategize",
    duration: "Week 1–2",
    desc:
      "We begin with listening. Stakeholder interviews, a teardown of what's working (and what isn't), and a sharp plan written in plain English.",
    deliverables: [
      "Brand, audience & competitor audit",
      "Measurable 90-day growth plan",
      "A signed statement of work — no surprises",
    ],
    outcome: "A roadmap your whole team can point to.",
  },
  {
    n: "02",
    title: "Design & build",
    duration: "Week 3–8",
    desc:
      "Senior designers and engineers ship in tight weekly loops. You see the work as it breathes — not a black box with a big reveal.",
    deliverables: [
      "Custom design system, shipped to code",
      "Headless build with CMS & analytics wired",
      "Conversion instrumentation from day one",
    ],
    outcome: "A website your competitors will screenshot.",
  },
  {
    n: "03",
    title: "Measure & compound",
    duration: "Ongoing",
    desc:
      "Launch is not the finish line — it's the baseline. We monitor, A/B, and lock in wins while the rest of the internet is still debating.",
    deliverables: [
      "Monthly growth review with named lead",
      "Funnel A/B tests & creative refresh cadence",
      "SEO & programmatic content engine",
    ],
    outcome: "A channel that compounds quarter over quarter.",
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
          Transparent, collaborative, and designed to build long-term confidence.
          No surprises, no layered sign-offs, no account managers forwarding your
          emails to a pool of freelancers.
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
            className="group relative bg-white rounded-2xl border border-[#E7E3D8] p-8 md:p-10 card-lift flex flex-col overflow-hidden"
            data-testid={`process-step-${i}`}
          >
            {/* Ambient accent corner */}
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#B8864C]/5 blur-2xl pointer-events-none"
            />

            {/* Step number + duration badge */}
            <div className="relative flex items-start justify-between gap-4 mb-6">
              <div className="font-display text-[72px] md:text-[88px] font-[400] leading-none text-[#B8864C]/30">
                {s.n}
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.24em] text-[#B8864C] border border-[#E7E3D8] bg-[#FBFAF6] rounded-full px-2.5 py-1">
                <Clock size={11} /> {s.duration}
              </span>
            </div>

            <h3 className="font-display text-[24px] md:text-[28px] font-[500] text-[#0B1B2B] tracking-tight mb-3">
              {s.title}
            </h3>
            <p className="text-[#4E5C6E] text-[15px] leading-relaxed">
              {s.desc}
            </p>

            {/* Deliverables list */}
            <ul className="mt-6 space-y-2.5">
              {s.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-[13.5px] text-[#0B1B2B]">
                  <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0B1B2B] text-white shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className="leading-snug">{d}</span>
                </li>
              ))}
            </ul>

            {/* Outcome footer */}
            <div className="mt-auto pt-6">
              <div className="h-px w-full bg-[#F0ECE0] mb-4" />
              <div className="flex items-start gap-2">
                <ArrowUpRight size={15} className="mt-0.5 text-[#B8864C] shrink-0" />
                <div className="text-[13px] font-[500] text-[#0B1B2B] leading-snug">
                  {s.outcome}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom reassurance strip */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] text-[#4E5C6E]">
        {[
          "Named senior lead on every engagement",
          "Weekly reviews — never skipped",
          "Fixed fee · fixed timeline · zero scope-creep theatrics",
        ].map((s) => (
          <div key={s} className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#B8864C]" />
            {s}
          </div>
        ))}
      </div>
    </section>
  );
}
