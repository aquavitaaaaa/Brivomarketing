import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bot, Wifi, WifiOff, Play, X, Sparkles, Copy, Terminal,
  CheckCircle2, AlertTriangle, Clock, RefreshCw, Send, Plus, Apple, Monitor,
  Shield, Pause, PlayCircle, Trophy, Zap, Target, Trash2, Eye, Link2, Share2,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import {
  adminMe, socialDashboard, socialAgents, socialCreatePairCode, socialRevokeAgent,
  socialCreatePairInvite,
  socialPosts, socialCreatePost, socialGenerateBatch, socialRunNow, socialCancelPost,
  socialJobs, socialPreviewPost,
  socialSafetySummary, socialPauseAgent, socialUnpauseAgent,
  socialListWins, socialCreateWin, socialDeleteWin,
  socialRecycleNow, socialCrossPost,
} from "@/lib/api";

const PLATFORM_PILL = {
  x:         { label: "X",        bg: "bg-black",          fg: "text-white" },
  instagram: { label: "Instagram", bg: "bg-[#E1306C]",     fg: "text-white" },
  linkedin:  { label: "LinkedIn", bg: "bg-[#0A66C2]",      fg: "text-white" },
};

const STATUS_PILL = {
  queued:     "bg-[#F1EAD8] text-[#8B6E2C]",
  running:    "bg-[#DCEAF7] text-[#1E5793]",
  published:  "bg-[#DDF1E1] text-[#1E7A36]",
  partial:    "bg-[#FCE9D6] text-[#9C5314]",
  failed:     "bg-[#FAE0E0] text-[#9A2424]",
  cancelled:  "bg-[#EEEEF0] text-[#5C5C66]",
};

function fmtRelative(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (d - new Date()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60)  return diff < 0 ? "just now"  : "in <1m";
  if (abs < 3600) return `${Math.round(abs/60)}m ${diff < 0 ? "ago" : "from now"}`;
  if (abs < 86400) return `${Math.round(abs/3600)}h ${diff < 0 ? "ago" : "from now"}`;
  return d.toLocaleString();
}

