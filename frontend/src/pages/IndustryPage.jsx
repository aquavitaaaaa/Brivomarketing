import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check } from "lucide-react";
import Logo from "@/components/site/Logo";
import InquiryDialog from "@/components/site/InquiryDialog";
import NotFound from "@/pages/NotFound";
import { INDUSTRY_PAGES } from "@/data/industryPages";
import { CASE_STUDIES } from "@/data/caseStudies";
import { trackEvent } from "@/lib/api";

const origin = () => (typeof window !== "undefined" ? window.location.origin : "");

export default function IndustryPage() {
  const { slug } = useParams();
  const pg = INDUSTRY_PAGES[slug];
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("industry-page");
  if (!pg) return <NotFound />;

  const url = `${origin()}/web-design/${pg.slug}`;
  const cta = (src) => {
    setSource(`${pg.slug}-${src}`);
    setOpen(true);
    trackEvent("cta_click", window.location.pathname, { meta: { source: `${pg.slug}-${src}` } });
  };
  const proof = CASE_STUDIES[pg.proof.slug];
  const related = INDUSTRY_PAGES[pg.related];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Brivo", item: `${origin()}/` },
        { "@type": "ListItem", position: 2, name: pg.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: pg.name,
      description: pg.metaDescription,
      url,
      serviceType: pg.name,
      audience: { "@type": "Audience", audienceType: pg.audience },
      provider: { "@type": "Organization", name: "Brivo", url: `${origin()}/` },
      areaServed: "US",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pg.faq.map((f) => ({
        "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#0B1B2B]" data-testid="industry-page">
      <Helmet>
        <title>{pg.seoTitle}</title>
        <meta name="description" content={pg.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pg.seoTitle} />
        <meta property="og:description" content={pg.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin()}${pg.hero}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>

      <header className="sticky top-0 z-40 bg-[#FBFAF6]/92 backdrop-blur-xl border-b border-[#E7E3D8]">
        <div className="px-6 md:px-10 lg:px-16 h-20 flex items-center justify-between">
          <Link to="/" aria-label="Brivo home" data-testid="industry-home-link"><Logo size={36} /></Link>
          <button onClick={() => cta("nav")} data-testid="industry-nav-cta"
            className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full px-5 py-2.5 text-[13.5px] hover:bg-[#14283F] transition-colors">
            Get a free quote <ArrowRight size={14} />
          </button>
        </div>
      </header>

      <main>
        <section className="px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-14 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <span className="eyebrow-accent">{pg.name}</span>
            <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-[52px] leading-[1.06] tracking-tight" data-testid="industry-h1">{pg.h1}</h1>
            <p className="mt-6 text-[17px] leading-relaxed text-[#4E5C6E] max-w-xl">{pg.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => cta("hero")} data-testid="industry-hero-cta"
                className="inline-flex items-center gap-2 bg-[#B8864C] text-white rounded-full px-7 py-3.5 text-[14px] font-medium hover:bg-[#C99661] transition-colors">
                Get a free quote <ArrowRight size={15} />
              </button>
              <Link to={`/work/${proof.slug}`} data-testid="industry-proof-link"
                className="inline-flex items-center gap-2 border border-[#0B1B2B] rounded-full px-7 py-3.5 text-[14px] font-medium hover:bg-[#0B1B2B] hover:text-white transition-colors">
                {pg.proof.label}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <img src={pg.hero} alt={pg.heroAlt} className="w-full aspect-[16/10] object-cover rounded-2xl border border-[#E7E3D8]" />
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 bg-white border-y border-[#E7E3D8]">
          <h2 className="font-display text-3xl md:text-4xl mb-10 max-w-2xl">What is costing {pg.audience} customers online</h2>
          <div className="grid md:grid-cols-2 gap-5" data-testid="industry-problems">
            {pg.problems.map((p) => (
              <article key={p.title} className="rounded-2xl border border-[#E7E3D8] bg-[#FBFAF6] p-6">
                <h3 className="font-display text-[22px]">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#4E5C6E]">{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 grid lg:grid-cols-12 gap-10">
          <h2 className="lg:col-span-4 font-display text-3xl md:text-4xl leading-tight">What is included</h2>
          <ul className="lg:col-span-7 space-y-4" data-testid="industry-included">
            {pg.included.map((w) => (
              <li key={w} className="flex gap-3 text-[16px] leading-relaxed text-[#4E5C6E]">
                <Check size={18} className="text-[#B8864C] mt-1 shrink-0" /> {w}
              </li>
            ))}
          </ul>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 bg-[#0B1B2B] text-white">
          <h2 className="font-display text-3xl md:text-4xl mb-8">Who we build for</h2>
          <div className="flex flex-wrap gap-3">
            {pg.trades.map((t) => (
              <span key={t} className="border border-white/25 rounded-full px-4 py-2 text-[14px] text-white/85">{t}</span>
            ))}
          </div>
          <div className="mt-14 grid md:grid-cols-4 gap-6">
            {pg.process.map((s, i) => (
              <div key={s.t}>
                <div className="text-[11px] tracking-[0.2em] text-[#B8864C]">STEP 0{i + 1}</div>
                <div className="font-display text-2xl mt-2">{s.t}</div>
                <p className="mt-2 text-[14px] text-white/70 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 grid lg:grid-cols-12 gap-10">
          <h2 className="lg:col-span-4 font-display text-3xl md:text-4xl leading-tight">Questions</h2>
          <div className="lg:col-span-7 divide-y divide-[#E7E3D8] border-y border-[#E7E3D8]" data-testid="industry-faq">
            {pg.faq.map((f) => (
              <details key={f.q} className="py-5">
                <summary className="cursor-pointer list-none text-[17px] font-medium">{f.q}</summary>
                <p className="mt-3 text-[15px] leading-relaxed text-[#4E5C6E]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 pb-20">
          <div className="rounded-3xl bg-[#B8864C] text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">Ready for a site that brings in customers?</h2>
              <p className="mt-2 text-white/85 max-w-xl">Tell us about your business. A strategist replies fast, usually the same day.</p>
            </div>
            <button onClick={() => cta("bottom")} data-testid="industry-bottom-cta"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full px-8 py-4 text-[15px] font-medium hover:bg-[#14283F] transition-colors shrink-0">
              Get a free quote <ArrowRight size={16} />
            </button>
          </div>
          <Link to={`/web-design/${related.slug}`} data-testid="industry-related-link"
            className="mt-8 inline-flex items-center gap-2 text-[15px] hover:text-[#B8864C]">
            Also see: {related.name} <ArrowRight size={15} />
          </Link>
        </section>
      </main>

      <footer className="px-6 md:px-10 lg:px-16 py-8 border-t border-[#E7E3D8] text-[13px] text-[#8190A1] flex flex-wrap justify-between gap-3">
        <span>© Brivo Marketing. AI performance studio.</span>
        <Link to="/" className="hover:text-[#B8864C]">Back to home</Link>
      </footer>

      <InquiryDialog open={open} onOpenChange={setOpen} defaultService="Web Design & Development" source={source} />
    </div>
  );
}
