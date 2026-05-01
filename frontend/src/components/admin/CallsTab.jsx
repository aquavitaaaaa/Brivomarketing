import { useEffect, useState } from "react";
import { RefreshCcw, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { fetchCalls } from "@/lib/api";

export default function CallsTab() {
  const [calls, setCalls] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    setErr("");
    fetchCalls()
      .then(setCalls)
      .catch((e) => setErr(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6" data-testid="calls-tab">
      <div className="flex items-center gap-3">
        <button
          onClick={load}
          className="inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 transition-colors"
        >
          <RefreshCcw size={12} /> Refresh
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          {calls.length} call{calls.length === 1 ? "" : "s"}
        </span>
      </div>

      {err && (
        <div className="text-sm text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-2">
          {err}
        </div>
      )}

      {loading ? (
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          Loading calls…
        </div>
      ) : calls.length === 0 ? (
        <div className="bg-[#13131C] border border-white/10 p-12 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            No calls yet
          </div>
          <div className="mt-2 text-white/55 text-sm">
            Enable the inbound operator or dial an outbound call from the Operator tab.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((c) => {
            const Icon = c.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
            return (
              <div
                key={c.id}
                className="bg-[#13131C] border border-white/10 hover:border-[#CCFF00]/40 transition-colors"
              >
                <button
                  onClick={() => setOpen(open === c.id ? null : c.id)}
                  className="w-full text-left p-5 flex flex-wrap items-center gap-4"
                >
                  <div className="w-10 h-10 border border-white/15 flex items-center justify-center text-[#CCFF00]">
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-base font-bold">
                      {c.phone_number || "(unknown)"}{" "}
                      <span className="text-white/35 font-normal">·</span>{" "}
                      <span className="text-white/55 font-normal text-sm">
                        {c.direction}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
                      {c.status || "—"}
                      {c.call_length != null ? ` · ${c.call_length}s` : ""}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {c.created_at && new Date(c.created_at).toLocaleString()}
                  </span>
                </button>
                {open === c.id && (
                  <div className="px-5 pb-5 pt-5 border-t border-white/10 space-y-3">
                    {c.transcript ? (
                      <>
                        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                          Transcript
                        </div>
                        <pre className="whitespace-pre-wrap text-sm text-white/80 bg-black/30 border border-white/10 p-4 max-h-[300px] overflow-auto">
                          {c.transcript}
                        </pre>
                      </>
                    ) : (
                      <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                        No transcript yet — will appear when the call completes.
                      </div>
                    )}
                    {c.recording_url && (
                      <a
                        href={c.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#CCFF00] hover:underline"
                      >
                        Play recording →
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
