import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CrosshairCursor from "@/components/site/CrosshairCursor";
import SocialProofToaster from "@/components/site/SocialProofToaster";
import CaseStudyModal from "@/components/site/CaseStudyModal";
import ScrollReveal from "@/components/site/ScrollReveal";
import NotFound from "@/pages/NotFound";

const Home = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");
  const [activeCase, setActiveCase] = useState(null);

  const openInquiry = (service = "") => {
    setInquiryService(service);
    setInquiryOpen(true);
  };

  return (
    <div className="App relative" data-testid="home-root">
      <Navigation onCTA={() => openInquiry()} />
      <Hero onCTA={() => openInquiry()} />
      <LiveTicker />
      <PressShelf />
      <ScrollReveal>
        <StatsBar />
      </ScrollReveal>
      <TrustBar />
      <Services onSelect={(s) => openInquiry(s)} />
      <Industries onSelect={(s) => openInquiry(`${s} marketing`)} />
      <Differentiators />
      <Process />
      <Portfolio onOpen={(p) => setActiveCase(p)} />
      <RoiCalculator onSubmitLead={(d) => openInquiry(`Audit request · ${d.email}`)} />
      <Pricing onSelect={(tier) => openInquiry(tier)} />
      <Testimonials />
      <ScrollReveal>
        <Insights />
      </ScrollReveal>
      <Partners />
      <BigCtaCard onCTA={() => openInquiry()} />
      <Footer onCTA={() => openInquiry()} />
      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        defaultService={inquiryService}
      />
      <CaseStudyModal
        open={!!activeCase}
        project={activeCase}
        onClose={() => setActiveCase(null)}
        onCTA={(title) => openInquiry(title)}
      />
      <ChatWidget />
      <SocialProofToaster />
      <CrosshairCursor />
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
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
