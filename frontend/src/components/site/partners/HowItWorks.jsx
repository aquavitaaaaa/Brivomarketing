import { UserPlus, Link2, TrendingUp, Wallet } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: UserPlus,
    title: "Apply in 2 minutes",
    body:
      "Tell us who you are, your reach, and how you sell. We approve serious applicants within 48 hours.",
  },
  {
    n: "02",
    icon: Link2,
    title: "Get your private link",
    body:
      "You get a unique referral link + a co-branded pitch kit. Share it on LinkedIn, in DMs, on calls — anywhere.",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "We close. You climb.",
    body:
      "Our senior strategists pitch every lead and close them. Your tier rises automatically as your active book grows.",
  },
  {
    n: "04",
    icon: Wallet,
    title: "Get paid every month",
    body:
      "Commissions are calculated and paid monthly. Recurring forever — for as long as the client stays with us.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#FBFAF6] py-24 px-6 md:px-10 lg:px-16" id="how">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#B8864C] font-medium">
              How it works
            </span>
            <h2 className="font-display text-[36px] md:text-[52px] leading-[1.05] tracking-tight mt-3 text-[#0B1B2B]">
              Four steps. Lifetime upside.
            </h2>
          </div>
          <p className="text-[15px] text-[#4E5C6E] max-w-[420px]">
            We give partners a real product to sell, real strategists to close it,
            and real recurring revenue. No MLM nonsense, no quarterly clawbacks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="relative bg-white border border-[#E7E3D8] rounded-2xl p-7 hover:border-[#B8864C] transition-all"
              >
                <span className="absolute top-5 right-5 font-mono text-[11px] tracking-[0.32em] text-[#B8864C]/80">
                  / {s.n}
                </span>
                <div className="w-11 h-11 rounded-full bg-[#0B1B2B] text-[#E8C28A] flex items-center justify-center mb-5">
                  <Icon size={18} />
                </div>
                <h3 className="font-display text-[22px] tracking-tight text-[#0B1B2B] mb-2">
                  {s.title}
                </h3>
                <p className="text-[14px] text-[#4E5C6E] leading-relaxed">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
