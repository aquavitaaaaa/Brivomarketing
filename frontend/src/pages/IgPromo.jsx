import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Circle,
  Camera,
} from "lucide-react";

/**
 * Instagram Reel-format animated promo (9:16)
 * ------------------------------------------------
 * A 15-second looping editorial promo rendered entirely with CSS keyframes.
 * No video files, no AI dependencies — just brand assets + real portfolio
 * screenshots already on disk.
 *
 * The user can:
 *   - Watch the animation preview inside a phone mockup.
 *   - Restart it to prep for a recording.
 *   - One-click capture the page with getDisplayMedia + MediaRecorder
 *     -> downloads a .webm (drag into any free online webm→mp4 tool,
 *      or use ffmpeg/cloudconvert for the final upload file).
 *   - Or screen-record on iPhone / QuickTime / OBS for maximum quality.
 */

const REEL_CAPTION = `We don't build websites. We build receipts. 🧾

140+ sites shipped · 8-week build · zero revision rounds.

Your website isn't a brochure — it's your best salesperson, working 24/7.

If it's not closing deals while you sleep, it's a liability.

DM "RECEIPTS" and we'll send a 2-minute teardown of your current site. Free. No call.

🦉 Brivo · Web + Growth
brivomarketing.com`;

const REEL_HASHTAGS =
  "#webdesignagency #websitedesign #webdesigner #webdevelopment #brandingagency #creativeagency #editorialdesign #uidesign #uxdesign #figma #nextjs #reactjs #digitalagency #marketingagency #growthmarketing #foundercommunity #premiumbranding #designstudio #conversionoptimization #websiteredesign #melbournebusiness #madeinmelbourne #brivomarketing";

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
  const [runKey, setRunKey] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordStatus, setRecordStatus] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  const restart = () => {
    setRunKey((k) => k + 1);
    setRecordStatus("");
  };

  const startCapture = async () => {
    if (recording) return;
    setRecordStatus("Select the Brivo promo tab when asked…");
    try {
      // ask the user for their screen / tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60 } },
        audio: false,
        // Chrome-only hint: start with this tab highlighted
        // eslint-disable-next-line
        preferCurrentTab: true,
      });

      const mime =
        MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm;codecs=vp8";

      const rec = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 8_000_000,
      });
      recRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "brivo-reel-15s.webm";
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setRecordStatus("Downloaded brivo-reel-15s.webm — convert → .mp4 → upload.");
      };

      // if the user stops sharing from the browser UI, finalise nicely
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (rec.state !== "inactive") rec.stop();
      });

      rec.start();
      setRecording(true);
      setRecordStatus("Recording 15s…");
      // restart the animation so recording begins on frame 0
      setRunKey((k) => k + 1);

      // auto-stop after 15.5s (one full loop + buffer)
      setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
      }, 15500);
    } catch (err) {
      setRecording(false);
      setRecordStatus(
        err?.name === "NotAllowedError"
          ? "Capture cancelled. No file downloaded."
          : "Your browser blocked tab capture. Try Chrome or Edge."
      );
    }
  };

  // Preload portfolio images so the animation doesn't stall
  useEffect(() => {
    [
      "/portfolio/koa-desktop.jpg",
      "/portfolio/keepercache-desktop.jpg",
      "/portfolio/instalease-desktop.jpg",
      "/portfolio/sportbotai-desktop.jpg",
      "/owl-logo.jpg",
    ].forEach((src) => {
      const i = new Image();
      i.src = src;
    });
  }, []);

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
            onClick={startCapture}
            disabled={recording}
            data-testid="capture-reel"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              recording
                ? "cursor-not-allowed border border-white/15 bg-white/5 text-white/50"
                : "border border-[#CCFF00] bg-[#CCFF00] text-black hover:bg-[#d6ff33]"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            {recording ? "Recording…" : "Capture & Download"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 md:grid-cols-[1fr,1.1fr] md:px-10 md:py-16">
        {/* LEFT — controls & copy */}
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
              Press play. Record the tab. Upload to Instagram. The animation
              loops at 15.0s on the dot — Reels' sweet-spot for replays.
            </p>
          </div>

          {/* Controls */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-white/50">
              Controls
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={restart}
                data-testid="restart-reel"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[12px] font-medium text-white/80 transition hover:border-[#CCFF00] hover:text-[#CCFF00]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart animation
              </button>
              <button
                onClick={startCapture}
                disabled={recording}
                className="inline-flex items-center gap-2 rounded-full border border-[#CCFF00] bg-[#CCFF00] px-4 py-2 text-[12px] font-semibold text-black transition hover:bg-[#d6ff33] disabled:opacity-50"
              >
                {recording ? (
                  <>
                    <Circle className="h-3 w-3 animate-pulse fill-red-500 text-red-500" />
                    Recording…
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Capture & download
                  </>
                )}
              </button>
            </div>
            {recordStatus ? (
              <div className="mt-4 text-xs text-white/60" data-testid="record-status">
                {recordStatus}
              </div>
            ) : null}
          </div>

          {/* How to post */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#CCFF00]">
              How to get this into Instagram
            </div>
            <ol className="space-y-3 text-sm text-white/80">
              <li>
                <strong className="text-white">1 · Capture.</strong> Click{" "}
                <em>Capture &amp; download</em> and share this tab. Recording auto-stops at 15.5 s.
              </li>
              <li>
                <strong className="text-white">2 · Convert to .mp4.</strong> Drag
                the .webm into{" "}
                <a
                  href="https://cloudconvert.com/webm-to-mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[#CCFF00]/60 underline-offset-2 hover:text-[#CCFF00]"
                >
                  cloudconvert.com/webm-to-mp4
                </a>
                . Takes 10 seconds. Free.
              </li>
              <li>
                <strong className="text-white">3 · Upload to Reels.</strong>{" "}
                Paste the caption + hashtags below. Hit share.
              </li>
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#CCFF00]/30 bg-[#CCFF00]/[0.06] p-3 text-xs text-white/75">
              <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#CCFF00]" />
              <span>
                <strong className="text-[#CCFF00]">Higher-quality alt:</strong> use
                iPhone Control Center → Screen Record (or QuickTime on Mac) pointed
                at this tab. Records in native 1080 × 1920 and outputs .mov directly.
              </span>
            </div>
          </div>

          {/* Caption + hashtags */}
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

        {/* RIGHT — phone mockup with the animation */}
        <div className="flex items-start justify-center">
          <div className="relative">
            {/* Phone bezel */}
            <div className="relative rounded-[48px] border-[10px] border-[#141414] bg-black shadow-[0_40px_80px_-20px_rgba(204,255,0,0.12)]">
              <div className="absolute left-1/2 top-2 z-30 h-4 w-24 -translate-x-1/2 rounded-full bg-black" />
              {/* 9:16 stage */}
              <div
                key={runKey}
                data-testid="reel-stage"
                className="reel-stage relative overflow-hidden rounded-[38px] bg-black"
                style={{ width: 360, height: 640 }}
              >
                {/* Ambient lime radial glow */}
                <div className="reel-glow" />

                {/* Noise overlay */}
                <div className="reel-noise" />

                {/* SCENE 1 — owl intro */}
                <div className="scene scene-1">
                  <img
                    src="/owl-logo.jpg"
                    alt="Brivo"
                    className="reel-owl"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="reel-kicker">BRIVO</div>
                  <div className="reel-subkicker">WEB · DESIGN · GROWTH</div>
                </div>

                {/* SCENE 2 — "We don't build websites." */}
                <div className="scene scene-2">
                  <div className="reel-line">We don't build</div>
                  <div className="reel-line">websites.</div>
                </div>

                {/* SCENE 3 — "We build receipts." */}
                <div className="scene scene-3">
                  <div className="reel-line">We build</div>
                  <div className="reel-line reel-lime">
                    receipts.
                    <span className="reel-underline" />
                  </div>
                </div>

                {/* SCENE 4 — portfolio carousel */}
                <div className="scene scene-4">
                  <div className="reel-card reel-card-1">
                    <img src="/portfolio/koa-desktop.jpg" alt="" />
                    <div className="reel-card-label">Outdoor hospitality</div>
                  </div>
                  <div className="reel-card reel-card-2">
                    <img src="/portfolio/keepercache-desktop.jpg" alt="" />
                    <div className="reel-card-label">Sports management OS</div>
                  </div>
                  <div className="reel-card reel-card-3">
                    <img src="/portfolio/instalease-desktop.jpg" alt="" />
                    <div className="reel-card-label">Commercial leasing</div>
                  </div>
                  <div className="reel-card reel-card-4">
                    <img src="/portfolio/sportbotai-desktop.jpg" alt="" />
                    <div className="reel-card-label">AI sports platform</div>
                  </div>
                </div>

                {/* SCENE 5 — stat cards */}
                <div className="scene scene-5">
                  <div className="reel-stat reel-stat-1">
                    <div className="reel-stat-num">140+</div>
                    <div className="reel-stat-lbl">sites shipped</div>
                  </div>
                  <div className="reel-stat reel-stat-2">
                    <div className="reel-stat-num">8wk</div>
                    <div className="reel-stat-lbl">design → launch</div>
                  </div>
                  <div className="reel-stat reel-stat-3">
                    <div className="reel-stat-num">0</div>
                    <div className="reel-stat-lbl">revision rounds</div>
                  </div>
                </div>

                {/* SCENE 6 — manifesto */}
                <div className="scene scene-6">
                  <div className="reel-line reel-manifesto">
                    Your site is a <em className="reel-lime not-italic">closer</em>.
                  </div>
                  <div className="reel-line reel-manifesto reel-muted">
                    Not a brochure.
                  </div>
                </div>

                {/* SCENE 7 — CTA */}
                <div className="scene scene-7">
                  <div className="reel-cta-owl-wrap">
                    <img
                      src="/owl-logo.jpg"
                      alt=""
                      className="reel-cta-owl"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="reel-cta-title">brivomarketing.com</div>
                  <div className="reel-cta-btn">DM "RECEIPTS" · free teardown</div>
                  <div className="reel-cta-sub">2 build slots left · July</div>
                </div>

                {/* Progress bar */}
                <div className="reel-progress">
                  <div className="reel-progress-fill" />
                </div>
              </div>
            </div>

            {/* Timecodes (dev aid) */}
            <div className="mt-4 grid grid-cols-7 gap-1 text-[9px] uppercase tracking-[0.2em] text-white/30">
              {["0s", "2s", "4s", "5s", "9s", "11s", "13s"].map((t) => (
                <div key={t} className="text-center">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CSS ANIMATION — all keyframes inline so the page is self-contained   */}
      {/* ------------------------------------------------------------------ */}
      <style>{`
        .reel-stage {
          font-family: "Inter", "SF Pro Text", system-ui, sans-serif;
          color: #fff;
          isolation: isolate;
        }

        /* Ambient glow — always on, pulsing subtly */
        .reel-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(60% 50% at 30% 20%, rgba(204,255,0,0.18), transparent 70%),
            radial-gradient(40% 40% at 70% 85%, rgba(122,140,0,0.22), transparent 70%);
          animation: reelGlow 15s linear infinite;
          z-index: 0;
        }
        @keyframes reelGlow {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        /* Film grain */
        .reel-noise {
          position: absolute; inset: 0;
          background-image:
            repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px),
            repeating-radial-gradient(circle at 70% 80%, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px);
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 50;
          animation: reelNoise 0.25s steps(4) infinite;
        }
        @keyframes reelNoise {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-1px, 1px); }
          50%  { transform: translate(1px, -1px); }
          75%  { transform: translate(-1px, -1px); }
          100% { transform: translate(0, 0); }
        }

        /* Every scene is absolutely positioned, fades in/out on a 15s master timeline */
        .scene {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          opacity: 0;
          z-index: 5;
          animation-duration: 15s;
          animation-iteration-count: infinite;
          animation-timing-function: ease;
        }

        /* --- SCENE 1  (0-2s) -------------------------------------------- */
        .scene-1 { animation-name: s1; }
        @keyframes s1 {
          0%   { opacity: 0; transform: scale(0.9); }
          3%   { opacity: 1; transform: scale(1);   }
          12%  { opacity: 1; transform: scale(1);   }
          14%  { opacity: 0; transform: scale(1.05);}
          100% { opacity: 0; }
        }
        .reel-owl {
          width: 120px; height: 120px; border-radius: 999px;
          border: 3px solid #CCFF00;
          box-shadow: 0 0 60px rgba(204,255,0,0.55);
          animation: owlSpin 15s linear infinite;
        }
        @keyframes owlSpin {
          0%  { transform: rotate(-12deg) scale(0.6); filter: blur(8px); opacity: 0; }
          4%  { transform: rotate(0) scale(1);          filter: blur(0);  opacity: 1; }
          13% { transform: rotate(0) scale(1); }
          14% { transform: rotate(0) scale(1.4); filter: blur(6px); opacity: 0; }
          100%{ opacity: 0; }
        }
        .reel-kicker {
          margin-top: 24px;
          font-size: 34px; font-weight: 700; letter-spacing: 0.32em;
          color: #fff;
        }
        .reel-subkicker {
          margin-top: 8px;
          font-size: 10px; letter-spacing: 0.45em; color: #CCFF00;
        }

        /* --- SCENE 2  (2-4s) -------------------------------------------- */
        .scene-2 { animation-name: s2; text-align: center; }
        @keyframes s2 {
          0%, 13% { opacity: 0; }
          15%     { opacity: 1; transform: translateY(0); }
          25%     { opacity: 1; }
          27%     { opacity: 0; transform: translateY(-18px); }
          100%    { opacity: 0; }
        }

        /* --- SCENE 3  (4-5s) --------------------------------------------- */
        .scene-3 { animation-name: s3; text-align: center; }
        @keyframes s3 {
          0%, 26% { opacity: 0; }
          28%     { opacity: 1; transform: translateY(0); }
          33%     { opacity: 1; }
          34%     { opacity: 0; transform: translateY(-18px); }
          100%    { opacity: 0; }
        }

        .reel-line {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.015em;
          color: #fff;
        }
        .reel-lime { color: #CCFF00; position: relative; display: inline-block; }
        .reel-underline {
          display: block;
          width: 0; height: 3px; background: #CCFF00;
          margin-top: 6px;
          animation: underlineDraw 15s ease infinite;
        }
        @keyframes underlineDraw {
          0%, 28%  { width: 0; }
          31%      { width: 100%; }
          33%      { width: 100%; }
          34%      { width: 0; }
          100%     { width: 0; }
        }

        /* --- SCENE 4  (5-9s) — portfolio carousel ----------------------- */
        .scene-4 { animation-name: s4; padding: 0; }
        @keyframes s4 {
          0%, 33% { opacity: 0; }
          34%     { opacity: 1; }
          59%     { opacity: 1; }
          61%     { opacity: 0; }
          100%    { opacity: 0; }
        }
        .reel-card {
          position: absolute;
          inset: 10% 8%;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(204,255,0,0.15);
          opacity: 0;
          transform: scale(1.1);
        }
        .reel-card img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .reel-card-label {
          position: absolute;
          left: 16px; bottom: 16px;
          padding: 8px 14px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(204,255,0,0.3);
          border-radius: 999px;
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #CCFF00; font-weight: 600;
        }
        .reel-card-1 { animation: card1 15s ease infinite; }
        .reel-card-2 { animation: card2 15s ease infinite; }
        .reel-card-3 { animation: card3 15s ease infinite; }
        .reel-card-4 { animation: card4 15s ease infinite; }
        @keyframes card1 {
          0%, 33% { opacity: 0; transform: scale(1.15); }
          35%     { opacity: 1; transform: scale(1); }
          40%     { opacity: 1; transform: scale(1.04); }
          42%     { opacity: 0; transform: scale(1.08); }
          100%    { opacity: 0; }
        }
        @keyframes card2 {
          0%, 41% { opacity: 0; transform: scale(1.15) translateX(40px); }
          43%     { opacity: 1; transform: scale(1) translateX(0); }
          48%     { opacity: 1; transform: scale(1.04) translateX(0); }
          50%     { opacity: 0; transform: scale(1.08) translateX(-40px); }
          100%    { opacity: 0; }
        }
        @keyframes card3 {
          0%, 49% { opacity: 0; transform: scale(1.15) translateX(40px); }
          51%     { opacity: 1; transform: scale(1) translateX(0); }
          56%     { opacity: 1; transform: scale(1.04) translateX(0); }
          58%     { opacity: 0; transform: scale(1.08) translateX(-40px); }
          100%    { opacity: 0; }
        }
        @keyframes card4 {
          0%, 57% { opacity: 0; transform: scale(1.15) translateX(40px); }
          59%     { opacity: 1; transform: scale(1) translateX(0); }
          63%     { opacity: 1; transform: scale(1.04) translateX(0); }
          65%     { opacity: 0; transform: scale(1.08) translateX(-40px); }
          100%    { opacity: 0; }
        }

        /* --- SCENE 5  (9-11s) — stats ----------------------------------- */
        .scene-5 { animation-name: s5; gap: 28px; }
        @keyframes s5 {
          0%, 58% { opacity: 0; }
          62%     { opacity: 1; }
          72%     { opacity: 1; }
          74%     { opacity: 0; }
          100%    { opacity: 0; }
        }
        .reel-stat {
          display: flex; flex-direction: column; align-items: center;
          padding: 14px 30px;
          border: 1px solid rgba(204,255,0,0.3);
          border-radius: 999px;
          background: rgba(204,255,0,0.04);
          opacity: 0;
          transform: translateY(30px);
        }
        .reel-stat-num { font-size: 42px; font-weight: 700; color: #CCFF00; letter-spacing: -0.02em; }
        .reel-stat-lbl { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #fff; opacity: 0.7; margin-top: 4px; }
        .reel-stat-1 { animation: stat1 15s ease infinite; }
        .reel-stat-2 { animation: stat2 15s ease infinite; }
        .reel-stat-3 { animation: stat3 15s ease infinite; }
        @keyframes stat1 {
          0%, 60% { opacity: 0; transform: translateY(30px); }
          63%     { opacity: 1; transform: translateY(0); }
          73%     { opacity: 1; }
          75%     { opacity: 0; transform: translateY(-20px); }
          100%    { opacity: 0; }
        }
        @keyframes stat2 {
          0%, 62% { opacity: 0; transform: translateY(30px); }
          65%     { opacity: 1; transform: translateY(0); }
          73%     { opacity: 1; }
          75%     { opacity: 0; transform: translateY(-20px); }
          100%    { opacity: 0; }
        }
        @keyframes stat3 {
          0%, 64% { opacity: 0; transform: translateY(30px); }
          67%     { opacity: 1; transform: translateY(0); }
          73%     { opacity: 1; }
          75%     { opacity: 0; transform: translateY(-20px); }
          100%    { opacity: 0; }
        }

        /* --- SCENE 6  (11-13s) — manifesto ------------------------------ */
        .scene-6 { animation-name: s6; text-align: center; }
        @keyframes s6 {
          0%, 73% { opacity: 0; }
          76%     { opacity: 1; transform: translateY(0); }
          85%     { opacity: 1; }
          87%     { opacity: 0; transform: translateY(-20px); }
          100%    { opacity: 0; }
        }
        .reel-manifesto { font-size: 34px; font-weight: 600; letter-spacing: -0.01em; }
        .reel-muted { opacity: 0.55; margin-top: 6px; }

        /* --- SCENE 7  (13-15s) — CTA ----------------------------------- */
        .scene-7 { animation-name: s7; gap: 14px; }
        @keyframes s7 {
          0%, 86% { opacity: 0; }
          89%     { opacity: 1; transform: scale(1); }
          98%     { opacity: 1; transform: scale(1); }
          100%    { opacity: 0; transform: scale(0.96); }
        }
        .reel-cta-owl-wrap {
          width: 72px; height: 72px; border-radius: 999px;
          border: 2px solid #CCFF00; padding: 3px;
          box-shadow: 0 0 40px rgba(204,255,0,0.5);
        }
        .reel-cta-owl { width: 100%; height: 100%; border-radius: 999px; object-fit: cover; }
        .reel-cta-title {
          font-size: 24px; font-weight: 700; letter-spacing: 0.02em; color: #fff;
          margin-top: 6px;
        }
        .reel-cta-btn {
          margin-top: 8px;
          padding: 12px 22px;
          background: #CCFF00;
          color: #0a0a0a;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          border-radius: 999px;
          animation: ctaPulse 1.2s ease-in-out infinite;
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(204,255,0,0.6); transform: scale(1); }
          50%      { box-shadow: 0 0 0 12px rgba(204,255,0,0); transform: scale(1.04); }
        }
        .reel-cta-sub { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #fff; opacity: 0.7; }

        /* Progress bar at the bottom */
        .reel-progress {
          position: absolute;
          left: 20px; right: 20px; bottom: 14px;
          height: 3px;
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
          overflow: hidden;
          z-index: 40;
        }
        .reel-progress-fill {
          width: 100%; height: 100%;
          background: #CCFF00;
          transform-origin: left;
          animation: progress 15s linear infinite;
        }
        @keyframes progress {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
