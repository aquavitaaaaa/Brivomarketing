import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { sendChat } from "@/lib/api";

const SUGGESTIONS = [
  "What does Accelerate include?",
  "How fast can you launch a site?",
  "What industries do you specialise in?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi — I'm the BrivoMarketing assistant. Ask me about services, pricing, timelines, or how we'd approach your market.",
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
            "Something went wrong on our end. Please try again, or use ‘Start a project’ to reach a human.",
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
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#0B1B2B] text-white flex items-center justify-center"
        style={{ boxShadow: "0 18px 40px -15px rgba(11,27,43,0.45), 0 0 0 1px rgba(184,134,76,0.25)" }}
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
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#B8864C]">
            <span className="absolute inset-0 bg-[#B8864C] rounded-full animate-ping opacity-75" />
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
            className="fixed bottom-24 right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[80vh] bg-white border border-[#E7E3D8] rounded-2xl flex flex-col overflow-hidden"
            style={{ boxShadow: "0 25px 70px -15px rgba(11,27,43,0.30)" }}
            data-testid="chat-panel"
          >
            <div className="px-5 py-4 border-b border-[#E7E3D8] flex items-center gap-3 bg-[#FBFAF6]">
              <div className="relative w-2 h-2">
                <span className="absolute inset-0 bg-[#3B7B5A] rounded-full" />
                <span className="absolute inset-0 bg-[#3B7B5A] rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1">
                <div className="font-display text-[15px] font-[600] tracking-tight text-[#0B1B2B]">
                  BrivoMarketing Assistant
                </div>
                <div className="text-[11px] tracking-wider text-[#8190A1]">
                  Online · Usually replies instantly
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-white"
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
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[#0B1B2B] text-white rounded-br-md"
                        : "bg-[#FBFAF6] text-[#0B1B2B] border border-[#E7E3D8] rounded-bl-md"
                    }`}
                    data-testid={`chat-msg-${m.role}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#FBFAF6] border border-[#E7E3D8] flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-[#B8864C] rounded-full animate-pulse" />
                    <span
                      className="w-1.5 h-1.5 bg-[#B8864C] rounded-full animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-[#B8864C] rounded-full animate-pulse"
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
                      className="block w-full text-left text-[13px] px-3.5 py-2.5 rounded-xl border border-[#E7E3D8] text-[#0B1B2B]/80 hover:border-[#B8864C] hover:text-[#0B1B2B] hover:bg-[#FBFAF6] transition-colors"
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
              className="border-t border-[#E7E3D8] p-3 flex items-center gap-2 bg-[#FBFAF6]"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-white border border-[#E7E3D8] rounded-full text-[14px] px-4 py-2.5 outline-none focus:border-[#B8864C] placeholder:text-[#B6BDC7] text-[#0B1B2B]"
                data-testid="chat-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-[#0B1B2B] text-white rounded-full disabled:opacity-50 hover:bg-[#14283F] transition-colors"
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
