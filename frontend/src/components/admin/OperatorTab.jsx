import { useEffect, useState } from "react";
import { Power, PhoneOutgoing, Loader2, Radio, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { fetchOperatorStatus, toggleOperator, startOutboundCall } from "@/lib/api";

export default function OperatorTab() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone_number: "", name: "", company: "", task: "" });
  const [dialing, setDialing] = useState(false);

  const load = () =>
    fetchOperatorStatus()
      .then(setStatus)
      .catch(() => setStatus(null));

  useEffect(() => {
    load();
  }, []);

  const doToggle = async () => {
    if (!status?.configured) {
      toast.error("Bland.ai not configured — add BLAND_API_KEY in backend/.env first.");
      return;
    }
    setLoading(true);
    try {
      const next = !status.inbound_enabled;
      await toggleOperator(next);
      toast.success(next ? "Inbound operator activated." : "Inbound operator paused.");
      await load();
    } catch (e) {
      toast.error(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Toggle failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const dial = async (e) => {
    e.preventDefault();
    if (!status?.configured) {
      toast.error("Bland.ai not configured — add BLAND_API_KEY in backend/.env first.");
      return;
    }
    if (!form.phone_number) return;
    setDialing(true);
    try {
      await startOutboundCall(form);
      toast.success("Call queued. Check the Calls tab for the transcript when it completes.");
      setForm({ phone_number: "", name: "", company: "", task: "" });
    } catch (e) {
      toast.error(
        typeof e?.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Call failed"
      );
    } finally {
      setDialing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl" data-testid="operator-tab">
      {/* Status card */}
      <div className="bg-[#13131C] border border-white/10 p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-full border flex items-center justify-center ${
              status?.inbound_enabled
                ? "border-[#CCFF00] text-[#CCFF00]"
                : "border-white/15 text-white/35"
            }`}
          >
            <Radio size={18} />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">
              / Mobile Operator
            </div>
            <h3 className="font-display text-xl font-black uppercase tracking-tight mt-1">
              24/7 AI phone agent
            </h3>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
              {status?.configured ? (
                status.inbound_enabled ? (
                  <span className="text-[#CCFF00]">● Inbound live</span>
                ) : (
                  <span className="text-white/45">● Inbound paused</span>
                )
              ) : (
                <span className="text-orange-400">● Not configured</span>
              )}
              {status?.inbound_number && (
                <>
                  <span className="text-white/20 mx-2">|</span>
                  Number: {status.inbound_number}
                </>
              )}
              {status?.pathway_id && (
                <>
                  <span className="text-white/20 mx-2">|</span>
                  Pathway: {status.pathway_id.slice(0, 10)}…
                </>
              )}
            </div>
          </div>
          <button
            onClick={doToggle}
            disabled={loading || !status?.configured}
            className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] font-bold px-5 py-3 border transition-colors disabled:opacity-50 ${
              status?.inbound_enabled
                ? "border-white/20 text-white hover:border-white/50"
                : "bg-[#CCFF00] text-black border-[#CCFF00] accent-glow"
            }`}
            data-testid="operator-toggle"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
            {status?.inbound_enabled ? "Pause inbound" : "Go live"}
          </button>
        </div>

        {!status?.configured && (
          <div className="flex items-start gap-3 bg-orange-400/10 border border-orange-400/30 p-4">
            <AlertTriangle
              size={16}
              className="text-orange-400 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-orange-100/80">
              <strong className="text-orange-300">Not connected.</strong> Add these
              to <code className="bg-black/40 px-1.5 py-0.5">backend/.env</code>{" "}
              then restart the backend:
              <ul className="mt-2 space-y-1 font-mono text-xs text-white/70">
                <li>• <code>BLAND_API_KEY</code> — required</li>
                <li>• <code>BLAND_WEBHOOK_SECRET</code> — for webhook verification</li>
                <li>• <code>BLAND_INBOUND_NUMBER</code> — E.164 number to receive calls</li>
                <li>• <code>BLAND_PATHWAY_ID</code> — optional, if you built one</li>
                <li>• <code>BLAND_FROM_NUMBER</code> — optional, for outbound caller ID</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${
              status?.email_configured ? "bg-[#CCFF00]" : "bg-white/25"
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
            Lead email alerts:{" "}
            {status?.email_configured
              ? `on → ${status.notify_email || "(set NOTIFY_EMAIL)"}`
              : "off — add RESEND_API_KEY in backend/.env"}
          </span>
        </div>
      </div>

      {/* Outbound dial */}
      <form onSubmit={dial} className="bg-[#13131C] border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <PhoneOutgoing size={16} className="text-[#CCFF00]" />
          <h3 className="font-display text-lg font-black uppercase tracking-tight">
            Dial a lead
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
              Phone number (E.164) *
            </label>
            <input
              type="tel"
              required
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              placeholder="+14155551234"
              className="w-full bg-black border border-white/15 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#CCFF00] text-white"
              data-testid="operator-dial-number"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
              className="w-full bg-black border border-white/15 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#CCFF00] text-white"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
              Company
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Acme Inc."
              className="w-full bg-black border border-white/15 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#CCFF00] text-white"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
              Custom task (optional)
            </label>
            <input
              type="text"
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
              placeholder="Leave blank for default audit-booking script"
              className="w-full bg-black border border-white/15 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#CCFF00] text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={dialing || !status?.configured}
          className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-mono text-xs uppercase tracking-[0.2em] font-bold px-6 py-3 accent-glow disabled:opacity-50"
          data-testid="operator-dial-submit"
        >
          {dialing ? <Loader2 size={14} className="animate-spin" /> : <PhoneOutgoing size={14} />}
          {dialing ? "Queuing…" : "Start call"}
        </button>
      </form>
    </div>
  );
}
