import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Instagram, Shield, Send, Trash2, Loader2, CheckCircle2, AlertTriangle,
  KeyRound, Globe, ExternalLink, RefreshCw,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import {
  adminMe, directIgAccounts, directIgConnect, directIgPost, directIgDisconnect,
} from "@/lib/api";

/* Available brand images the operator can post (the posters + ad creatives we
   generate into /public/kit-assets). */
const ASSETS = [
  ...Array.from({ length: 9 }, (_, i) => ({
    label: `Poster ${String(i + 1).padStart(2, "0")}`,
    url: `/kit-assets/ig-posts/post-${String(i + 1).padStart(2, "0")}.jpg`,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    label: `Ad creative ${String(i + 1).padStart(2, "0")}`,
    url: `/kit-assets/ad-creatives/ad-${String(i + 1).padStart(2, "0")}.jpg`,
  })),
];

const STATUS = {
  connected: { cls: "bg-[#DDF1E1] text-[#1E7A36]", label: "Connected" },
  error:     { cls: "bg-[#FAE0E0] text-[#9A2424]", label: "Needs attention" },
  challenge: { cls: "bg-[#FCE9D6] text-[#9C5314]", label: "Challenge" },
};

/* ----------------------------------------------------------- Connect form */
function ConnectCard({ onConnected }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [proxy, setProxy] = useState("");
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      toast.error("Enter username and password.");
      return;
    }
    setBusy(true);
    try {
      const r = await directIgConnect({
        username: username.trim(),
        password,
        proxy: proxy.trim() || null,
        verification_code: code.trim() || null,
      });
      if (r.status === "connected") {
        toast.success(`Connected as @${r.username}`);
        setPassword(""); setCode(""); setNeedCode(false);
        onConnected();
      } else if (r.status === "two_factor_required") {
        setNeedCode(true);
        toast("2FA required — enter the 6-digit code and submit again.", {
          icon: "🔐",
        });
      } else if (r.status === "challenge_required") {
        toast(r.message || "Instagram security check — approve it, then retry.", {
          icon: "⚠️", duration: 8000,
        });
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6">
      <div className="flex items-center gap-2 text-[#0B1B2B]">
        <KeyRound size={18} className="text-[#B8864C]" />
        <h2 className="font-display text-lg font-black uppercase tracking-tight">
          Connect an Instagram account
        </h2>
      </div>
      <p className="mt-2 text-sm text-[#4E5C6E]">
        The website logs in and posts for you. Use a{" "}
        <strong>SOCKS5 / residential proxy</strong> that matches your usual
        location — it keeps the login from being flagged.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#4E5C6E]">
            Instagram username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="brivo.marketing"
            data-testid="direct-username"
            className="mt-1 w-full rounded-lg border border-[#E7E3D8] bg-white px-3 py-2.5 text-sm text-[#0B1B2B] outline-none focus:border-[#0B1B2B]"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#4E5C6E]">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            data-testid="direct-password"
            className="mt-1 w-full rounded-lg border border-[#E7E3D8] bg-white px-3 py-2.5 text-sm text-[#0B1B2B] outline-none focus:border-[#0B1B2B]"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#4E5C6E]">
            <Globe size={12} /> Proxy (recommended)
          </span>
          <input
            value={proxy}
            onChange={(e) => setProxy(e.target.value)}
            placeholder="socks5://user:pass@host:port"
            data-testid="direct-proxy"
            className="mt-1 w-full rounded-lg border border-[#E7E3D8] bg-white px-3 py-2.5 font-mono text-sm text-[#0B1B2B] outline-none focus:border-[#0B1B2B]"
          />
        </label>
        {needCode && (
          <label className="block md:col-span-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9C5314]">
              2FA code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              data-testid="direct-2fa"
              className="mt-1 w-full rounded-lg border border-[#9C5314]/40 bg-[#FCF6EC] px-3 py-2.5 font-mono text-sm tracking-[0.3em] text-[#0B1B2B] outline-none focus:border-[#9C5314]"
            />
          </label>
        )}
      </div>

      <button
        onClick={submit}
        disabled={busy}
        data-testid="direct-connect-btn"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B1B2B] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#13314c] disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Instagram size={15} />}
        {busy ? "Connecting…" : needCode ? "Verify & connect" : "Connect"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------- Per-account card */
function AccountCard({ acc, onChanged }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(ASSETS[0].url);
  const [posting, setPosting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const st = STATUS[acc.status] || STATUS.connected;

  const post = async () => {
    if (!image) { toast.error("Pick an image."); return; }
    setPosting(true);
    try {
      const r = await directIgPost({
        account_id: acc.id, caption, image_url: image,
      });
      toast.success("Posted to Instagram!");
      if (r.url) {
        toast(`View post`, {
          action: { label: "Open", onClick: () => window.open(r.url, "_blank") },
        });
      }
      setCaption("");
      onChanged();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Post failed.");
    } finally {
      setPosting(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await directIgDisconnect(acc.id);
      toast.success("Account disconnected.");
      onChanged();
    } catch {
      toast.error("Failed to disconnect.");
      setRemoving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E7E3D8] bg-white p-5" data-testid={`direct-account-${acc.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#B8864C] to-[#0B1B2B] text-white">
            <Instagram size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-base font-black text-[#0B1B2B]">
              @{acc.username}
            </div>
            <div className="truncate text-xs text-[#4E5C6E]">
              {acc.full_name || "Instagram account"}
              {acc.proxy_set ? " · proxy on" : " · no proxy"}
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${st.cls}`}>
          {st.label}
        </span>
      </div>

      {acc.last_error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FAD9D9] bg-[#FDF0F0] px-3 py-2 text-xs text-[#9A2424]">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span className="break-words">{acc.last_error}</span>
        </div>
      )}

      <div className="mt-4 grid gap-3">
        <select
          value={image}
          onChange={(e) => setImage(e.target.value)}
          data-testid={`direct-image-${acc.id}`}
          className="w-full rounded-lg border border-[#E7E3D8] bg-white px-3 py-2.5 text-sm text-[#0B1B2B] outline-none focus:border-[#0B1B2B]"
        >
          {ASSETS.map((a) => (
            <option key={a.url} value={a.url}>{a.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <img
            src={image}
            alt="preview"
            className="h-20 w-16 shrink-0 rounded-md border border-[#E7E3D8] object-cover"
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            rows={3}
            data-testid={`direct-caption-${acc.id}`}
            className="w-full resize-none rounded-lg border border-[#E7E3D8] bg-white px-3 py-2.5 text-sm text-[#0B1B2B] outline-none focus:border-[#0B1B2B]"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={remove}
            disabled={removing}
            data-testid={`direct-disconnect-${acc.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E3D8] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8190A1] transition hover:border-[#8B0000] hover:text-[#8B0000]"
          >
            <Trash2 size={13} /> Disconnect
          </button>
          <button
            onClick={post}
            disabled={posting}
            data-testid={`direct-post-${acc.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B2B] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#13314c] disabled:opacity-60"
          >
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {posting ? "Posting…" : "Post now"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Page */
export default function AdminDirectPoster() {
  const [authed, setAuthed] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminMe().then(() => setAuthed(true)).catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAccounts(await directIgAccounts());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  if (authed === false) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-[#F6F4EE]">
      <AdminNav
        title="DIRECT POSTER"
        subtitle="/ INSTAGRAM"
        current="directposter"
        backTo="/admin/social"
        theme="bone"
      />

      <main className="mx-auto max-w-[1100px] px-4 py-8 md:px-8 md:py-10">
        {/* Safety banner */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#E7E3D8] bg-white p-4">
          <Shield size={18} className="mt-0.5 shrink-0 text-[#B8864C]" />
          <p className="text-sm text-[#4E5C6E]">
            The website posts directly to Instagram from the cloud — no spare PC
            needed. For account safety, always attach a{" "}
            <strong className="text-[#0B1B2B]">residential SOCKS5 proxy</strong>,
            post slowly while a new connection warms up, and use a Business /
            Creator account where possible. This uses Instagram's private API and
            is best paired with the host-agent on{" "}
            <a href="/admin/social" className="inline-flex items-center gap-0.5 text-[#0B1B2B] underline">
              Auto-Poster <ExternalLink size={11} />
            </a>.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ConnectCard onConnected={load} />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-black uppercase tracking-tight text-[#0B1B2B]">
                Connected accounts
              </h2>
              <button
                onClick={load}
                data-testid="direct-refresh"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E3D8] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#4E5C6E] transition hover:border-[#0B1B2B] hover:text-[#0B1B2B]"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-[#E7E3D8] bg-white p-6 text-sm text-[#4E5C6E]">
                <Loader2 size={15} className="animate-spin" /> Loading…
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8D2C4] bg-white/60 p-8 text-center">
                <CheckCircle2 size={22} className="mx-auto text-[#B8864C]" />
                <p className="mt-2 text-sm text-[#4E5C6E]">
                  No accounts yet. Connect one on the left to start posting.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {accounts.map((acc) => (
                  <AccountCard key={acc.id} acc={acc} onChanged={load} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
