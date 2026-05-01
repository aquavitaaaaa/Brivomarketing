import { useEffect, useState } from "react";
import { Mail, Building2, Tag, Calendar, RefreshCcw } from "lucide-react";
import { fetchInquiries, updateInquiryStatus } from "@/lib/api";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

const STATUS_STYLE = {
  new: "bg-[#CCFF00] text-black",
  contacted: "bg-blue-400/20 text-blue-300 border border-blue-400/30",
  qualified: "bg-violet-400/20 text-violet-300 border border-violet-400/30",
  won: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30",
  lost: "bg-white/10 text-white/45 border border-white/15",
};

export default function LeadsTab() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);

  const load = () => {
    setLoading(true);
    setErr("");
    fetchInquiries()
      .then(setInquiries)
      .catch((e) => setErr(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id, status) => {
    setInquiries((xs) =>
      xs.map((x) => (x.id === id ? { ...x, status } : x))
    );
    try {
      await updateInquiryStatus(id, status);
    } catch {
      load();
    }
  };

  return (
    <div className="space-y-6" data-testid="leads-tab">
      <div className="flex items-center gap-3">
        <button
          onClick={load}
          className="inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 transition-colors"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          {inquiries.length} lead{inquiries.length === 1 ? "" : "s"}
        </span>
      </div>

      {err && (
        <div className="text-sm text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-2">
          {err}
        </div>
      )}

      {loading ? (
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          Loading inbox…
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-[#13131C] border border-white/10 p-12 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Inbox clear
          </div>
          <div className="mt-2 text-white/55 text-sm">
            Submit the inquiry form on the public site to populate leads.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((it) => (
            <div
              key={it.id}
              className="bg-[#13131C] border border-white/10 hover:border-[#CCFF00]/40 transition-colors"
              data-testid={`lead-${it.id}`}
            >
              <button
                onClick={() => setOpen(open === it.id ? null : it.id)}
                className="w-full text-left p-5 flex flex-wrap items-center gap-4"
              >
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.3em] font-bold px-2.5 py-1 ${
                    STATUS_STYLE[it.status] || STATUS_STYLE.new
                  }`}
                >
                  {it.status}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-base font-bold truncate">
                    {it.name}{" "}
                    <span className="text-white/35 font-normal">·</span>{" "}
                    <span className="text-white/55 font-normal">
                      {it.service_interest}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Mail size={10} /> {it.email}
                    </span>
                    {it.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={10} /> {it.company}
                      </span>
                    )}
                    {it.source && (
                      <span className="inline-flex items-center gap-1">
                        <Tag size={10} /> {it.source}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 inline-flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(it.created_at).toLocaleString()}
                </span>
              </button>

              {open === it.id && (
                <div className="px-5 pb-5 border-t border-white/10 pt-5 space-y-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                      Brief
                    </div>
                    <p className="text-sm text-white/80 whitespace-pre-wrap">
                      {it.message}
                    </p>
                  </div>
                  {it.budget && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                        Budget
                      </div>
                      <div className="text-sm">{it.budget}</div>
                    </div>
                  )}
                  {it.roi_snapshot && (
                    <div className="bg-black/30 border border-white/10 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#CCFF00] mb-2">
                        ROI calculator snapshot
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-white/40 text-xs">Revenue</div>
                          <div className="font-bold">
                            ${Number(it.roi_snapshot.revenue).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/40 text-xs">Current ROAS</div>
                          <div className="font-bold">{it.roi_snapshot.roas}x</div>
                        </div>
                        <div>
                          <div className="text-white/40 text-xs">Monthly spend</div>
                          <div className="font-bold">
                            ${Number(it.roi_snapshot.spend).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/40 text-xs">Projected lift</div>
                          <div className="font-bold text-[#CCFF00]">
                            +${Number(it.roi_snapshot.lift).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
                      Set status
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(it.id, s)}
                          className={`font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 border ${
                            it.status === s
                              ? "border-[#CCFF00] text-[#CCFF00]"
                              : "border-white/15 text-white/50 hover:text-white"
                          }`}
                          data-testid={`lead-status-${s}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
