import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import Navigation from "@/components/site/Navigation";
import Hero from "@/components/site/Hero";
import StatsBar from "@/components/site/StatsBar";
import TrustBar from "@/components/site/TrustBar";
import PressShelf from "@/components/site/PressShelf";
import Services from "@/components/site/Services";
import Industries from "@/components/site/Industries";
import Differentiators from "@/components/site/Differentiators";
import Process from "@/components/site/Process";
import Portfolio from "@/components/site/Portfolio";
import RoiCalculator from "@/components/site/RoiCalculator";
import Pricing from "@/components/site/Pricing";
import Testimonials from "@/components/site/Testimonials";
import Insights from "@/components/site/Insights";
import Partners from "@/components/site/Partners";
import BigCtaCard from "@/components/site/BigCtaCard";
import BeforeAfterSlider from "@/components/site/BeforeAfterSlider";
import LiveWinsFeed from "@/components/site/LiveWinsFeed";
import Manifesto from "@/components/site/Manifesto";
import AwardsBar from "@/components/site/AwardsBar";
import Footer from "@/components/site/Footer";
import InquiryDialog from "@/components/site/InquiryDialog";
import ChatWidget from "@/components/site/ChatWidget";
import CaseStudyModal from "@/components/site/CaseStudyModal";
import ScrollReveal from "@/components/site/ScrollReveal";
import ExitIntentModal from "@/components/site/ExitIntentModal";
import MobileCtaBar from "@/components/site/MobileCtaBar";
import WelcomeBackBanner from "@/components/site/WelcomeBackBanner";
import { useVisitor } from "@/hooks/useVisitor";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSocial from "@/pages/AdminSocial";
import AdminDirectPoster from "@/pages/AdminDirectPoster";
import AdminLeadEngine from "@/pages/AdminLeadEngine";
import AdminAffiliates from "@/pages/AdminAffiliates";
import BrandKit from "@/pages/BrandKit";
import InstagramKit from "@/pages/InstagramKit";
import IgPromo from "@/pages/IgPromo";
import PartnersPage from "@/pages/Partners";
import PairWizard from "@/pages/PairWizard";
import CaseStudyPage from "@/pages/CaseStudyPage";
import { trackEvent } from "@/lib/api";

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    // Capture ?ref=CODE on any page load and persist for 30 days.
    try {
      const params = new URLSearchParams(location.search);
      const ref = params.get("ref");
      if (ref) {
        const code = ref.trim().toUpperCase();
        localStorage.setItem("brivo_ref", code);
        localStorage.setItem("brivo_ref_at", String(Date.now()));
      } else {
        const at = parseInt(localStorage.getItem("brivo_ref_at") || "0", 10);
        if (at && Date.now() - at > 30 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem("brivo_ref");
          localStorage.removeItem("brivo_ref_at");
        }
      }
    } catch {
      /* noop */
    }
    trackEvent("pageview", location.pathname);
  }, [location.pathname, location.search]);
  return null;
}

const Home = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");
  const [inquirySource, setInquirySource] = useState("manual");
  const [activeCase, setActiveCase] = useState(null);
  const { isReturning, hasConverted, visits } = useVisitor();

  const openInquiry = (service = "", source = "manual") => {
    setInquiryService(service);
    setInquirySource(source);
    setInquiryOpen(true);
    trackEvent("cta_click", window.location.pathname, { meta: { source } });
  };

  return (
    <div className="App relative" data-testid="home-root">
      {isReturning && !hasConverted && (
        <WelcomeBackBanner visits={visits} onCTA={() => openInquiry("", "welcome-back")} />
      )}
      <Navigation onCTA={() => openInquiry("", "nav-cta")} />
      <Hero onCTA={() => openInquiry("", "hero-cta")} />
      <TrustBar />
      <AwardsBar />
      <ScrollReveal>
        <StatsBar />
      </ScrollReveal>
      <LiveWinsFeed />
      <PressShelf />
      <Services onSelect={(s) => openInquiry(s, "service-card")} />
      <Differentiators />
      <Manifesto />
      <Process />
      <BeforeAfterSlider />
      <Portfolio
        onOpen={(p) => {
          setActiveCase(p);
          trackEvent("case_study_open", window.location.pathname, {
            meta: { id: p.id },
          });
        }}
      />
      <Industries onSelect={(s) => openInquiry(`${s} marketing`, "industry")} />
      <RoiCalculator />
      <Pricing onSelect={(tier) => openInquiry(tier, "pricing")} />
      <Testimonials />
      <ScrollReveal>
        <Insights />
      </ScrollReveal>
      <Partners />
      <BigCtaCard onCTA={() => openInquiry("", "big-cta")} />
      <Footer onCTA={() => openInquiry("", "footer-cta")} />
      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        defaultService={inquiryService}
        source={inquirySource}
      />
      <CaseStudyModal
        open={!!activeCase}
        project={activeCase}
        onClose={() => setActiveCase(null)}
        onCTA={(title) => openInquiry(title, "case-study")}
      />
      <ChatWidget />
      <MobileCtaBar onCTA={() => openInquiry("", "mobile-bar")} />
      <ExitIntentModal />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/social" element={<AdminSocial />} />
        <Route path="/admin/social/direct" element={<AdminDirectPoster />} />
        <Route path="/admin/leads" element={<AdminLeadEngine />} />
        <Route path="/admin/affiliates" element={<AdminAffiliates />} />
        <Route path="/brand-kit" element={<BrandKit />} />
        <Route path="/instagram-kit" element={<InstagramKit />} />
        <Route path="/ig-promo" element={<IgPromo />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/work/:slug" element={<CaseStudyPage />} />
        <Route path="/pair" element={<PairWizard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        theme="light"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#FFFFFF",
            border: "1px solid #E7E3D8",
            color: "#0B1B2B",
            borderRadius: 12,
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
