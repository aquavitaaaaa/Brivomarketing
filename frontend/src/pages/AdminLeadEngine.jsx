import { useEffect, useState, useCallback, useRef } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  RefreshCw, Send, Sparkles, Target, Activity,
  Search, Inbox, ChevronRight, Plus, Zap, Brain, Cpu, Radio,
  Gauge, TrendingUp, Filter, MessageSquare, AlertTriangle,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import {
  adminMe,
  leadsPipeline, leadsList, leadGet, leadDiscoverNow, leadDispatch,
  leadReply, leadStage, leadImport, outreachJobs,
  leadAnalytics, leadAutoQualify, leadQualify,
} from "@/lib/api";

const STAGES = [
  { key: "discovered", label: "DISCOVERED", color: "bg-[#5a5a64] text-white" },
  { key: "queued",     label: "QUEUED",     color: "bg-[#9C5314] text-white" },
  { key: "contacted",  label: "CONTACTED",  color: "bg-[#1E5793] text-white" },
  { key: "replied",    label: "REPLIED",    color: "bg-[#5C30A8] text-white" },
  { key: "qualified",  label: "QUALIFIED",  color: "bg-[#1E7A36] text-white" },
  { key: "booked",     label: "BOOKED",     color: "bg-[#CCFF00] text-black" },
  { key: "negative",   label: "LOST",       color: "bg-[#8B0000] text-white" },
];

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// --- Tesla-style live telemetry strip
function TelemetryStrip({ ai, stats }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-black text-white px-4 sm:px-6 md:px-10 py-2 flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#CCFF00] whitespace-nowrap">
            AI ENGINE · ONLINE
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-white/60 whitespace-nowrap">
          PIPELINE · {stats?.total ?? 0} LEADS
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-white/60 whitespace-nowrap">
          OUTREACH 24H · {stats?.outreach_sent_today ?? 0}
        </span>
        <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.32em] text-white/60">
          DISCOVER LOOP · 30M ↻
        </span>
        <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.32em] text-white/60">
          DISPATCH LOOP · 1M ↻
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#CCFF00]">
          {new Date().toLocaleTimeString(undefined, { hour12: false })}
        </span>
      </div>
    </div>
  );
}

// --- Big telemetry card
function MetricTile({ label, value, sub, accent = "lime", testid }) {
  const accentStyle = {
    lime: "border-l-[#CCFF00]",
    red: "border-l-[#8B0000]",
    blue: "border-l-[#1E5793]",
    amber: "border-l-[#9C5314]",
  }[accent];
  return (
    <div
      className={`bg-white border border-[#9a9a9a] border-l-4 ${accentStyle} px-4 py-3 min-w-0`}
      data-testid={testid}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#5a5a64] truncate">
        {label}
      </div>
      <div className="font-display text-3xl md:text-4xl font-black text-black leading-none mt-2 tabular-nums">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5a5a64] mt-2 truncate">
          {sub}
        </div>
      )}
    </div>
  );
}

