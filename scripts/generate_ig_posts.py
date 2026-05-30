"""Generate a shock-and-awe Instagram poster pack for BrivoMarketing.

Strategy: Nano Banana (gemini-3.1-flash-image-preview) renders a luxury,
cinematic NAVY/GOLD background for each post, then we composite crisp,
on-brand typography on top with Pillow (Fraunces + Inter) so the text is
always razor-sharp and legible. Output: 1080x1350 portrait JPGs (the
highest-performing Instagram feed size).

Writes to /app/frontend/public/kit-assets/ig-posts/post-01.jpg ... post-09.jpg
Run:  python3 /app/scripts/generate_ig_posts.py
"""

import asyncio
import base64
import os
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont, ImageFilter

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "scripts" / "fonts"
AS = ROOT / "frontend" / "public" / "kit-assets"
OUT = AS / "ig-posts"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1350

# ----- brand palette -----
NAVY = (11, 27, 43)
NAVY_DEEP = (7, 18, 30)
GOLD = (184, 134, 76)
GOLD_HI = (212, 169, 113)
IVORY = (251, 250, 246)
CREAM = (245, 215, 164)


def F(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


# ------------------------------------------------------------------ text utils
def text_w(d, s, font):
    b = d.textbbox((0, 0), s, font=font)
    return b[2] - b[0]


def draw_tracked(d, xy, s, font, fill, tracking=0):
    """Draw uppercase text with manual letter-spacing."""
    x, y = xy
    for ch in s:
        d.text((x, y), ch, font=font, fill=fill)
        x += text_w(d, ch, font) + tracking
    return x


def tracked_width(d, s, font, tracking=0):
    return sum(text_w(d, ch, font) + tracking for ch in s) - tracking


def wrap(d, s, font, max_w):
    words, lines, cur = s.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if text_w(d, t, font) > max_w and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


# ------------------------------------------------------------------ background
def fallback_bg(variant=0):
    """Dramatic navy/gold cinematic background rendered procedurally.

    Variant changes glow positions + streak angle so every post differs.
    """
    import math
    import random
    rnd = random.Random(variant * 7 + 11)

    im = Image.new("RGB", (W, H), NAVY_DEEP)

    # layered gold + steel glows
    glow = Image.new("RGB", (W, H), NAVY_DEEP)
    gd = ImageDraw.Draw(glow)
    spots = [
        (rnd.randint(W // 2, W + 200), rnd.randint(-200, H // 3), 520, (92, 66, 36)),
        (rnd.randint(-200, W // 2), rnd.randint(H * 2 // 3, H + 200), 600, (34, 56, 86)),
        (rnd.randint(W // 4, W * 3 // 4), rnd.randint(H // 3, H * 2 // 3), 360, (70, 50, 28)),
    ]
    for cx, cy, r, col in spots:
        gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col)
    glow = glow.filter(ImageFilter.GaussianBlur(200))
    im = Image.blend(im, glow, 0.78)

    # diagonal gold light streaks
    streaks = Image.new("RGB", (W, H), (0, 0, 0))
    sd = ImageDraw.Draw(streaks)
    angle = rnd.choice([18, 24, -16, 30])
    for k in range(5):
        off = rnd.randint(-300, W)
        wdt = rnd.randint(8, 40)
        dx = int(math.tan(math.radians(angle)) * H)
        col = rnd.choice([(150, 110, 60), (120, 90, 50), (180, 140, 90)])
        sd.polygon([(off, 0), (off + wdt, 0), (off + wdt + dx, H), (off + dx, H)], fill=col)
    streaks = streaks.filter(ImageFilter.GaussianBlur(rnd.randint(30, 70)))
    im = Image.blend(im, Image.composite(streaks, im, streaks.convert("L")), 0.35)

    # subtle film grain
    grain = Image.effect_noise((W, H), 18).convert("RGB")
    im = Image.blend(im, Image.composite(grain, im, grain.convert("L").point(lambda v: v // 3)), 0.06)

    # vignette
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).ellipse((-W // 3, -H // 3, W + W // 3, H + H // 3), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(260))
    dark = Image.new("RGB", (W, H), NAVY_DEEP)
    im = Image.composite(im, dark, vig)
    return im


def cover_crop(img, w, h):
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    img = img.resize((int(iw * scale), int(ih * scale)), Image.LANCZOS)
    iw, ih = img.size
    left, top = (iw - w) // 2, (ih - h) // 2
    return img.crop((left, top, left + w, top + h))


async def ai_bg(prompt):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id=f"ig-{os.urandom(4).hex()}",
                   system_message="You are a world-class luxury brand art director.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"])
    full = (
        "Ultra-premium editorial poster BACKGROUND, vertical 4:5 portrait. "
        "Deep navy #0B1B2B base with gold #B8864C and cream highlights. "
        "Cinematic dramatic lighting, fine film grain, lots of bold negative "
        "space for text overlay, luxury fashion-magazine aesthetic, 8k, "
        "high detail, no text, no words, no letters, no logos, no human faces. "
        + prompt
    )
    try:
        _, images = await chat.send_message_multimodal_response(UserMessage(text=full))
        if images:
            b = base64.b64decode(images[0]["data"])
            return Image.open(BytesIO(b)).convert("RGB")
    except Exception as e:
        print("  ! AI bg failed:", str(e)[:120])
    return None


def scrim(im, top=0.55, bottom=0.92):
    """Darken with a navy vertical gradient for legibility."""
    grad = Image.new("L", (1, H), 0)
    for y in range(H):
        t = y / H
        a = top + (bottom - top) * t
        grad.putpixel((0, y), int(255 * a))
    grad = grad.resize((W, H))
    navy = Image.new("RGB", (W, H), NAVY_DEEP)
    return Image.composite(navy, im, grad)


# ------------------------------------------------------------------ composer
def compose(bg, post):
    im = scrim(bg.copy())
    d = ImageDraw.Draw(im)
    MARGIN = 96

    # top hairline + kicker
    f_kick = F("Inter.ttf", 26)
    kick = post["kicker"].upper()
    draw_tracked(d, (MARGIN, 96), kick, f_kick, GOLD_HI, tracking=8)
    d.rectangle((MARGIN, 150, MARGIN + 70, 153), fill=GOLD)

    # giant stat (optional)
    y = 250
    if post.get("stat"):
        f_stat = F("Fraunces.ttf", 300)
        d.text((MARGIN - 6, y), post["stat"], font=f_stat, fill=GOLD_HI)
        y += 300
        f_sl = F("Inter.ttf", 30)
        draw_tracked(d, (MARGIN, y + 6), post["stat_label"].upper(), f_sl,
                     IVORY, tracking=6)
        y += 90

    # headline
    f_head = F("Fraunces.ttf", post.get("head_size", 92))
    lines = wrap(d, post["headline"], f_head, W - 2 * MARGIN)
    if not post.get("stat"):
        # vertically bias headline toward middle/lower third
        total = len(lines) * (post.get("head_size", 92) + 14)
        y = max(360, int(H * 0.46) - total // 2)
    for ln in lines:
        d.text((MARGIN, y), ln, font=f_head, fill=IVORY)
        y += post.get("head_size", 92) + 14

    # supporting line (italic)
    if post.get("sub"):
        f_sub = F("FrauncesItalic.ttf", 40)
        for ln in wrap(d, post["sub"], f_sub, W - 2 * MARGIN):
            d.text((MARGIN, y + 14), ln, font=f_sub, fill=GOLD_HI)
            y += 52

    # CTA pill (bottom)
    if post.get("cta"):
        f_cta = F("Inter.ttf", 26)
        cta = post["cta"].upper()
        cw = tracked_width(d, cta, f_cta, 4)
        px, py = MARGIN, H - 250
        d.rounded_rectangle((px, py, px + cw + 64, py + 70), radius=35,
                            outline=GOLD, width=2)
        draw_tracked(d, (px + 32, py + 22), cta, f_cta, CREAM, tracking=4)

    # brand lockup (bottom)
    f_brand = F("Fraunces.ttf", 42)
    f_studio = F("Inter.ttf", 22)
    by = H - 130
    d.text((MARGIN, by), "BrivoMarketing.", font=f_brand, fill=IVORY)
    draw_tracked(d, (MARGIN + 2, by + 56), "PERFORMANCE STUDIO  ·  @BRIVO.MARKETING",
                 f_studio, GOLD_HI, tracking=4)

    # owl crest bottom-right
    owl_path = AS / "owl-logo.jpg"
    if owl_path.exists():
        owl = cover_crop(Image.open(owl_path).convert("RGB"), 120, 120)
        mask = Image.new("L", (120, 120), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 120, 120), fill=255)
        ox, oy = W - MARGIN - 120, H - 150
        im.paste(owl, (ox, oy), mask)
        d.ellipse((ox - 3, oy - 3, ox + 123, oy + 123), outline=GOLD, width=2)

    return im


# ------------------------------------------------------------------ content
POSTS = [
    {
        "file": "post-01.jpg",
        "kicker": "Manifesto · Vol. 01",
        "headline": "We don't build websites. We build receipts.",
        "sub": "Design → code → ranked → booked.",
        "cta": 'Comment "RECEIPTS" for a free teardown',
        "bg": "Abstract luxury gold ink swirl dissolving into navy mist, "
              "single dramatic light beam from top right.",
    },
    {
        "file": "post-02.jpg",
        "stat": "+318%",
        "stat_label": "Revenue · 90 days",
        "kicker": "Client Receipts · Obsidian Apparel",
        "headline": "From quiet launch to category leader in one quarter.",
        "cta": "Full case study in bio",
        "bg": "Glowing gold financial upward light trails over deep navy, "
              "elegant bokeh, premium and cinematic.",
    },
    {
        "file": "post-03.jpg",
        "stat": "+412%",
        "stat_label": "Qualified leads",
        "kicker": "Client Receipts · Vault Finance",
        "headline": "A website that closes while you sleep.",
        "cta": 'DM "VAULT" to see the build',
        "bg": "Dark navy marble texture with veins of liquid gold, "
              "luxurious, moody studio lighting.",
    },
    {
        "file": "post-04.jpg",
        "kicker": "Testimonial · Maya Okonkwo, CMO",
        "headline": "\u201CWe hit our annual revenue target in five months.\u201D",
        "head_size": 80,
        "sub": "Obsidian Apparel",
        "cta": "See the work in bio",
        "bg": "Soft gold spotlight on an empty navy stage, theatrical, "
              "elegant negative space, subtle haze.",
    },
    {
        "file": "post-05.jpg",
        "kicker": "Carousel · Education",
        "headline": "5 signs your site is quietly costing you money.",
        "sub": "Swipe → the fixes are free.",
        "cta": 'Comment "AUDIT" for your teardown',
        "bg": "Abstract warning-light gold streaks cutting through dark navy "
              "fog, dramatic diagonal composition.",
    },
    {
        "file": "post-06.jpg",
        "kicker": "Process · How we work",
        "headline": "8 weeks. Zero surprises. One named senior lead.",
        "sub": "No revision rounds. Fixed fee.",
        "cta": "Save this post",
        "bg": "Architectural gold light grid receding into navy depth, "
              "precise, minimal, blueprint-luxury feel.",
    },
    {
        "file": "post-07.jpg",
        "kicker": "Founder POV",
        "headline": "We turned down a $4k project last week. Here's why.",
        "head_size": 78,
        "sub": "We're the last rebuild you'll need.",
        "cta": "Ready? Link in bio",
        "bg": "Single gold owl-feather catching dramatic light on a navy "
              "void, fine grain, fine-art photography.",
    },
    {
        "file": "post-08.jpg",
        "kicker": "As featured in",
        "headline": "TechCrunch · Forbes · Bloomberg · Fast Company.",
        "head_size": 70,
        "sub": "The studio founders wish they'd hired sooner.",
        "cta": "See the press in bio",
        "bg": "Polished gold award light flares over deep navy, prestige "
              "gala atmosphere, glamorous bokeh.",
    },
    {
        "file": "post-09.jpg",
        "kicker": "Intake · July",
        "headline": "2 slots left. We only take 4 builds a month.",
        "sub": "First-come, first-served.",
        "cta": 'DM "JULY" to book a slot',
        "bg": "Dramatic gold countdown light shafts over navy, urgent, "
              "cinematic, luxury scarcity mood.",
    },
]


async def main():
    use_ai = os.getenv("IG_USE_AI", "1") == "1"
    print(f"Generating {len(POSTS)} IG posters → {OUT}  (AI={use_ai})")
    for i, post in enumerate(POSTS, 1):
        print(f"[{i}/{len(POSTS)}] {post['file']} — {post['kicker']}")
        bg = None
        if use_ai:
            bg = await ai_bg(post["bg"])
        if bg is None:
            print("  using cinematic fallback")
            bg = fallback_bg(variant=i)
        else:
            bg = cover_crop(bg, W, H)
        img = compose(bg, post)
        img.save(OUT / post["file"], "JPEG", quality=90)
        print("  saved", post["file"])
    print("DONE")


if __name__ == "__main__":
    asyncio.run(main())
