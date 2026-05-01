import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { sendChat } from "@/lib/api";

const SUGGESTIONS = [
  "What does Accelerate include?",
  "How fast can you launch a site?",
  "What's your typical ROAS?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey — I'm BrivoMarketing AI. Ask about pricing, services, timelines, or how we'd attack your market.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    setMessages((m) => [...m, { role: "user", content: value }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChat(sessionId, value);
      if (!sessionId) setSessionId(res.session_id);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Connection slipped. Try again or hit 'Start a Project' to talk to a human.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#CCFF00] text-black flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.4)]"
        aria-label="Open chat"
        data-testid="chat-toggle"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="m"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={20} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-black rounded-full">
            <span className="absolute inset-0 bg-[#CCFF00] rounded-full animate-ping opacity-75" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[80vh] bg-[#0A0A0A] border border-white/15 flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            data-testid="chat-panel"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-black/40 backdrop-blur-xl">
              <div className="relative w-2 h-2">
                <span className="absolute inset-0 bg-[#CCFF00] rounded-full" />
                <span className="absolute inset-0 bg-[#CCFF00] rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1">
                <div className="font-display text-sm font-bold uppercase tracking-tight">
                  BrivoMarketing AI
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Live • Strategist on demand
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
              data-testid="chat-messages"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[#CCFF00] text-black"
                        : "bg-white/5 text-white border border-white/10"
                    }`}
                    data-testid={`chat-msg-${m.role}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-white/5 border border-white/10 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse" />
                    <span
                      className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="pt-2 space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full text-left text-xs px-3 py-2 border border-white/10 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
                      data-testid={`chat-suggestion-${s.slice(0, 10)}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-white/10 p-3 flex items-center gap-2 bg-black/40"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent border border-white/10 text-sm px-3 py-2.5 outline-none focus:border-[#CCFF00] placeholder:text-white/30"
                data-testid="chat-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-[#CCFF00] text-black disabled:opacity-50"
                data-testid="chat-send"
                aria-label="Send"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
