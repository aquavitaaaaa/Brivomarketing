import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Building2,
  Tag,
  RefreshCcw,
  Search,
  MessageSquare,
  FileText,
  TrendingUp,
  Users,
  Trophy,
  Activity,
  X,
} from "lucide-react";
import {
  fetchClients,
  fetchClientDetail,
  fetchInquiryAnalytics,
  updateInquiryStatus,
} from "@/lib/api";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

const STATUS_STYLE = {
  new: "bg-[#CCFF00] text-black",
  contacted: "bg-blue-400/20 text-blue-300 border border-blue-400/30",
  qualified: "bg-violet-400/20 text-violet-300 border border-violet-400/30",
  won: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30",
  lost: "bg-white/10 text-white/45 border border-white/15",
};

const FUNNEL_COLOR = {
  new: "bg-[#CCFF00]",
  contacted: "bg-blue-400",
  qualified: "bg-violet-400",
  won: "bg-emerald-400",
  lost: "bg-white/25",
};

const fmtDate = (s) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#13131C] border border-white/10 p-4">
      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
        <Icon size={12} className={accent} />
        {label}
      </div>
      <div className={`mt-2 font-display text-3xl font-black ${accent || ""}`}>
        {value}
      </div>
    </div>
  );
}

function AnalyticsPanel({ a }) {
  if (!a) return null;
  const funnelMax = Math.max(
    1,
    ...STATUSES.map((s) => a.funnel?.[s] || 0)
  );
  const trendMax = Math.max(1, ...(a.series || []).map((d) => d.count));
  return (
    <div className="space-y-4" data-testid="clients-analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total leads" value={a.total} accent="text-white" />
        <StatCard
          icon={TrendingUp}
          label="Conversion"
          value={`${a.conversion_rate}%`}
          accent="text-[#CCFF00]"
        />
        <StatCard icon={Trophy} label="Won" value={a.won} accent="text-emerald-300" />
        <StatCard icon={Activity} label="Open" value={a.open} accent="text-blue-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Funnel */}
        <div className="bg-[#13131C] border border-white/10 p-4 lg:col-span-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
            Pipeline funnel
          </div>
          <div className="space-y-2.5">
            {STATUSES.map((s) => {
              const v = a.funnel?.[s] || 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/50 w-20 shrink-0">
                    {s}
                  </span>
                  <div className="flex-1 h-3 bg-black/40 rounded-sm overflow-hidden">
                    <div
                      className={`h-full ${FUNNEL_COLOR[s]} rounded-sm transition-all`}
                      style={{ width: `${(v / funnelMax) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-white/70 w-6 text-right">
                    {v}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-[#13131C] border border-white/10 p-4 lg:col-span-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
            Leads / day ({(a.series || []).length}d)
          </div>
          <div className="flex items-end gap-[3px] h-[110px]">
            {(a.series || []).map((d) => (
              <div
                key={d.date}
                className="flex-1 bg-[#CCFF00]/70 hover:bg-[#CCFF00] rounded-sm transition-colors min-h-[2px]"
                style={{ height: `${(d.count / trendMax) * 100}%` }}
                title={`${d.date}: ${d.count}`}
              />
            ))}
          </div>
        </div>

        {/* Top sources */}
        <div className="bg-[#13131C] border border-white/10 p-4 lg:col-span-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
            Top sources
          </div>
          <div className="space-y-2">
            {(a.top_sources || []).map((s) => (
              <div
                key={s.source}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-white/70 truncate">{s.source}</span>
                <span className="font-mono text-[11px] text-white/45 shrink-0">
                  {s.total}
                  {s.won > 0 && (
                    <span className="text-emerald-300"> · {s.won}w</span>
                  )}
                </span>
              </div>
            ))}
            {(!a.top_sources || a.top_sources.length === 0) && (
              <div className="text-white/35 text-sm">No source data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ email, onClose, onStatusChanged }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchClientDetail(email)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [email]);

  const setStatus = async (inquiryId, status) => {
    setDetail((d) => ({
      ...d,
      inquiries: d.inquiries.map((i) =>
        i.id === inquiryId ? { ...i, status } : i
      ),
    }));
    try {
      await updateInquiryStatus(inquiryId, status);
      onStatusChanged && onStatusChanged();
    } catch {
      load();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      data-testid="client-detail"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#0B0B0F] border-l border-white/15 h-full overflow-y-auto">
        <div className="sticky top-0 bg-[#0B0B0F]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="font-display text-xl font-black text-white truncate">
              {detail?.name || email}
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Mail size={10} /> {email}
              </span>
              {detail?.company && (
                <span className="inline-flex items-center gap-1">
                  <Building2 size={10} /> {detail.company}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white shrink-0"
            data-testid="client-detail-close"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Loading profile…
          </div>
        ) : !detail ? (
          <div className="p-8 text-white/50">Could not load this client.</div>
        ) : (
          <div className="p-6 space-y-7">
            {/* Inquiries */}
            <section>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00] mb-3 flex items-center gap-2">
                <FileText size={12} /> Inquiries ({detail.inquiries.length})
              </div>
              <div className="space-y-3">
                {detail.inquiries.map((it) => (
                  <div
                    key={it.id}
                    className="bg-[#13131C] border border-white/10 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <span className="font-display font-bold text-white">
                        {it.service_interest}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {fmtDate(it.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1.5">
                      {it.source && (
                        <span className="inline-flex items-center gap-1">
                          <Tag size={10} /> {it.source}
                        </span>
                      )}
                      {it.budget && <span>{it.budget}</span>}
                    </div>
                    {it.message && (
                      <p className="text-sm text-white/75 whitespace-pre-wrap mt-3">
                        {it.message}
                      </p>
                    )}
                    {it.roi_snapshot && (
                      <div className="bg-black/30 border border-white/10 p-3 mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-white/40 text-xs">Revenue</div>
                          <div className="font-bold">
                            ${Number(it.roi_snapshot.revenue).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/40 text-xs">ROAS</div>
                          <div className="font-bold">{it.roi_snapshot.roas}x</div>
                        </div>
                        <div>
                          <div className="text-white/40 text-xs">Spend</div>
                          <div className="font-bold">
                            ${Number(it.roi_snapshot.spend).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/40 text-xs">Lift</div>
                          <div className="font-bold text-[#CCFF00]">
                            +${Number(it.roi_snapshot.lift).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(it.id, s)}
                          className={`font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 border ${
                            it.status === s
                              ? "border-[#CCFF00] text-[#CCFF00]"
                              : "border-white/15 text-white/50 hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Chat conversation */}
            <section>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00] mb-3 flex items-center gap-2">
                <MessageSquare size={12} /> Chat ({detail.chat_messages.length}{" "}
                messages)
              </div>
              {detail.chat_messages.length === 0 ? (
                <div className="text-white/40 text-sm bg-[#13131C] border border-white/10 p-4">
                  No chat history linked to this client.
                </div>
              ) : (
                <div className="space-y-2">
                  {detail.chat_messages.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className={`flex ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 text-sm ${
                          m.role === "user"
                            ? "bg-[#CCFF00] text-black rounded-l-xl rounded-tr-xl"
                            : "bg-[#13131C] border border-white/10 text-white/85 rounded-r-xl rounded-tl-xl"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <div
                          className={`mt-1 font-mono text-[8px] uppercase tracking-[0.2em] ${
                            m.role === "user" ? "text-black/50" : "text-white/30"
                          }`}
                        >
                          {m.role} · {fmtDate(m.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientsTab() {
  const [clients, setClients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    Promise.all([fetchClients(), fetchInquiryAnalytics(30)])
      .then(([cs, a]) => {
        setClients(cs);
        setAnalytics(a);
      })
      .catch((e) => setErr(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter !== "all" && c.pipeline_status !== filter) return false;
      if (!q) return true;
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q)
      );
    });
  }, [clients, query, filter]);

  return (
    <div className="space-y-6" data-testid="clients-tab">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={load}
          className="inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 transition-colors"
          data-testid="clients-refresh"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          {clients.length} client{clients.length === 1 ? "" : "s"}
        </span>
      </div>

      {err && (
        <div className="text-sm text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-2">
          {err}
        </div>
      )}

      <AnalyticsPanel a={analytics} />

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, company…"
            className="w-full bg-[#13131C] border border-white/10 focus:border-[#CCFF00]/50 outline-none text-sm text-white placeholder:text-white/30 pl-9 pr-3 py-2.5"
            data-testid="clients-search"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 border ${
                filter === s
                  ? "border-[#CCFF00] text-[#CCFF00]"
                  : "border-white/15 text-white/50 hover:text-white"
              }`}
              data-testid={`clients-filter-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          Loading clients…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#13131C] border border-white/10 p-12 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            No clients match
          </div>
          <div className="mt-2 text-white/55 text-sm">
            Submit the inquiry form on the public site to populate clients.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <button
              key={c.email}
              onClick={() => setActive(c.email)}
              className="text-left bg-[#13131C] border border-white/10 hover:border-[#CCFF00]/40 transition-colors p-5"
              data-testid={`client-${c.email}`}
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="min-w-0">
                  <div className="font-display text-base font-bold truncate text-white">
                    {c.name || c.email}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Mail size={10} /> {c.email}
                    </span>
                    {c.company && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <Building2 size={10} /> {c.company}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.3em] font-bold px-2.5 py-1 shrink-0 ${
                    STATUS_STYLE[c.pipeline_status] || STATUS_STYLE.new
                  }`}
                >
                  {c.pipeline_status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                <span className="inline-flex items-center gap-1">
                  <FileText size={10} /> {c.inquiry_count} inquir
                  {c.inquiry_count === 1 ? "y" : "ies"}
                </span>
                {c.chat_message_count > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#CCFF00]/80">
                    <MessageSquare size={10} /> {c.chat_message_count} msgs
                  </span>
                )}
                {c.has_roi && (
                  <span className="inline-flex items-center gap-1 text-emerald-300/80">
                    <TrendingUp size={10} /> ROI
                  </span>
                )}
                <span className="ml-auto">{fmtDate(c.last_seen)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <ClientDetail
          email={active}
          onClose={() => setActive(null)}
          onStatusChanged={load}
        />
      )}
    </div>
  );
}
