import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trophy, Sparkles, Target, BarChart3, Zap } from "lucide-react";

const MESSAGES = [
  { icon: TrendingUp, text: "+$2,840 conversion · Q2 launch campaign", meta: "Toronto · 4m ago" },
  { icon: Trophy, text: "New retainer signed · Series A SaaS", meta: "Austin · 12m ago" },
  { icon: BarChart3, text: "ROAS 6.1x · Halo Fitness · Q2 win", meta: "Los Angeles · 27m ago" },
  { icon: Zap, text: "+$8,420 daily revenue · D2C apparel", meta: "NYC · 41m ago" },
  { icon: Sparkles, text: "Lighthouse 100/100 shipped · luminflow.io", meta: "Remote · 1h ago" },
  { icon: Target, text: "Ranked #1 'AI marketing agency' · Google", meta: "Verified · 2h ago" },
  { icon: TrendingUp, text: "+212% CVR · kestral.studio launch", meta: "Toronto · 3h ago" },
  { icon: Trophy, text: "$120M revenue tracked across portfolio", meta: "Updated · today" },
];

export default function SocialProofToaster() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const initial = setTimeout(() => setShow(true), 4500);
    const cycle = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setShow(true);
      }, 600);
    }, 12000);
    return () => {
      clearTimeout(initial);
      clearInterval(cycle);
    };
  }, []);

  const m = MESSAGES[idx];
  const Icon = m.icon;

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-none hidden md:block">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 bg-[#13131C]/95 backdrop-blur-md border border-[#CCFF00]/25 px-4 py-3 rounded-lg max-w-sm"
            style={{
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.5), 0 0 30px rgba(204,255,0,0.12)",
            }}
          >
            <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center bg-[#CCFF00]/15 rounded-md text-[#CCFF00]">
              <Icon size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.85)] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-medium leading-tight">
                {m.text}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 mt-0.5">
                {m.meta}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
