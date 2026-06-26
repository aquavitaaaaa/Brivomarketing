import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/api";

// Personalised strip for returning visitors who haven't converted yet.
// Nudges them straight to the inquiry flow and surfaces the partner program.
export default function WelcomeBackBanner({ visits, onCTA }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("brivo_welcome_dismissed") === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const close = () => {
    try {
      sessionStorage.setItem("brivo_welcome_dismissed", "1");
    } catch {
      /* noop */
    }
    setDismissed(true);
  };

  const start = () => {
    trackEvent("cta_click", window.location.pathname, {
      meta: { source: "welcome-back" },
    });
    onCTA();
  };

  return (
    <div
      className="relative z-[80] bg-[#0B1B2B] text-white"
      data-testid="welcome-back-banner"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-2.5 flex items-center justify-center gap-3 text-center">
        <p className="text-[12.5px] md:text-[13px] text-white/90">
          <span className="text-[#E0B973] font-medium">Welcome back.</span>{" "}
          Ready to pick up where you left off?
        </p>
        <button
          onClick={start}
          className="hidden sm:inline-flex items-center gap-1.5 bg-[#B8864C] text-white rounded-full text-[12px] font-medium px-4 py-1.5 hover:bg-[#a5763f] transition"
          data-testid="welcome-back-cta"
        >
          Start a project <ArrowRight size={13} />
        </button>
        <Link
          to="/partners"
          className="hidden md:inline text-[12px] text-white/70 hover:text-white underline underline-offset-2"
        >
          or refer &amp; earn monthly →
        </Link>
        <button
          onClick={close}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          aria-label="Dismiss"
          data-testid="welcome-back-close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
