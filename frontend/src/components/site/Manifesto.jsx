import { motion } from "framer-motion";

/**
 * Manifesto — editorial, NYT Magazine-tier bold positioning essay.
 * Cream background, Fraunces serif, huge type, surgical italics.
 */

export default function Manifesto() {
  return (
    <section id="manifesto" className="relative bg-[#FBFAF6] py-28 md:py-40 overflow-hidden" data-testid="manifesto-section">
      {/* Editorial margin rule */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-[#D4A971]" />

      <div className="max-w-[1080px] mx-auto px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="eyebrow-accent mb-10 md:mb-14"
        >
          A MANIFESTO · EST. 2019
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-[400] leading-[1.08] tracking-[-0.022em] text-[#0B1B2B] text-[clamp(2.2rem,5.2vw,4.6rem)]"
        >
          Most agencies sell{" "}
          <em className="italic text-[#B8864C]">output.</em>
          <br />
          We sell{" "}
          <em className="italic text-[#B8864C]">outcomes.</em>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="mt-14 md:mt-20 max-w-[680px] mx-auto text-left space-y-6 text-[#2A394C] font-[300] text-[19px] md:text-[22px] leading-[1.65]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          <p>
            The industry is full of shops that will ship you a deck,
            a press release, and a founder-feature on some Substack no one reads.
          </p>
          <p>
            <span className="font-[500] text-[#0B1B2B]">We don't do that.</span>{" "}
            We ship websites that your CFO can point to on a P&L.
            We build marketing systems your Head of Sales can't live without.
            We instrument every dollar, every click, every millisecond of page load —
            and we report the number, not the activity.
          </p>
          <p>
            If your current agency can't tell you,
            to the cent, <em className="italic text-[#B8864C]">exactly</em> what last month's retainer returned —
            they aren't your agency. They're a subscription.
          </p>
          <p className="text-[#0B1B2B] font-[500] pt-2">
            Brivo is a performance studio.{" "}
            <span className="italic text-[#B8864C]">We ship the number.</span>
          </p>
        </motion.div>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 flex flex-col items-center gap-3"
        >
          <div className="font-display italic text-[32px] md:text-[42px] font-[400] text-[#B8864C]" style={{ fontFamily: "'Fraunces', serif" }}>
            — The Brivo Studio
          </div>
          <div className="w-14 h-px bg-[#D4A971]" />
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#8190A1]">
            Partner-led · Senior-only · Outcome-guaranteed
          </div>
        </motion.div>
      </div>
    </section>
  );
}
