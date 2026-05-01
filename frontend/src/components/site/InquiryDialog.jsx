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
  "Web Design & Dev",
  "SEO & Content",
  "Paid Ads",
  "Social Media",
  "Branding & Identity",
  "Ignite Tier",
  "Accelerate Tier",
  "Dominate Tier",
  "Other",
];

const BUDGETS = [
  "< $2,500 / mo",
  "$2,500 – $7,500 / mo",
  "$7,500 – $15,000 / mo",
  "$15,000+ / mo",
  "One-time project",
];

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
      await submitInquiry({ ...form, source: source || "inquiry-dialog" });
      toast.success("Inquiry received. We'll be in touch within 24 hours.");
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
      const msg =
        err?.response?.data?.detail || "Something went wrong. Try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0A0A0A] border border-white/10 text-white max-w-2xl rounded-none p-0 overflow-hidden"
        data-testid="inquiry-dialog"
      >
        <div className="grain absolute inset-0 pointer-events-none" />
        <div className="relative px-8 py-8 md:px-10 md:py-10">
          <DialogHeader className="text-left">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#CCFF00]">
              / Start a Project
            </span>
            <DialogTitle className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight mt-3">
              Tell us where you're stuck.
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm mt-2">
              Reply within 24 hours. No bots, no fluff — a strategist will read this.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Jane Doe"
                className="bg-black border border-white/15 rounded-none h-11 focus-visible:ring-[#CCFF00] focus-visible:ring-offset-0 focus-visible:ring-1"
                data-testid="inquiry-name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Email *
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jane@brand.com"
                className="bg-black border border-white/15 rounded-none h-11 focus-visible:ring-[#CCFF00] focus-visible:ring-offset-0 focus-visible:ring-1"
                data-testid="inquiry-email"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Company
              </Label>
              <Input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc."
                className="bg-black border border-white/15 rounded-none h-11 focus-visible:ring-[#CCFF00] focus-visible:ring-offset-0 focus-visible:ring-1"
                data-testid="inquiry-company"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Service *
              </Label>
              <Select
                value={form.service_interest}
                onValueChange={(v) => update("service_interest", v)}
              >
                <SelectTrigger
                  className="bg-black border border-white/15 rounded-none h-11 focus:ring-[#CCFF00]"
                  data-testid="inquiry-service"
                >
                  <SelectValue placeholder="Pick a service" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border border-white/15 text-white rounded-none">
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s} className="font-body">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Budget
              </Label>
              <Select
                value={form.budget}
                onValueChange={(v) => update("budget", v)}
              >
                <SelectTrigger
                  className="bg-black border border-white/15 rounded-none h-11 focus:ring-[#CCFF00]"
                  data-testid="inquiry-budget"
                >
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border border-white/15 text-white rounded-none">
                  {BUDGETS.map((b) => (
                    <SelectItem key={b} value={b} className="font-body">
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Project Brief *
              </Label>
              <Textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="What are you trying to scale, fix, or launch?"
                rows={5}
                className="bg-black border border-white/15 rounded-none focus-visible:ring-[#CCFF00] focus-visible:ring-offset-0 focus-visible:ring-1"
                data-testid="inquiry-message"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
              <span className="text-xs text-white/40">
                * Required. We never share your info.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-3 bg-[#CCFF00] text-black font-mono text-xs uppercase tracking-[0.2em] font-bold px-7 py-4 accent-glow disabled:opacity-60"
                data-testid="inquiry-submit"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {loading ? "Sending" : "Send Brief"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
