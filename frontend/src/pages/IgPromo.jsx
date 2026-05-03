import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Download,
  Copy,
  Check,
  Circle,
  Camera,
  Loader2,
} from "lucide-react";

/**
 * Brivo · Reel Generator (canvas-rendered)
 * -----------------------------------------------------------
 * The whole 15-second reel is painted to a single 1080×1920
 * canvas. We use canvas.captureStream() + MediaRecorder to
 * export ONLY the canvas — no screen-share, no surrounding UI,
 * just the isolated reel as a downloadable video file.
 *
 * Tries .mp4 first (Safari + newer Chrome), falls back to .webm.
 */

const W = 1080;
const H = 1920;
const LOOP = 15;
const RECORD_LEN_MS = 15500;

const REEL_CAPTION = `We don't build websites. We build receipts. 🧾

140+ sites shipped · 8-week build · zero revision rounds.

Your website isn't a brochure — it's your best salesperson, working 24/7.

If it's not closing deals while you sleep, it's a liability.

DM "RECEIPTS" and we'll send a 2-minute teardown of your current site. Free. No call.

🦉 Brivo · Web + Growth
brivomarketing.com`;

const REEL_HASHTAGS =
  "#webdesignagency #websitedesign #webdesigner #webdevelopment #brandingagency #creativeagency #editorialdesign #uidesign #uxdesign #figma #nextjs #reactjs #digitalagency #marketingagency #growthmarketing #foundercommunity #premiumbranding #designstudio #conversionoptimization #websiteredesign #melbournebusiness #madeinmelbourne #brivomarketing";

