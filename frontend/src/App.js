import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import Navigation from "@/components/site/Navigation";
import Hero from "@/components/site/Hero";
import LiveTicker from "@/components/site/LiveTicker";
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
import Footer from "@/components/site/Footer";
import InquiryDialog from "@/components/site/InquiryDialog";
import ChatWidget from "@/components/site/ChatWidget";
import CaseStudyModal from "@/components/site/CaseStudyModal";
import ScrollReveal from "@/components/site/ScrollReveal";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
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
      <LiveTicker />
      <PressShelf />
      <ScrollReveal>
        <StatsBar />
      </ScrollReveal>
      <TrustBar />
      <Services onSelect={(s) => openInquiry(s, "service-card")} />
      <Industries onSelect={(s) => openInquiry(`${s} marketing`, "industry")} />
      <Differentiators />
      <Process />
      <Portfolio
        onOpen={(p) => {
          setActiveCase(p);
          trackEvent("case_study_open", window.location.pathname, {
            meta: { id: p.id },
          });
        }}
      />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#0A0A0A",
            border: "1px solid #222",
            color: "#fff",
            borderRadius: 0,
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
