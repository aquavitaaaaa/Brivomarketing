import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Rocket, Clock, Hand, Zap, Check, X, Loader2, ImageIcon, ExternalLink } from "lucide-react";
import {
  apOverview, apUpdate, apPosts, apRunNow, apApprove, apSkip, apEdit, apShots,
} from "@/lib/api";

const MODES = [
  { id: "auto", icon: Zap, title: "Auto", desc: "We pick the best time each weekday and post hands-off." },
  { id: "timed", icon: Clock, title: "Timed", desc: "You pick one daily time. Hands-off." },
  { id: "manual", icon: Hand, title: "Manual", desc: "A draft is made daily. Nothing posts until you approve." },
];
const TZS = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "UTC"];
const PILL = {
  draft: "bg-[#F1EAD8] text-[#8B6E2C]", queued: "bg-[#DCEAF7] text-[#1E5793]", running: "bg-[#DCEAF7] text-[#1E5793]",
  published: "bg-[#DDF1E1] text-[#1E7A36]", failed: "bg-[#FAE0E0] text-[#9A2424]", cancelled: "bg-[#EEEEF0] text-[#5C5C66]",
};

export default function AutopilotPanel() {
  const [ov, setOv] = useState(null);
  const [posts, setPosts] = useState([]);
  const [shots, setShots] = useState([]);
  const [busy, setBusy] = useState("");
  const [edit, setEdit] = useState({});

  const load = useCallback(async () => {
    setOv(await apOverview().catch(() => null));
    setPosts((await apPosts().catch(() => ({ posts: [] }))).posts);
  }, []);
  useEffect(() => {
    load();
    apShots().then((r) => setShots(r.shots)).catch(() => null);
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const save = async (patch, msg) => {
    try { await apUpdate(patch); toast.success(msg || "Saved"); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Save failed"); }
  };
  const run = async (body, key) => {
    setBusy(key);
    try { await apRunNow(body); toast.success(body.publish_now ? "Queued to publish now" : "Post created"); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Could not create post"); }
    setBusy("");
  };
  const s = ov?.settings;
  const ch = ov?.channels;
  const chLabel = {
    graph_api: "Instagram Graph API",
    direct: `Direct account @${ch?.direct_account}`,
    paired_host: "Paired host (no server channel yet)",
  }[ch?.active];

  return (
    <section className="rounded-2xl border border-[#E7E3D8] bg-white p-6 md:p-8" data-testid="autopilot-panel">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#B8864C]"><Rocket size={13} /> Instagram autopilot</div>
          <h2 className="font-display text-3xl mt-2">Post daily. Never think about it.</h2>
          <p className="text-[13px] text-[#4E5C6E] mt-1">
            Publishing via: <b data-testid="autopilot-channel">{chLabel || "…"}</b>
            {ch?.active === "paired_host" && " — add META_ACCESS_TOKEN + IG_BUSINESS_ACCOUNT_ID or connect a direct account for true hands-off posting."}
          </p>
        </div>
        <label className="inline-flex items-center gap-3 cursor-pointer select-none" data-testid="autopilot-enabled-toggle">
          <span className="text-[12px] uppercase tracking-wider text-[#4E5C6E]">{s?.enabled ? "Running" : "Paused"}</span>
          <input type="checkbox" className="sr-only peer" checked={!!s?.enabled}
            onChange={(e) => save({ enabled: e.target.checked }, e.target.checked ? "Autopilot on" : "Autopilot paused")} />
          <span className="w-12 h-7 rounded-full bg-[#D8D3C4] peer-checked:bg-[#1E7A36] relative transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon; const on = s?.mode === m.id;
          return (
            <button key={m.id} onClick={() => save({ mode: m.id }, `Mode: ${m.title}`)} data-testid={`autopilot-mode-${m.id}`}
              className={`text-left rounded-xl border p-4 transition-colors ${on ? "border-[#0B1B2B] bg-[#0B1B2B] text-white" : "border-[#E7E3D8] hover:border-[#B8864C]"}`}>
              <Icon size={18} className={on ? "text-[#B8864C]" : "text-[#8190A1]"} />
              <div className="font-medium mt-2">{m.title}</div>
              <div className={`text-[12.5px] mt-1 ${on ? "text-white/70" : "text-[#4E5C6E]"}`}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-4 mt-5">
        {s?.mode !== "auto" && (
          <label className="text-[12px] text-[#4E5C6E]">Daily time
            <input type="time" value={s?.post_time || "12:00"} data-testid="autopilot-time"
              onChange={(e) => save({ post_time: e.target.value }, "Time saved")}
              className="block mt-1 border border-[#E7E3D8] rounded-lg px-3 py-2 text-[#0B1B2B]" />
          </label>
        )}
        <label className="text-[12px] text-[#4E5C6E]">Timezone
          <select value={s?.timezone || ""} data-testid="autopilot-tz" onChange={(e) => save({ timezone: e.target.value }, "Timezone saved")}
            className="block mt-1 border border-[#E7E3D8] rounded-lg px-3 py-2 text-[#0B1B2B] bg-white">
            {TZS.map((z) => <option key={z}>{z}</option>)}
          </select>
        </label>
        <div className="text-[12px] text-[#4E5C6E]">Next slot: <b>{ov?.next_slot ? new Date(ov.next_slot).toLocaleString() : "—"}</b></div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => run({}, "gen")} disabled={!!busy} data-testid="autopilot-generate"
            className="inline-flex items-center gap-2 border border-[#0B1B2B] text-[13px] px-4 py-2 rounded-full hover:bg-[#0B1B2B] hover:text-white transition-colors">
            {busy === "gen" ? <Loader2 size={13} className="animate-spin" /> : null} Generate a post
          </button>
          <button onClick={() => run({ publish_now: true }, "now")} disabled={!!busy} data-testid="autopilot-post-now"
            className="inline-flex items-center gap-2 bg-[#B8864C] text-white text-[13px] px-4 py-2 rounded-full hover:bg-[#C99661] transition-colors">
            {busy === "now" ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />} Post now
          </button>
        </div>
      </div>

      <div className="mt-8" data-testid="autopilot-posts">
        <div className="text-[11px] tracking-[0.2em] uppercase text-[#8190A1] mb-3">Autopilot posts</div>
        {posts.length === 0 && <div className="text-[13px] text-[#8190A1] border border-dashed border-[#E7E3D8] rounded-xl p-6 text-center">Nothing yet. Turn autopilot on or generate a post.</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {posts.slice(0, 8).map((p) => (
            <div key={p.id} className="flex gap-4 border border-[#E7E3D8] rounded-xl p-3" data-testid={`autopilot-post-${p.id}`}>
              {p.image_url && <img src={p.image_url} alt="" className="w-24 h-28 object-cover rounded-lg shrink-0" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded-full ${PILL[p.status] || ""}`}>{p.status}</span>
                  <span className="text-[11px] text-[#8190A1]">{new Date(p.scheduled_at).toLocaleString()}</span>
                </div>
                {edit[p.id] !== undefined ? (
                  <textarea value={edit[p.id]} onChange={(e) => setEdit({ ...edit, [p.id]: e.target.value })} rows={4}
                    className="w-full border border-[#E7E3D8] rounded-lg p-2 text-[12.5px]" />
                ) : <p className="text-[12.5px] text-[#4E5C6E] line-clamp-4 whitespace-pre-wrap">{p.caption}</p>}
                {p.error && <p className="text-[11px] text-[#9A2424] mt-1">{p.error}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {p.status === "draft" && (
                    <button data-testid={`approve-${p.id}`} onClick={async () => {
                      if (edit[p.id] !== undefined) await apEdit(p.id, { caption: edit[p.id] });
                      await apApprove(p.id); toast.success("Approved, publishing"); setEdit({}); load();
                    }} className="inline-flex items-center gap-1 text-[12px] bg-[#1E7A36] text-white px-3 py-1 rounded-full"><Check size={12} /> Approve &amp; post</button>
                  )}
                  {["draft", "queued"].includes(p.status) && edit[p.id] === undefined && (
                    <button onClick={() => setEdit({ ...edit, [p.id]: p.caption })} className="text-[12px] border border-[#E7E3D8] px-3 py-1 rounded-full">Edit</button>
                  )}
                  {edit[p.id] !== undefined && p.status !== "draft" && (
                    <button onClick={async () => { await apEdit(p.id, { caption: edit[p.id] }); setEdit({}); toast.success("Caption saved"); load(); }} className="text-[12px] border border-[#E7E3D8] px-3 py-1 rounded-full">Save</button>
                  )}
                  {["draft", "queued"].includes(p.status) && (
                    <button data-testid={`skip-${p.id}`} onClick={async () => { await apSkip(p.id); load(); }} className="inline-flex items-center gap-1 text-[12px] text-[#9A2424] px-3 py-1"><X size={12} /> Skip</button>
                  )}
                  {p.permalink && <a href={p.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-[#1E5793]"><ExternalLink size={12} /> View</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8" data-testid="social-shots">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#8190A1] mb-3"><ImageIcon size={13} /> Social shots · click to post</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {shots.map((sh) => (
            <button key={sh.slug} title={sh.title} data-testid={`shot-${sh.slug}`} onClick={() => run({ slug: sh.slug }, sh.slug)} disabled={!!busy}
              className="group relative rounded-lg overflow-hidden border border-[#E7E3D8] hover:border-[#B8864C] transition-colors">
              <img src={sh.image_url} alt={sh.title} loading="lazy" className="w-full aspect-[4/5] object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-[#0B1B2B]/85 text-white text-[10.5px] px-2 py-1 truncate">{busy === sh.slug ? "Creating…" : sh.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
