import { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Bot, RefreshCw, Send, Sparkles, Target, Zap,
  CheckCircle2, AlertTriangle, MessageSquare, Plus, Trash2,
  ChevronRight, Search, Inbox, Calendar,
} from "lucide-react";
import {
  adminMe,
  leadsPipeline, leadsList, leadGet, leadDiscoverNow, leadDispatch,
  leadReply, leadStage, leadImport, outreachJobs,
} from "@/lib/api";

const STAGES = [
  { key: "discovered", label: "Discovered", color: "bg-[#F1EAD8] text-[#8B6E2C]" },
  { key: "queued",     label: "Queued",     color: "bg-[#FCE9D6] text-[#9C5314]" },
  { key: "contacted",  label: "Contacted",  color: "bg-[#DCEAF7] text-[#1E5793]" },
  { key: "replied",    label: "Replied",    color: "bg-[#E5DBF6] text-[#5C30A8]" },
  { key: "qualified",  label: "Qualified",  color: "bg-[#DDF1E1] text-[#1E7A36]" },
  { key: "booked",     label: "Booked",     color: "bg-[#CCFF00]/20 text-[#5C7A00]" },
  { key: "negative",   label: "Lost",       color: "bg-[#FAE0E0] text-[#9A2424]" },
];

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ----- Pipeline header
function PipelineHeader({ stats, onRefresh, onDiscover, busyDiscover }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6" data-testid="pipeline-header">
      {STAGES.map((s) => (
        <div key={s.key} className="border border-white/10 bg-[#11111A] p-3" data-testid={`pipeline-stage-${s.key}`}>
          <div className={`inline-block text-[9px] uppercase tracking-[0.25em] font-mono px-2 py-[2px] ${s.color}`}>
            {s.label}
          </div>
          <div className="font-display text-2xl font-black mt-2">{stats?.[s.key] ?? 0}</div>
        </div>
      ))}
      <div className="border border-[#CCFF00]/40 bg-[#CCFF00]/[0.04] p-3 flex flex-col gap-2">
        <button
          onClick={onDiscover}
          disabled={busyDiscover}
          className="inline-flex items-center justify-center gap-2 border border-[#CCFF00]/60 text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] py-2 hover:bg-[#CCFF00]/10 disabled:opacity-50"
          data-testid="discover-now-btn"
        >
          {busyDiscover ? <RefreshCw size={12} className="animate-spin" /> : <Search size={12} />}
          Discover Now
        </button>
        <button
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/70 hover:text-white font-mono text-[10px] uppercase tracking-[0.25em] py-2"
          data-testid="pipeline-refresh-btn"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>
    </div>
  );
}

// ----- Lead row
function LeadRow({ lead, onOpen, onDispatch }) {
  const stage = STAGES.find((s) => s.key === lead.stage);
  return (
    <div
      className="grid grid-cols-12 gap-2 items-center border-b border-white/5 hover:bg-white/[0.02] px-3 py-3 cursor-pointer"
      onClick={() => onOpen(lead)}
      data-testid={`lead-row-${lead.id}`}
    >
      <div className="col-span-1 text-center">
        <span className="font-mono text-[10px] text-[#CCFF00]">{lead.signal_score}</span>
      </div>
      <div className="col-span-5">
        <div className="text-sm text-white/90 line-clamp-1">{lead.title}</div>
        <div className="font-mono text-[10px] text-white/40 mt-1">
          r/{lead.subreddit || lead.source} · @{lead.platform_handle || "?"} · {fmt(lead.created_at)}
        </div>
      </div>
      <div className="col-span-2">
        <span className={`inline-block text-[9px] uppercase tracking-[0.2em] font-mono px-2 py-[2px] ${stage?.color || "bg-white/10"}`}>
          {stage?.label || lead.stage}
        </span>
      </div>
      <div className="col-span-2 font-mono text-[10px] text-white/50">
        {lead.outreach_attempts > 0 ? `${lead.outreach_attempts}× sent` : "—"}
      </div>
      <div className="col-span-2 text-right">
        {lead.stage === "discovered" && (
          <button
            onClick={(e) => { e.stopPropagation(); onDispatch(lead); }}
            className="inline-flex items-center gap-1 border border-[#CCFF00]/60 text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 hover:bg-[#CCFF00]/10"
            data-testid={`dispatch-${lead.id}`}
          >
            <Send size={11} /> Dispatch
          </button>
        )}
        <ChevronRight size={14} className="inline-block text-white/30 ml-2" />
      </div>
    </div>
  );
}

