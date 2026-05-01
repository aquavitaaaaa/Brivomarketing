import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "@studio-freight/lenis";
import { Toaster } from "sonner";

import Navigation from "@/components/site/Navigation";
import Hero from "@/components/site/Hero";
import StatsBar from "@/components/site/StatsBar";
import TrustBar from "@/components/site/TrustBar";
import PressBar from "@/components/site/PressBar";
import Services from "@/components/site/Services";
import Industries from "@/components/site/Industries";
import Differentiators from "@/components/site/Differentiators";
import Process from "@/components/site/Process";
import Portfolio from "@/components/site/Portfolio";
import Pricing from "@/components/site/Pricing";
import Testimonials from "@/components/site/Testimonials";
import Insights from "@/components/site/Insights";
import Partners from "@/components/site/Partners";
import Footer from "@/components/site/Footer";
import InquiryDialog from "@/components/site/InquiryDialog";
import ChatWidget from "@/components/site/ChatWidget";

const Home = () => {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryService, setInquiryService] = useState("");

  const openInquiry = (service = "") => {
    setInquiryService(service);
    setInquiryOpen(true);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="App relative" data-testid="home-root">
      <Navigation onCTA={() => openInquiry()} />
      <Hero onCTA={() => openInquiry()} />
      <PressBar />
      <StatsBar />
      <TrustBar />
      <Services onSelect={(s) => openInquiry(s)} />
      <Industries onSelect={(s) => openInquiry(`${s} marketing`)} />
      <Differentiators />
      <Process />
      <Portfolio />
      <Pricing onSelect={(tier) => openInquiry(tier)} />
      <Testimonials />
      <Insights />
      <Partners />
      <Footer onCTA={() => openInquiry()} />
      <InquiryDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        defaultService={inquiryService}
      />
      <ChatWidget />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
