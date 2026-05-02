import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";

/**
 * BeforeAfterSlider — drag/hover reveal of ugly-before vs premium-after.
 * Before is a hand-built CSS mock (proves craft) — After is our real mockup.
 */

const CASES = [
  {
    id: "saas",
    afterSrc: "/mockup-saas.jpg",
    tag: "SaaS platform",
    beforeMeta: { industry: "FinOps Analytics", year: 2013 },
    metrics: [
      { label: "Activation rate", before: "8.1%", after: "34.7%", delta: "+4.3×" },
      { label: "Trial → paid",    before: "4.3%", after: "19.2%", delta: "+346%" },
      { label: "NPS",             before: "18",   after: "72",    delta: "+54 pts" },
    ],
  },
  {
    id: "ecom",
    afterSrc: "/mockup-ecom.jpg",
    tag: "Luxury e-commerce",
    beforeMeta: { industry: "Hand-made ceramics", year: 2014 },
    metrics: [
      { label: "Conversion rate",      before: "0.9%",  after: "4.8%",   delta: "+5.3×" },
      { label: "Avg. order value",     before: "$72",   after: "$186",   delta: "+158%" },
      { label: "Return customer rate", before: "11%",   after: "41%",    delta: "+3.7×" },
    ],
  },
];

/** Hand-built cluttered 2013-era SaaS dashboard mock (before) */
function LegacySaaSMock() {
  return (
    <div className="absolute inset-0 bg-[#EDEFF2] text-[11px] text-[#333] font-sans overflow-hidden" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* header */}
      <div className="h-[34px] bg-gradient-to-b from-[#3D6A96] to-[#264F76] text-white flex items-center px-3 justify-between border-b-2 border-[#1E3F5E]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#F2BE1A] rounded-sm" />
          <span className="font-bold text-[12px]">FinAnalyzer<sup className="text-[8px]">™</sup> 2013</span>
          <span className="text-[9px] ml-3 opacity-75">Home  |  Reports  |  Users  |  Settings  |  Help  |  Logout</span>
        </div>
        <div className="text-[9px]">Welcome back, admin!</div>
      </div>

      {/* 3 column: sidebar / main / right widgets */}
      <div className="flex h-[calc(100%-34px)]">
        {/* sidebar */}
        <div className="w-[120px] bg-[#F5F6F8] border-r border-[#CCC] p-2 space-y-1.5 overflow-hidden">
          {["📊 Dashboard","📁 Reports","👥 Users","💵 Invoices","📈 Charts","⚙️ Settings","❓ Support","✉️ Messages","🔔 Alerts","📅 Calendar","🗂️ Archives"].map((v, i) => (
            <div key={i} className={`px-1.5 py-0.5 rounded text-[10px] ${i === 0 ? "bg-[#FFE27A] border border-[#D6A700] font-bold" : "hover:bg-white border border-transparent"}`}>{v}</div>
          ))}
        </div>

        {/* main */}
        <div className="flex-1 p-2 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF9800] via-[#FFC107] to-[#FFEB3B] text-white text-[11px] font-bold px-2 py-1 rounded mb-1.5 border border-[#E65100] text-shadow">
            ★ LIMITED TIME: Upgrade to Pro and get 50% OFF ★ Call 1-800-FIN-CASH ★
          </div>
          <h1 className="text-[16px] font-bold mb-1.5" style={{ textShadow: "1px 1px 0 #fff, 2px 2px 0 #999" }}>Financial Overview Dashboard</h1>

          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[
              { l: "Revenue",  v: "$184,520.12", c: "#4CAF50" },
              { l: "Expenses", v: "$89,230.45",  c: "#F44336" },
              { l: "Profit",   v: "$95,289.67",  c: "#2196F3" },
              { l: "Users",    v: "1,245",       c: "#9C27B0" },
            ].map((s, i) => (
              <div key={i} className="border border-[#AAA] bg-white rounded p-1 text-center" style={{ boxShadow: "inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.15)" }}>
                <div className="text-[8px] uppercase text-[#666]">{s.l}</div>
                <div className="text-[11px] font-bold" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* ugly chart */}
          <div className="border border-[#AAA] bg-white rounded p-2 mb-1.5 relative h-[105px] overflow-hidden">
            <div className="text-[10px] font-bold mb-1">Revenue Growth (Line Graph)</div>
            <svg viewBox="0 0 200 60" className="w-full h-[75px]">
              <rect x="0" y="0" width="200" height="60" fill="#fff" />
              {[0, 10, 20, 30, 40, 50].map(y => (
                <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#e5e5e5" strokeWidth="0.3" />
              ))}
              <polyline fill="none" stroke="#1976D2" strokeWidth="1.5" points="0,45 20,40 40,42 60,38 80,35 100,30 120,32 140,26 160,24 180,20 200,18" />
              <polyline fill="none" stroke="#D32F2F" strokeWidth="1.5" points="0,50 20,48 40,46 60,44 80,42 100,41 120,39 140,38 160,37 180,36 200,35" />
              <polyline fill="none" stroke="#388E3C" strokeWidth="1.5" points="0,52 20,49 40,47 60,45 80,43 100,40 120,37 140,34 160,30 180,26 200,22" />
            </svg>
          </div>

          {/* data table */}
          <div className="border border-[#AAA] bg-white rounded overflow-hidden">
            <div className="bg-[#3D6A96] text-white text-[9px] grid grid-cols-5 px-1.5 py-0.5 font-bold">
              <div>Date</div><div>Client</div><div>Plan</div><div>Amount</div><div>Status</div>
            </div>
            {[
              ["10/31/13", "Acme Inc.",   "Pro",        "$1,250.00", "Paid"],
              ["10/30/13", "Globex",      "Enterprise", "$3,400.00", "Pending"],
              ["10/29/13", "Umbrella Co", "Basic",      "$49.00",    "Paid"],
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-5 px-1.5 py-0.5 text-[9px] border-t border-[#ddd] ${i % 2 ? "bg-[#F9F9F9]" : "bg-white"}`}>
                {row.map((c, j) => (
                  <div key={j} className={j === 4 ? (c === "Paid" ? "text-[#4CAF50] font-bold" : "text-[#FF9800] font-bold") : ""}>{c}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* right widgets column */}
        <div className="w-[90px] bg-[#F5F6F8] border-l border-[#CCC] p-1.5 space-y-1.5 overflow-hidden text-[8px]">
          <div className="bg-white border border-[#AAA] rounded p-1"><div className="font-bold">Weather</div><div>☁️ 62°F NYC</div></div>
          <div className="bg-[#FFF9C4] border border-[#F9A825] rounded p-1"><div className="font-bold">Tip!</div><div>Click here for a free eBook</div></div>
          <div className="bg-white border border-[#AAA] rounded p-1"><div className="font-bold">Stocks</div><div>▲ AAPL 178.21</div><div>▼ GOOG 125.04</div></div>
          <div className="bg-[#E1BEE7] border border-[#8E24AA] rounded p-1 text-center font-bold">BUY NOW!</div>
          <div className="bg-white border border-[#AAA] rounded p-1"><div className="font-bold">Calendar</div><div>Oct 31, 2013</div></div>
        </div>
      </div>
    </div>
  );
}

/** Hand-built cluttered 2014-era e-commerce mock */
function LegacyEcomMock() {
  return (
    <div className="absolute inset-0 bg-white overflow-hidden text-[#333]" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>
      {/* rainbow banner */}
      <div className="h-[38px] text-white flex items-center justify-between px-3" style={{ background: "linear-gradient(90deg,#FF0000,#FF9900,#FFFF00,#00FF00,#00CCFF,#AA00FF,#FF00AA)" }}>
        <div className="font-bold text-[14px]" style={{ fontFamily: "'Comic Sans MS', cursive", textShadow: "1px 1px 0 #000" }}>
          ✨ CeramicsWorld.biz ✨
        </div>
        <div className="text-[9px] flex gap-2">
          <span>🛒 Cart (0)</span><span>❤️ Wishlist</span><span>👤 Log In</span><span>🔍 Search</span>
        </div>
      </div>

      {/* nav */}
      <div className="h-[22px] bg-[#F5EFE0] border-b border-[#D4C49A] flex items-center px-3 text-[9px] gap-3 font-bold text-[#8B4513]">
        <span>HOME</span><span>|</span><span>SHOP</span><span>|</span><span>NEW!!!</span><span>|</span><span style={{ color: "red" }}>SALE 🔥</span><span>|</span><span>ABOUT US</span><span>|</span><span>CONTACT</span><span>|</span><span>BLOG</span>
      </div>

      {/* main */}
      <div className="flex h-[calc(100%-60px)]">
        {/* left filter sidebar */}
        <div className="w-[110px] bg-[#FFFDE7] border-r border-[#FBC02D] p-1.5 text-[8px] overflow-hidden">
          <div className="font-bold text-[#D32F2F] mb-1">FILTERS:</div>
          {["Category","Color","Price Range","Size","Material","Brand","Rating","Country","Shape","Glaze","Oven Safe","Dishwasher Safe","Handmade","Vintage"].map((f, i) => (
            <div key={i} className="flex items-center gap-1 mb-0.5"><input type="checkbox" className="scale-[0.7]" /><span>{f}</span></div>
          ))}
          <div className="mt-1.5 bg-[#FFCDD2] border border-[#D32F2F] text-[#B71C1C] font-bold text-center p-0.5 rounded-sm">FREE SHIP $50+!</div>
        </div>

        {/* product grid */}
        <div className="flex-1 p-1.5 overflow-hidden bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-bold text-[#8B4513]">Featured Products (1-15 of 2,487)</div>
            <div className="text-[8px]">Sort: <u>Price ↑</u> | <u>Newest</u> | <u>Rating</u></div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="border border-[#DDD] bg-white p-0.5 relative">
                <div className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[7px] font-bold px-0.5 rotate-12 rounded-sm">SALE!</div>
                <div className="w-full aspect-square bg-gradient-to-br from-[#D7CCC8] to-[#8D6E63] mb-0.5" />
                <div className="text-[8px] font-bold truncate">Ceramic Mug #{1042 + i}</div>
                <div className="text-[7px] text-gray-500 line-through inline">$24</div>{" "}
                <div className="text-[8px] text-red-600 font-bold inline">${12 + i}.99</div>
                <div className="text-[6px] text-[#FFA000]">★★★★☆ (42)</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-0.5 mt-1 text-[8px]">
            {[1, 2, 3, "...", 166].map((p, i) => (
              <span key={i} className={`border border-[#DDD] px-1 py-0.5 ${p === 1 ? "bg-[#FFD54F] font-bold" : "bg-white"}`}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegacyMock({ id }) {
  if (id === "saas") return <LegacySaaSMock />;
  return <LegacyEcomMock />;
}


export default function BeforeAfterSlider() {
  const [activeCase, setActiveCase] = useState(0);
  const caseData = CASES[activeCase];

  return (
    <section id="transformations" className="relative py-24 md:py-32 bg-[#F3F1EA]" data-testid="transformations-section">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        {/* Section header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="eyebrow-accent mb-4">THE TRANSFORMATION</div>
            <h2 className="font-display text-[42px] md:text-[58px] font-[500] leading-[1.02] tracking-[-0.02em] text-[#0B1B2B]">
              Before us. <em className="italic text-[#B8864C]">After us.</em>
            </h2>
            <p className="mt-4 max-w-xl text-[#4E5C6E] text-[16px] leading-relaxed">
              Drag the handle. This is a real side-by-side — a hand-built recreation of
              the legacy experience vs the redesigned system we shipped. No stock photos.
              No smoke and mirrors.
            </p>
          </div>

          {/* case switcher */}
          <div className="flex gap-2" role="tablist">
            {CASES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveCase(i)}
                className={`text-[12px] tracking-[0.08em] uppercase font-medium px-4 py-2.5 rounded-full border transition-all ${
                  i === activeCase
                    ? "bg-[#0B1B2B] border-[#0B1B2B] text-white"
                    : "bg-transparent border-[#CFC9B8] text-[#4E5C6E] hover:border-[#0B1B2B] hover:text-[#0B1B2B]"
                }`}
                data-testid={`transform-case-${c.id}`}
              >
                {c.tag}
              </button>
            ))}
          </div>
        </div>

        {/* slider */}
        <Slider caseData={caseData} key={caseData.id} />

        {/* metrics strip */}
        <div className="mt-10 grid grid-cols-3 gap-4 md:gap-8 border-t border-[#E7E3D8] pt-8">
          {caseData.metrics.map((m) => (
            <div key={m.label}>
              <div className="text-[11px] tracking-[0.22em] uppercase text-[#8190A1] mb-2">{m.label}</div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[#B9B2A0] text-[18px] md:text-[22px] font-display line-through decoration-[#B9B2A0]/60">{m.before}</span>
                <svg width="22" height="10" viewBox="0 0 22 10" className="text-[#B8864C]"><path d="M0 5 H18 M14 1 L20 5 L14 9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="font-display text-[28px] md:text-[36px] font-[500] text-[#0B1B2B] tracking-tight">{m.after}</span>
                <span className="inline-block ml-auto md:ml-2 text-[11px] font-medium text-white bg-[#0B1B2B] px-2.5 py-1 rounded-full">{m.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Slider({ caseData }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef(null);

  const update = (clientX) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const p = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPos(p);
  };

  return (
    <div
      ref={wrapRef}
      onMouseDown={(e) => { setDragging(true); update(e.clientX); }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onMouseMove={(e) => { if (dragging) update(e.clientX); }}
      onTouchStart={(e) => { setDragging(true); update(e.touches[0].clientX); }}
      onTouchEnd={() => setDragging(false)}
      onTouchMove={(e) => { if (dragging) update(e.touches[0].clientX); }}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden select-none shadow-[0_30px_80px_-30px_rgba(11,27,43,0.35)] cursor-ew-resize ring-1 ring-[#E7E3D8]"
      data-testid="transform-slider"
    >
      {/* AFTER (base) */}
      <div className="absolute inset-0">
        <img src={caseData.afterSrc} alt="" className="w-full h-full object-cover object-top" draggable={false} />
        <div className="absolute top-4 right-4 bg-[#0B1B2B] text-white text-[10px] font-medium tracking-[0.22em] uppercase px-3 py-1.5 rounded-full">
          After · Brivo
        </div>
      </div>

      {/* BEFORE (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <LegacyMock id={caseData.id} />
        <div className="absolute top-4 left-4 bg-white text-[#0B1B2B] text-[10px] font-medium tracking-[0.22em] uppercase px-3 py-1.5 rounded-full border border-[#CFC9B8]">
          Before · Legacy
        </div>
      </div>

      {/* Divider handle */}
      <div
        className="absolute top-0 bottom-0 w-[3px] bg-[#D4A971] pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)", boxShadow: "0 0 30px rgba(212,169,113,0.6)" }}
      >
        <motion.div
          animate={{ scale: dragging ? 1.1 : 1 }}
          className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-[#D4A971] flex items-center justify-center shadow-xl"
        >
          <MoveHorizontal size={18} className="text-[#0B1B2B]" />
        </motion.div>
      </div>
    </div>
  );
}
