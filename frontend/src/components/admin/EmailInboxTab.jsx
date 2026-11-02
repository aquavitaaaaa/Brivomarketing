import { useEffect, useState } from "react";
import { MailOpen, RefreshCw } from "lucide-react";
import { fetchInboundEmails, markInboundEmailRead } from "@/lib/api";

export default function EmailInboxTab() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchInboundEmails();
      setEmails(Array.isArray(data) ? data : []);
    } catch {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id, read) => {
    try {
      await markInboundEmailRead(id, read);
      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read } : e)));
    } catch { /* noop */ }
  };

  const visible = emails.filter((e) => (filter === "unread" ? !e.read : true));
  const unread = emails.filter((e) => !e.read).length;

  return (
    <div data-testid="email-inbox-tab" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/60">
          hello@brivomarketing.com · {emails.length} saved · {unread} unread
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            className="font-mono text-[11px] uppercase tracking-[0.2em] border border-white/20 px-3 py-1.5 hover:bg-white/10"
            data-testid="email-inbox-filter">
            {filter === "all" ? "Show unread" : "Show all"}
          </button>
          <button onClick={load}
            className="font-mono text-[11px] uppercase tracking-[0.2em] border border-white/20 px-3 py-1.5 hover:bg-white/10 inline-flex items-center gap-1.5"
            data-testid="email-inbox-refresh">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>
      {loading ? (
        <div className="font-mono text-xs text-white/50 py-8 text-center">LOADING INBOX…</div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-white/20 p-8 text-center">
          <MailOpen size={22} className="mx-auto text-[#CCFF00]" />
          <p className="font-mono text-xs text-white/60 mt-3 uppercase tracking-[0.2em]">
            {emails.length === 0 ? "No mail yet — every message to hello@ lands here" : "Inbox zero. Nothing unread."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((e) => (
            <article key={e.id} data-testid={`email-inbox-item-${e.id}`}
              className={`border p-4 ${e.read ? "border-white/10 bg-white/[0.02]" : "border-[#CCFF00]/50 bg-[#CCFF00]/[0.04]"}`}>
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="font-semibold text-sm text-white">{e.subject || "(no subject)"}</div>
                <button onClick={() => markRead(e.id, !e.read)}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white"
                  data-testid={`email-inbox-read-${e.id}`}>
                  {e.read ? "Mark unread" : "Mark read"}
                </button>
              </div>
              <div className="font-mono text-[11px] text-[#CCFF00] mt-1">{e.from} → {e.to}</div>
              <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">{e.text}</p>
              <div className="font-mono text-[10px] text-white/40 mt-2">{e.created_at}</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
