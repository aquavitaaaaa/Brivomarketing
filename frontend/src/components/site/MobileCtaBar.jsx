import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
import { trackEvent } from "@/lib/api";
import { BOOKING_URL, hasBooking } from "@/lib/config";

// Persistent bottom action bar on mobile only. Surfaces after the visitor
// scrolls past the hero so the primary CTA is always one tap away.
export default function MobileCtaBar({ onCTA }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const book = () => {
    trackEvent("booking_click", window.location.pathname, {
      meta: { source: "mobile-bar" },
    });
    window.open(BOOKING_URL, "_blank", "noopener");
  };

  const start = () => {
    trackEvent("cta_click", window.location.pathname, {
      meta: { source: "mobile-bar" },
    });
    onCTA();
  };

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-[90] transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      data-testid="mobile-cta-bar"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-2xl border border-[#E7E3D8] bg-white/95 backdrop-blur p-2 shadow-[0_8px_30px_rgba(11,27,43,0.18)]">
        <button
          onClick={start}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0B1B2B] text-white rounded-xl text-[14px] font-medium py-3.5"
          data-testid="mobile-cta-start"
        >
          Start a project <ArrowRight size={15} />
        </button>
        {hasBooking() && (
          <button
            onClick={book}
            className="inline-flex items-center justify-center gap-1.5 border border-[#0B1B2B]/15 text-[#0B1B2B] rounded-xl text-[13px] font-medium px-4 py-3.5"
            data-testid="mobile-cta-book"
          >
            <CalendarClock size={15} /> Call
          </button>
        )}
      </div>
    </div>
  );
}