// --- Pipeline tiles
function PipelineHeader({ stats, onRefresh, onDiscover, onAutoQualify, busyDiscover, busyQualify }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-3" data-testid="pipeline-header">
      {STAGES.map((s) => (
        <div key={s.key} className="bg-white border border-[#9a9a9a] p-3" data-testid={`pipeline-stage-${s.key}`}>
          <div className={`inline-block text-[8px] uppercase tracking-[0.3em] font-mono px-2 py-[2px] ${s.color}`}>
            {s.label}
          </div>
          <div className="font-display text-3xl font-black mt-2 tabular-nums text-black leading-none">
            {stats?.[s.key] ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Score battery (Tesla range-style horizontal bar)
function ScoreBattery({ score = 0, size = "md" }) {
  const pct = Math.max(0, Math.min(100, score));
  const color = pct >= 80 ? "#CCFF00" : pct >= 60 ? "#65a30d" : pct >= 40 ? "#9C5314" : "#8B0000";
  const w = size === "lg" ? "w-32" : "w-16";
  return (
    <div className="flex items-center gap-2">
      <div className={`${w} h-2 bg-[#1a1a22] relative overflow-hidden`}>
        <div
          className="absolute left-0 top-0 bottom-0 transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[10px] tabular-nums text-black w-7">{pct}</span>
    </div>
  );
}

// --- Lead row (Tesla-style; mobile-friendly card)
function LeadRow({ lead, onOpen, onDispatch }) {
  const stage = STAGES.find((s) => s.key === lead.stage);
  return (
    <div
      className="bg-white hover:bg-[#f5f5f5] border-b border-[#dcdcdc] px-3 py-3 cursor-pointer transition-colors"
      onClick={() => onOpen(lead)}
      data-testid={`lead-row-${lead.id}`}
    >
      {/* Desktop ≥ md : 12-col grid. Mobile : stacked card. */}
      <div className="md:grid md:grid-cols-12 md:gap-2 md:items-center">
        {/* Row 1 (mobile): title + stage pill */}
        <div className="md:col-span-5 md:order-2">
          <div className="flex items-start justify-between gap-2 md:block">
            <div className="text-sm font-medium text-black line-clamp-2 md:line-clamp-1 flex-1">
              {lead.title}
            </div>
            {/* Stage pill — mobile only (inline). Desktop has its own col below. */}
            <span
              className={`md:hidden shrink-0 text-[9px] uppercase tracking-[0.22em] font-mono px-2 py-[2px] ${stage?.color || "bg-[#5a5a64] text-white"}`}
            >
              {stage?.label || lead.stage}
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5a5a64] mt-1 truncate">
            {lead.subreddit ? `r/${lead.subreddit}` : lead.source} · @{lead.platform_handle || "?"} · {fmt(lead.created_at)}
          </div>
        </div>

        {/* Row 2 (mobile): score battery */}
        <div className="md:col-span-2 md:order-1 mt-2 md:mt-0">
          <ScoreBattery score={lead.signal_score} />
        </div>

        {/* Stage pill — desktop only */}
        <div className="hidden md:block md:col-span-2 md:order-3">
          <span className={`inline-block text-[9px] uppercase tracking-[0.22em] font-mono px-2 py-[2px] ${stage?.color || "bg-[#5a5a64] text-white"}`}>
            {stage?.label || lead.stage}
          </span>
        </div>

        {/* Outreach count */}
        <div className="md:col-span-1 md:order-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5a5a64] mt-2 md:mt-0">
          {lead.outreach_attempts > 0 ? `${lead.outreach_attempts}× sent` : "—"}
        </div>

        {/* Action — full width button on mobile, aligned right on desktop */}
        <div className="md:col-span-2 md:order-5 md:text-right mt-3 md:mt-0 flex md:block items-center justify-end gap-2">
          {lead.stage === "discovered" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDispatch(lead); }}
              className="inline-flex items-center gap-1 bg-[#CCFF00] text-black border border-black font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-1.5 hover:bg-black hover:text-[#CCFF00] transition-colors"
              data-testid={`dispatch-${lead.id}`}
            >
              <Send size={11} /> DISPATCH
            </button>
          )}
          <ChevronRight size={14} className="inline-block text-[#5a5a64] md:ml-2" />
        </div>
      </div>
    </div>
  );
}

// --- Lead detail drawer (also dark "Tesla screen" style for contrast)
function LeadDrawer({ lead, onClose, onChanged }) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  if (!lead) return null;

  const sendReply = async () => {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      const r = await leadReply(lead.id, reply);
      toast.success(`AI: ${r.action}`);
      setReply("");
      onChanged();
    } catch { toast.error("Reply failed"); }
    finally { setBusy(false); }
  };

  const setStage = async (s) => {
    setBusy(true);
    try {
      await leadStage(lead.id, s);
      toast.success(`Moved to ${s}`);
      onChanged();
    } catch { toast.error("Stage update failed"); }
    finally { setBusy(false); }
  };

  const qualifyOne = async () => {
    setBusy(true);
    try {
      const r = await leadQualify(lead.id);
      toast.success(`Re-scored: ${r.qualifier?.score}/100 · ${r.qualifier?.recommendation}`);
      onChanged();
    } catch { toast.error("Qualify failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex justify-end" onClick={onClose} data-testid="lead-drawer">
      <div
        className="w-full max-w-xl h-full bg-[#0B0B0F] border-l-4 border-[#CCFF00] overflow-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0B0B0F] z-10">
          <div className="flex items-start gap-3 min-w-0">
            <div className="border border-[#CCFF00]/40 p-2 mt-1">
              <Brain size={16} className="text-[#CCFF00]" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#CCFF00]">
                LEAD · SCORE {lead.signal_score}/100
              </div>
              <div className="font-display text-lg font-black mt-1 line-clamp-1">{lead.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl ml-2" data-testid="lead-drawer-close">✕</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">SIGNAL</div>
            <ScoreBattery score={lead.signal_score} size="lg" />
          </div>

          {lead.qualifier && (
            <div className="border border-[#CCFF00]/30 bg-[#CCFF00]/[0.04] p-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#CCFF00] mb-1">
                AI QUALIFIER · {lead.qualifier.qualifier?.toUpperCase()}
              </div>
              <div className="text-sm">
                <span className="font-mono text-xs">SCORE</span> <span className="font-display font-black tabular-nums text-lg">{lead.qualifier.score}</span> /100
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {lead.qualifier.urgency} URGENCY · {lead.qualifier.vertical}
                </span>
              </div>
              {lead.qualifier.fit_summary && (
                <div className="text-xs text-white/80 mt-2">{lead.qualifier.fit_summary}</div>
              )}
            </div>
          )}

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">SNIPPET</div>
            <p className="text-sm text-white/85 whitespace-pre-wrap">{lead.snippet}</p>
            {lead.url && (
              <a href={lead.url} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-[#CCFF00] underline mt-2 inline-block">
                {lead.url}
              </a>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={qualifyOne}
              disabled={busy}
              className="inline-flex items-center gap-2 border border-[#CCFF00]/60 text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 hover:bg-[#CCFF00]/10 disabled:opacity-40"
              data-testid="lead-qualify-btn"
            >
              <Cpu size={12} /> AI QUALIFY
            </button>
          </div>

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">CONVERSATION</div>
            <div className="space-y-2">
              {(lead.messages || []).length === 0 && (
                <p className="text-xs text-white/40 italic">No messages yet.</p>
              )}
              {(lead.messages || []).map((m, i) => (
                <div key={i} className={`p-3 text-sm ${m.role === "brivo" ? "bg-[#CCFF00]/[0.06] border border-[#CCFF00]/30" : "bg-white/[0.04] border border-white/10"}`}>
                  <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
                    {m.role} · {fmt(m.ts)}{m.action ? ` · ${m.action}` : ""}
                  </div>
                  <div className="whitespace-pre-wrap">{m.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">SIMULATE INBOUND REPLY</div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Paste their DM/comment to let the AI take the next turn..."
              className="w-full bg-black/40 border border-white/10 px-3 py-2 text-sm focus:border-[#CCFF00] outline-none"
              data-testid="lead-reply-input"
            />
            <button
              onClick={sendReply}
              disabled={busy || !reply.trim()}
              className="mt-2 inline-flex items-center gap-2 bg-[#CCFF00] text-black border border-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 hover:bg-black hover:text-[#CCFF00] disabled:opacity-40"
              data-testid="lead-reply-send"
            >
              <Sparkles size={12} /> RUN AI NURTURER
            </button>
          </div>

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">STAGE OVERRIDE</div>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStage(s.key)}
                  disabled={busy || s.key === lead.stage}
                  className={`text-[9px] font-mono uppercase tracking-[0.22em] px-2 py-1 border ${
                    s.key === lead.stage ? "border-[#CCFF00] text-[#CCFF00]" : "border-white/15 text-white/60 hover:border-white/40"
                  }`}
                  data-testid={`stage-btn-${s.key}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Outreach jobs panel (light theme, embedded "screen")
function OutreachJobs() {
  const [jobs, setJobs] = useState([]);
  const load = useCallback(async () => {
    try { const r = await outreachJobs(); setJobs(r.jobs || []); } catch { /* */ }
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div className="border border-[#9a9a9a] bg-white mt-6" data-testid="outreach-jobs">
      <div className="px-4 py-3 border-b border-[#9a9a9a] flex items-center justify-between bg-[#ececec]">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-black flex items-center gap-2">
          <Radio size={12} /> OUTREACH JOBS · LAST 100
        </div>
        <button onClick={load} className="text-[#5a5a64] hover:text-black" data-testid="outreach-refresh-btn">
          <RefreshCw size={12} />
        </button>
      </div>
      {jobs.length === 0 && (
        <p className="px-4 py-6 text-xs text-[#5a5a64] italic">No jobs yet. Discover or import leads to start.</p>
      )}
      {jobs.slice(0, 10).map((j) => (
        <div
          key={j.id}
          className="px-4 py-3 border-b border-[#dcdcdc] md:grid md:grid-cols-12 md:gap-2 text-xs"
        >
          <div className="md:col-span-2 font-mono text-[10px] text-[#5a5a64]">{fmt(j.created_at)}</div>
          <div className="md:col-span-1 font-mono text-[10px] uppercase text-black mt-1 md:mt-0">
            {j.channel}
          </div>
          <div className="md:col-span-1 font-mono text-[10px] mt-1 md:mt-0">
            <span className={`px-1.5 py-[1px] uppercase tracking-[0.18em] ${
              j.status === "sent" ? "bg-[#1E7A36] text-white" :
              j.status === "failed" ? "bg-[#8B0000] text-white" :
              "bg-[#9C5314] text-white"
            }`}>{j.status}</span>
          </div>
          <div className="md:col-span-8 text-black/85 line-clamp-3 md:line-clamp-2 mt-2 md:mt-0">{j.body}</div>
        </div>
      ))}
    </div>
  );
}

// --- Quick import dialog
function QuickImport({ onImported }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState('[\n  {"source":"linkedin","source_id":"abc123","url":"https://linkedin.com/in/abc","title":"Founder, looking for marketing","snippet":"Need help with paid ads + landing pages.","author":"Jane Doe"}\n]');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error("Must be JSON array");
      setBusy(true);
      const r = await leadImport(arr);
      toast.success(`Imported ${r.inserted}/${r.submitted} leads`);
      setOpen(false);
      onImported();
    } catch (e) {
      toast.error(e.message || "Import failed");
    } finally { setBusy(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-black text-black hover:bg-black hover:text-white font-mono text-[10px] uppercase tracking-[0.28em] px-3 py-2 transition-colors"
        data-testid="lead-import-open"
      >
        <Plus size={12} /> IMPORT
      </button>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white border border-black max-w-xl w-full p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-lg font-black uppercase mb-2 text-black">IMPORT COLD LIST</div>
            <div className="font-mono text-[10px] text-[#5a5a64] mb-3 uppercase tracking-[0.22em]">
              JSON ARRAY · KEYS: SOURCE, SOURCE_ID, URL, TITLE · OPT: SNIPPET, AUTHOR
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              className="w-full bg-[#ececec] border border-[#9a9a9a] px-3 py-2 text-xs font-mono focus:border-black focus:bg-white outline-none text-black"
              data-testid="lead-import-textarea"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="font-mono text-[10px] uppercase tracking-[0.28em] px-3 py-2 text-[#5a5a64] hover:text-black">
                CANCEL
              </button>
              <button onClick={submit} disabled={busy} className="font-mono text-[10px] uppercase tracking-[0.28em] px-3 py-2 bg-[#CCFF00] text-black border border-black hover:bg-black hover:text-[#CCFF00] disabled:opacity-40" data-testid="lead-import-submit">
                {busy ? "IMPORTING…" : "IMPORT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Analytics row
function AnalyticsRow({ analytics }) {
  if (!analytics) return null;
  const f = analytics.funnel || {};
  const r = analytics.rates || {};
  const o = analytics.outreach_7d || {};
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3" data-testid="analytics-row">
      <MetricTile label="REPLY RATE" value={`${r.reply_rate_pct ?? 0}%`} sub="REPLIED ÷ CONTACTED" accent="lime" testid="metric-reply-rate" />
      <MetricTile label="BOOK RATE" value={`${r.book_rate_pct ?? 0}%`} sub="BOOKED ÷ REPLIED" accent="lime" testid="metric-book-rate" />
      <MetricTile label="SENT · 7D" value={o.sent ?? 0} sub={`${o.queued ?? 0} QUEUED`} accent="blue" testid="metric-sent-7d" />
      <MetricTile label="FAILED · 7D" value={o.failed ?? 0} sub="OUTREACH ERRORS" accent="red" testid="metric-failed-7d" />
      <MetricTile label="LEADS" value={f.leads ?? 0} sub={`${f.contacted ?? 0} CONTACTED`} accent="amber" testid="metric-leads" />
      <MetricTile label="BOOKED" value={f.booked ?? 0} sub="MEETINGS WON" accent="lime" testid="metric-booked" />
    </div>
  );
}

// =============================================================== MAIN
export default function AdminLeadEngine() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [stageFilter, setStageFilter] = useState("");
  const [busyDiscover, setBusyDiscover] = useState(false);
  const [busyQualify, setBusyQualify] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    adminMe()
      .then((u) => setAdmin(u))
      .catch(() => { localStorage.removeItem("brivo_admin_token"); setAdmin(null); })
      .finally(() => setChecked(true));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [s, l, a] = await Promise.all([
        leadsPipeline(),
        leadsList(stageFilter || undefined),
        leadAnalytics(),
      ]);
      setStats(s);
      setLeads(l.leads || []);
      setAnalytics(a);
    } catch { /* soft fail */ }
  }, [stageFilter]);

  useEffect(() => { if (admin) refresh(); }, [admin, refresh]);

  useEffect(() => {
    if (!admin) return;
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [admin, refresh]);

  if (checked && !admin) return <Navigate to="/admin/login" replace />;
  if (!checked) {
    return (
      <div className="min-h-screen bg-[#bebebe] flex items-center justify-center text-[#5a5a64] font-mono text-xs uppercase tracking-[0.32em]">
        BOOTING LEAD ENGINE…
      </div>
    );
  }

  const discover = async () => {
    setBusyDiscover(true);
    try {
      const r = await leadDiscoverNow();
      toast.success(`+${r.new_leads} new leads`);
      await refresh();
    } catch {
      toast.error("Discovery failed (Reddit may be rate-limited)");
    } finally { setBusyDiscover(false); }
  };

  const autoQualify = async () => {
    setBusyQualify(true);
    try {
      const r = await leadAutoQualify(20, 60);
      toast.success(`Qualified ${r.processed} · ${r.high_fit} high-fit`);
      await refresh();
    } catch {
      toast.error("Auto-qualify failed");
    } finally { setBusyQualify(false); }
  };

  const dispatch = async (lead) => {
    try {
      await leadDispatch(lead.id);
      toast.success("Outreach dispatched");
      await refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Dispatch blocked (cap or spacing)");
    }
  };

  const openLead = async (lead) => {
    try { const fresh = await leadGet(lead.id); setOpen(fresh); }
    catch { setOpen(lead); }
  };

  return (
    <div className="min-h-screen bg-[#bebebe] text-black" data-testid="admin-lead-engine">
      <TelemetryStrip stats={stats} />

      <AdminNav
        title="LEAD ENGINE"
        subtitle="/ AUTONOMOUS ACQUISITION"
        current="leads"
        backTo="/admin"
        rightSlot={
          <>
            <button
              onClick={autoQualify}
              disabled={busyQualify}
              className="inline-flex items-center gap-2 bg-black text-[#CCFF00] border border-black font-mono text-[10px] uppercase tracking-[0.28em] px-3 py-2.5 hover:bg-[#CCFF00] hover:text-black transition-colors disabled:opacity-40 whitespace-nowrap shrink-0"
              data-testid="auto-qualify-btn"
            >
              {busyQualify ? <RefreshCw size={12} className="animate-spin" /> : <Brain size={12} />}
              AI QUALIFY
            </button>
            <button
              onClick={discover}
              disabled={busyDiscover}
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-black border border-black font-mono text-[10px] uppercase tracking-[0.28em] px-3 py-2.5 hover:bg-black hover:text-[#CCFF00] transition-colors disabled:opacity-40 whitespace-nowrap shrink-0"
              data-testid="discover-now-btn"
            >
              {busyDiscover ? <RefreshCw size={12} className="animate-spin" /> : <Search size={12} />}
              DISCOVER
            </button>
            <QuickImport onImported={refresh} />
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 border border-[#5a5a64] text-[#5a5a64] hover:border-black hover:text-black font-mono text-[10px] uppercase tracking-[0.28em] px-3 py-2.5 transition-colors whitespace-nowrap shrink-0"
              data-testid="pipeline-refresh-btn"
            >
              <RefreshCw size={12} /> REFRESH
            </button>
          </>
        }
      />

      <main className="px-4 sm:px-6 md:px-10 py-6 max-w-[1480px] mx-auto">
        {/* ANALYTICS ROW */}
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64] flex items-center gap-2">
          <TrendingUp size={11} /> PERFORMANCE · 7-DAY
        </div>
        <AnalyticsRow analytics={analytics} />

        {/* PIPELINE */}
        <div className="mb-1 mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64] flex items-center gap-2">
          <Gauge size={11} /> PIPELINE BY STAGE
        </div>
        <PipelineHeader stats={stats} />

        {/* Stage filter chips */}
        <div className="flex flex-wrap gap-2 mb-3 mt-5 items-center" data-testid="stage-filters">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64] flex items-center gap-2">
            <Filter size={11} /> FILTER:
          </span>
          <button
            onClick={() => setStageFilter("")}
            className={`text-[10px] font-mono uppercase tracking-[0.22em] px-3 py-1 border ${
              !stageFilter ? "bg-black text-[#CCFF00] border-black" : "border-[#5a5a64] text-[#5a5a64] hover:border-black hover:text-black bg-white"
            }`}
            data-testid="filter-all"
          >
            ALL · {stats?.total ?? 0}
          </button>
          {STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStageFilter(s.key)}
              className={`text-[10px] font-mono uppercase tracking-[0.22em] px-3 py-1 border ${
                stageFilter === s.key ? "bg-black text-[#CCFF00] border-black" : "border-[#5a5a64] text-[#5a5a64] hover:border-black hover:text-black bg-white"
              }`}
              data-testid={`filter-${s.key}`}
            >
              {s.label} · {stats?.[s.key] ?? 0}
            </button>
          ))}
        </div>

        {/* Lead list */}
        <div className="border border-[#9a9a9a] bg-white" data-testid="lead-list">
          <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 border-b border-[#9a9a9a] font-mono text-[9px] uppercase tracking-[0.32em] text-[#5a5a64] bg-[#ececec]">
            <div className="col-span-2">SIGNAL</div>
            <div className="col-span-5">TITLE / SOURCE</div>
            <div className="col-span-2">STAGE</div>
            <div className="col-span-1">OUTREACH</div>
            <div className="col-span-2 text-right">ACTION</div>
          </div>
          {leads.length === 0 && (
            <div className="px-4 py-12 text-center text-[#5a5a64] text-sm">
              <Inbox size={28} className="mx-auto mb-3 opacity-50" />
              NO LEADS {stageFilter ? `IN '${stageFilter.toUpperCase()}'` : "YET"}.<br/>
              CLICK <span className="text-black font-bold">DISCOVER</span> OR <span className="text-black font-bold">IMPORT</span> TO START.
            </div>
          )}
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onOpen={openLead} onDispatch={dispatch} />
          ))}
        </div>

        {/* Top sources side panel */}
        {analytics?.top_subreddits?.length > 0 && (
          <div className="grid md:grid-cols-2 gap-3 mt-6">
            <div className="bg-white border border-[#9a9a9a] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64] mb-3 flex items-center gap-2">
                <MessageSquare size={11} /> TOP SUBREDDITS
              </div>
              <div className="space-y-2">
                {analytics.top_subreddits.map((s) => (
                  <div key={s.subreddit} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-black">r/{s.subreddit}</span>
                    <span className="font-display font-black tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#9a9a9a] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64] mb-3 flex items-center gap-2">
                <Activity size={11} /> SOURCES
              </div>
              <div className="space-y-2">
                {(analytics.top_sources || []).map((s) => (
                  <div key={s.source} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-black uppercase">{s.source}</span>
                    <span className="font-display font-black tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <OutreachJobs />
      </main>

      {open && (
        <LeadDrawer
          lead={open}
          onClose={() => setOpen(null)}
          onChanged={async () => { await refresh(); const fresh = await leadGet(open.id); setOpen(fresh); }}
        />
      )}
    </div>
  );
}
