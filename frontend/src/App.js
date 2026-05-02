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
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSocial from "@/pages/AdminSocial";
import AdminLeadEngine from "@/pages/AdminLeadEngine";
import BrandKit from "@/pages/BrandKit";
import { trackEvent } from "@/lib/api";

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackEvent("pageview", location.pathname);
  }, [location.pathname]);
  return null;
}

const Home = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");
  const [inquirySource, setInquirySource] = useState("manual");
  const [activeCase, setActiveCase] = useState(null);

  const openInquiry = (service = "", source = "manual") => {
    setInquiryService(service);
    setInquirySource(source);
    setInquiryOpen(true);
  };

  return (
    <div className="App relative" data-testid="home-root">
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
        <Route path="/admin/leads" element={<AdminLeadEngine />} />
        <Route path="/brand-kit" element={<BrandKit />} />
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
