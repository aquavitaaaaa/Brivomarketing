import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/api";

// Lightweight returning-visitor detection backed by localStorage.
// Returns visit count, whether this is a returning visitor, and whether the
// visitor has ever converted (submitted an inquiry / audit on this device).
export function useVisitor() {
  const [state, setState] = useState({
    visits: 1,
    isReturning: false,
    hasConverted: false,
  });

  useEffect(() => {
    try {
      const prev = parseInt(localStorage.getItem("brivo_visits") || "0", 10) || 0;
      const visits = prev + 1;
      localStorage.setItem("brivo_visits", String(visits));
      localStorage.setItem("brivo_last_visit", String(Date.now()));
      const hasConverted = localStorage.getItem("brivo_converted") === "1";
      const isReturning = visits >= 2;
      setState({ visits, isReturning, hasConverted });
      if (isReturning && !hasConverted) {
        trackEvent("returning_visitor", window.location.pathname, {
          meta: { visits },
        });
      }
    } catch {
      /* noop */
    }
  }, []);

  return state;
}

export function markConverted() {
  try {
    localStorage.setItem("brivo_converted", "1");
  } catch {
    /* noop */
  }
}
