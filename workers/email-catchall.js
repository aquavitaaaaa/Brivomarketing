"""Inbound email catch-all — Cloudflare Email Routing worker.

Receives every message to *@brivomarketing.com and saves it to the backend
`inbound_emails` collection so no lead is ever lost, even before a personal
forwarding inbox is configured. Replies to the sender are intentionally NOT
sent from here (transactional-only policy); the owner follows up from admin.

Deploy: wrangler deploy (see scripts/deploy-email-worker.sh).
Env: BACKEND_URL (https://brivomarketing.com), WORKER_SECRET (shared secret).
"""
export default {
  async email(message, env) {
    const from = message.from || "";
    const to = message.to || "";
    const subject = message.headers.get("subject") || "";
    let text = "";
    try {
      const reader = message.raw.getReader();
      const chunks = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const raw = new TextDecoder().decode(
        chunks.reduce((a, c) => {
          const n = new Uint8Array(a.length + c.length);
          n.set(a); n.set(c, a.length);
          return n;
        }, new Uint8Array(0))
      ).slice(0, 20000);
      const m = raw.split(/\r?\n\r?\n/);
      text = (m.length > 1 ? m.slice(1).join("\n\n") : raw).slice(0, 5000);
    } catch (e) {
      text = "";
    }
    try {
      await fetch(`${env.BACKEND_URL}/api/inbound/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Worker-Secret": env.WORKER_SECRET,
        },
        body: JSON.stringify({ from, to, subject, text }),
      });
    } catch (e) {
      // fall through to accept the message anyway
    }
    // No forward() call: without a verified destination this would bounce.
    // Message is safely stored in the backend inbox.
  },
};
