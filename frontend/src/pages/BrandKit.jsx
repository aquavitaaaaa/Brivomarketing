import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Check, FileDown, Instagram, Twitter, Youtube, Linkedin, Facebook } from "lucide-react";
import Logo from "../components/site/Logo";

/**
 * Brand Kit — public download page for all social media assets.
 * Shows every generated graphic with preview + one-click download.
 */

const SECTIONS = [
  {
    id: "logos",
    title: "Logo lockups",
    subtitle: "Horizontal wordmark + monogram. Use on any marketing surface.",
    items: [
      { slug: "logo-horizontal-dark",  label: "Horizontal — Dark",  dims: "2400×600",  note: "For navy / dark backgrounds",  bg: "dark"  },
      { slug: "logo-horizontal-light", label: "Horizontal — Light", dims: "2400×600",  note: "For ivory / light backgrounds", bg: "light" },
    ],
  },
  {
    id: "avatars",
    title: "Profile avatars",
    subtitle: "1:1 monogram badges. Works on every social platform profile photo.",
    items: [
      { slug: "avatar-dark",  label: "Avatar — Dark",  dims: "1024×1024", note: "Instagram, X, LinkedIn, YouTube, Facebook", bg: "dark"  },
      { slug: "avatar-light", label: "Avatar — Light", dims: "1024×1024", note: "Optional alternate for light profiles",     bg: "light" },
    ],
  },
  {
    id: "instagram",
    title: "Instagram",
    subtitle: "Story, grid post, and cover — editorial poster style.",
    items: [
      { slug: "instagram-story", label: "Story / Reel Cover", dims: "1080×1920", note: "9:16 vertical",        icon: Instagram, bg: "dark" },
      { slug: "instagram-post",  label: "Grid Post",          dims: "1080×1080", note: "1:1 square",           icon: Instagram, bg: "dark" },
      { slug: "instagram-cover", label: "Cover Highlight",    dims: "1920×1080", note: "Hero / highlight art", icon: Instagram, bg: "dark" },
    ],
  },
  {
    id: "twitter",
    title: "X (Twitter)",
    subtitle: "Banner header optimized for the X safe area.",
    items: [
      { slug: "twitter-header", label: "Profile Header", dims: "1500×500", note: "3:1 banner", icon: Twitter, bg: "dark" },
    ],
  },
  {
    id: "youtube",
    title: "YouTube",
    subtitle: "Channel art with a safe center for mobile / TV display.",
    items: [
      { slug: "youtube-banner", label: "Channel Banner", dims: "2560×1440", note: "Safe area 1546×423", icon: Youtube, bg: "dark" },
    ],
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    subtitle: "Company page cover — B2B editorial look.",
    items: [
      { slug: "linkedin-cover", label: "Company Cover", dims: "1584×396", note: "Logo space lower-left", icon: Linkedin, bg: "dark" },
    ],
  },
];

