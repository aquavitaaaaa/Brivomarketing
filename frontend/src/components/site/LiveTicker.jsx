/**
 * LiveTicker — sub-hero strip with auto-scrolling live results.
 * Reads like a trading-desk feed.
 */
const ITEMS = [
  { tone: "green", text: "Acquired 12,486 clicks today" },
  { tone: "lime", text: "+$28,420 revenue this hour" },
  { tone: "green", text: "ROAS 5.8x avg across portfolio" },
  { tone: "green", text: "1.2M monthly organic sessions" },
  { tone: "lime", text: "92% client retention rate" },
  { tone: "green", text: "180+ brands scaled to date" },
  { tone: "lime", text: "$120M revenue tracked YTD" },
  { tone: "green", text: "Lighthouse 100/100 across 40 sites" },
  { tone: "lime", text: "+38.4% MoM growth · BrivoMarketing" },
  { tone: "green", text: "38M social impressions this week" },
];

export default function LiveTicker() {
  const items = [...ITEMS, ...ITEMS]; // duplicate for seamless marquee

  return (
    <div
      className="relative bg-[#0F0F18] border-y border-white/10 overflow-hidden"
      data-testid="live-ticker"
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-[#0F0F18] pr-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00] flex items-center gap-2">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#CCFF00]" />
            <span className="absolute inset-0 rounded-full bg-[#CCFF00] animate-ping opacity-70" />
          </span>
          LIVE
        </span>
        <span className="text-white/20">|</span>
      </div>

      <div className="flex animate-marquee gap-12 py-4 pl-32 whitespace-nowrap">
        {items.map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/75"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                it.tone === "lime" ? "bg-[#CCFF00]" : "bg-emerald-400"
              }`}
              style={{
                boxShadow:
                  it.tone === "lime"
                    ? "0 0 8px rgba(204,255,0,0.85)"
                    : "0 0 8px rgba(52,211,153,0.85)",
              }}
            />
            {it.text}
            <span className="text-white/15 ml-6">·</span>
          </span>
        ))}
      </div>

      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0F0F18] to-transparent pointer-events-none" />
    </div>
  );
}
