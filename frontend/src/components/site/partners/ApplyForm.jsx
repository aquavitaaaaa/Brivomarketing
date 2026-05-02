import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitAffiliateApplication } from "@/lib/api";

const labelCls = "text-[11px] tracking-[0.18em] uppercase text-[#8190A1] font-medium";
const inputCls =
  "bg-white border border-[#E7E3D8] rounded-lg h-11 focus-visible:ring-[#B8864C] focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-[#B8864C] text-[#0B1B2B] placeholder:text-[#B6BDC7]";

const INITIAL = {
  name: "",
  email: "",
  phone: "",
  location: "",
  experience: "",
  channels: "",
  audience_size: "",
  portfolio_url: "",
  expected_clients_per_month: "",
  why_join: "",
  referral_source: "",
};

export default function ApplyForm() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.why_join) {
      toast.error("Please fill in name, email, and why you want to join.");
      return;
    }
    setLoading(true);
    try {
      await submitAffiliateApplication(form);
      setSubmitted(true);
      toast.success("Application received. We'll be in touch within 48 hours.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Submission failed. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="apply" className="bg-[#0B1B2B] text-white py-28 px-6 md:px-10 lg:px-16">
        <div className="max-w-[640px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8C28A]/20 border border-[#E8C28A] flex items-center justify-center mx-auto mb-7">
            <CheckCircle2 size={28} className="text-[#E8C28A]" />
          </div>
          <h2 className="font-display text-[40px] md:text-[52px] tracking-tight">
            You&rsquo;re in the pile.
          </h2>
          <p className="text-white/70 mt-4 leading-relaxed">
            We review every application personally. Expect to hear from a senior strategist within 48 hours with your private referral link and a co-branded pitch kit.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="apply" className="bg-[#0B1B2B] text-white py-24 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#E8C28A] font-medium">
            Apply now
          </span>
          <h2 className="font-display text-[40px] md:text-[58px] leading-[1.02] tracking-tight mt-3">
            Become a Brivo Partner.
          </h2>
          <p className="text-white/65 max-w-[620px] mx-auto mt-4">
            Tell us a bit about you. Strong applicants get a private link and a co-branded sales kit within 48 hours.
          </p>
        </div>

        <form
          onSubmit={submit}
          data-testid="partner-apply-form"
          className="bg-white text-[#0B1B2B] rounded-2xl p-7 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <Field label="Full name *">
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jane Doe"
              className={inputCls}
              data-testid="apply-name"
              required
            />
          </Field>

          <Field label="Email *">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="jane@network.com"
              className={inputCls}
              data-testid="apply-email"
              required
            />
          </Field>

          <Field label="Phone / WhatsApp">
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555 000 0000"
              className={inputCls}
              data-testid="apply-phone"
            />
          </Field>

          <Field label="Where you're based">
            <Input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Lagos, Nigeria"
              className={inputCls}
              data-testid="apply-location"
            />
          </Field>

          <Field label="Sales / marketing experience">
            <Input
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              placeholder="e.g. 4 yrs SaaS BDR"
              className={inputCls}
              data-testid="apply-experience"
            />
          </Field>

          <Field label="Channels you'll use">
            <Input
              value={form.channels}
              onChange={(e) => update("channels", e.target.value)}
              placeholder="LinkedIn, Instagram, network, cold email"
              className={inputCls}
              data-testid="apply-channels"
            />
          </Field>

          <Field label="Audience / following size">
            <Input
              value={form.audience_size}
              onChange={(e) => update("audience_size", e.target.value)}
              placeholder="e.g. 12k LinkedIn, 4k IG"
              className={inputCls}
              data-testid="apply-audience"
            />
          </Field>

          <Field label="LinkedIn / portfolio URL">
            <Input
              value={form.portfolio_url}
              onChange={(e) => update("portfolio_url", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className={inputCls}
              data-testid="apply-portfolio"
            />
          </Field>

          <Field label="Clients you can realistically bring per month">
            <Input
              value={form.expected_clients_per_month}
              onChange={(e) => update("expected_clients_per_month", e.target.value)}
              placeholder="e.g. 2-3"
              className={inputCls}
              data-testid="apply-expected"
            />
          </Field>

          <Field label="How did you find us?">
            <Input
              value={form.referral_source}
              onChange={(e) => update("referral_source", e.target.value)}
              placeholder="Twitter, search, friend..."
              className={inputCls}
              data-testid="apply-source"
            />
          </Field>

          <Field label="Why do you want to be a Brivo Partner? *" full>
            <Textarea
              value={form.why_join}
              onChange={(e) => update("why_join", e.target.value)}
              rows={5}
              placeholder="What's your edge? Who do you know? What pipeline do you have lined up?"
              className="bg-white border border-[#E7E3D8] rounded-lg focus-visible:ring-[#B8864C] focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-[#B8864C] text-[#0B1B2B] placeholder:text-[#B6BDC7]"
              data-testid="apply-why"
              required
            />
          </Field>

          <div className="md:col-span-2 flex items-center justify-between pt-2 gap-4">
            <span className="text-[12px] text-[#8190A1]">
              By applying you agree to the program terms. We never share your info.
            </span>
            <button
              type="submit"
              disabled={loading}
              data-testid="apply-submit"
              className="inline-flex items-center gap-2 bg-[#B8864C] hover:bg-[#C99661] text-white rounded-full text-[13px] font-medium px-7 py-3.5 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? "Sending" : "Submit application"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
      <Label className={labelCls}>{label}</Label>
      {children}
    </div>
  );
}