function AssetCard({ slug, label, dims, note, icon: Icon, bg }) {
  const [copied, setCopied] = useState(false);
  const src = `/kit-assets/${slug}.jpg`;

  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `brivo-${slug}.jpg`;
    a.click();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${src}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-[#E7E3D8] bg-white card-lift"
      data-testid={`brand-asset-${slug}`}
    >
      <div className={`relative ${bg === "dark" ? "bg-[#0B1B2B]" : "bg-[#F3F1EA]"} aspect-[16/10] flex items-center justify-center overflow-hidden`}>
        <img
          src={src}
          alt={label}
          loading="lazy"
          className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3">
          {Icon ? (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase ${bg === "dark" ? "bg-white/10 text-white/90 border border-white/20" : "bg-[#0B1B2B]/10 text-[#0B1B2B] border border-[#0B1B2B]/15"}`}>
              <Icon size={11} /> {label.split(" ")[0]}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[19px] font-[500] text-[#0B1B2B] leading-tight">{label}</div>
            <div className="mt-1 text-[12px] text-[#4E5C6E]">
              <span className="font-medium text-[#0B1B2B]">{dims}</span> · {note}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={download}
            className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#14283F] text-white text-[12.5px] font-medium px-4 py-2 rounded-full transition-colors"
            data-testid={`brand-asset-download-${slug}`}
          >
            <Download size={13} /> Download .jpg
          </button>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 border border-[#CFC9B8] hover:border-[#0B1B2B] text-[#0B1B2B] text-[12.5px] font-medium px-4 py-2 rounded-full transition-colors"
            data-testid={`brand-asset-copy-${slug}`}
          >
            {copied ? <><Check size={13} /> Copied</> : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrandKit() {
  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#0B1B2B]">
      {/* Top bar */}
      <header className="border-b border-[#E7E3D8] bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-3.5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 group"
            data-testid="brand-kit-logo-link"
          >
            <Logo size={40} />
            <span className="hidden md:inline-flex items-center gap-1.5 ml-3 pl-4 border-l border-[#E7E3D8] text-[10px] tracking-[0.24em] uppercase text-[#8190A1] font-medium">
              <span className="inline-block w-1 h-1 rounded-full bg-[#B8864C]" />
              Press Kit · Vol. 01
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 text-[12.5px] text-[#4E5C6E] hover:text-[#0B1B2B] transition-colors"
              data-testid="brand-kit-back"
            >
              <ArrowLeft size={13} /> brivomarketing.com
            </Link>
            <a
              href="/kit-assets/brivo-brand-kit.pdf"
              download="brivo-brand-kit.pdf"
              className="inline-flex items-center gap-2 bg-[#0B1B2B] hover:bg-[#14283F] text-white text-[12.5px] font-medium px-4 py-2 rounded-full transition-colors shadow-sm"
              data-testid="brand-kit-pdf-download"
            >
              <FileDown size={13} /> <span className="hidden sm:inline">Download full kit</span><span className="sm:hidden">PDF</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12">
        <div className="grid md:grid-cols-[1.1fr,0.9fr] gap-12 items-start">
          {/* Left: copy */}
          <div>
            <div className="eyebrow-accent mb-4">SOCIAL MEDIA BLITZ · DOWNLOAD PACK · VOL. 01</div>
            <h1 className="font-display font-[400] leading-[1.02] tracking-[-0.02em] text-[clamp(2.4rem,6vw,4.6rem)]">
              The Brivo<br />
              <em style={{ fontStyle: "italic" }} className="text-[#B8864C] font-[500]">brand system.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-[#4E5C6E] text-[16px] md:text-[17px] leading-[1.65]">
              A full press kit — manifesto, fact sheet, featured-in, awards, case studies, logo system,
              palette, typography, Instagram takeover, voice guide, and a weekly playbook —
              pre-sized for every platform you'll ever need. Download the 17-page PDF or grab
              individual .jpgs with a copy-ready link for your scheduler.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/kit-assets/brivo-brand-kit.pdf"
                download="brivo-brand-kit.pdf"
                className="inline-flex items-center gap-2 bg-[#B8864C] hover:bg-[#C99661] text-white px-6 py-3 rounded-full text-[14px] font-medium transition-colors shadow-lg shadow-[#B8864C]/25 hover:shadow-[#B8864C]/40 hover:-translate-y-[1px]"
                data-testid="brand-kit-hero-pdf"
                style={{ transition: "transform .2s, box-shadow .2s, background-color .2s" }}
              >
                <FileDown size={15} /> Download the lookbook · PDF
              </a>
              <span className="text-[12px] text-[#8190A1]">
                17 pages · 8 MB · full press kit with URLs
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 max-w-md gap-3 text-center">
              {[
                { n: "17", l: "Pages" },
                { n: "14", l: "Assets" },
                { n: "7",  l: "Platforms" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-[#E7E3D8] bg-white/60 backdrop-blur-sm py-3">
                  <div className="font-display text-[26px] font-[500] text-[#0B1B2B] leading-none">{s.n}</div>
                  <div className="mt-1 text-[10px] tracking-[0.18em] uppercase text-[#8190A1]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: PDF preview stack */}
          <div className="relative" data-testid="brand-kit-pdf-preview">
            <div className="relative aspect-[11/8.5] max-w-[520px] mx-auto">
              {/* Back pages peeking */}
              <img
                src="/kit-assets/brand-kit-page-back.png"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-xl rotate-[5deg] translate-x-[6%] translate-y-[4%] opacity-90"
              />
              <img
                src="/kit-assets/brand-kit-page-ig.png"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-xl rotate-[-3deg] translate-x-[-4%] translate-y-[2%] opacity-95"
              />
              {/* Cover on top */}
              <a
                href="/kit-assets/brivo-brand-kit.pdf"
                download="brivo-brand-kit.pdf"
                className="relative block rounded-lg overflow-hidden shadow-2xl ring-1 ring-[#0B1B2B]/10 hover:-translate-y-1 transition-transform"
                style={{ transitionDuration: ".3s" }}
                data-testid="brand-kit-preview-cover"
              >
                <img
                  src="/kit-assets/brand-kit-cover.png"
                  alt="Brivo brand kit — cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-[#0B1B2B]/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                  <FileDown size={10} /> 17 pages
                </div>
              </a>
            </div>

            {/* Small thumb strip */}
            <div className="mt-6 flex items-center justify-center gap-2 opacity-90">
              {["index", "awards", "case", "ig", "color", "back"].map((t) => (
                <img
                  key={t}
                  src={`/kit-assets/brand-kit-page-${t}.png`}
                  alt=""
                  aria-hidden
                  className="h-14 w-auto rounded border border-[#E7E3D8] shadow-sm hover:-translate-y-[2px] transition-transform"
                  style={{ transitionDuration: ".2s" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Press wall — featured-in ticker */}
        <div className="mt-20 border-y border-[#E7E3D8] py-8" data-testid="brand-kit-press-wall">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="eyebrow-accent md:border-r md:border-[#E7E3D8] md:pr-10 whitespace-nowrap">
              AS FEATURED IN
            </div>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 font-display text-[22px] md:text-[26px] font-[500] text-[#0B1B2B]/70">
              <span>TechCrunch</span>
              <span className="text-[#B8864C]">·</span>
              <span>Forbes</span>
              <span className="text-[#B8864C]">·</span>
              <span>Fast Company</span>
              <span className="text-[#B8864C]">·</span>
              <span>Bloomberg</span>
              <span className="text-[#B8864C]">·</span>
              <span>WSJ</span>
            </div>
          </div>
        </div>

        {/* Palette + typography quick-reference */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6">
            <div className="eyebrow mb-4">Palette</div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { hex: "#0B1B2B", name: "Navy" },
                { hex: "#B8864C", name: "Gold" },
                { hex: "#D4A971", name: "Amber" },
                { hex: "#F5D7A4", name: "Cream" },
                { hex: "#FBFAF6", name: "Ivory", border: true },
              ].map((c) => (
                <div key={c.hex} className="text-center" data-testid={`palette-${c.name.toLowerCase()}`}>
                  <div
                    className="h-14 rounded-lg mb-2"
                    style={{
                      background: c.hex,
                      border: c.border ? "1px solid #E7E3D8" : undefined,
                    }}
                  />
                  <div className="text-[11px] font-medium">{c.name}</div>
                  <div className="text-[10px] text-[#8190A1] font-mono">{c.hex}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7E3D8] bg-white p-6">
            <div className="eyebrow mb-4">Typography</div>
            <div className="space-y-3">
              <div>
                <div className="font-display text-[32px] font-[500] leading-none text-[#0B1B2B]">
                  Fraunces
                </div>
                <div className="text-[11px] text-[#8190A1] mt-1">Serif · Headlines, wordmark, editorial pull-quotes</div>
              </div>
              <div className="pt-2 border-t border-[#F3F1EA]">
                <div className="text-[20px] font-medium text-[#0B1B2B]" style={{ fontFamily: "Inter, sans-serif" }}>
                  Inter
                </div>
                <div className="text-[11px] text-[#8190A1] mt-1">Sans · Body, UI, captions, small-caps labels</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asset sections */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 pb-24 space-y-20">
        {SECTIONS.map((section) => (
          <section key={section.id} data-testid={`brand-section-${section.id}`}>
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#E7E3D8]">
              <div>
                <div className="eyebrow-accent mb-2">{section.id.toUpperCase()}</div>
                <h2 className="font-display text-[32px] md:text-[40px] font-[500] leading-none text-[#0B1B2B]">
                  {section.title}
                </h2>
                <p className="mt-2 text-[14px] text-[#4E5C6E] max-w-xl">{section.subtitle}</p>
              </div>
              <div className="text-[11px] text-[#8190A1] tracking-wider uppercase hidden md:block">
                {section.items.length} asset{section.items.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className={`grid gap-6 ${section.items.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2"} ${section.items.length >= 3 ? "lg:grid-cols-3" : ""}`}>
              {section.items.map((item) => (
                <AssetCard key={item.slug} {...item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Editorial wordmark banner */}
      <section className="relative overflow-hidden bg-[#0B1B2B] text-white" data-testid="brand-kit-wordmark-banner">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(184,134,76,0.35) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(212,169,113,0.25) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B8864C]" />
            <span className="text-[11px] tracking-[0.28em] uppercase text-[#D4A971] font-medium">
              THE OFFICIAL BRAND SYSTEM · V1.0
            </span>
          </div>
          <h2 className="font-display font-[500] leading-[0.92] tracking-[-0.03em] text-[clamp(4rem,14vw,11rem)]">
            Brivo<span className="text-[#B8864C]">.</span>
          </h2>
          <p
            className="mt-4 font-display italic text-[clamp(1.4rem,2.6vw,2.2rem)] text-[#F5D7A4] font-[400]"
            style={{ fontStyle: "italic" }}
          >
            A brand built to move markets.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { n: "17", l: "Press kit pages" },
              { n: "+412%", l: "Top client lift" },
              { n: "< 48h", l: "Kit turnaround" },
              { n: "100%", l: "Every asset · every URL" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-[34px] md:text-[42px] font-[500] text-white leading-none">
                  {s.n}
                </div>
                <div className="mt-1.5 text-[11px] tracking-[0.16em] uppercase text-[#D4A971]/80">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#0B1B2B] text-white py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-10 items-center">
          <div className="md:col-span-2">
            <div className="eyebrow text-[#D4A971] mb-3" style={{ color: "#D4A971" }}>NEED A CUSTOM ASSET?</div>
            <h3 className="font-display text-[30px] md:text-[38px] font-[500] leading-tight">
              Want a campaign-specific cover, ad creative,<br />
              or a bespoke brand extension?
            </h3>
          </div>
          <div className="flex md:justify-end">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#B8864C] hover:bg-[#C99661] text-white px-7 py-3.5 rounded-full text-[14px] font-medium transition-colors"
              data-testid="brand-kit-cta"
            >
              Talk to our studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