// ---------- Pair flow ---------------------------------------------------
function PairFlow({ onPaired }) {
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [os, setOs] = useState("mac");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareExpiresAt, setShareExpiresAt] = useState("");
  const [hostNameHint, setHostNameHint] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [sharing, setSharing] = useState(false);

  const generate = async () => {
    try {
      const r = await socialCreatePairCode();
      setCode(r.code);
      setExpiresAt(r.expires_at);
    } catch (e) {
      toast.error("Could not generate pair code");
    }
  };

  const createShareLink = async () => {
    setSharing(true);
    try {
      const r = await socialCreatePairInvite({
        host_name_hint: hostNameHint || null,
        note: shareNote || null,
      });
      const full = `${window.location.origin}${r.path}`;
      setShareUrl(full);
      setShareExpiresAt(r.expires_at);
    } catch (e) {
      toast.error("Could not create share link");
    } finally {
      setSharing(false);
    }
  };

  const origin = window.location.origin;
  const codeStr = code || "<CODE>";
  const installCmds = {
    mac:     `curl -fsSL ${origin}/agent-host/install.sh | bash -s -- --code ${codeStr} --backend ${origin}`,
    win:     `$env:BRIVO_CODE="${codeStr}"; irm ${origin}/agent-host/install.ps1 | iex`,
    linux:   `curl -fsSL ${origin}/agent-host/install-linux.sh | bash -s -- ${codeStr}`,
  };
  const cmd = installCmds[os];

  const tabs = [
    { id: "mac",   label: "macOS",   icon: Apple,    req: "macOS 12+" },
    { id: "win",   label: "Windows", icon: Monitor,  req: "Windows 10+" },
    { id: "linux", label: "Linux",   icon: Terminal, req: "Ubuntu 20+ / Debian 11+" },
  ];

  return (
    <div
      className="relative rounded-2xl border border-[#E7E3D8] bg-white overflow-hidden"
      data-testid="pair-flow"
    >
      {/* Ambient editorial band across the top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#B8864C] via-[#0B1B2B] to-[#B8864C]" />

      <div className="p-6 md:p-7">
        {/* Fleet status chip */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E3D8] bg-[#FBFAF6] px-3 py-1">
            <span className="relative inline-flex">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#1E7A36] opacity-70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1E7A36]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#0B1B2B]">
              Fleet ready
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.22em] text-[#8190A1]">
            Add hosts · posts · sleep · repeat
          </span>
        </div>

        {/* Kicker */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#B8864C] font-semibold mb-2">
          <Terminal size={13} /> Pair a host
        </div>

        <h3 className="font-display text-[22px] md:text-[26px] font-[500] text-[#0B1B2B] leading-[1.1] tracking-tight">
          Turn any Mac, PC, or Linux box<br className="hidden sm:inline"/> into a Brivo posting agent.
        </h3>

        <p className="mt-3 text-[13.5px] text-[#4E5C6E] leading-relaxed max-w-xl">
          No cloud VMs. No third-party schedulers. The agent runs natively on
          your own hardware, signs in with your real sessions, and publishes
          exactly when you tell it to — then idles invisibly between posts.
        </p>

        {/* 3-step journey */}
        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="pair-journey">
          {[
            { n: "01", title: "Generate a pair code", body: "6 digits, expires in 15 minutes. One code = one host." },
            { n: "02", title: "Paste one install line", body: "Auto-installs the agent, registers a boot daemon, self-pairs." },
            { n: "03", title: "Schedule & sleep", body: "Posts go out on time even with your laptop's lid closed." },
          ].map((s) => (
            <li
              key={s.n}
              className="relative rounded-xl border border-[#F0ECE0] bg-[#FBFAF6] p-4"
            >
              <div className="font-mono text-[10px] tracking-[0.28em] text-[#B8864C] font-semibold">
                {s.n}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-[#0B1B2B] leading-snug">
                {s.title}
              </div>
              <div className="mt-1 text-[11.5px] text-[#4E5C6E] leading-snug">
                {s.body}
              </div>
            </li>
          ))}
        </ol>

        {/* Trust bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
          {[
            { label: "End-to-end encrypted", icon: Shield },
            { label: "No file access",       icon: CheckCircle2 },
            { label: "~2% CPU · 80MB RAM",   icon: Zap },
            { label: "Revoke in one click",  icon: X },
          ].map((t) => {
            const I = t.icon;
            return (
              <div
                key={t.label}
                className="inline-flex items-center gap-1.5 text-[#4E5C6E]"
              >
                <I size={12} className="text-[#B8864C]" />
                <span className="truncate">{t.label}</span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-[#F0ECE0]" />

        {!code ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={generate}
              data-testid="pair-generate"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#14283F] text-white text-[13px] font-medium px-4 py-2.5 rounded-full transition-colors shadow-sm shadow-black/10"
            >
              <Sparkles size={14} /> Generate pair code
            </button>
            <button
              onClick={() => { setShareOpen(true); setShareUrl(""); setHostNameHint(""); setShareNote(""); }}
              data-testid="pair-share-link"
              className="inline-flex items-center gap-2 border border-[#E7E3D8] hover:border-[#B8864C] hover:text-[#B8864C] text-[#0B1B2B] text-[13px] font-medium px-4 py-2.5 rounded-full transition-colors"
              title="Share a one-time pair link with a teammate or client — they pair their own Mac without admin access."
            >
              <Share2 size={13} /> Share public pair link
            </button>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8190A1]">
              6-digit · expires in 15m
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Big code display */}
            <div className="rounded-xl border border-[#E7E3D8] bg-[#FBFAF6] p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-[#8190A1] mb-1">
                  Pair code
                </div>
                <div
                  className="font-display text-[34px] sm:text-[40px] tracking-[0.22em] font-[500] text-[#B8864C] leading-none"
                  data-testid="pair-code"
                >
                  {code}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#8190A1]">
                  Expires
                </div>
                <div className="text-[12px] text-[#0B1B2B] font-medium">
                  {fmtRelative(expiresAt)}
                </div>
              </div>
            </div>

            {/* OS tabs */}
            <div className="flex gap-1 border-b border-[#F3F1EA] overflow-x-auto no-scrollbar">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = t.id === os;
                return (
                  <button
                    key={t.id}
                    onClick={() => setOs(t.id)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors whitespace-nowrap ${
                      active ? "text-[#0B1B2B]" : "text-[#8190A1] hover:text-[#0B1B2B]"
                    }`}
                    data-testid={`pair-os-${t.id}`}
                  >
                    <Icon size={12} /> {t.label}
                    {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#B8864C]" />}
                  </button>
                );
              })}
            </div>

            {/* Active OS requirement */}
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8190A1]">
              Requires · {tabs.find((t) => t.id === os)?.req}
            </div>

            {/* Install command */}
            <div
              className="rounded-xl bg-[#0B1B2B] text-white text-[11.5px] font-mono p-4 overflow-x-auto leading-relaxed"
              data-testid="pair-install-cmd"
            >
              <span className="text-[#B8864C]">$</span> {cmd}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => { navigator.clipboard.writeText(cmd); toast.success("Copied"); }}
                className="inline-flex items-center gap-1.5 bg-[#0B1B2B] text-white text-[12px] font-medium px-3.5 py-2 rounded-full hover:bg-[#14283F] transition-colors"
              >
                <Copy size={12} /> Copy install command
              </button>
              <button
                onClick={generate}
                className="inline-flex items-center gap-1.5 text-[12px] text-[#4E5C6E] hover:text-[#0B1B2B] px-3 py-2 transition-colors"
              >
                <RefreshCw size={12} /> New code
              </button>
              <button
                onClick={onPaired}
                className="inline-flex items-center gap-1.5 ml-auto text-[12px] font-medium text-[#0B1B2B] border border-[#E7E3D8] hover:border-[#B8864C] hover:text-[#B8864C] rounded-full px-3.5 py-2 transition-colors"
              >
                <CheckCircle2 size={12} /> I'm done — refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share public pair link modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          onClick={() => setShareOpen(false)}
          data-testid="share-link-modal"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl border border-[#E7E3D8] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F1EA]">
              <div className="flex items-center gap-2">
                <Share2 size={15} className="text-[#B8864C]" />
                <div>
                  <div className="text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold">
                    Public pair link
                  </div>
                  <div className="text-[11px] text-[#8190A1]">
                    Single-use · expires in 60 min · no admin login required
                  </div>
                </div>
              </div>
              <button onClick={() => setShareOpen(false)} className="text-[#8190A1] hover:text-[#0B1B2B]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!shareUrl ? (
                <>
                  <p className="text-[13px] text-[#4E5C6E] leading-relaxed">
                    Generate a one-time link you can send to a teammate or client. They'll
                    open it in a browser, hit "Start pairing", and follow a wizard — no admin
                    panel access.
                  </p>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-[#8190A1] font-semibold mb-1.5">
                      Host name hint <span className="text-[#B8864C]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={hostNameHint}
                      onChange={(e) => setHostNameHint(e.target.value)}
                      placeholder="e.g. Alex's Mac mini"
                      className="w-full text-[13px] border border-[#E7E3D8] rounded-lg px-3 py-2 outline-none focus:border-[#B8864C]"
                      data-testid="share-host-hint"
                    />
                    <div className="mt-1 text-[11px] text-[#8190A1]">Shown on the public page so the recipient knows it's for them.</div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-[#8190A1] font-semibold mb-1.5">
                      Personal note <span className="text-[#B8864C]">(optional)</span>
                    </label>
                    <textarea
                      value={shareNote}
                      onChange={(e) => setShareNote(e.target.value)}
                      rows={2}
                      placeholder="Thanks for helping us run this on your Mac!"
                      className="w-full text-[13px] border border-[#E7E3D8] rounded-lg px-3 py-2 outline-none focus:border-[#B8864C] resize-none"
                      data-testid="share-note"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={createShareLink}
                      disabled={sharing}
                      data-testid="share-create"
                      className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#14283F] disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-full"
                    >
                      <Link2 size={13} />
                      {sharing ? "Creating…" : "Create one-time link"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[12.5px] text-[#4E5C6E] leading-relaxed">
                    Send this link to your teammate. When they claim it, a fresh pair code
                    is issued automatically. The link can only be claimed <strong>once</strong>.
                  </div>
                  <div className="rounded-xl bg-[#FBFAF6] border border-[#E7E3D8] p-3 break-all font-mono text-[11.5px]" data-testid="share-url">
                    {shareUrl}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }}
                      className="inline-flex items-center gap-1.5 bg-[#0B1B2B] text-white text-[12.5px] font-medium px-4 py-2 rounded-full hover:bg-[#14283F]"
                      data-testid="share-copy"
                    >
                      <Copy size={12} /> Copy link
                    </button>
                    <button
                      onClick={() => { setShareUrl(""); setHostNameHint(""); setShareNote(""); }}
                      className="inline-flex items-center gap-1.5 text-[12.5px] text-[#4E5C6E] hover:text-[#0B1B2B] px-3 py-2"
                    >
                      <RefreshCw size={12} /> New link
                    </button>
                    <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8190A1]">
                      Expires {new Date(shareExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ---------- Stat card ---------------------------------------------------
function StatCard({ label, value, accent = false, testid }) {
  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-5" data-testid={testid}>
      <div className="text-[11px] tracking-[0.18em] uppercase text-[#8190A1] font-medium">{label}</div>
      <div className={`mt-2 font-display text-[32px] font-[500] leading-none ${accent ? "text-[#B8864C]" : "text-[#0B1B2B]"}`}>
        {value}
      </div>
    </div>
  );
}

// ---------- Agents card -------------------------------------------------
function SessionDot({ ok, label }) {
  const color = ok === undefined ? "bg-[#D8D6CD]" : ok ? "bg-[#1E7A36]" : "bg-[#9A2424]";
  const tip = ok === undefined ? `${label}: unknown` : ok ? `${label}: logged in` : `${label}: NOT logged in — re-run login.sh`;
  return (
    <span title={tip} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#4E5C6E]">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} /> {label}
    </span>
  );
}

function AgentsCard({ agents, onRevoke }) {
  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6" data-testid="agents-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold">
          <Bot size={14} /> Hosts
        </div>
        <span className="text-[11px] text-[#8190A1]">{agents.length} paired</span>
      </div>
      {agents.length === 0 ? (
        <p className="text-[13px] text-[#8190A1]">No hosts paired yet. Run the install command on your Mac, ASUS, or Linux box.</p>
      ) : (
        <ul className="space-y-3">
          {agents.map((a) => (
            <li key={a.id} className="text-[13px]">
              <div className="flex items-center gap-3">
                {a.online ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1E7A36] bg-[#DDF1E1] px-2 py-1 rounded-full">
                    <Wifi size={11} /> ONLINE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5C5C66] bg-[#EEEEF0] px-2 py-1 rounded-full">
                    <WifiOff size={11} /> offline
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#0B1B2B] truncate">{a.name}</div>
                  <div className="text-[10.5px] text-[#8190A1]">
                    paired {fmtRelative(a.paired_at)} · last beat {fmtRelative(a.last_heartbeat)}
                  </div>
                </div>
                <button
                  onClick={() => onRevoke(a.id)}
                  className="text-[11px] text-[#9A2424] hover:underline"
                >
                  Revoke
                </button>
              </div>
              {a.sessions && (
                <div className="mt-1.5 ml-[68px] flex gap-3">
                  <SessionDot ok={a.sessions.x}         label="X" />
                  <SessionDot ok={a.sessions.instagram} label="IG" />
                  <SessionDot ok={a.sessions.linkedin}  label="LinkedIn" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Composer ---------------------------------------------------
function Composer({ open, onClose, onCreated }) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [platforms, setPlatforms] = useState({ x: true, instagram: false, linkedin: false });
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    const list = Object.keys(platforms).filter((k) => platforms[k]);
    if (!caption.trim()) return toast.error("Caption is required");
    if (list.length === 0) return toast.error("Pick at least one platform");
    setBusy(true);
    try {
      await socialCreatePost({
        caption: caption.trim(),
        image_url: imageUrl.trim() || null,
        platforms: list,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      toast.success("Post queued");
      setCaption(""); setImageUrl(""); setScheduledAt("");
      onCreated();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to queue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={onClose} data-testid="composer-modal">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[22px] font-[500] text-[#0B1B2B]">New post</h3>
          <button onClick={onClose} className="text-[#8190A1] hover:text-[#0B1B2B]"><X size={16} /></button>
        </div>
        <label className="text-[11px] uppercase tracking-[0.16em] text-[#8190A1] font-medium">Caption</label>
        <textarea
          value={caption} onChange={(e) => setCaption(e.target.value)}
          rows={5} placeholder="What's the message?"
          className="mt-1 w-full rounded-xl border border-[#E7E3D8] focus:border-[#B8864C] outline-none px-3 py-2.5 text-[13px] leading-snug"
          data-testid="composer-caption"
        />
        <label className="mt-3 block text-[11px] uppercase tracking-[0.16em] text-[#8190A1] font-medium">Image URL (optional)</label>
        <input
          value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          placeholder="/kit-assets/instagram-post.jpg or full URL"
          className="mt-1 w-full rounded-xl border border-[#E7E3D8] focus:border-[#B8864C] outline-none px-3 py-2 text-[13px]"
          data-testid="composer-image"
        />
        <label className="mt-3 block text-[11px] uppercase tracking-[0.16em] text-[#8190A1] font-medium">Schedule</label>
        <input
          type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#E7E3D8] focus:border-[#B8864C] outline-none px-3 py-2 text-[13px]"
          data-testid="composer-schedule"
        />
        <p className="mt-1 text-[10.5px] text-[#8190A1]">Leave blank to dispatch as soon as a host is online.</p>

        <div className="mt-3 flex gap-3">
          {Object.keys(platforms).map((k) => (
            <label key={k} className="inline-flex items-center gap-1.5 text-[12px] cursor-pointer">
              <input
                type="checkbox" checked={platforms[k]}
                onChange={(e) => setPlatforms({ ...platforms, [k]: e.target.checked })}
                data-testid={`composer-platform-${k}`}
              />
              <span className="capitalize">{k}</span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="text-[12.5px] text-[#4E5C6E] hover:text-[#0B1B2B] px-3 py-2">
            Cancel
          </button>
          <button
            onClick={submit} disabled={busy}
            className="inline-flex items-center gap-1.5 bg-[#0B1B2B] hover:bg-[#14283F] disabled:opacity-50 text-white text-[12.5px] font-medium px-4 py-2 rounded-full"
            data-testid="composer-submit"
          >
            <Send size={12} /> Queue post
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Job detail modal ------------------------------------------
function JobDetailModal({ job, onClose }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={onClose} data-testid="job-modal">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-[#8190A1]">{job.platform} · {job.status}</div>
            <h3 className="font-display text-[20px] font-[500] text-[#0B1B2B]">Job detail</h3>
          </div>
          <button onClick={onClose} className="text-[#8190A1] hover:text-[#0B1B2B]"><X size={16} /></button>
        </div>
        {job.posted_url && (
          <p className="text-[12.5px] text-[#1E5793] break-all">
            <a href={job.posted_url} target="_blank" rel="noreferrer" className="hover:underline">{job.posted_url}</a>
          </p>
        )}
        {job.error && (
          <pre className="mt-3 rounded-xl bg-[#FAE0E0] text-[#9A2424] text-[12px] p-3 overflow-x-auto whitespace-pre-wrap">{job.error}</pre>
        )}
        {job.screenshot_b64 && (
          <img
            alt="agent screenshot"
            src={`data:image/jpeg;base64,${job.screenshot_b64}`}
            className="mt-4 w-full rounded-xl border border-[#E7E3D8]"
          />
        )}
        <div className="mt-3 text-[11px] text-[#8190A1]">
          Job ID: <span className="font-mono">{job.id}</span> · Created {fmtRelative(job.created_at)}
        </div>
      </div>
    </div>
  );
}

// ---------- Posts queue --------------------------------------------------
function PostsQueue({ posts, onRunNow, onCancel, onPreview }) {
  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white overflow-hidden" data-testid="posts-queue">
      <div className="px-6 py-4 border-b border-[#F3F1EA] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold">
          <Send size={14} /> Content queue
        </div>
        <span className="text-[11px] text-[#8190A1]">{posts.length} posts</span>
      </div>
      {posts.length === 0 ? (
        <div className="p-8 text-center text-[13px] text-[#8190A1]">
          Queue is empty. Hit "Generate next 14 days" above to fill it.
        </div>
      ) : (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-[#8190A1]">
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Platforms</th>
              <th className="px-3 py-3 font-medium">Caption</th>
              <th className="px-3 py-3 font-medium">Theme</th>
              <th className="px-3 py-3 font-medium">When</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-[#F3F1EA] hover:bg-[#FBFAF6]" data-testid={`post-row-${p.id}`}>
                <td className="px-6 py-3">
                  <span className={`inline-block text-[10.5px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_PILL[p.status] || "bg-[#EEEEF0]"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(p.platforms || []).map((pl) => {
                      const conf = PLATFORM_PILL[pl] || { label: pl, bg: "bg-gray-300", fg: "text-black" };
                      return (
                        <span key={pl} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${conf.bg} ${conf.fg}`}>
                          {conf.label}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-3 py-3 text-[#0B1B2B] max-w-md">
                  <div className="flex items-start gap-2">
                    {p.image_url && (
                      <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 border border-[#E7E3D8]" />
                    )}
                    <div className="line-clamp-2 leading-snug">{p.caption}</div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[#4E5C6E] capitalize">{p.theme || "—"}</td>
                <td className="px-3 py-3 text-[#8190A1] text-[11.5px] whitespace-nowrap">{fmtRelative(p.scheduled_at)}</td>
                <td className="px-6 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => onPreview(p)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#4E5C6E] hover:underline mr-3"
                    data-testid={`preview-${p.id}`}
                  >
                    <Eye size={11} /> Preview
                  </button>
                  {(p.status === "queued" || p.status === "scheduled") && (
                    <>
                      <button
                        onClick={() => onRunNow(p.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#1E5793] hover:underline mr-3"
                        data-testid={`run-now-${p.id}`}
                      >
                        <Play size={11} /> Run now
                      </button>
                      <button
                        onClick={() => onCancel(p.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#9A2424] hover:underline"
                      >
                        <X size={11} /> Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------- Preview modal (dry-run) -----------------------------------------
function PreviewModal({ post, onClose }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!post) { setPreview(null); return; }
    setLoading(true);
    socialPreviewPost(post.id)
      .then(setPreview)
      .catch(() => toast.error("Preview failed"))
      .finally(() => setLoading(false));
  }, [post]);

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
      data-testid="preview-modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white rounded-2xl border border-[#E7E3D8] shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F1EA]">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-[#B8864C]" />
            <div>
              <div className="text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold">
                Dry-run preview
              </div>
              <div className="text-[11px] text-[#8190A1]">
                Exactly what the host will publish · no network call
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8190A1] hover:text-[#0B1B2B]"
            data-testid="preview-close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="text-[13px] text-[#8190A1]">Rendering previews…</div>}
          {preview && (
            <div className="space-y-4">
              {preview.previews.map((pv) => {
                const conf = PLATFORM_PILL[pv.platform] || { label: pv.platform, bg: "bg-gray-300", fg: "text-black" };
                const over = pv.character_limit && pv.character_count > pv.character_limit;
                return (
                  <div key={pv.platform} className="border border-[#E7E3D8] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#FBFAF6] border-b border-[#F3F1EA]">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${conf.bg} ${conf.fg}`}>
                        {conf.label}
                      </span>
                      <span className={`text-[11px] font-mono ${over ? "text-[#9A2424]" : "text-[#8190A1]"}`}>
                        {pv.character_count}{pv.character_limit ? ` / ${pv.character_limit}` : ""}
                      </span>
                    </div>
                    <div className="p-4 text-[13.5px] text-[#0B1B2B] whitespace-pre-wrap leading-relaxed">
                      {pv.rendered_body}
                    </div>
                    {pv.attachment && (
                      <div className="px-4 pb-4">
                        <img
                          src={pv.attachment}
                          alt=""
                          className="w-full max-h-64 object-cover rounded-lg border border-[#E7E3D8]"
                        />
                      </div>
                    )}
                    <div className="px-4 pb-3 text-[10.5px] uppercase tracking-wider text-[#8190A1]">
                      Renders as: {pv.looks_like}
                    </div>
                    {(pv.warnings || []).length > 0 && (
                      <div className="px-4 pb-4 space-y-1">
                        {pv.warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-[12px] text-[#9A2424]">
                            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                            {w}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Phase 1: Safety panel ------------------------------------------
const PLATFORM_LABEL = { x: "X", instagram: "Instagram", linkedin: "LinkedIn" };

function riskColor(score) {
  if (score >= 70) return "bg-[#9A2424]/10 text-[#9A2424] border-[#9A2424]/30";
  if (score >= 40) return "bg-[#B8864C]/10 text-[#B8864C] border-[#B8864C]/30";
  return "bg-[#1E7A36]/10 text-[#1E7A36] border-[#1E7A36]/30";
}

function SafetyPanel() {
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setSummary(await socialSafetySummary()); } catch { /* 401 etc. */ }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 12000); return () => clearInterval(t); }, [load]);

  const togglePause = async (p) => {
    setBusy(true);
    try {
      if (p.paused) {
        await socialUnpauseAgent(p.agent_id, p.platform);
        toast.success(`${PLATFORM_LABEL[p.platform]} unpaused`);
      } else {
        await socialPauseAgent(p.agent_id, p.platform, "manual");
        toast.success(`${PLATFORM_LABEL[p.platform]} paused`);
      }
      load();
    } catch { toast.error("Failed"); }
    finally { setBusy(false); }
  };

  const recycleNow = async () => {
    setBusy(true);
    try {
      const r = await socialRecycleNow();
      toast.success(`Drafted post from: ${r.source_win}`);
      load();
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  if (!summary) return null;

  const policies = summary.policies || [];
  const qf = summary.queue_floor || {};

  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6" data-testid="safety-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold">
          <Shield size={14} /> Safety &amp; warm-up
        </div>
        <div className="flex items-center gap-2">
          {qf.currently_low && (
            <span className="inline-flex items-center gap-1 text-[10.5px] text-[#9A2424] font-semibold uppercase tracking-[0.15em]">
              <AlertTriangle size={11}/> Queue low — floor {qf.threshold}
            </span>
          )}
          <button
            onClick={recycleNow} disabled={busy}
            data-testid="recycle-now"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium border border-[#E7E3D8] hover:border-[#B8864C] text-[#4E5C6E] hover:text-[#B8864C] px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
          >
            <Trophy size={12}/> Recycle a win now
          </button>
        </div>
      </div>

      {policies.length === 0 ? (
        <p className="text-[13px] text-[#8190A1]">
          No hosts paired yet. Pair a host above — safety policies auto-seed on pairing.
        </p>
      ) : (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.15em] text-[#8190A1] border-b border-[#E7E3D8]">
              <th className="py-2 pr-4">Host</th>
              <th className="py-2 pr-4">Platform</th>
              <th className="py-2 pr-4">Warm-up</th>
              <th className="py-2 pr-4">Cadence</th>
              <th className="py-2 pr-4">Risk</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => {
              const warmed = p.warmup_complete;
              const wDay = p.warmup_day;
              const wTotal = p.warmup_days_total || 7;
              return (
                <tr key={`${p.agent_id}-${p.platform}`} className="border-b border-[#F2EFE6] last:border-none">
                  <td className="py-2 pr-4 font-medium">{p.agent_name}</td>
                  <td className="py-2 pr-4 uppercase tracking-wider text-[10.5px] text-[#4E5C6E]">
                    {PLATFORM_LABEL[p.platform] || p.platform}
                  </td>
                  <td className="py-2 pr-4">
                    {warmed ? (
                      <span className="text-[#1E7A36] text-[11.5px] font-medium">✓ Full cadence</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#E7E3D8] rounded overflow-hidden">
                          <div className="h-full bg-[#B8864C]"
                               style={{ width: `${Math.min(100, ((wDay ?? 0) + 1) * 100 / wTotal)}%` }} />
                        </div>
                        <span className="text-[11px] text-[#4E5C6E]">Day {(wDay ?? 0) + 1}/{wTotal}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-[11.5px] text-[#4E5C6E]">
                    max <b>{p.max_posts_per_day}</b>/day · min <b>{p.min_minutes_between}</b>m · quiet {p.quiet_hours_start}:00–{p.quiet_hours_end}:00
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 border rounded-full ${riskColor(p.ban_risk)}`}>
                      {p.ban_risk}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {p.paused ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#9A2424] font-semibold">
                        <Pause size={11}/> Paused
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#1E7A36] font-semibold">
                        <PlayCircle size={11}/> Active
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => togglePause(p)} disabled={busy}
                      data-testid={`toggle-${p.platform}`}
                      className="text-[11.5px] text-[#B8864C] hover:text-[#0B1B2B] transition-colors px-2"
                    >
                      {p.paused ? "Unpause" : "Pause"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="mt-3 text-[10.5px] text-[#8190A1]">
        Policy: warm-up tiers (7 days) → daily caps, min-spacing, quiet hours (1:00–7:00 local). 3 consecutive failures auto-pause. Ban-risk colour: green &lt; 40 &lt; amber &lt; 70 &lt; red.
      </p>
    </div>
  );
}


// ---------- Phase 1: Wins manager -------------------------------------------
function WinsCard() {
  const [wins, setWins] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", metric: "", detail: "", tags: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const r = await socialListWins(); setWins(r.wins || []); } catch { /* 401 */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await socialCreateWin({
        title: form.title, metric: form.metric, detail: form.detail,
        tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
      });
      toast.success("Win added — recycler can use it now");
      setForm({ title: "", metric: "", detail: "", tags: "" });
      setOpen(false); load();
    } catch (e2) { toast.error(e2?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this win?")) return;
    try { await socialDeleteWin(id); toast.success("Deleted"); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6" data-testid="wins-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold">
          <Trophy size={14}/> Client wins
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          data-testid="toggle-win-form"
          className="text-[11.5px] font-medium border border-[#E7E3D8] hover:border-[#B8864C] text-[#4E5C6E] hover:text-[#B8864C] px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5"
        >
          <Plus size={11}/> Add win
        </button>
      </div>

      {open && (
        <form onSubmit={create} className="grid gap-2 mb-5 p-3 bg-[#FBFAF6] rounded-lg border border-[#E7E3D8]">
          <input required placeholder="Title — e.g. Chrono Yachts"
            data-testid="win-title"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="bg-white border border-[#E7E3D8] rounded px-2 py-1.5 text-[13px]"/>
          <input required placeholder="Metric — e.g. +318% pipeline in 90 days"
            data-testid="win-metric"
            value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })}
            className="bg-white border border-[#E7E3D8] rounded px-2 py-1.5 text-[13px]"/>
          <textarea required placeholder="Detail (1-2 sentences)"
            data-testid="win-detail"
            value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })}
            rows={2} className="bg-white border border-[#E7E3D8] rounded px-2 py-1.5 text-[13px] resize-none"/>
          <input placeholder="Tags (comma-separated) e.g. receipts, cro, pipeline"
            data-testid="win-tags"
            value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
            className="bg-white border border-[#E7E3D8] rounded px-2 py-1.5 text-[13px]"/>
          <button disabled={busy} data-testid="win-submit"
            className="bg-[#0B1B2B] hover:bg-[#14283F] text-white text-[12.5px] font-medium px-3 py-1.5 rounded mt-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
            <Send size={11}/> {busy ? "Saving…" : "Save win"}
          </button>
        </form>
      )}

      {wins.length === 0 ? (
        <p className="text-[13px] text-[#8190A1]">No wins on file yet. Add one to start the recycler.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {wins.map((w) => (
            <li key={w.id} className="flex items-start gap-2 text-[13px] border-b border-[#F2EFE6] pb-2 last:border-none last:pb-0">
              <Trophy size={13} className="text-[#B8864C] mt-0.5 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#0B1B2B]">{w.title}</div>
                <div className="text-[#1E7A36] text-[12px] font-medium">{w.metric}</div>
                <div className="text-[11.5px] text-[#4E5C6E] truncate">{w.detail}</div>
                <div className="text-[10.5px] text-[#8190A1] mt-0.5">used {w.uses || 0}x</div>
              </div>
              <button onClick={() => remove(w.id)}
                data-testid={`delete-win-${w.id}`}
                className="text-[#8190A1] hover:text-[#9A2424] p-1 transition-colors">
                <Trash2 size={12}/>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// ---------- Phase 1: Cross-poster (1 brief → N platforms) ------------------
function CrossPoster({ onPosted }) {
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("confident");
  const [platforms, setPlatforms] = useState(["x", "instagram", "linkedin"]);
  const [busy, setBusy] = useState(false);

  const togglePlatform = (p) => {
    setPlatforms((ps) => ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p]);
  };

  const post = async (e) => {
    e.preventDefault();
    if (!brief.trim() || platforms.length === 0) return;
    setBusy(true);
    try {
      const r = await socialCrossPost({ brief, tone, platforms });
      toast.success(`Queued ${r.created.length} platform-tailored post(s)`);
      setBrief("");
      onPosted?.();
    } catch (e2) { toast.error(e2?.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6" data-testid="cross-poster">
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold mb-4">
        <Zap size={14}/> Cross-poster
      </div>
      <p className="text-[12px] text-[#4E5C6E] mb-3">
        One brief → a platform-tailored caption queued for each selected platform (X punchy, IG casual, LinkedIn story-led).
      </p>
      <form onSubmit={post} className="grid gap-3">
        <textarea required rows={3} value={brief}
          data-testid="cross-brief"
          onChange={e => setBrief(e.target.value)}
          placeholder="What's the post about? e.g. 'Shipped a voice agent for a yacht broker that booked 14 calls in a week — lessons on AI voice for luxury.'"
          className="bg-white border border-[#E7E3D8] rounded px-3 py-2 text-[13px] resize-none"/>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={tone} onChange={e => setTone(e.target.value)}
            data-testid="cross-tone"
            className="bg-white border border-[#E7E3D8] rounded px-2 py-1.5 text-[12.5px]">
            <option value="confident">Confident</option>
            <option value="contrarian">Contrarian</option>
            <option value="receipts">Receipts</option>
            <option value="story">Story</option>
            <option value="curiosity">Curiosity</option>
          </select>
          {Object.keys(PLATFORM_LABEL).map((p) => (
            <button type="button" key={p}
              onClick={() => togglePlatform(p)}
              data-testid={`cross-${p}`}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium border transition-colors ${
                platforms.includes(p)
                  ? "bg-[#0B1B2B] text-white border-[#0B1B2B]"
                  : "bg-white text-[#4E5C6E] border-[#E7E3D8] hover:border-[#B8864C]"
              }`}>
              {PLATFORM_LABEL[p]}
            </button>
          ))}
          <button disabled={busy || !brief.trim() || platforms.length === 0}
            data-testid="cross-submit"
            className="ml-auto bg-[#B8864C] hover:bg-[#C99661] disabled:opacity-50 text-white text-[12.5px] font-medium px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm shadow-[#B8864C]/20">
            {busy ? <RefreshCw size={12} className="animate-spin"/> : <Target size={12}/>}
            {busy ? "Queuing…" : "Queue for all"}
          </button>
        </div>
      </form>
    </div>
  );
}



// ---------- Main page ---------------------------------------------------
export default function AdminSocial() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [dash, setDash] = useState(null);
  const [agents, setAgents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);

  const reload = useCallback(async () => {
    try {
      const [d, a, p, j] = await Promise.all([
        socialDashboard(), socialAgents(), socialPosts(), socialJobs(),
      ]);
      setDash(d);
      setAgents(a.agents || []);
      setPosts(p.posts || []);
      setJobs(j.jobs || []);
    } catch (e) {
      // 401s are normal before auth check resolves
    }
  }, []);

  useEffect(() => {
    adminMe().then(setAdmin).catch(() => setAdmin(null)).finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (!admin) return;
    reload();
    const t = setInterval(reload, 8000);
    return () => clearInterval(t);
  }, [admin, reload]);

  if (checked && !admin) return <Navigate to="/admin/login" replace />;
  if (!checked) {
    return (
      <div className="min-h-screen bg-[#FBFAF6] flex items-center justify-center text-[#8190A1] font-mono text-xs uppercase tracking-[0.3em]">
        Loading…
      </div>
    );
  }

  const generateBatch = async () => {
    setGenerating(true);
    try {
      const r = await socialGenerateBatch({ days: 14, platforms: ["x", "instagram", "linkedin"], posts_per_day: 1 });
      toast.success(`Generated ${r.created} posts`);
      reload();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const runNow = async (id) => {
    try { await socialRunNow(id); toast.success("Queued for next dispatch"); reload(); }
    catch { toast.error("Failed"); }
  };
  const cancel = async (id) => {
    try { await socialCancelPost(id); toast.success("Cancelled"); reload(); }
    catch { toast.error("Failed"); }
  };
  const revoke = async (id) => {
    if (!window.confirm("Revoke this host? It will be disconnected immediately.")) return;
    try { await socialRevokeAgent(id); toast.success("Host revoked"); reload(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#0B1B2B]">
      <AdminNav
        theme="bone"
        title="Social auto-poster"
        subtitle="/ CONTENT FACTORY"
        current="social"
        backTo="/admin"
        rightSlot={
          <>
            <button
              onClick={() => setComposerOpen(true)}
              data-testid="open-composer"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#14283F] text-white text-[12.5px] font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap shrink-0"
            >
              <Plus size={13} /> New post
            </button>
            <button
              onClick={generateBatch}
              disabled={generating}
              data-testid="generate-batch"
              className="inline-flex items-center gap-2 bg-[#B8864C] hover:bg-[#C99661] disabled:opacity-50 text-white text-[12.5px] font-medium px-4 py-2 rounded-full transition-colors shadow-sm shadow-[#B8864C]/20 whitespace-nowrap shrink-0"
            >
              {generating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span className="hidden sm:inline">Generate next 14 days</span>
              <span className="sm:hidden">Generate 14d</span>
            </button>
          </>
        }
      />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10 space-y-8 md:space-y-10">
        {/* Agent-offline banner — critical: no host online but posts queued */}
        {dash && dash.agents_online === 0 && dash.queued > 0 && (
          <div
            className="rounded-2xl border border-[#9A2424]/40 bg-gradient-to-r from-[#FAE0E0] to-[#FBF3EC] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4"
            data-testid="agent-offline-banner"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-[#9A2424]/15 flex items-center justify-center flex-shrink-0">
                <WifiOff size={18} className="text-[#9A2424]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#9A2424] uppercase tracking-wider">
                  No host online — {dash.queued} post{dash.queued === 1 ? "" : "s"} stalled
                </div>
                <div className="text-[12.5px] text-[#4E5C6E] mt-0.5">
                  The auto-poster is running, but posts will not publish until you pair a Mac, Windows, or Linux host below.
                  {dash.agents_total > 0 && ` ${dash.agents_total} host${dash.agents_total === 1 ? "" : "s"} paired but offline.`}
                </div>
              </div>
            </div>
            <a
              href="#pair-flow"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('[data-testid="pair-flow"]')?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-1.5 bg-[#0B1B2B] hover:bg-[#14283F] text-white text-[12.5px] font-medium px-4 py-2 rounded-full whitespace-nowrap"
              data-testid="banner-pair-cta"
            >
              Pair a host now →
            </a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4" data-testid="social-stats">
          <StatCard label="Hosts online"  value={dash?.agents_online ?? 0} accent testid="stat-online" />
          <StatCard label="Hosts paired"  value={dash?.agents_total  ?? 0} testid="stat-paired" />
          <StatCard label="Queued"        value={dash?.queued        ?? 0} testid="stat-queued" />
          <StatCard label="Published"     value={dash?.published     ?? 0} testid="stat-published" />
          <StatCard label="Failed"        value={dash?.failed        ?? 0} testid="stat-failed" />
        </div>

        {/* Pair + Agents */}
        <div className="grid md:grid-cols-2 gap-6">
          <PairFlow onPaired={reload} />
          <AgentsCard agents={agents} onRevoke={revoke} />
        </div>

        {/* Phase 1: Safety panel */}
        <SafetyPanel />

        {/* Phase 1: Wins + Cross-poster */}
        <div className="grid md:grid-cols-2 gap-6">
          <WinsCard />
          <CrossPoster onPosted={reload} />
        </div>

        {/* Queue */}
        <PostsQueue posts={posts} onRunNow={runNow} onCancel={cancel} onPreview={setPreviewPost} />

        {/* Recent jobs */}
        {jobs.length > 0 && (
          <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6" data-testid="recent-jobs">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#B8864C] font-semibold mb-4">
              <Clock size={14} /> Recent runs
            </div>
            <ul className="space-y-2 text-[13px]">
              {jobs.slice(0, 12).map((j) => (
                <li
                  key={j.id}
                  onClick={() => setActiveJob(j)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-[#FBFAF6] -mx-2 px-2 py-1 rounded transition-colors"
                  data-testid={`job-row-${j.id}`}
                >
                  {j.status === "succeeded" ? <CheckCircle2 size={14} className="text-[#1E7A36]" />
                    : j.status === "failed"  ? <AlertTriangle size={14} className="text-[#9A2424]" />
                    : <Clock size={14} className="text-[#8190A1]" />}
                  <span className="font-medium uppercase text-[10.5px] tracking-wider text-[#4E5C6E]">{j.platform}</span>
                  <span className="flex-1 truncate text-[#4E5C6E]">{j.posted_url || j.error || "queued"}</span>
                  <span className="text-[10.5px] text-[#8190A1]">{fmtRelative(j.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} onCreated={reload} />
      <JobDetailModal job={activeJob} onClose={() => setActiveJob(null)} />
      <PreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
    </div>
  );
}