const ASSETS = {
  owl: "/owl-logo.jpg",
  slides: [
    { src: "/portfolio/koa-mobile.jpg",         label: "OUTDOOR HOSPITALITY" },
    { src: "/portfolio/keepercache-mobile.jpg", label: "SPORTS MANAGEMENT OS" },
    { src: "/portfolio/instalease-mobile.jpg",  label: "COMMERCIAL LEASING" },
    { src: "/portfolio/sportbotai-mobile.jpg",  label: "AI SPORTS PLATFORM" },
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Standard fade-in/hold/fade-out window. Returns alpha 0..1. */
function window01(t, start, end, fadeIn = 0.25, fadeOut = 0.25) {
  if (t < start || t > end) return 0;
  const local = t - start;
  const len = end - start;
  if (local < fadeIn) return easeOut(local / fadeIn);
  if (local > len - fadeOut) return easeOut((len - local) / fadeOut);
  return 1;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Pick the best supported MediaRecorder mime + file extension. */
function pickMime() {
  const candidates = [
    { mime: "video/mp4;codecs=avc1.42E01E",  ext: "mp4"  },
    { mime: "video/mp4",                      ext: "mp4"  },
    { mime: "video/webm;codecs=vp9",          ext: "webm" },
    { mime: "video/webm;codecs=vp8",          ext: "webm" },
    { mime: "video/webm",                     ext: "webm" },
  ];
  for (const c of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(c.mime)) {
      return c;
    }
  }
  return { mime: "", ext: "webm" };
}

/* ------------------------------------------------------------------ */
/* The single render function — paints frame at time `t` (seconds)     */
/* ------------------------------------------------------------------ */

function paint(ctx, t, assets) {
  // Clear
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Ambient lime glow (animated breathe)
  const breathe = 0.85 + 0.15 * Math.sin((t / LOOP) * Math.PI * 2);
  const grad1 = ctx.createRadialGradient(
    W * 0.3,
    H * 0.2,
    0,
    W * 0.3,
    H * 0.2,
    W * 0.85
  );
  grad1.addColorStop(0, `rgba(204,255,0,${0.22 * breathe})`);
  grad1.addColorStop(0.6, "rgba(204,255,0,0)");
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, W, H);

  const grad2 = ctx.createRadialGradient(
    W * 0.7,
    H * 0.85,
    0,
    W * 0.7,
    H * 0.85,
    W * 0.85
  );
  grad2.addColorStop(0, `rgba(122,140,0,${0.28 * breathe})`);
  grad2.addColorStop(0.6, "rgba(0,0,0,0)");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, W, H);

  /* ---------- SCENE 1 — OWL INTRO  (0.0 → 2.1s)  --------------- */
  {
    const a = window01(t, 0.0, 2.1, 0.45, 0.3);
    if (a > 0 && assets.owl) {
      ctx.save();
      ctx.globalAlpha = a;
      const cx = W / 2;
      const cy = H * 0.42;
      // Glow halo
      const halo = ctx.createRadialGradient(cx, cy, 60, cx, cy, 360);
      halo.addColorStop(0, "rgba(204,255,0,0.55)");
      halo.addColorStop(1, "rgba(204,255,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(cx - 380, cy - 380, 760, 760);

      // Owl avatar (clipped circle)
      const r = 180;
      const intro = clamp01((t - 0) / 0.6);
      const scale = 0.7 + 0.3 * easeOut(intro);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(assets.owl, -r, -r, r * 2, r * 2);
      ctx.restore();

      // Lime ring
      ctx.strokeStyle = "#CCFF00";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale + 6, 0, Math.PI * 2);
      ctx.stroke();

      // BRIVO wordmark
      ctx.fillStyle = "#fff";
      ctx.font = "700 130px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.letterSpacing = "20px";
      ctx.fillText("BRIVO", cx, cy + 320);

      // Subkicker
      ctx.fillStyle = "#CCFF00";
      ctx.font = "600 32px 'Inter', system-ui, sans-serif";
      ctx.fillText("WEB · DESIGN · GROWTH", cx, cy + 380);

      ctx.restore();
    }
  }

  /* ---------- SCENE 2 — "We don't build websites."  (2.1 → 4.0s) */
  {
    const a = window01(t, 2.1, 4.0, 0.3, 0.3);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff";
      ctx.font = "700 150px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = W / 2;
      ctx.fillText("We don't build", cx, H * 0.46);
      ctx.fillText("websites.", cx, H * 0.56);
      ctx.restore();
    }
  }

  /* ---------- SCENE 3 — "We build receipts."  (4.0 → 5.2s) ----- */
  {
    const a = window01(t, 4.0, 5.2, 0.2, 0.25);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = "700 150px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = W / 2;
      ctx.fillStyle = "#fff";
      ctx.fillText("We build", cx, H * 0.46);
      ctx.fillStyle = "#CCFF00";
      ctx.fillText("receipts.", cx, H * 0.56);

      // Underline draw
      const local = clamp01((t - 4.2) / 0.5);
      const drawW = 540 * easeInOut(local);
      ctx.fillStyle = "#CCFF00";
      ctx.fillRect(cx - drawW / 2, H * 0.56 + 80, drawW, 10);

      ctx.restore();
    }
  }

  /* ---------- SCENE 4 — PORTFOLIO CAROUSEL  (5.2 → 9.4s) ------- */
  {
    const slides = assets.slides || [];
    const startBase = 5.2;
    const slideLen = 1.05; // each ~1.05s
    slides.forEach((s, idx) => {
      if (!s.img) return;
      const start = startBase + idx * slideLen;
      const end = start + slideLen;
      const a = window01(t, start, end, 0.18, 0.18);
      if (a <= 0) return;

      ctx.save();
      ctx.globalAlpha = a;

      // Phone device frame inside the 9:16 canvas
      const margin = 110;
      const labelGap = 110;
      const fw = W - margin * 2;          // device width
      const fh = Math.min(H - 380, fw * (19.5 / 9)); // device height
      const fx = (W - fw) / 2;
      const fy = (H - fh) / 2 - 30;

      // Outer glow
      ctx.shadowColor = "rgba(204,255,0,0.35)";
      ctx.shadowBlur = 80;
      ctx.shadowOffsetY = 30;
      roundRect(ctx, fx, fy, fw, fh, 70);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Image clipped to rounded rect
      ctx.save();
      roundRect(ctx, fx + 10, fy + 10, fw - 20, fh - 20, 60);
      ctx.clip();
      // object-fit: cover, anchored top
      const imgRatio = s.img.width / s.img.height;
      const frameRatio = (fw - 20) / (fh - 20);
      let dw, dh, dx, dy;
      if (imgRatio > frameRatio) {
        // image wider — fit by height
        dh = fh - 20;
        dw = dh * imgRatio;
        dx = fx + 10 - (dw - (fw - 20)) / 2;
        dy = fy + 10;
      } else {
        // image taller — fit by width, anchor top
        dw = fw - 20;
        dh = dw / imgRatio;
        dx = fx + 10;
        dy = fy + 10;
      }
      ctx.drawImage(s.img, dx, dy, dw, dh);
      ctx.restore();

      // Lime border
      ctx.strokeStyle = "rgba(204,255,0,0.45)";
      ctx.lineWidth = 4;
      roundRect(ctx, fx, fy, fw, fh, 70);
      ctx.stroke();

      // Notch
      ctx.fillStyle = "#000";
      roundRect(ctx, W / 2 - 90, fy + 22, 180, 38, 19);
      ctx.fill();

      // Industry label pill (below device)
      const labelY = fy + fh + 60;
      ctx.font = "700 36px 'Inter', system-ui, sans-serif";
      const labelW = ctx.measureText(s.label).width + 80;
      const labelX = (W - labelW) / 2;
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      roundRect(ctx, labelX, labelY, labelW, 80, 40);
      ctx.fill();
      ctx.strokeStyle = "rgba(204,255,0,0.55)";
      ctx.lineWidth = 3;
      roundRect(ctx, labelX, labelY, labelW, 80, 40);
      ctx.stroke();
      ctx.fillStyle = "#CCFF00";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.label, W / 2, labelY + 42);

      ctx.restore();
    });
  }

  /* ---------- SCENE 5 — STATS  (9.4 → 11.2s) ------------------- */
  {
    const stats = [
      { num: "140+", label: "SITES SHIPPED" },
      { num: "8wk",  label: "DESIGN → LAUNCH" },
      { num: "0",    label: "REVISION ROUNDS" },
    ];
    const sceneStart = 9.4;
    const sceneEnd = 11.2;
    const masterA = window01(t, sceneStart, sceneEnd, 0.2, 0.25);
    if (masterA > 0) {
      stats.forEach((s, i) => {
        const enterAt = sceneStart + 0.12 * i;
        const local = clamp01((t - enterAt) / 0.45);
        const a = clamp01(local) * masterA;
        const ty = (1 - easeOut(local)) * 60;
        ctx.save();
        ctx.globalAlpha = a;
        const pillW = 760;
        const pillH = 200;
        const pillX = (W - pillW) / 2;
        const pillY = H * 0.34 + i * 240 - ty;

        // pill bg
        ctx.fillStyle = "rgba(204,255,0,0.06)";
        roundRect(ctx, pillX, pillY, pillW, pillH, 100);
        ctx.fill();
        ctx.strokeStyle = "rgba(204,255,0,0.45)";
        ctx.lineWidth = 4;
        roundRect(ctx, pillX, pillY, pillW, pillH, 100);
        ctx.stroke();

        // number
        ctx.fillStyle = "#CCFF00";
        ctx.font = "700 110px 'Inter', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(s.num, W / 2, pillY + 120);

        // label
        ctx.fillStyle = "#fff";
        ctx.font = "600 30px 'Inter', system-ui, sans-serif";
        ctx.fillText(s.label, W / 2, pillY + 170);

        ctx.restore();
      });
    }
  }

  /* ---------- SCENE 6 — MANIFESTO  (11.2 → 13.0s) -------------- */
  {
    const a = window01(t, 11.2, 13.0, 0.3, 0.3);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Line 1: "Your site is a [closer]."
      const cx = W / 2;
      ctx.font = "700 110px 'Inter', system-ui, sans-serif";
      // measure parts so we can colour "closer"
      const left  = "Your site is a ";
      const lime  = "closer";
      const dot   = ".";
      const wL = ctx.measureText(left).width;
      const wM = ctx.measureText(lime).width;
      const wR = ctx.measureText(dot).width;
      const total = wL + wM + wR;
      let xCursor = cx - total / 2;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.fillText(left, xCursor, H * 0.46);
      xCursor += wL;
      ctx.fillStyle = "#CCFF00";
      ctx.fillText(lime, xCursor, H * 0.46);
      xCursor += wM;
      ctx.fillStyle = "#fff";
      ctx.fillText(dot, xCursor, H * 0.46);

      // Line 2: "Not a brochure."
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.textAlign = "center";
      ctx.fillText("Not a brochure.", cx, H * 0.56);

      ctx.restore();
    }
  }

  /* ---------- SCENE 7 — CTA  (13.0 → 15.0s) -------------------- */
  {
    const a = window01(t, 13.0, 15.0, 0.25, 0.2);
    if (a > 0) {
      ctx.save();
      ctx.globalAlpha = a;
      const cx = W / 2;

      // Owl small
      if (assets.owl) {
        const r = 90;
        const cy = H * 0.36;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(assets.owl, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.strokeStyle = "#CCFF00";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // brivomarketing.com
      ctx.fillStyle = "#fff";
      ctx.font = "700 80px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("brivomarketing.com", cx, H * 0.5);

      // Pulse CTA pill
      const pulse = 1 + 0.04 * Math.sin((t - 13) * Math.PI * 2 * 1.2);
      const ctaW = 820 * pulse;
      const ctaH = 130;
      const ctaX = (W - ctaW) / 2;
      const ctaY = H * 0.58;

      // glow halo behind pill
      const ringHalo = ctx.createRadialGradient(
        cx, ctaY + ctaH / 2, 80,
        cx, ctaY + ctaH / 2, 360
      );
      ringHalo.addColorStop(0, "rgba(204,255,0,0.45)");
      ringHalo.addColorStop(1, "rgba(204,255,0,0)");
      ctx.fillStyle = ringHalo;
      ctx.fillRect(cx - 400, ctaY - 100, 800, ctaH + 200);

      ctx.fillStyle = "#CCFF00";
      roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 70);
      ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.font = "700 38px 'Inter', system-ui, sans-serif";
      ctx.fillText("DM \"RECEIPTS\" · FREE TEARDOWN", cx, ctaY + ctaH / 2);

      // sub
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "600 30px 'Inter', system-ui, sans-serif";
      ctx.fillText("2 BUILD SLOTS LEFT · JULY", cx, H * 0.72);

      ctx.restore();
    }
  }

  /* ---------- PROGRESS BAR (always on) ------------------------- */
  {
    const margin = 40;
    const barY = H - 50;
    const barW = W - margin * 2;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, margin, barY, barW, 8, 4);
    ctx.fill();
    ctx.fillStyle = "#CCFF00";
    roundRect(ctx, margin, barY, barW * (t / LOOP), 8, 4);
    ctx.fill();
  }
}

