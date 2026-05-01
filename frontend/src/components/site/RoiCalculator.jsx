import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { submitRoiLead } from "@/lib/api";

const BRIVO_TARGET_ROAS = 5.8;

function fmtMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function Slider({ label, value, setValue, min, max, step, format, unit }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[11px] tracking-[0.18em] uppercase text-[#8190A1] font-medium">
          {label}
        </span>
        <span className="font-display text-[26px] md:text-[30px] font-[500] text-[#0B1B2B]">
          {format(value)}
          {unit && <span className="text-base text-[#8190A1] ml-1">{unit}</span>}
        </span>
      </div>
      <div className="relative h-2 bg-[#F3F1EA] rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B8864C] to-[#8E6535] rounded-full"
          style={{ width: pct + "%" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer roi-slider"
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default function RoiCalculator() {
  const [revenue, setRevenue] = useState(2_000_000);
  const [roas, setRoas] = useState(2.5);
  const [spend, setSpend] = useState(40_000);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const lift = useMemo(() => {
    const newAnnual = spend * 12 * BRIVO_TARGET_ROAS;
    const oldAnnual = spend * 12 * roas;
    return Math.max(0, newAnnual - oldAnnual);
  }, [roas, spend]);

  const liftPct = useMemo(() => {
    if (revenue === 0) return 0;
    return Math.round((lift / revenue) * 100);
  }, [lift, revenue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitRoiLead({ email, revenue, roas, spend, lift });
      setSubmitted(true);
      toast.success("Audit queued — we'll be in touch within 48 hours.");
    } catch (err) {
      const d = err?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="roi"
      className="px-6 md:px-10 lg:px-16 py-24 md:py-32 bg-[#FBFAF6] border-b border-[#E7E3D8]"
      data-testid="roi-section"
    >
      <div className="grid md:grid-cols-12 gap-10 mb-14 items-end">
        <div className="md:col-span-7">
          <span className="eyebrow-accent">Complimentary audit</span>
          <motion.h2
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-5 font-display text-4xl sm:text-5xl md:text-[56px] font-[400] text-[#0B1B2B] leading-[1.08] tracking-tight"
          >
            Your potential, <em className="italic text-[#B8864C] font-[500]">in numbers.</em>
          </motion.h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-[#4E5C6E] text-[16px] leading-relaxed">
          A quick projection of what scaling to a 5.8x ROAS could mean for your top-line. No obligation.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden border border-[#E7E3D8] bg-white">
        {/* Sliders */}
        <div className="lg:col-span-7 p-8 md:p-12 space-y-10">
          <Slider
            label="Annual Revenue"
            value={revenue}
            setValue={setRevenue}
            min={100_000}
            max={50_000_000}
            step={50_000}
            format={fmtMoney}
          />
          <Slider
            label="Current ROAS"
            value={roas}
            setValue={setRoas}
            min={0.5}
            max={5.5}
            step={0.1}
            format={(v) => v.toFixed(1)}
            unit="x"
          />
          <Slider
            label="Monthly Ad Spend"
            value={spend}
            setValue={setSpend}
            min={1000}
            max={1_000_000}
            step={1000}
            format={fmtMoney}
          />

          <div className="flex items-start gap-3 pt-6 border-t border-[#EFECE3]">
            <Sparkles size={16} className="text-[#B8864C] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#8190A1] leading-relaxed">
              Projection assumes scaling to our portfolio benchmark of
              <span className="text-[#0B1B2B] font-medium"> 5.8x ROAS</span>. Actual results vary by vertical, offer, and creative quality.
            </p>
          </div>
        </div>

        {/* Result panel — navy */}
        <div className="lg:col-span-5 relative bg-[#0B1B2B] text-white p-8 md:p-12 flex flex-col justify-between min-h-[500px] overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#B8864C]/15 blur-[120px]" />

          <div className="relative">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#B8864C]">
              Projected lift · per year
            </span>
            <motion.div
              key={lift}
              initial={{ scale: 0.96, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-5 font-display font-[500] text-[56px] md:text-[72px] tracking-tight leading-none"
            >
              +{fmtMoney(lift)}
            </motion.div>
            <div className="mt-4 inline-flex items-center gap-2 text-[12px] tracking-wider text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8864C]" />
              {liftPct}% revenue uplift
            </div>
            <div className="mt-2 text-[12px] text-white/45">
              When scaled to 5.8x ROAS benchmark
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="relative mt-8">
              <label className="text-[11px] tracking-[0.18em] uppercase text-white/55">
                Get the full audit
              </label>
              <div className="mt-3 flex bg-white/5 border border-white/15 rounded-full overflow-hidden">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent text-white px-5 py-3.5 placeholder-white/40 focus:outline-none text-[14px]"
                  data-testid="roi-email"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#B8864C] text-white px-6 py-3.5 hover:bg-[#8E6535] transition-colors flex items-center gap-1 text-[13px] font-medium disabled:opacity-60"
                  data-testid="roi-submit"
                >
                  {submitting ? "Sending" : "Send"} <ChevronRight size={14} />
                </button>
              </div>
              <div className="mt-3 text-[11px] text-white/40">
                No spam. Audit arrives in your inbox within 48 hours.
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-8 bg-white/5 border border-[#B8864C]/40 p-5 rounded-xl"
            >
              <div className="text-[11px] tracking-[0.2em] uppercase text-[#B8864C] mb-2">
                ✓ Audit queued
              </div>
              <div className="font-display text-[17px] font-[500]">
                Check {email} — we&apos;ll be in touch within 48 hours.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
