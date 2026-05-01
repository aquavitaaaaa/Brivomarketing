import { useEffect, useState } from "react";
import {
  MessageSquare,
  RefreshCcw,
  Globe2,
  Monitor,
  Smartphone,
  User,
  Bot,
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("brivo_admin_token")}`,
});

export default function MessagesTab() {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingT, setLoadingT] = useState(false);

  const load = () => {
    setLoading(true);
    axios
      .get(`${API}/admin/chat/sessions`, { headers: authHeaders() })
      .then((r) => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openSession = async (s) => {
    setActive(s);
    setLoadingT(true);
    try {
      const { data } = await axios.get(
        `${API}/admin/chat/sessions/${s.session_id}`,
        { headers: authHeaders() }
      );
      setTranscript(data.messages || []);
    } finally {
      setLoadingT(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6 min-h-[600px]" data-testid="messages-tab">
      {/* Sessions list */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-2 transition-colors"
          >
            <RefreshCcw size={12} /> Refresh
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            {sessions.length} session{sessions.length === 1 ? "" : "s"}
          </span>
        </div>
        {loading ? (
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            Loading…
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-[#13131C] border border-white/10 p-10 text-center">
            <MessageSquare size={24} className="text-white/25 mx-auto" />
            <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
              No chat yet
            </div>
            <div className="mt-2 text-white/55 text-sm">
              Visitors using the chat widget will appear here.
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {sessions.map((s) => {
              const isActive = active?.session_id === s.session_id;
              return (
                <button
                  key={s.session_id}
                  onClick={() => openSession(s)}
                  className={`w-full text-left p-4 border transition-colors ${
                    isActive
                      ? "bg-[#1b1b27] border-[#CCFF00]/60"
                      : "bg-[#13131C] border-white/10 hover:border-[#CCFF00]/40"
                  }`}
                  data-testid={`message-session-${s.session_id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#CCFF00]">
                      · {s.message_count ?? 0} msgs
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
                      {new Date(s.updated_at || s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-white/85 truncate">
                    “{s.first_message || "(no preview)"}”
                  </div>
                  <div className="mt-2 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                    {s.country && (
                      <span className="inline-flex items-center gap-1">
                        <Globe2 size={10} />
                        {s.city ? `${s.city}, ${s.country_code || s.country}` : s.country}
                      </span>
                    )}
                    {s.device && (
                      <span className="inline-flex items-center gap-1">
                        {s.device === "desktop" ? (
                          <Monitor size={10} />
                        ) : (
                          <Smartphone size={10} />
                        )}
                        {s.device}
                      </span>
                    )}
                    {s.browser && s.browser !== "Other" && (
                      <span>{s.browser}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Transcript panel */}
      <div className="lg:col-span-3 bg-[#13131C] border border-white/10 flex flex-col">
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-center p-10">
            <div>
              <MessageSquare size={28} className="text-white/25 mx-auto" />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                Select a session
              </div>
              <div className="mt-2 text-white/55 text-sm max-w-xs">
                Pick a conversation on the left to see the full transcript and
                what the visitor asked.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-white/10">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">
                / Session {active.session_id.slice(0, 8)}
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Started</div>
                  <div>{new Date(active.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Location</div>
                  <div>
                    {active.city ? `${active.city}, ` : ""}
                    {active.country || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Device</div>
                  <div>
                    {active.device || "—"}
                    {active.browser && active.browser !== "Other"
                      ? ` · ${active.browser}`
                      : ""}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">IP</div>
                  <div className="font-mono text-xs">{active.ip || "—"}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[560px]">
              {loadingT ? (
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                  Loading transcript…
                </div>
              ) : transcript.length === 0 ? (
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                  Empty session.
                </div>
              ) : (
                transcript.map((m) => {
                  const mine = m.role === "assistant";
                  const Icon = mine ? Bot : User;
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${mine ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          mine
                            ? "border-[#CCFF00]/40 text-[#CCFF00]"
                            : "border-white/15 text-white/60"
                        }`}
                      >
                        <Icon size={12} />
                      </div>
                      <div
                        className={`max-w-[78%] p-3 text-sm whitespace-pre-wrap leading-relaxed ${
                          mine
                            ? "bg-[#CCFF00]/8 border border-[#CCFF00]/30 text-white"
                            : "bg-white/[0.05] border border-white/10 text-white/90"
                        }`}
                      >
                        <div className="font-mono text-[9px] uppercase tracking-[0.25em] opacity-55 mb-1">
                          {mine ? "AI Strategist" : "Visitor"} ·{" "}
                          {new Date(m.created_at).toLocaleTimeString()}
                        </div>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
