import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/api";

// Minimal client-side A/B harness.
// Assigns a stable variant per test (persisted in localStorage) and logs an
// `ab_assigned` analytics event once per session so the admin funnel can
// compute per-variant conversion.
export function useAbTest(test, variants = ["a", "b"]) {
  const [variant, setVariant] = useState(variants[0]);

  useEffect(() => {
    let assigned;
    try {
      const key = `brivo_ab_${test}`;
      assigned = localStorage.getItem(key);
      if (!assigned || !variants.includes(assigned)) {
        assigned = variants[Math.floor(Math.random() * variants.length)];
        localStorage.setItem(key, assigned);
      }
      setVariant(assigned);

      const logKey = `brivo_ab_logged_${test}`;
      if (!sessionStorage.getItem(logKey)) {
        sessionStorage.setItem(logKey, "1");
        trackEvent("ab_assigned", window.location.pathname, {
          meta: { test, variant: assigned },
        });
      }
    } catch {
      assigned = variants[0];
      setVariant(assigned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  return variant;
}
