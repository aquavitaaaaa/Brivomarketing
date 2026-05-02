"""Generate a 'shock & awe' BrivoMarketing social reel via Sora 2.

Vertical 9:16 (1024x1792) · 8 seconds · sora-2-pro for max polish.
Saves to /app/frontend/public/kit-assets/brivo-reel.mp4 so it can be
served at /kit-assets/brivo-reel.mp4.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(""))

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

load_dotenv("/app/backend/.env")

OUT = Path("/app/frontend/public/kit-assets/brivo-reel.mp4")
OUT.parent.mkdir(parents=True, exist_ok=True)

PROMPT = """Cinematic luxury product reel for "BrivoMarketing — A performance studio that builds custom websites that move markets."

Shot 1 (0-2s): Pitch black void. Tiny gold spark drifts in. Camera dollies forward as a glassy MacBook Pro materialises floating in a beam of warm gold light, a beautiful luxury e-commerce website softly glowing on its screen — deep navy UI, ivory typography, gold accents.

Shot 2 (2-4s): Whip pan to a floating iPhone 15 Pro showing a sleek SaaS dashboard with rising charts, gold KPI numbers ticking upward. Warm bokeh, silky depth of field, subtle gold dust particles.

Shot 3 (4-6s): Hard cut to a dark editorial scene: three luxury website mockups (a fine-dining site, a wellness app, a creative agency homepage) flying through space toward camera, parallax, motion blur. Stat overlays appear in giant ivory serif type one at a time: "+412% LEADS", "+318% REVENUE", "<48H".

Shot 4 (6-8s): Final reveal — full-bleed deep navy background, warm golden vignette. A circular gold-ringed owl crest emblem rotates into center frame with a soft lens flare, followed by an editorial serif wordmark that elegantly types in: "BrivoMarketing." with an italic gold line beneath: "A brand built to move markets."

Style: cinematic, premium, dark navy & gold palette (#0B1B2B + #B8864C + #F5D7A4 + ivory). Slow-motion, high-end advertising aesthetic, Apple keynote energy crossed with a luxury fashion film. Anamorphic lens flares, subtle film grain, no people, no logos other than the owl crest. 24fps, shallow depth of field. NO TEXT MISSPELLINGS. Mood: confident, expensive, scroll-stopping."""


def main() -> None:
    print("→ Sora 2 generating BrivoMarketing reel (vertical 9:16, 8s, sora-2-pro)…")
    gen = OpenAIVideoGeneration(api_key=os.environ["EMERGENT_LLM_KEY"])
    video_bytes = gen.text_to_video(
        prompt=PROMPT,
        model="sora-2-pro",
        size="1024x1792",
        duration=8,
        max_wait_time=900,
    )
    if not video_bytes:
        raise SystemExit("✗ Video generation failed (no bytes returned)")
    gen.save_video(video_bytes, str(OUT))
    kb = OUT.stat().st_size / 1024.0
    print(f"✓ saved {OUT} ({kb:,.1f} KB)")


if __name__ == "__main__":
    main()
