import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Send, ArrowRight, ArrowLeft, CalendarClock, Check } from "lucide-react";
import { submitInquiry, trackEvent } from "@/lib/api";
import { BOOKING_URL, hasBooking } from "@/lib/config";
import { markConverted } from "@/hooks/useVisitor";

const SERVICES = [
  "Web Design & Development",
  "SEO & Content",
  "Paid Media",
  "Social & Content",
  "Brand & Identity",
  "Ignite Tier",
  "Accelerate Tier",
  "Partner Tier",
  "Other",
];

const BUDGETS = [
  "< $2,500 / month",
  "$2,500 – $7,500 / month",
  "$7,500 – $15,000 / month",
  "$15,000+ / month",
  "One-time project",
];

const labelCls = "text-[11px] tracking-[0.18em] uppercase text-[#8190A1] font-medium";
const inputCls =
  "bg-white border border-[#E7E3D8] rounded-lg h-11 focus-visible:ring-[#B8864C] focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-[#B8864C] text-[#0B1B2B] placeholder:text-[#B6BDC7]";

const EMPTY = {
  name: "",
  email: "",
  company: "",
  service_interest: "",
  budget: "",
  message: "",
};

const STEPS = ["Goal", "Brief", "Contact"];

function Chip({ active, onClick, children, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={`text-left rounded-xl border px-4 py-3 text-[13.5px] transition-all ${
        active
          ? "border-[#B8864C] bg-[#FBF7EF] text-[#0B1B2B] ring-1 ring-[#B8864C]"
          : "border-[#E7E3D8] bg-white text-[#4E5C6E] hover:border-[#B8864C]/60"
      }`}
    >
      {children}
    </button>
  );
}