// ----- Lead detail drawer
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
    } catch {
      toast.error("Reply failed");
    } finally { setBusy(false); }
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

  return (
    <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex justify-end" onClick={onClose} data-testid="lead-drawer">
      <div
        className="w-full max-w-xl h-full bg-[#0F0F17] border-l border-white/10 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0F0F17] z-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#CCFF00]">Lead · {lead.signal_score}/100</div>
            <div className="font-display text-lg font-black mt-1 line-clamp-1">{lead.title}</div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white" data-testid="lead-drawer-close">✕</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">Snippet</div>
            <p className="text-sm text-white/80 whitespace-pre-wrap">{lead.snippet}</p>
            {lead.url && (
              <a href={lead.url} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-[#CCFF00] underline mt-2 inline-block">
                {lead.url}
              </a>
            )}
          </div>

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">Conversation</div>
            <div className="space-y-2">
              {(lead.messages || []).length === 0 && (
                <p className="text-xs text-white/40 italic">No messages yet.</p>
              )}
              {(lead.messages || []).map((m, i) => (
                <div key={i} className={`p-3 text-sm ${m.role === "brivo" ? "bg-[#CCFF00]/[0.06] border border-[#CCFF00]/20" : "bg-white/[0.04] border border-white/10"}`}>
                  <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
                    {m.role} · {fmt(m.ts)}{m.action ? ` · ${m.action}` : ""}
                  </div>
                  <div className="whitespace-pre-wrap">{m.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">Simulate Inbound Reply</div>
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
              className="mt-2 inline-flex items-center gap-2 border border-[#CCFF00]/60 text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 hover:bg-[#CCFF00]/10 disabled:opacity-40"
              data-testid="lead-reply-send"
            >
              <Sparkles size={12} /> Run AI Nurturer
            </button>
          </div>

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">Stage</div>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStage(s.key)}
                  disabled={busy || s.key === lead.stage}
                  className={`text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-1 border ${
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

// ----- Outreach jobs panel
function OutreachJobs() {
  const [jobs, setJobs] = useState([]);
  const load = useCallback(async () => {
    try { const r = await outreachJobs(); setJobs(r.jobs || []); }
    catch { /* silent */ }
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div className="border border-white/10 bg-[#11111A] mt-6" data-testid="outreach-jobs">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">Outreach Jobs · Last 100</div>
        <button onClick={load} className="text-white/40 hover:text-white" data-testid="outreach-refresh-btn">
          <RefreshCw size={12} />
        </button>
      </div>
      {jobs.length === 0 && (
        <p className="px-4 py-6 text-xs text-white/40 italic">No jobs yet. Discover or import leads to start.</p>
      )}
      {jobs.slice(0, 10).map((j) => (
        <div key={j.id} className="px-4 py-3 border-b border-white/5 grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-2 font-mono text-[10px] text-white/50">{fmt(j.created_at)}</div>
          <div className="col-span-1 font-mono text-[10px] uppercase text-[#CCFF00]">{j.channel}</div>
          <div className="col-span-1 font-mono text-[10px]">
            <span className={`px-1 py-[1px] ${
              j.status === "sent" ? "bg-[#DDF1E1] text-[#1E7A36]" :
              j.status === "failed" ? "bg-[#FAE0E0] text-[#9A2424]" :
              "bg-[#F1EAD8] text-[#8B6E2C]"
            }`}>{j.status}</span>
          </div>
          <div className="col-span-8 text-white/70 line-clamp-2">{j.body}</div>
        </div>
      ))}
    </div>
  );
}

// ----- Quick import dialog (paste cold-list JSON)
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
        className="inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/40 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2"
        data-testid="lead-import-open"
      >
        <Plus size={12} /> Import Leads
      </button>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-[#0F0F17] border border-white/15 max-w-xl w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-lg font-black uppercase mb-2">Import Cold List</div>
            <div className="font-mono text-[10px] text-white/50 mb-3">
              Paste a JSON array. Required keys: source, source_id, url, title. Optional: snippet, author.
            </div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              className="w-full bg-black/40 border border-white/10 px-3 py-2 text-xs font-mono focus:border-[#CCFF00] outline-none"
              data-testid="lead-import-textarea"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 text-white/60 hover:text-white">
                Cancel
              </button>
              <button onClick={submit} disabled={busy} className="font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 border border-[#CCFF00]/60 text-[#CCFF00] hover:bg-[#CCFF00]/10 disabled:opacity-40" data-testid="lead-import-submit">
                {busy ? "Importing…" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----- Main page
export default function AdminLeadEngine() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [stageFilter, setStageFilter] = useState("");
  const [busyDiscover, setBusyDiscover] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    adminMe()
      .then((u) => setAdmin(u))
      .catch(() => { localStorage.removeItem("brivo_admin_token"); setAdmin(null); })
      .finally(() => setChecked(true));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        leadsPipeline(),
        leadsList(stageFilter || undefined),
      ]);
      setStats(s);
      setLeads(l.leads || []);
    } catch (e) {
      // soft fail
    }
  }, [stageFilter]);

  useEffect(() => { if (admin) refresh(); }, [admin, refresh]);

  // poll every 30s
  useEffect(() => {
    if (!admin) return;
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [admin, refresh]);

  if (checked && !admin) return <Navigate to="/admin/login" replace />;
  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white/50 font-mono text-xs uppercase tracking-[0.3em]">
        Loading lead engine…
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

  const dispatch = async (lead) => {
    try {
      const r = await leadDispatch(lead.id);
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
    <div className="min-h-screen bg-[#0B0B0F] text-white" data-testid="admin-lead-engine">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0B0F]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.3em]"
              data-testid="back-to-admin"
            >
              <ArrowLeft size={13} /> Control Room
            </Link>
            <div className="border-l border-white/15 pl-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">/ Lead Engine</div>
              <div className="font-display text-lg font-black uppercase tracking-tight leading-none mt-1">
                Autonomous Acquisition
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuickImport onImported={refresh} />
            <Link
              to="/admin/social"
              className="hidden md:inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/40 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2"
              data-testid="link-social"
            >
              <Send size={12} /> Auto-Poster
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-[1480px] mx-auto">
        <PipelineHeader
          stats={stats}
          onRefresh={refresh}
          onDiscover={discover}
          busyDiscover={busyDiscover}
        />

        {/* Stage filter chips */}
        <div className="flex flex-wrap gap-2 mb-3" data-testid="stage-filters">
          <button
            onClick={() => setStageFilter("")}
            className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 border ${
              !stageFilter ? "border-[#CCFF00] text-[#CCFF00]" : "border-white/15 text-white/50 hover:border-white/40"
            }`}
            data-testid="filter-all"
          >
            All ({stats?.total ?? 0})
          </button>
          {STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStageFilter(s.key)}
              className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 border ${
                stageFilter === s.key ? "border-[#CCFF00] text-[#CCFF00]" : "border-white/15 text-white/50 hover:border-white/40"
              }`}
              data-testid={`filter-${s.key}`}
            >
              {s.label} ({stats?.[s.key] ?? 0})
            </button>
          ))}
        </div>

        {/* Lead list */}
        <div className="border border-white/10 bg-[#11111A]" data-testid="lead-list">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-white/10 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
            <div className="col-span-1 text-center">Score</div>
            <div className="col-span-5">Title / Source</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2">Outreach</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          {leads.length === 0 && (
            <div className="px-4 py-12 text-center text-white/40 text-sm">
              <Inbox size={28} className="mx-auto mb-3 opacity-50" />
              No leads {stageFilter ? `in '${stageFilter}'` : "yet"}.<br/>
              Click <span className="text-[#CCFF00]">Discover Now</span> or <span className="text-[#CCFF00]">Import Leads</span> to get started.
            </div>
          )}
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onOpen={openLead} onDispatch={dispatch} />
          ))}
        </div>

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
