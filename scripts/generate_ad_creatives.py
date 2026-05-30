"""Generate UNIQUE, conversation-starting AD CREATIVES for BrivoMarketing.

These are engineered for reach + comments + shares: hot takes, provocations,
a "roast your homepage" challenge, shock stats, dares. Multiple formats:
  - feed   1080x1350 (4:5 portrait)
  - square 1080x1080 (1:1)
  - story  1080x1920 (9:16)

Backgrounds via Nano Banana (gemini-3.1-flash-image-preview, LlmChat multimodal)
with a cinematic procedural fallback. Typography overlaid in Pillow
(Fraunces/Inter, navy/gold/ivory) with a dark halo for any-background legibility.

Output: /app/frontend/public/kit-assets/ad-creatives/ad-01.jpg ...
Run: python3 /app/scripts/generate_ad_creatives.py   (IG_USE_AI=0 to skip AI)
"""

import asyncio
import base64
import math
import os
import random
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont, ImageFilter

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "scripts" / "fonts"
AS = ROOT / "frontend" / "public" / "kit-assets"
OUT = AS / "ad-creatives"
OUT.mkdir(parents=True, exist_ok=True)

NAVY_DEEP = (7, 18, 30)
GOLD = (184, 134, 76)
GOLD_HI = (212, 169, 113)
IVORY = (251, 250, 246)
CREAM = (245, 215, 164)