export default function InquiryDialog({ open, onOpenChange, defaultService, source }) {
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setForm((f) => ({
        ...f,
        service_interest: defaultService || f.service_interest || "",
      }));
      trackEvent("inquiry_open", window.location.pathname, {
        meta: { source: source || "inquiry-dialog" },
      });
    }
  }, [open, defaultService, source]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const goNext = () => {
    if (step === 0 && !form.service_interest) {
      toast.error("Pick what you'd like help with.");
      return;
    }
    if (step === 1 && !form.message.trim()) {
      toast.error("Tell us a little about the project.");
      return;
    }
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    trackEvent("inquiry_step", window.location.pathname, {
      meta: { step: next, label: STEPS[next] },
    });
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const book = () => {
    trackEvent("booking_click", window.location.pathname, {
      meta: { source: "inquiry-dialog" },
    });
    window.open(BOOKING_URL, "_blank", "noopener");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.service_interest || !form.message) {
      toast.error("Please fill in name, email, service, and brief.");
      return;
    }
    setLoading(true);
    try {
      const ref_code = localStorage.getItem("brivo_ref") || null;
      const session_id = localStorage.getItem("brivo_sid") || null;
      await submitInquiry({
        ...form,
        source: source || "inquiry-dialog",
        ref_code,
        session_id,
      });
      trackEvent("inquiry_submitted", window.location.pathname, {
        meta: { source: source || "inquiry-dialog", budget: form.budget },
      });
      markConverted();
      toast.success("Thank you. We'll be in touch within 24 hours.");
      onOpenChange(false);
      setForm(EMPTY);
      setStep(0);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-white border border-[#E7E3D8] text-[#0B1B2B] max-w-2xl rounded-2xl p-0 overflow-hidden"
        data-testid="inquiry-dialog"
      >
        <div className="relative px-7 py-7 md:px-10 md:py-9">
          <DialogHeader className="text-left">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#B8864C] font-medium">
              Start a conversation · Step {step + 1} of {STEPS.length}
            </span>
            <DialogTitle className="font-display text-[26px] md:text-[32px] font-[500] tracking-tight mt-3 text-[#0B1B2B]">
              {step === 0 && "What can we build for you?"}
              {step === 1 && "Tell us about the project."}
              {step === 2 && "Where do we send the plan?"}
            </DialogTitle>
            <DialogDescription className="text-[#4E5C6E] text-[14px] mt-2 leading-relaxed">
              {step === 0 &&
                "Pick a focus and budget. Takes 30 seconds — no obligation."}
              {step === 1 &&
                "A senior strategist reads every brief. The more context, the sharper the plan."}
              {step === 2 &&
                "We reply within 24 hours with next steps — no bots, no generic decks."}
            </DialogDescription>
          </DialogHeader>

          {/* progress */}
          <div className="mt-5 flex items-center gap-2" data-testid="inquiry-progress">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-[#B8864C]" : "bg-[#E7E3D8]"
                }`}
              />
            ))}
          </div>

          {/* STEP 0 — goal + budget */}
          {step === 0 && (
            <div className="mt-7 space-y-6">
              <div className="space-y-3">
                <Label className={labelCls}>What do you need? *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SERVICES.map((s) => (
                    <Chip
                      key={s}
                      active={form.service_interest === s}
                      onClick={() => update("service_interest", s)}
                      testid={`inquiry-service-chip-${s}`}
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
                {/* hidden field preserves prior testid contract */}
                <input
                  type="hidden"
                  value={form.service_interest}
                  data-testid="inquiry-service"
                  readOnly
                />
              </div>

              <div className="space-y-3">
                <Label className={labelCls}>Budget</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUDGETS.map((b) => (
                    <Chip
                      key={b}
                      active={form.budget === b}
                      onClick={() => update("budget", b)}
                      testid={`inquiry-budget-chip-${b}`}
                    >
                      {b}
                    </Chip>
                  ))}
                </div>
                <input
                  type="hidden"
                  value={form.budget}
                  data-testid="inquiry-budget"
                  readOnly
                />
              </div>
            </div>
          )}

          {/* STEP 1 — brief + company */}
          {step === 1 && (
            <div className="mt-7 space-y-5">
              <div className="space-y-2">
                <Label className={labelCls}>Project brief *</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us what you're trying to launch, scale, or solve."
                  rows={6}
                  className="bg-white border border-[#E7E3D8] rounded-lg focus-visible:ring-[#B8864C] focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-[#B8864C] text-[#0B1B2B] placeholder:text-[#B6BDC7]"
                  data-testid="inquiry-message"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className={labelCls}>Company</Label>
                <Input
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="Acme Inc."
                  className={inputCls}
                  data-testid="inquiry-company"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — contact + submit */}
          {step === 2 && (
            <form onSubmit={submit} className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className={labelCls}>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Doe"
                  className={inputCls}
                  data-testid="inquiry-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className={labelCls}>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jane@company.com"
                  className={inputCls}
                  data-testid="inquiry-email"
                  required
                />
              </div>

              <div className="md:col-span-2 rounded-xl bg-[#FBF7EF] border border-[#EFE6D4] px-4 py-3 text-[12.5px] text-[#6A5836] flex items-center gap-2">
                <Check size={14} className="text-[#B8864C]" />
                {form.service_interest || "Project"}
                {form.budget ? ` · ${form.budget}` : ""}
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <span className="text-[12px] text-[#8190A1]">
                  * Required. We never share your information.
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B1B2B] text-white rounded-full text-[13px] font-medium px-7 py-3.5 hover:bg-[#14283F] transition-all disabled:opacity-60"
                  data-testid="inquiry-submit"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {loading ? "Sending" : "Send brief"}
                </button>
              </div>
            </form>
          )}

          {/* footer nav */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <div>
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 text-[13px] text-[#4E5C6E] hover:text-[#0B1B2B] transition"
                  data-testid="inquiry-back"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {hasBooking() && (
                <button
                  type="button"
                  onClick={book}
                  className="inline-flex items-center gap-1.5 text-[13px] text-[#B8864C] hover:text-[#a5763f] transition"
                  data-testid="inquiry-book"
                >
                  <CalendarClock size={14} /> Prefer to talk? Book a call
                </button>
              )}
              {step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full text-[13px] font-medium px-7 py-3 hover:bg-[#14283F] transition-all"
                  data-testid="inquiry-next"
                >
                  Continue <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
