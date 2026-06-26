import { useEffect, useState } from "react";
import { GitBranchPlus, LogOut, FlaskConical } from "lucide-react";
import { fetchFunnel } from "@/lib/api";

export default function ConversionFunnel({ days = 7 }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchFunnel(days)
      .then(setData)
      .catch((e) => setErr(e?.message || "Failed to load funnel"));
  }, [days]);

  if (err) {
    return (
      <div className="text-sm text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-2">
        {err}
      </div>
    );
  }

  const steps = data?.steps || [];

  return (
    <div className="space-y-4" data-testid="conversion-funnel">
      <div className="bg-[#13131C] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            <GitBranchPlus size={12} /> Conversion funnel
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#CCFF00]">
            {data ? `${data.overall_cvr}% overall CVR` : "—"}
          </div>
        </div>

        <ul className="space-y-3">
          {steps.map((s, i) => {
            const prev = i > 0 ? steps[i - 1].sessions : s.sessions;
            const dropFromPrev =
              i > 0 && prev > 0
                ? Math.round(((prev - s.sessions) / prev) * 100)
                : 0;
            return (
              <li key={s.event} className="flex items-center gap-3">
                <span className="flex-1 text-sm truncate text-white/80">
                  {s.label}
                </span>
                <div className="relative flex-[2] h-3 bg-white/5 overflow-hidden rounded-sm">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#CCFF00]/80"
                    style={{ width: `${s.pct_of_top}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-white/70 w-14 text-right">
                  {s.sessions}
                </span>
                <span className="font-mono text-[10px] w-16 text-right text-red-300/70">
                  {i > 0 && dropFromPrev > 0 ? `-${dropFromPrev}%` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#13131C] border border-white/10 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-3">
            <LogOut size={12} /> Exit-intent recovery
          </div>
          <div className="flex items-end gap-6">
            <div>
              <div className="font-display text-3xl font-black text-[#CCFF00] leading-none">
                {data?.exit_intent?.captured ?? 0}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
                Leads recovered
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-black text-white leading-none">
                {data?.exit_intent?.capture_rate ?? 0}%
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
                Capture rate
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-black text-white/70 leading-none">
                {data?.audit_leads ?? 0}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
                Audit leads
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#13131C] border border-white/10 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-3">
            <FlaskConical size={12} /> A/B tests
          </div>
          {data?.ab_tests?.length ? (
            <div className="space-y-4">
              {data.ab_tests.map((t) => (
                <div key={t.test}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55 mb-2">
                    {t.test}
                  </div>
                  <div className="space-y-2">
                    {t.variants.map((v) => (
                      <div key={v.variant} className="flex items-center gap-3 text-sm">
                        <span className="uppercase font-mono text-[11px] text-white/60 w-6">
                          {v.variant}
                        </span>
                        <span className="text-white/55 flex-1">
                          {v.visitors} visitors · {v.conversions} conv
                        </span>
                        <span className="font-mono text-[#CCFF00] text-xs">
                          {v.cvr}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm">No A/B data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
