import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2, Copy, Terminal, Apple, Monitor, Shield, Zap, X,
  AlertTriangle, Sparkles, Clock,
} from "lucide-react";
import { publicGetPairInvite, publicClaimPairInvite } from "@/lib/api";

/* ------------------------------------------------------------------
   Public pair-invite wizard — no auth. An admin shares a one-time
   link of the form /pair?token=abc123 and the teammate pairs their
   own Mac / PC / Linux box without ever touching the admin panel.
-------------------------------------------------------------------*/

const OS_TABS = [
  { id: "mac",   label: "macOS",   icon: Apple,    req: "macOS 12+" },
  { id: "win",   label: "Windows", icon: Monitor,  req: "Windows 10+" },
  { id: "linux", label: "Linux",   icon: Terminal, req: "Ubuntu 20+ / Debian 11+" },
];

function fmtExpiry(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (d - new Date()) / 1000;
  if (diff < 60) return `${Math.max(0, Math.round(diff))}s`;
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  return `${Math.round(diff / 3600)}h`;
}

export default function PairWizard() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [state, setState] = useState("loading"); // loading | ready | claimed | error
  const [errMsg, setErrMsg] = useState("");
  const [invite, setInvite] = useState(null);
  const [code, setCode] = useState(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [os, setOs] = useState("mac");
  const [claiming, setClaiming] = useState(false);

  // Validate invite on mount (does NOT consume)
  useEffect(() => {
    if (!token) {
      setState("error");
      setErrMsg("No invite token in the link. Ask the admin to share the full URL.");
      return;
    }
    (async () => {
      try {
        const data = await publicGetPairInvite(token);
        setInvite(data);
        setState("ready");
      } catch (e) {
        setState("error");
        const status = e?.response?.status;
        if (status === 404) setErrMsg("This invite link doesn't exist.");
        else if (status === 410) setErrMsg("This invite has already been used or has expired. Ask the admin for a fresh link.");
        else setErrMsg("Something went wrong validating the invite. Please try again.");
      }
    })();
  }, [token]);

  const claim = async () => {
    setClaiming(true);
    try {
      const r = await publicClaimPairInvite(token);
      setCode(r.code);
      setCodeExpiresAt(r.expires_at);
      setState("claimed");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 410) setErrMsg("The invite was just used or expired. Ask the admin for a new one.");
      else setErrMsg("Could not issue a pair code. Please try again.");
      setState("error");
    } finally {
      setClaiming(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const codeStr = code || "XXXXXX";

  const cmd = useMemo(() => {
    if (os === "mac") {
      return `curl -fsSL ${origin}/agent-host/install.sh | bash -s -- --code ${codeStr} --backend ${origin}`;
    }
    if (os === "win") {
      return `$env:BRIVO_CODE="${codeStr}"; irm ${origin}/agent-host/install.ps1 | iex`;
    }
    return `curl -fsSL ${origin}/agent-host/install-linux.sh | bash -s -- ${codeStr}`;
  }, [os, origin, codeStr]);

  const copy = () => {
    navigator.clipboard.writeText(cmd);
    toast.success("Install command copied");
  };

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#0B1B2B]" data-testid="public-pair-page">
      {/* Header */}
      <header className="border-b border-[#E7E3D8] bg-white/70 backdrop-blur">
        <div className="max-w-[960px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B1B2B] flex items-center justify-center">
              <span className="text-[#B8864C] font-display text-[18px] font-[500] leading-none">B</span>
            </div>
            <div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-[#B8864C] font-semibold">
                Host onboarding
              </div>
              <div className="font-display text-[18px] font-[500] leading-none mt-0.5">
                Brivo Auto-Poster
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8190A1]">
            <Shield size={12} className="text-[#B8864C]" /> Single-use · encrypted
          </div>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-14">
        {state === "loading" && (
          <div className="text-center py-24 font-mono text-[11px] uppercase tracking-[0.3em] text-[#8190A1]">
            Validating invite…
          </div>
        )}

        {state === "error" && (
          <div
            className="rounded-2xl border border-[#9A2424]/30 bg-[#FAE0E0]/40 p-8 text-center"
            data-testid="pair-error"
          >
            <div className="inline-flex w-12 h-12 rounded-full bg-[#9A2424]/10 items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-[#9A2424]" />
            </div>
            <h1 className="font-display text-[26px] font-[500] mb-2">Invite unavailable</h1>
            <p className="text-[14px] text-[#4E5C6E] leading-relaxed max-w-md mx-auto">
              {errMsg || "This link can't be used right now."}
            </p>
          </div>
        )}

        {state === "ready" && invite && (
          <div
            className="rounded-2xl border border-[#E7E3D8] bg-white p-7 md:p-9"
            data-testid="pair-ready"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#B8864C] font-semibold mb-3">
              <Sparkles size={13} /> You're invited
            </div>
            <h1 className="font-display text-[28px] md:text-[34px] font-[500] leading-[1.1] tracking-tight">
              Pair your Mac, PC, or Linux box{" "}
              <span className="text-[#B8864C]">as a posting host.</span>
            </h1>
            <p className="mt-4 text-[14px] text-[#4E5C6E] leading-relaxed max-w-[580px]">
              {invite.issued_by_display ? (
                <>Shared by <span className="font-medium text-[#0B1B2B]">{invite.issued_by_display}</span>. </>
              ) : null}
              You'll install a lightweight agent that lives on your own hardware and
              signs into social accounts <em>in your own Chromium profile</em> — no
              cloud scraping, no password storage.
            </p>

            {invite.host_name_hint && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E7E3D8] bg-[#FBFAF6] px-3 py-1 text-[12px] text-[#4E5C6E]">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#8190A1]">
                  For host
                </span>
                <span className="font-medium text-[#0B1B2B]">{invite.host_name_hint}</span>
              </div>
            )}

            {invite.note && (
              <div className="mt-3 text-[13px] text-[#4E5C6E] italic border-l-2 border-[#B8864C]/40 pl-3">
                “{invite.note}”
              </div>
            )}

            {/* What happens next */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { n: "01", title: "Grab your code", body: "We'll issue a 6-digit pair code — expires in 10 minutes." },
                { n: "02", title: "Paste one install line", body: "Auto-installs the agent, registers on boot, self-pairs." },
                { n: "03", title: "Log in once in Chromium", body: "IG / X / LinkedIn stay logged in forever on your profile." },
              ].map((s) => (
                <div key={s.n} className="rounded-xl border border-[#F0ECE0] bg-[#FBFAF6] p-4">
                  <div className="font-mono text-[10px] tracking-[0.28em] text-[#B8864C] font-semibold">{s.n}</div>
                  <div className="mt-1.5 text-[13px] font-semibold leading-snug">{s.title}</div>
                  <div className="mt-1 text-[11.5px] text-[#4E5C6E] leading-snug">{s.body}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] text-[#4E5C6E]">
              {[
                { label: "End-to-end encrypted", icon: Shield },
                { label: "No file access", icon: CheckCircle2 },
                { label: "~2% CPU · 80MB RAM", icon: Zap },
                { label: "Revoke in one click", icon: X },
              ].map((t) => {
                const I = t.icon;
                return (
                  <div key={t.label} className="inline-flex items-center gap-1.5">
                    <I size={12} className="text-[#B8864C]" />
                    <span className="truncate">{t.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={claim}
                disabled={claiming}
                data-testid="pair-claim"
                className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#14283F] disabled:opacity-60 text-white text-[13.5px] font-medium px-5 py-3 rounded-full transition-colors shadow-sm shadow-black/10"
              >
                <Sparkles size={14} />
                {claiming ? "Generating…" : "Start pairing"}
              </button>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8190A1]">
                Link expires in ~{fmtExpiry(invite.expires_at)}
              </span>
            </div>
          </div>
        )}

        {state === "claimed" && (
          <div
            className="rounded-2xl border border-[#E7E3D8] bg-white p-7 md:p-9"
            data-testid="pair-claimed"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#1E7A36] font-semibold mb-3">
              <CheckCircle2 size={13} /> Code issued
            </div>
            <h1 className="font-display text-[26px] md:text-[32px] font-[500] leading-[1.1] tracking-tight">
              Your pair code is ready.
            </h1>

            {/* Big code */}
            <div className="mt-6 rounded-xl border border-[#E7E3D8] bg-[#FBFAF6] p-5 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-[#8190A1] mb-1">
                  Pair code
                </div>
                <div
                  className="font-display text-[40px] sm:text-[48px] tracking-[0.22em] font-[500] text-[#B8864C] leading-none"
                  data-testid="issued-code"
                >
                  {code}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#8190A1]">Expires</div>
                <div className="text-[12.5px] text-[#0B1B2B] font-medium inline-flex items-center gap-1">
                  <Clock size={11} className="text-[#8190A1]" />
                  in {fmtExpiry(codeExpiresAt)}
                </div>
              </div>
            </div>

            {/* OS tabs */}
            <div className="mt-6 flex gap-1 border-b border-[#F3F1EA] overflow-x-auto no-scrollbar">
              {OS_TABS.map((t) => {
                const Icon = t.icon;
                const active = t.id === os;
                return (
                  <button
                    key={t.id}
                    onClick={() => setOs(t.id)}
                    className={`relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                      active ? "text-[#0B1B2B]" : "text-[#8190A1] hover:text-[#0B1B2B]"
                    }`}
                    data-testid={`pair-os-${t.id}`}
                  >
                    <Icon size={13} /> {t.label}
                    {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#B8864C]" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8190A1]">
              Requires · {OS_TABS.find((t) => t.id === os)?.req}
            </div>

            {/* Install command */}
            <div
              className="mt-4 rounded-xl bg-[#0B1B2B] text-white text-[11.5px] font-mono p-4 overflow-x-auto leading-relaxed"
              data-testid="pair-install-cmd"
            >
              <span className="text-[#B8864C]">$</span> {cmd}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 bg-[#0B1B2B] text-white text-[12.5px] font-medium px-4 py-2 rounded-full hover:bg-[#14283F] transition-colors"
                data-testid="pair-copy-cmd"
              >
                <Copy size={12} /> Copy install command
              </button>
              <div className="ml-auto text-[11.5px] text-[#8190A1] self-center">
                Paste in <span className="font-mono">{os === "win" ? "PowerShell" : "Terminal"}</span> on the machine you want to turn into a host.
              </div>
            </div>

            {/* Next */}
            <div className="mt-8 rounded-xl border border-[#F0ECE0] bg-[#FBFAF6] p-4 text-[13px] text-[#4E5C6E] leading-relaxed">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#B8864C] font-semibold mb-2">
                What happens next
              </div>
              <ol className="space-y-1.5 list-decimal pl-5">
                <li>The installer downloads Python + Chromium, creates the agent, and registers a boot service.</li>
                <li>A second terminal opens Chromium — log into Instagram, X, and LinkedIn once.</li>
                <li>Your host shows up in the Brivo dashboard as <span className="font-medium text-[#1E7A36]">ONLINE</span> within ~30 seconds.</li>
              </ol>
            </div>

            <div className="mt-6 text-[11px] text-[#8190A1] font-mono uppercase tracking-[0.2em]">
              You can close this page once the install completes.
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-[960px] mx-auto px-5 md:px-8 py-8 text-center text-[11px] text-[#8190A1]">
        Brivo · Auto-Poster host onboarding · single-use link
      </footer>
    </div>
  );
}
