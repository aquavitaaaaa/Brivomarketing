import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/site/Navigation";
import Footer from "@/components/site/Footer";
import PartnersHero from "@/components/site/partners/PartnersHero";
import HowItWorks from "@/components/site/partners/HowItWorks";
import CommissionTiers from "@/components/site/partners/CommissionTiers";
import EarningsCalculator from "@/components/site/partners/EarningsCalculator";
import PartnersFAQ from "@/components/site/partners/PartnersFAQ";
import ApplyForm from "@/components/site/partners/ApplyForm";
import { fetchAffiliateProgram, trackRefClick, trackEvent } from "@/lib/api";

const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function captureRefFromUrl(search) {
  try {
    const params = new URLSearchParams(search);
    const ref = params.get("ref");
    if (!ref) return null;
    const code = ref.trim().toUpperCase();
    localStorage.setItem("brivo_ref", code);
    localStorage.setItem("brivo_ref_at", String(Date.now()));
    return code;
  } catch {
    return null;
  }
}

function purgeStaleRef() {
  try {
    const at = parseInt(localStorage.getItem("brivo_ref_at") || "0", 10);
    if (at && Date.now() - at > REF_TTL_MS) {
      localStorage.removeItem("brivo_ref");
      localStorage.removeItem("brivo_ref_at");
    }
  } catch {
    /* noop */
  }
}

export default function Partners() {
  const [program, setProgram] = useState(null);
  const location = useLocation();

  useEffect(() => {
    purgeStaleRef();
    const ref = captureRefFromUrl(location.search);
    if (ref) {
      trackRefClick(ref);
      trackEvent("ref_landing", "/partners", { meta: { ref } });
    }
  }, [location.search]);

  useEffect(() => {
    fetchAffiliateProgram()
      .then(setProgram)
      .catch(() => {
        /* keep null, components have fallbacks */
      });
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="App relative bg-[#FBFAF6]" data-testid="partners-page">
      <Navigation onCTA={() => scrollTo("apply")} />
      <PartnersHero onApply={() => scrollTo("apply")} program={program} />
      <HowItWorks />
      <CommissionTiers tiers={program?.tiers} />
      <EarningsCalculator program={program} />
      <PartnersFAQ />
      <ApplyForm />
      <Footer onCTA={() => scrollTo("apply")} />
    </div>
  );
}
