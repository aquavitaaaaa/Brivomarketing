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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { submitInquiry } from "@/lib/api";

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

export default function InquiryDialog({ open, onOpenChange, defaultService, source }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service_interest: "",
    budget: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        service_interest: defaultService || f.service_interest || "",
      }));
    }
  }, [open, defaultService]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.service_interest || !form.message) {
      toast.error("Please fill in name, email, service, and message.");
      return;
    }
    setLoading(true);
    try {
      const ref_code =
        (typeof window !== "undefined" && localStorage.getItem("brivo_ref")) ||
        null;
      await submitInquiry({
        ...form,
        source: source || "inquiry-dialog",
        ref_code,
      });
      toast.success("Thank you. We'll be in touch within 24 hours.");
      onOpenChange(false);
      setForm({
        name: "",
        email: "",
        company: "",
        service_interest: "",
        budget: "",
        message: "",
      });
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
        <div className="relative px-8 py-8 md:px-10 md:py-10">
          <DialogHeader className="text-left">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#B8864C] font-medium">
              Start a conversation
            </span>
            <DialogTitle className="font-display text-[28px] md:text-[34px] font-[500] tracking-tight mt-3 text-[#0B1B2B]">
              Tell us about your project.
            </DialogTitle>
            <DialogDescription className="text-[#4E5C6E] text-[14px] mt-2 leading-relaxed">
              A senior strategist will read your brief and reply within 24 hours. No bots, no generic sales decks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <div className="space-y-2 md:col-span-2">
              <Label className={labelCls}>Company</Label>
              <Input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc."
                className={inputCls}
                data-testid="inquiry-company"
              />
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Service of interest *</Label>
              <Select
                value={form.service_interest}
                onValueChange={(v) => update("service_interest", v)}
              >
                <SelectTrigger
                  className="bg-white border border-[#E7E3D8] rounded-lg h-11 focus:ring-2 focus:ring-[#B8864C] text-[#0B1B2B]"
                  data-testid="inquiry-service"
                >
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E7E3D8] text-[#0B1B2B] rounded-lg">
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Budget</Label>
              <Select
                value={form.budget}
                onValueChange={(v) => update("budget", v)}
              >
                <SelectTrigger
                  className="bg-white border border-[#E7E3D8] rounded-lg h-11 focus:ring-2 focus:ring-[#B8864C] text-[#0B1B2B]"
                  data-testid="inquiry-budget"
                >
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E7E3D8] text-[#0B1B2B] rounded-lg">
                  {BUDGETS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className={labelCls}>Project brief *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Tell us what you're trying to launch, scale, or solve."
                rows={5}
                className="bg-white border border-[#E7E3D8] rounded-lg focus-visible:ring-[#B8864C] focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:border-[#B8864C] text-[#0B1B2B] placeholder:text-[#B6BDC7]"
                data-testid="inquiry-message"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
              <span className="text-[12px] text-[#8190A1]">
                * Required. We never share your information.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full text-[13px] font-medium px-7 py-3.5 hover:bg-[#14283F] transition-all disabled:opacity-60"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
