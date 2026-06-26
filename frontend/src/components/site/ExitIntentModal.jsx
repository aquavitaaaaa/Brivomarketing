import { useEffect, useRef, useState } from "react";
import { X, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { submitAudit, trackEvent } from "@/lib/api";
import { markConverted } from "@/hooks/useVisitor";

const inputCls =
  "w-full bg-white border border-[#E7E3D8] rounded-lg h-12 px-4 text-[#0B1B2B] placeholder:text-[#B6BDC7] focus:outline-none focus:ring-2 focus:ring-[#B8864C] focus:border-[#B8864C]";

// Recovers abandoning visitors with a high-value, zero-friction offer:
// a free homepage teardown in exchange for an email.
export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const armed = useRef(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("brivo_exit_shown") === "1") return;
      if (localStorage.getItem("brivo_converted") === "1") return;
    } catch {
      /* noop */
    }

    const trigger = () => {
      if (armed.current) return;
      armed.current = true;
      try {
        sessionStorage.setItem("brivo_exit_shown", "1");
      } catch {
        /* noop */
      }
      setOpen(true);
      trackEvent("exit_intent_shown", window.location.pathname);
    };

    const onMouseOut = (e) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };

    // Desktop: real exit-intent on cursor leaving the top of the viewport.
    document.addEventListener("mouseout", onMouseOut);

    // Mobile (no hover): fire after dwell + meaningful scroll instead.
    let timer = null;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) {
      timer = setTimeout(() => {
        const scrolled =
          window.scrollY > (document.body.scrollHeight - window.innerHeight) * 0.35;
        if (scrolled) trigger();
      }, 28000);
    }

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const close = () => setOpen(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const ref_code = localStorage.getItem("brivo_ref") || null;
      const session_id = localStorage.getItem("brivo_sid") || null;
      await submitAudit({
        email,
        website,
        source: "exit-intent",
        ref_code,
        session_id,
      });
      trackEvent("exit_intent_captured", window.location.pathname);
      trackEvent("audit_submitted", window.location.pathname, {
        meta: { source: "exit-intent" },
      });
      markConverted();
      setDone(true);
      toast.success("On it. Your teardown lands in your inbox within 48 hours.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      data-testid="exit-intent-modal"
    >
      <div
        className="absolute inset-0 bg-[#0B1B2B]/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E7E3D8] shadow-2xl overflow-hidden">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-[#8190A1] hover:text-[#0B1B2B] transition"
          data-testid="exit-intent-close"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="px-8 py-9">
          {done ? (
            <div className="text-center py-6">
              <div className="text-[#B8864C] text-[11px] tracking-[0.22em] uppercase font-medium">
                Request received
              </div>
              <h3 className="font-display text-[26px] font-[500] text-[#0B1B2B] mt-3">
                Your teardown is on the way.
              </h3>
              <p className="text-[#4E5C6E] text-[14px] mt-3 leading-relaxed">
                A senior strategist will record a short walkthrough of your
                homepage and email it over within 48 hours.
              </p>
              <button
                onClick={close}
                className="mt-6 inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full text-[13px] font-medium px-7 py-3 hover:bg-[#14283F] transition"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="text-[#B8864C] text-[11px] tracking-[0.22em] uppercase font-medium">
                Wait — before you go
              </div>
              <h3 className="font-display text-[27px] leading-tight font-[500] text-[#0B1B2B] mt-3">
                Get a free 5-minute teardown of your homepage.
              </h3>
              <p className="text-[#4E5C6E] text-[14px] mt-3 leading-relaxed">
                No pitch. A senior strategist records exactly what's costing you
                conversions and how we'd fix it. Yours free.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={inputCls}
                  data-testid="exit-intent-email"
                  required
                />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yourwebsite.com (optional)"
                  className={inputCls}
                  data-testid="exit-intent-website"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#B8864C] text-white rounded-full text-[14px] font-medium px-7 py-3.5 hover:bg-[#a5763f] transition disabled:opacity-60"
                  data-testid="exit-intent-submit"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      Send my free teardown <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#8190A1]">
                  We never share your information. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
