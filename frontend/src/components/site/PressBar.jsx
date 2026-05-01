// "As Featured In" press logos. Uses typographic wordmarks (not real trademarks)
// styled to match the publication aesthetic. Conveys instant social proof.
const press = [
  { name: "FORBES", className: "font-serif italic font-black tracking-tight" },
  { name: "TECHCRUNCH", className: "font-display font-black tracking-tighter" },
  { name: "INC.", className: "font-serif font-black tracking-tight" },
  { name: "FAST COMPANY", className: "font-display font-black tracking-tight" },
  { name: "ENTREPRENEUR", className: "font-display font-black tracking-tighter" },
  { name: "WIRED", className: "font-display font-black tracking-[0.2em]" },
  { name: "BLOOMBERG", className: "font-serif font-black tracking-tight" },
];

export default function PressBar() {
  return (
    <section
      className="relative px-6 md:px-12 lg:px-24 py-12 md:py-14 border-y border-white/10 bg-[#0E0E14]"
      data-testid="press-bar"
    >
      <div className="grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            As Featured In
          </span>
          <div className="font-display text-xs uppercase tracking-tight text-white/70 mt-2 max-w-[180px]">
            Strategy and results covered by tier-1 business press.
          </div>
        </div>
        <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-y-6 gap-x-4 items-center">
          {press.map((p) => (
            <div
              key={p.name}
              className={`text-center text-white/45 hover:text-white transition-colors text-base md:text-lg ${p.className}`}
              data-testid={`press-${p.name.toLowerCase().replace(/\W/g, "-")}`}
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
