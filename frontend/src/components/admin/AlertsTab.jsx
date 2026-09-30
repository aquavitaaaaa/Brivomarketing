import { useEffect, useState, useCallback } from "react";
import { Bell, Mail, MessageSquare, Flame, PhoneCall, Send, Loader2, CheckCircle2, XCircle, Instagram } from "lucide-react";
import { toast } from "sonner";
import { alertsStatus, alertsList, alertsMarkRead, alertsTest } from "@/lib/api";

const KIND = {
  hot_lead: { icon: Flame, label: "Hot lead", color: "text-orange-400" },
  inquiry: { icon: Mail, label: "New inquiry", color: "text-[#CCFF00]" },
  call: { icon: PhoneCall, label: "AI call", color: "text-sky-400" },
  social_failed: { icon: Instagram, label: "Post failed", color: "text-red-400" },
  test: { icon: Bell, label: "Test", color: "text-white/60" },
};

function Check({ ok, label, hint }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-t border-white/10 first:border-t-0">
      {ok ? <CheckCircle2 size={16} className="text-[#CCFF00] mt-0.5" /> : <XCircle size={16} className="text-red-400 mt-0.5" />}
      <div>
        <div className="text-[13px] text-white">{label}</div>
        {!ok && <div className="font-mono text-[10px] text-white/50 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export default function AlertsTab() {
  const [st, setSt] = useState(null);
  const [items, setItems] = useState([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setSt(await alertsStatus().catch(() => null));
    const r = await alertsList().catch(() => ({ alerts: [] }));
    setItems(r.alerts);
    if (r.unread) alertsMarkRead().catch(() => null);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const test = async () => {
    setSending(true);
    try {
      const r = await alertsTest();
      toast[r.email.ok || r.sms.ok ? "success" : "error"](
        `Email: ${r.email.ok ? "sent" : r.email.error} · SMS: ${r.sms.ok ? "sent" : r.sms.error}`);
      load();
    } catch { toast.error("Test failed"); }
    setSending(false);
  };

  return (
    <div className="space-y-6" data-testid="alerts-tab">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-white/10 p-6" data-testid="alerts-config">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00] mb-3">/ Delivery channels</div>
          <Check ok={st?.email_configured} label={`Email via Resend → ${st?.notify_email || "(NOTIFY_EMAIL not set)"}`}
            hint="Set RESEND_API_KEY, SENDER_EMAIL, NOTIFY_EMAIL in backend/.env" />
          <Check ok={st?.sms_configured} label={`SMS via Twilio → ${st?.sms_to || "(ALERT_SMS_TO not set)"}`}
            hint="Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ALERT_SMS_TO (E.164)" />
          <Check ok={st?.bland_configured} label="Bland.ai phone agent"
            hint="Set BLAND_API_KEY, BLAND_INBOUND_NUMBER (and BLAND_PATHWAY_ID) in backend/.env" />
          <Check ok={st?.instagram_graph} label="Instagram auto-publish (Graph API)"
            hint="Set META_ACCESS_TOKEN + IG_BUSINESS_ACCOUNT_ID, or connect a direct account in Social" />
          <div className="mt-4 font-mono text-[10px] text-white/50">
            Hot lead = signal score ≥ {st?.hot_threshold ?? 75}/100 · max {st?.daily_cap ?? 20} alerts/day · new inquiries and AI-operator calls always alert.
          </div>
          <button onClick={test} disabled={sending} data-testid="alerts-send-test"
            className="mt-5 inline-flex items-center gap-2 bg-[#CCFF00] text-black font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-2.5 hover:bg-white transition-colors disabled:opacity-50">
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Send test alert
          </button>
        </div>
        <div className="border border-white/10 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00] mb-3">/ What triggers an alert</div>
          <ul className="space-y-3 text-[13px] text-white/80">
            <li className="flex gap-3"><Mail size={15} className="mt-0.5 text-[#CCFF00]" /> Every website inquiry, ROI calculator and audit request: email + SMS instantly.</li>
            <li className="flex gap-3"><Flame size={15} className="mt-0.5 text-orange-400" /> Lead-engine prospects scoring above the hot threshold, batched every 90s.</li>
            <li className="flex gap-3"><PhoneCall size={15} className="mt-0.5 text-sky-400" /> Every call the Bland.ai operator finishes, with lead capture when an email is given.</li>
            <li className="flex gap-3"><MessageSquare size={15} className="mt-0.5 text-white/60" /> Failed Instagram autopilot posts.</li>
          </ul>
        </div>
      </div>

      <div className="border border-white/10" data-testid="alerts-feed">
        <div className="px-6 py-4 border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
          Alert history ({items.length})
        </div>
        {items.length === 0 && <div className="p-8 text-center text-white/40 text-sm">No alerts yet. Send a test above.</div>}
        {items.map((a) => {
          const k = KIND[a.kind] || KIND.test;
          const Icon = k.icon;
          return (
            <div key={a.id} className="px-6 py-4 border-b border-white/5 flex gap-4" data-testid={`alert-${a.id}`}>
              <Icon size={18} className={`${k.color} mt-1 shrink-0`} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] text-white">{a.title}</div>
                <div className="text-[12px] text-white/50 truncate">{a.detail}</div>
                <div className="font-mono text-[10px] text-white/40 mt-1">
                  {new Date(a.created_at).toLocaleString()} · email: {a.email.startsWith("sent") ? "sent" : "skipped"} · sms: {a.sms.startsWith("sent") ? "sent" : "skipped"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
