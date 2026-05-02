import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Check, Instagram, Twitter, Youtube, Linkedin, Facebook } from "lucide-react";

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
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] text-[#4E5C6E] hover:text-[#0B1B2B] transition-colors"
            data-testid="brand-kit-back"
          >
            <ArrowLeft size={14} /> Back to brivomarketing.com
          </Link>
          <div className="text-[11px] tracking-[0.22em] uppercase text-[#8190A1] font-medium">
            Brand Kit · v1.0
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12">
        <div className="eyebrow-accent mb-4">SOCIAL MEDIA BLITZ · DOWNLOAD PACK</div>
        <h1 className="font-display font-[400] leading-[1.02] tracking-[-0.02em] text-[clamp(2.4rem,6vw,4.6rem)]">
          The Brivo<br />
          <em style={{ fontStyle: "italic" }} className="text-[#B8864C] font-[500]">brand kit.</em>
        </h1>
        <p className="mt-6 max-w-2xl text-[#4E5C6E] text-[16px] md:text-[17px] leading-[1.65]">
          Logo lockups, avatars, covers, and post templates — pre-sized for every platform you'll ever need.
          Download the raw .jpgs or copy a direct link to drop straight into a scheduling tool.
        </p>

        {/* Palette + typography quick-reference */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
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
