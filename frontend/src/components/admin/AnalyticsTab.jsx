import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, Eye, Inbox } from "lucide-react";
import { fetchAnalyticsSummary } from "@/lib/api";

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-[#13131C] border border-white/10 p-5 hover:border-[#CCFF00]/40 transition-colors">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
        <Icon size={12} /> {label}
      </div>
      <div className="mt-3 font-display text-3xl md:text-4xl font-black text-[#CCFF00] tracking-tight leading-none">
        {value}
      </div>
      {sub && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          {sub}
        </div>
      )}
    </div>
  );
}

function BreakdownList({ title, items, empty = "No data yet" }) {
  const max = Math.max(1, ...(items || []).map((i) => i.count));
  return (
    <div className="bg-[#13131C] border border-white/10 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-4">
        {title}
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.label} className="flex items-center gap-3">
              <span className="flex-1 text-sm truncate">{it.label}</span>
              <div className="relative flex-1 h-2 bg-white/5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[#CCFF00]"
                  style={{ width: `${(it.count / max) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-white/65 w-12 text-right">
                {it.count}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
          {empty}
        </div>
      )}
    </div>
  );
}

function DailyChart({ data }) {
  const max = Math.max(1, ...(data || []).map((d) => d.count));
  return (
    <div className="bg-[#13131C] border border-white/10 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45 mb-4">
        Pageviews — last {data?.length || 0} day(s)
      </div>
      {data && data.length > 0 ? (
        <div className="flex items-end gap-2 h-40">
          {data.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-[#CCFF00]/80 hover:bg-[#CCFF00] transition-colors"
                style={{ height: `${(d.count / max) * 100}%`, minHeight: "2px" }}
                title={`${d.date}: ${d.count}`}
              />
              <span className="font-mono text-[9px] uppercase text-white/35">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
          No pageviews yet — visit the public site to generate data.
        </div>
      )}
    </div>
  );
}

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchAnalyticsSummary(days)
      .then(setData)
      .catch((e) => setErr(e?.message || "Failed to load"));
  }, [days]);

  const stats = useMemo(() => {
    const t = data?.totals || {};
    const cvr = t.pageviews
      ? ((t.inquiries / t.pageviews) * 100).toFixed(1) + "%"
      : "—";
    return [
      { icon: Eye, label: "Pageviews", value: t.pageviews ?? 0 },
      { icon: Users, label: "Unique sessions", value: t.unique_sessions ?? 0 },
      { icon: Inbox, label: "Inquiries", value: t.inquiries ?? 0 },
      { icon: TrendingUp, label: "Lead CVR", value: cvr },
    ];
  }, [data]);

  return (
    <div className="space-y-6" data-testid="analytics-tab">
      <div className="flex items-center gap-2">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 border ${
              days === d
                ? "border-[#CCFF00] text-[#CCFF00]"
                : "border-white/15 text-white/55 hover:text-white"
            }`}
            data-testid={`analytics-range-${d}`}
          >
            Last {d}d
          </button>
        ))}
      </div>

      {err && (
        <div className="text-sm text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-2">
          {err}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <DailyChart data={data?.daily_pageviews} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownList title="Top countries" items={data?.by_country} />
        <BreakdownList title="Devices" items={data?.by_device} />
        <BreakdownList title="Browsers" items={data?.by_browser} />
        <BreakdownList title="Operating systems" items={data?.by_os} />
        <BreakdownList title="Top pages" items={data?.by_path} />
        <BreakdownList title="Top referrers" items={data?.by_referrer} empty="Direct traffic only so far" />
      </div>

      <BreakdownList title="CTA click leaderboard" items={data?.cta_clicks} empty="No CTA clicks logged yet" />
    </div>
  );
}