def F(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def text_w(d, s, font):
    b = d.textbbox((0, 0), s, font=font)
    return b[2] - b[0]


def draw_tracked(d, xy, s, font, fill, tracking=0):
    x, y = xy
    for ch in s:
        d.text((x, y), ch, font=font, fill=fill)
        x += text_w(d, ch, font) + tracking


def tracked_width(d, s, font, tracking=0):
    return sum(text_w(d, ch, font) + tracking for ch in s) - tracking


def draw_outlined(d, xy, s, font, fill, outline=(6, 15, 26), w=4, step=2):
    x, y = xy
    for ox in range(-w, w + 1, step):
        for oy in range(-w, w + 1, step):
            if ox or oy:
                d.text((x + ox, y + oy), s, font=font, fill=outline)
    d.text((x, y), s, font=font, fill=fill)


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


def cover_crop(img, w, h):
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    img = img.resize((int(iw * scale), int(ih * scale)), Image.LANCZOS)
    iw, ih = img.size
    left, top = (iw - w) // 2, (ih - h) // 2
    return img.crop((left, top, left + w, top + h))


def fallback_bg(W, H, variant=0):
    rnd = random.Random(variant * 13 + 5)
    im = Image.new("RGB", (W, H), NAVY_DEEP)
    glow = Image.new("RGB", (W, H), NAVY_DEEP)
    gd = ImageDraw.Draw(glow)
    for _ in range(3):
        cx = rnd.randint(-200, W + 200)
        cy = rnd.randint(-200, H + 200)
        r = rnd.randint(340, 620)
        col = rnd.choice([(92, 66, 36), (34, 56, 86), (70, 50, 28)])
        gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col)
    glow = glow.filter(ImageFilter.GaussianBlur(200))
    im = Image.blend(im, glow, 0.78)
    streaks = Image.new("RGB", (W, H), (0, 0, 0))
    sd = ImageDraw.Draw(streaks)
    angle = rnd.choice([18, 24, -16, 30])
    for _ in range(5):
        off = rnd.randint(-300, W)
        wdt = rnd.randint(8, 40)
        dx = int(math.tan(math.radians(angle)) * H)
        col = rnd.choice([(150, 110, 60), (120, 90, 50), (180, 140, 90)])
        sd.polygon([(off, 0), (off + wdt, 0), (off + wdt + dx, H), (off + dx, H)], fill=col)
    streaks = streaks.filter(ImageFilter.GaussianBlur(rnd.randint(30, 70)))
    im = Image.blend(im, Image.composite(streaks, im, streaks.convert("L")), 0.35)
    grain = Image.effect_noise((W, H), 18).convert("RGB")
    im = Image.blend(im, Image.composite(grain, im, grain.convert("L").point(lambda v: v // 3)), 0.06)
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).ellipse((-W // 3, -H // 3, W + W // 3, H + H // 3), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(260))
    return Image.composite(im, Image.new("RGB", (W, H), NAVY_DEEP), vig)


def scrim(im, W, H, top=0.6, bottom=0.95):
    grad = Image.new("L", (1, H), 0)
    for y in range(H):
        a = top + (bottom - top) * (y / H)
        grad.putpixel((0, y), int(255 * a))
    grad = grad.resize((W, H))
    return Image.composite(Image.new("RGB", (W, H), NAVY_DEEP), im, grad)


async def ai_bg(prompt):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(api_key=api_key, session_id=f"ad-{os.urandom(4).hex()}",
                   system_message="You are a world-class luxury brand art director.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"])
    full = (
        "Ultra-premium editorial advertising BACKGROUND. Deep navy #0B1B2B base "
        "with gold #B8864C and cream highlights. Cinematic dramatic lighting, "
        "fine film grain, lots of bold negative space for a big text overlay, "
        "luxury fashion-magazine aesthetic, 8k, high detail, no text, no words, "
        "no letters, no logos, no human faces. " + prompt
    )
    try:
        _, images = await chat.send_message_multimodal_response(UserMessage(text=full))
        if images:
            return Image.open(BytesIO(base64.b64decode(images[0]["data"]))).convert("RGB")
    except Exception as e:
        print("  ! AI bg failed:", str(e)[:110])
    return None


def compose(bg, ad, W, H):
    im = scrim(bg.copy(), W, H)
    d = ImageDraw.Draw(im)
    M = 90

    # eyebrow chip (e.g. HOT TAKE / UNPOPULAR OPINION)
    f_eye = F("Inter.ttf", 26)
    eye = ad["eyebrow"].upper()
    ew = tracked_width(d, eye, f_eye, 6)
    d.rounded_rectangle((M, 100, M + ew + 56, 158), radius=29, fill=GOLD)
    draw_tracked(d, (M + 28, 116), eye, f_eye, NAVY_DEEP, tracking=6)

    # big headline (centered block, biased per format)
    hs = ad.get("head_size", 100)
    f_head = F("Fraunces.ttf", hs)
    lines = wrap(d, ad["headline"], f_head, W - 2 * M)
    total = len(lines) * (hs + 16)
    y = int(H * ad.get("head_y", 0.40)) - total // 2
    y = max(y, 210)
    for ln in lines:
        draw_outlined(d, (M, y), ln, f_head, IVORY, w=5, step=2)
        y += hs + 16

    # supporting italic line on a subtle dark backing bar (guaranteed contrast)
    if ad.get("sub"):
        f_sub = F("FrauncesItalic.ttf", 42)
        sub_lines = wrap(d, ad["sub"], f_sub, W - 2 * M)
        line_h = 56
        sub_w = max(text_w(d, ln, f_sub) for ln in sub_lines)
        x0, y0 = M - 20, y + 10
        x1, y1 = M + sub_w + 22, y + 10 + len(sub_lines) * line_h + 6
        ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(ov).rounded_rectangle((x0, y0, x1, y1), radius=18,
                                             fill=(5, 12, 22, 210))
        im = Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")
        d = ImageDraw.Draw(im)
        yy = y + 16
        for ln in sub_lines:
            draw_outlined(d, (M, yy), ln, f_sub, CREAM, w=2, step=2)
            yy += line_h
        y = y1

    # CTA pill
    if ad.get("cta"):
        f_cta = F("Inter.ttf", 28)
        cta = ad["cta"].upper()
        cw = tracked_width(d, cta, f_cta, 4)
        py = (y + 48) if H > 1400 else (H - 250)
        d.rounded_rectangle((M, py, M + cw + 72, py + 76), radius=38, fill=GOLD)
        draw_tracked(d, (M + 36, py + 23), cta, f_cta, NAVY_DEEP, tracking=4)

    # brand lockup
    f_brand = F("Fraunces.ttf", 44)
    f_studio = F("Inter.ttf", 22)
    by = H - 130
    draw_outlined(d, (M, by), "BrivoMarketing.", f_brand, IVORY, w=2, step=2)
    draw_tracked(d, (M + 2, by + 58), "PERFORMANCE STUDIO  ·  @BRIVO.MARKETING",
                 f_studio, GOLD_HI, tracking=4)

    owl_path = AS / "owl-logo.jpg"
    if owl_path.exists():
        owl = cover_crop(Image.open(owl_path).convert("RGB"), 116, 116)
        mask = Image.new("L", (116, 116), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 116, 116), fill=255)
        ox, oy = W - M - 116, H - 150
        im.paste(owl, (ox, oy), mask)
        d.ellipse((ox - 3, oy - 3, ox + 119, oy + 119), outline=GOLD, width=2)
    return im


SIZES = {
    "feed": (1080, 1350),
    "square": (1080, 1080),
    "story": (1080, 1920),
}

ADS = [
    {
        "file": "ad-01.jpg", "format": "feed",
        "eyebrow": "Hot take",
        "headline": "Your website isn't ugly. It's invisible.",
        "sub": "Pretty doesn't rank. Proof does.",
        "cta": 'Comment "INVISIBLE"',
        "head_size": 104, "head_y": 0.40,
        "bg": "Abstract gold light dissolving into navy fog, one dramatic beam.",
    },
    {
        "file": "ad-02.jpg", "format": "square",
        "eyebrow": "Free roast",
        "headline": "Send us your homepage. We'll roast it. Free.",
        "sub": "No pitch. Just the brutal truth.",
        "cta": 'DM "ROAST"',
        "head_size": 92, "head_y": 0.42,
        "bg": "Smouldering gold ember sparks rising over deep navy, dramatic.",
    },
    {
        "file": "ad-03.jpg", "format": "feed",
        "eyebrow": "Unpopular opinion",
        "headline": "Most 'award-winning' sites quietly lose money.",
        "sub": "Awards don't pay your invoices. Conversions do.",
        "cta": "Agree? Tap save",
        "head_size": 92, "head_y": 0.40,
        "bg": "Single gold trophy-like light flare on a navy void, prestige bokeh.",
    },
    {
        "file": "ad-04.jpg", "format": "story",
        "eyebrow": "Poll",
        "headline": "Your site: a weapon or a liability?",
        "sub": "There is no third option.",
        "cta": "Reply with one word",
        "head_size": 110, "head_y": 0.38,
        "bg": "Two opposing gold light shafts crossing over navy, tension, cinematic.",
    },
    {
        "file": "ad-05.jpg", "format": "feed",
        "eyebrow": "Shock stat",
        "headline": "53% of visitors leave after 3 seconds.",
        "sub": "Is yours fast enough to keep them?",
        "cta": 'Comment "AUDIT"',
        "head_size": 100, "head_y": 0.40,
        "bg": "Fast gold motion-blur light streaks over navy, sense of speed.",
    },
    {
        "file": "ad-06.jpg", "format": "feed",
        "eyebrow": "Mic drop",
        "headline": "We don't do revisions. We get it right.",
        "sub": "One named senior lead. Fixed fee. Zero surprises.",
        "cta": "See the work in bio",
        "head_size": 100, "head_y": 0.40,
        "bg": "Architectural gold light grid receding into navy depth, precise, minimal.",
    },
    {
        "file": "ad-07.jpg", "format": "square",
        "eyebrow": "The dare",
        "headline": "Bet your site can't load in under 1 second.",
        "sub": "Prove us wrong. Or let us fix it.",
        "cta": 'DM "SPEED"',
        "head_size": 90, "head_y": 0.42,
        "bg": "Electric gold light pulse over navy, energetic, high contrast.",
    },
    {
        "file": "ad-08.jpg", "format": "story",
        "eyebrow": "True story",
        "headline": "We turned down $20k last week. Here's why.",
        "sub": "We're a partner, not a vendor.",
        "cta": "Watch why → bio",
        "head_size": 106, "head_y": 0.38,
        "bg": "Lone dramatic gold spotlight on an empty navy stage, theatrical haze.",
    },
    {
        "file": "ad-09.jpg", "format": "feed",
        "eyebrow": "Reality check",
        "headline": "A $4k template costs you $40k in lost deals.",
        "sub": "Buy twice, or buy right.",
        "cta": "Do the math → bio",
        "head_size": 96, "head_y": 0.40,
        "bg": "Liquid gold veins through dark navy marble, luxurious moody studio light.",
    },
    {
        "file": "ad-10.jpg", "format": "story",
        "eyebrow": "Last call",
        "headline": "We only build 4 sites a month. 2 left.",
        "sub": "First come, first booked.",
        "cta": 'DM "JULY"',
        "head_size": 108, "head_y": 0.38,
        "bg": "Dramatic gold countdown light shafts over navy, urgent scarcity mood.",
    },
]


async def main():
    use_ai = os.getenv("IG_USE_AI", "1") == "1"
    recompose = os.getenv("IG_RECOMPOSE", "0") == "1"
    cache = OUT / "_clean"
    cache.mkdir(exist_ok=True)
    print(f"Generating {len(ADS)} ad creatives → {OUT}  (AI={use_ai} recompose={recompose})")
    for i, ad in enumerate(ADS, 1):
        W, H = SIZES[ad["format"]]
        print(f"[{i}/{len(ADS)}] {ad['file']} ({ad['format']} {W}x{H}) — {ad['eyebrow']}")
        cpath = cache / ad["file"].replace(".jpg", ".png")
        if recompose and cpath.exists():
            bg = Image.open(cpath).convert("RGB")
            print("  recompose from cached clean bg")
        else:
            bg = await ai_bg(ad["bg"]) if use_ai else None
            if bg is None:
                print("  cinematic fallback")
                bg = fallback_bg(W, H, variant=i)
            else:
                bg = cover_crop(bg, W, H)
            bg.save(cpath, "PNG")  # cache clean bg for free re-composites
        compose(bg, ad, W, H).save(OUT / ad["file"], "JPEG", quality=90)
        print("  saved", ad["file"])
    print("DONE")


if __name__ == "__main__":
    asyncio.run(main())
