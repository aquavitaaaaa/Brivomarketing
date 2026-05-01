import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import MagneticCta from "@/components/site/MagneticCta";
import { submitRoiLead } from "@/lib/api";

/**
 * RoiCalculator — interactive sliders that compute a projected lift.
 * Captures email at the end as a soft lead-gen.
 */
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
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/55">
          {label}
        </span>
        <span className="font-display text-2xl md:text-3xl font-black text-[#CCFF00]">
          {format(value)}
          {unit && <span className="text-base text-white/40 ml-1">{unit}</span>}
        </span>
      </div>
      <div className="relative h-2 bg-white/[0.06] rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#CCFF00] to-[#9CCC00] rounded-full"
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
      toast.success("Audit queued — we'll be in touch within 48h.");
    } catch (err) {
      const d = err?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="roi"
      className="px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-[#0B0B0F] relative overflow-hidden"
      data-testid="roi-section"
    >
      <div className="absolute -top-40 right-[-10%] w-[800px] h-[800px] rounded-full bg-[#CCFF00]/[0.05] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[700px] h-[700px] rounded-full bg-[#6F4FFF]/[0.10] blur-[140px] pointer-events-none" />

      <div className="relative grid md:grid-cols-12 gap-8 mb-12 md:mb-16 items-end">
        <div className="md:col-span-7">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
            / Free Audit
          </span>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter"
          >
            Your potential
            <br />
            <span className="text-[#CCFF00]">lift, calculated.</span>
          </motion.h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-white/60 text-base leading-relaxed">
          Slide your numbers. We'll show what scaling to a 5.8x ROAS could mean
          for your top-line.
        </p>
      </div>

      <div className="relative grid lg:grid-cols-12 gap-px bg-white/8 border border-white/10">
        {/* Sliders */}
        <div className="lg:col-span-7 bg-[#13131C] p-8 md:p-12 space-y-10">
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

          <div className="flex items-start gap-3 pt-4 border-t border-white/8">
            <Sparkles size={16} className="text-[#CCFF00] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">
              Projection assumes scaling to Brivo's portfolio benchmark of
              <span className="text-[#CCFF00]"> 5.8x ROAS</span>. Actual results
              vary by vertical, offer, and creative quality.
            </p>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-[#CCFF00] to-[#9CCC00] text-black p-8 md:p-12 flex flex-col justify-between min-h-[480px] overflow-hidden">
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative">
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/70">
              Projected Lift / Year
            </span>
            <motion.div
              key={lift}
              initial={{ scale: 0.96, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="mt-5 font-display font-black text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] leading-none"
            >
              +{fmtMoney(lift)}
            </motion.div>
            <div className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-black/65">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              {liftPct}% revenue uplift
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-black/55">
              When scaled to 5.8x ROAS · Brivo benchmark
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="relative mt-6">
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/65">
                Send me the full audit →
              </label>
              <div className="mt-2 flex bg-[#0B0B0F] border-2 border-black">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@brand.com"
                  className="flex-1 bg-transparent text-white px-4 py-3.5 placeholder-white/40 focus:outline-none font-mono text-sm cursor-target"
                  data-testid="roi-email"
                />
                <MagneticCta strength={0.2}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#CCFF00] text-black px-5 py-3.5 hover:bg-white transition-colors flex items-center gap-1 font-mono text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-60"
                    data-testid="roi-submit"
                  >
                    {submitting ? "Sending" : "Send"} <ChevronRight size={14} />
                  </button>
                </MagneticCta>
              </div>
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.25em] text-black/55">
                No spam. Audit lands in your inbox within 48h.
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-6 bg-black text-[#CCFF00] p-5"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-2">
                ✓ Audit queued
              </div>
              <div className="font-display text-lg font-bold">
                Check {email} — we'll be in touch within 48 hours.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