/* ================================================================== */
/* The page                                                            */
/* ================================================================== */

function CopyChip({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
        copied
          ? "border-[#CCFF00] bg-[#CCFF00] text-black"
          : "border-white/20 text-white/70 hover:border-[#CCFF00] hover:text-[#CCFF00]"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export default function IgPromo() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const startTsRef = useRef(0);
  const assetsRef = useRef({ owl: null, slides: ASSETS.slides.map((s) => ({ ...s, img: null })) });

  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [exportFormat, setExportFormat] = useState("");

  /* Preload images ------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const owlImg = await loadImage(ASSETS.owl);
      const slideImgs = await Promise.all(
        ASSETS.slides.map((s) => loadImage(s.src))
      );
      if (cancelled) return;
      assetsRef.current.owl = owlImg;
      assetsRef.current.slides = ASSETS.slides.map((s, i) => ({
        ...s,
        img: slideImgs[i],
      }));
      setReady(true);
      // Detect best format for the export label
      const m = pickMime();
      setExportFormat(m.ext.toUpperCase());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Render loop --------------------------------------------------- */
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    if (!startTsRef.current) startTsRef.current = now;
    const elapsed = (now - startTsRef.current) / 1000;
    const t = elapsed % LOOP;

    paint(ctx, t, assetsRef.current);
    rafRef.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    if (!ready) return;
    startTsRef.current = 0;
    rafRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, renderLoop]);

  const restart = () => {
    startTsRef.current = 0;
    setStatus("");
  };

  /* One-click download (canvas → MediaRecorder → blob) ------------ */
  const downloadVideo = async () => {
    if (recording || !ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { mime, ext } = pickMime();
    if (!window.MediaRecorder) {
      setStatus("Your browser doesn't support video export. Try Chrome.");
      return;
    }

    setRecording(true);
    setStatus("Rendering 15-second reel…");
    // Restart the loop so capture begins on frame 0
    startTsRef.current = 0;

    try {
      const stream = canvas.captureStream(60);
      const recOpts = mime ? { mimeType: mime, videoBitsPerSecond: 10_000_000 } : { videoBitsPerSecond: 10_000_000 };
      const rec = new MediaRecorder(stream, recOpts);
      const chunks = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: mime || "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `brivo-reel-15s.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setRecording(false);
        const sizeMb = (blob.size / 1024 / 1024).toFixed(2);
        setStatus(
          ext === "mp4"
            ? `✅ Saved brivo-reel-15s.mp4 (${sizeMb} MB) — Instagram-ready, upload directly.`
            : `✅ Saved brivo-reel-15s.webm (${sizeMb} MB) — convert to .mp4 at cloudconvert.com/webm-to-mp4 before uploading.`
        );
      };

      rec.start();
      // Stop after one full loop + small buffer
      setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
      }, RECORD_LEN_MS);
    } catch (err) {
      setRecording(false);
      setStatus(`Couldn't render the video: ${err?.message || err}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 md:px-10">
          <Link
            to="/instagram-kit"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60 hover:text-[#CCFF00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to launch kit
          </Link>
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
            Brivo · Reel · 15s · 9:16
          </div>
          <button
            onClick={downloadVideo}
            disabled={recording || !ready}
            data-testid="download-video"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              recording || !ready
                ? "cursor-not-allowed border border-white/15 bg-white/5 text-white/40"
                : "border border-[#CCFF00] bg-[#CCFF00] text-black hover:bg-[#d6ff33]"
            }`}
          >
            {recording ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Rendering…
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download .{exportFormat || "WEBM"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 md:grid-cols-[1fr,1.1fr] md:px-10 md:py-16">
        {/* LEFT — controls + caption */}
        <div className="space-y-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.35em] text-[#CCFF00]/80">
              Your reel · ready to post
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.05] md:text-5xl">
              A 15-second Brivo reel.{" "}
              <span className="text-[#CCFF00]">Zero filming.</span>
            </h1>
            <p className="mt-4 max-w-xl text-white/65 md:text-base">
              Click <em>Download</em>. Wait 15 seconds. The reel renders to a
              1080×1920 video file — only the reel, nothing else. Upload it
              straight to Instagram.
            </p>
          </div>

          {/* Controls */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                Controls
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
                {ready ? (
                  <>
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
                    Ready · 1080×1920 · {exportFormat || "WEBM"}
                  </>
                ) : (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading assets…
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={restart}
                disabled={!ready}
                data-testid="restart-reel"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[12px] font-medium text-white/80 transition hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart preview
              </button>
              <button
                onClick={downloadVideo}
                disabled={recording || !ready}
                data-testid="download-video-2"
                className="inline-flex items-center gap-2 rounded-full border border-[#CCFF00] bg-[#CCFF00] px-4 py-2 text-[12px] font-semibold text-black transition hover:bg-[#d6ff33] disabled:opacity-50"
              >
                {recording ? (
                  <>
                    <Circle className="h-3 w-3 animate-pulse fill-red-500 text-red-500" />
                    Rendering 15s…
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Download video
                  </>
                )}
              </button>
            </div>
            {status ? (
              <div
                data-testid="render-status"
                className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/75"
              >
                {status}
              </div>
            ) : null}
          </div>

          {/* How to post */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#CCFF00]">
              Upload to Instagram
            </div>
            <ol className="space-y-3 text-sm text-white/80">
              <li>
                <strong className="text-white">1 · Download.</strong> Click the
                green button — the file lands in your Downloads folder in ~16 s.
              </li>
              <li>
                <strong className="text-white">2 · Upload.</strong>
                {exportFormat === "MP4" ? (
                  <> Drop the .mp4 straight into Instagram → Reels.</>
                ) : (
                  <>
                    {" "}
                    The file is .webm. Drag into{" "}
                    <a
                      href="https://cloudconvert.com/webm-to-mp4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-[#CCFF00]/60 underline-offset-2 hover:text-[#CCFF00]"
                    >
                      cloudconvert.com/webm-to-mp4
                    </a>{" "}
                    (10 s, free) → upload the .mp4.
                  </>
                )}
              </li>
              <li>
                <strong className="text-white">3 · Caption + tags.</strong>{" "}
                Copy the caption + hashtags below. Hit share.
              </li>
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#CCFF00]/30 bg-[#CCFF00]/[0.06] p-3 text-xs text-white/75">
              <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#CCFF00]" />
              <span>
                <strong className="text-[#CCFF00]">Note:</strong> the file is
                exactly 1080 × 1920 — Instagram's native Reels resolution. No
                cropping, no quality loss on upload.
              </span>
            </div>
          </div>

          {/* Caption */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                Caption
              </div>
              <CopyChip value={REEL_CAPTION} label="Copy caption" />
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
              {REEL_CAPTION}
            </pre>
          </div>

          {/* Hashtags */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                Hashtags (post as first comment)
              </div>
              <CopyChip value={REEL_HASHTAGS} label="Copy tags" />
            </div>
            <p className="text-sm leading-relaxed text-[#CCFF00]/90">
              {REEL_HASHTAGS}
            </p>
          </div>
        </div>

        {/* RIGHT — phone mockup wrapping the live canvas */}
        <div className="flex items-start justify-center">
          <div className="relative">
            <div className="relative rounded-[48px] border-[10px] border-[#141414] bg-black shadow-[0_40px_80px_-20px_rgba(204,255,0,0.18)]">
              <div className="absolute left-1/2 top-2 z-30 h-4 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="overflow-hidden rounded-[38px]">
                <canvas
                  ref={canvasRef}
                  width={W}
                  height={H}
                  data-testid="reel-canvas"
                  style={{ width: 360, height: 640, display: "block" }}
                />
              </div>
            </div>
            <div className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-white/40">
              Live preview · loops every 15 s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
