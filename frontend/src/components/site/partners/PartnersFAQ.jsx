import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Who is this program for?",
    a: "Sales pros, marketers, freelancers, agency owners with stale clients, fractional execs, founders with networks, students hustling on the side. If you can credibly introduce a brand to a senior strategist, you can earn here.",
  },
  {
    q: "Do I need to sell or close the deal?",
    a: "No. You make the warm intro and pass the lead. Our senior strategists run the discovery, build the pitch, handle objections, and close. You collect commission on every paying month.",
  },
  {
    q: "How long do I keep getting paid?",
    a: "For as long as the client pays Brivo. There is no 12-month cap and no clawback after the second month. If they stay 5 years, you get paid for 5 years.",
  },
  {
    q: "How is commission paid?",
    a: "Monthly, on the 5th, via Stripe / bank transfer / PayPal — your pick. Statements show every active client and the exact $ each one generated for you.",
  },
  {
    q: "Is there a cap?",
    a: "None. Platinum partners earn 30% on every dollar — and we do not stop you at $50k/mo, $100k/mo, or $250k/mo.",
  },
  {
    q: "What happens if a client cancels?",
    a: "You stop earning on that one client. Your tier is recalculated based on remaining active clients. There is never a clawback on already-paid commissions.",
  },
  {
    q: "How fast does an application get approved?",
    a: "We review every application personally within 48 hours. Strong applications (with relevant experience or warm pipeline) get fast-tracked.",
  },
];

export default function PartnersFAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white py-24 px-6 md:px-10 lg:px-16" id="faq">
      <div className="max-w-[920px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#B8864C] font-medium">
            FAQ
          </span>
          <h2 className="font-display text-[36px] md:text-[52px] leading-[1.05] tracking-tight mt-3 text-[#0B1B2B]">
            The questions you&rsquo;re about to ask.
          </h2>
        </div>
        <div className="divide-y divide-[#E7E3D8] border-y border-[#E7E3D8]">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="py-1">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-6 py-5 text-left"
                  data-testid={`partners-faq-${i}`}
                >
                  <span className="font-display text-[18px] md:text-[22px] tracking-tight text-[#0B1B2B]">
                    {f.q}
                  </span>
                  {isOpen ? (
                    <Minus size={18} className="text-[#B8864C] flex-shrink-0" />
                  ) : (
                    <Plus size={18} className="text-[#B8864C] flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="pb-6 pr-9 text-[14.5px] text-[#4E5C6E] leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
