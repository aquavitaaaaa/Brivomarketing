import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, MapPin } from "lucide-react";
import Logo from "@/components/site/Logo";
import InquiryDialog from "@/components/site/InquiryDialog";
import NotFound from "@/pages/NotFound";
import { CASE_STUDIES } from "@/data/caseStudies";
import { trackEvent } from "@/lib/api";

const origin = () => (typeof window !== "undefined" ? window.location.origin : "");

export default function CaseStudyPage() {
  const { slug } = useParams();
  const cs = CASE_STUDIES[slug];
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("case-page");
  if (!cs) return <NotFound />;

  const url = `${origin()}/work/${cs.slug}`;
  const cta = (src) => {
    setSource(src);
    setOpen(true);
    trackEvent("cta_click", window.location.pathname, { meta: { source: src } });
  };
  const related = CASE_STUDIES[cs.related];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Brivo", item: `${origin()}/` },
        { "@type": "ListItem", position: 2, name: "Work", item: `${origin()}/#work` },
        { "@type": "ListItem", position: 3, name: cs.client, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${cs.client} website`,
      description: cs.metaDescription,
      url,
      image: `${origin()}${cs.hero}`,
      about: cs.industry,
      locationCreated: cs.location,
      creator: { "@type": "Organization", name: "Brivo", url: `${origin()}/` },
      sameAs: cs.liveUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: cs.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#0B1B2B]" data-testid="case-page">
      <Helmet>
        <title>{cs.seoTitle}</title>
        <meta name="description" content={cs.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={cs.seoTitle} />
        <meta property="og:description" content={cs.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${origin()}${cs.hero}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={cs.seoTitle} />
        <meta name="twitter:description" content={cs.metaDescription} />
        <meta name="twitter:image" content={`${origin()}${cs.hero}`} />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>

      <header className="sticky top-0 z-40 bg-[#FBFAF6]/92 backdrop-blur-xl border-b border-[#E7E3D8]">
        <div className="px-6 md:px-10 lg:px-16 h-20 flex items-center justify-between">
          <Link to="/" aria-label="Brivo home" data-testid="case-home-link"><Logo size={36} /></Link>
          <nav className="flex items-center gap-6 text-[14px]">
            <Link to="/#work" className="hidden sm:inline hover:text-[#B8864C]" data-testid="case-back-link">All work</Link>
            <button onClick={() => cta("case-nav")} data-testid="case-nav-cta"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full px-5 py-2.5 text-[13.5px] hover:bg-[#14283F] transition-colors">
              Start a project <ArrowRight size={14} />
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="px-6 md:px-10 lg:px-16 pt-14 md:pt-20 pb-12 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-6">
            <span className="eyebrow-accent" data-testid="case-kicker">{cs.kicker}</span>
            <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-[54px] leading-[1.06] tracking-tight" data-testid="case-h1">{cs.h1}</h1>
            <p className="mt-6 text-[17px] leading-relaxed text-[#4E5C6E] max-w-xl">{cs.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3 items-center">
              <button onClick={() => cta("case-hero")} data-testid="case-hero-cta"
                className="inline-flex items-center gap-2 bg-[#B8864C] text-white rounded-full px-7 py-3.5 text-[14px] font-medium hover:bg-[#C99661] transition-colors">
                Get a site like this <ArrowRight size={15} />
              </button>
              <a href={cs.liveUrl} target="_blank" rel="noopener noreferrer" data-testid="case-live-link"
                className="inline-flex items-center gap-2 border border-[#0B1B2B] rounded-full px-7 py-3.5 text-[14px] font-medium hover:bg-[#0B1B2B] hover:text-white transition-colors">
                Visit live site <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[13px] text-[#8190A1]"><MapPin size={14} /> {cs.location}</div>
          </div>
          <div className="lg:col-span-6">
            <img src={cs.hero} alt={`${cs.client} website preview`} className="w-full aspect-[16/10] object-cover rounded-2xl border border-[#E7E3D8]" />
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 pb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="case-facts">
            {cs.facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-[#E7E3D8] bg-white p-5">
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8190A1]">{f.label}</div>
                <div className="font-display text-3xl text-[#B8864C] mt-2">{f.value}</div>
                <div className="text-[12.5px] text-[#4E5C6E] mt-1">{f.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 border-t border-[#E7E3D8] bg-white grid lg:grid-cols-12 gap-10">
          <h2 className="lg:col-span-4 font-display text-3xl md:text-4xl leading-tight">The brief</h2>
          <p className="lg:col-span-7 text-[17px] leading-[1.75] text-[#4E5C6E]">{cs.brief}</p>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl mb-10">What we built</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="case-built">
            {cs.built.map((b, i) => (
              <article key={b.title} className="rounded-2xl border border-[#E7E3D8] bg-white p-6">
                <div className="text-[11px] tracking-[0.2em] text-[#B8864C]">0{i + 1}</div>
                <h3 className="font-display text-[22px] mt-2">{b.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#4E5C6E]">{b.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 pb-16 grid md:grid-cols-2 gap-5">
          {cs.gallery.map((g) => (
            <img key={g.src} src={g.src} alt={g.alt} loading="lazy" className="w-full h-[420px] object-cover rounded-2xl border border-[#E7E3D8]" />
          ))}
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 bg-[#0B1B2B] text-white">
          <div className="grid lg:grid-cols-12 gap-10">
            <h2 className="lg:col-span-4 font-display text-3xl md:text-4xl leading-tight">Why this works for {cs.industryLabel}</h2>
            <ul className="lg:col-span-7 space-y-4" data-testid="case-why">
              {cs.why.map((w) => (
                <li key={w} className="flex gap-3 text-[16px] leading-relaxed text-white/85">
                  <Check size={18} className="text-[#B8864C] mt-1 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-16 md:py-20 grid lg:grid-cols-12 gap-10">
          <h2 className="lg:col-span-4 font-display text-3xl md:text-4xl leading-tight">Questions</h2>
          <div className="lg:col-span-7 divide-y divide-[#E7E3D8] border-y border-[#E7E3D8]" data-testid="case-faq">
            {cs.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex justify-between gap-4 cursor-pointer list-none text-[17px] font-medium">
                  {f.q}
                  <ChevronDown size={18} className="shrink-0 mt-1 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-[#4E5C6E]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 pb-20">
          <div className="rounded-3xl bg-[#B8864C] text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">Want results like {cs.client}?</h2>
              <p className="mt-2 text-white/85 max-w-xl">Tell us about your business. A strategist replies fast, usually the same day.</p>
            </div>
            <button onClick={() => cta("case-bottom")} data-testid="case-bottom-cta"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] text-white rounded-full px-8 py-4 text-[15px] font-medium hover:bg-[#14283F] transition-colors shrink-0">
              Start a project <ArrowRight size={16} />
            </button>
          </div>
          {cs.industryPage && (
            <Link to={`/web-design/${cs.industryPage}`} data-testid="case-industry-link"
              className="mt-8 mr-8 inline-flex items-center gap-2 text-[15px] text-[#0B1B2B] hover:text-[#B8864C]">
              Web design for {cs.industryLabel} <ArrowRight size={15} />
            </Link>
          )}
          {related && (
            <Link to={`/work/${related.slug}`} data-testid="case-related-link"
              className="mt-8 inline-flex items-center gap-2 text-[15px] text-[#0B1B2B] hover:text-[#B8864C]">
              Next case study: {related.client} <ArrowRight size={15} />
            </Link>
          )}
        </section>
      </main>

      <footer className="px-6 md:px-10 lg:px-16 py-8 border-t border-[#E7E3D8] text-[13px] text-[#8190A1] flex flex-wrap justify-between gap-3">
        <span>© Brivo Marketing. AI performance studio.</span>
        <Link to="/" className="hover:text-[#B8864C]">Back to home</Link>
      </footer>

      <InquiryDialog open={open} onOpenChange={setOpen} defaultService={`Website like ${cs.client}`} source={source} />
    </div>
  );
}
