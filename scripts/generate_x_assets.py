"""Generate premium X (Twitter) assets — enhanced owl profile avatar and a
cinematic 1500x500 header with the owl integrated (not just text).

Outputs (all JPEG, progressive, optimised):

    x-avatar.jpg     1500x1500    Profile photo — owl dominant, dual gold
                                 ring, radial glow, deeper vignette. Built
                                 to survive X's aggressive compression and
                                 still read at 40px on mobile.

    x-header.jpg     1500x500     Profile header. Safe-zone aware:
                                 bottom-left 280x130 kept clean so X's
                                 circular profile overlay doesn't clash.
                                 Owl sits on the right, wordmark +
                                 tagline + CTA centred, gold hairline
                                 rules top + bottom.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "frontend" / "public" / "kit-assets"
FONTS = ROOT / "scripts" / "fonts"

NAVY = (11, 15, 20)
NAVY_DEEP = (6, 9, 13)
NAVY_SOFT = (20, 28, 40)
GOLD = (201, 169, 97)
GOLD_BRIGHT = (224, 195, 120)
GOLD_DEEP = (166, 135, 70)
IVORY = (245, 241, 234)
INK = (15, 24, 36)

OWL_SRC = ASSETS / "owl-logo.jpg"


def load_fraunces(size: int, italic: bool = False) -> ImageFont.FreeTypeFont:
    name = "FrauncesItalic.ttf" if italic else "Fraunces.ttf"
    return ImageFont.truetype(str(FONTS / name), size)


def load_inter(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / "Inter.ttf"), size)


def prepare_owl_circle(diameter: int) -> Image.Image:
    """Square-crop the owl logo and mask it into a circle with an alpha
    channel. Edges are feathered one pixel for anti-alias smoothness."""
    owl = Image.open(OWL_SRC).convert("RGB")
    w, h = owl.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    owl_sq = owl.crop((left, top, left + side, top + side))
    owl_sq = owl_sq.resize((diameter, diameter), Image.LANCZOS)

    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, diameter, diameter), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))

    out = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    out.paste(owl_sq, (0, 0), mask)
    return out


def radial_gradient(size: tuple[int, int], inner, outer,
                    center: tuple[int, int] | None = None,
                    radius_scale: float = 0.75) -> Image.Image:
    """Paint a radial gradient from inner -> outer over `size`."""
    w, h = size
    cx, cy = center if center else (w // 2, h // 2)
    max_r = int(max(w, h) * radius_scale)

    base = Image.new("RGB", size, outer)
    overlay = Image.new("RGB", size, inner)

    mask = Image.new("L", size, 0)
    md = ImageDraw.Draw(mask)
    for i in range(max_r, 0, -4):
        alpha = int(255 * (1 - i / max_r) ** 1.6)
        md.ellipse((cx - i, cy - i, cx + i, cy + i), fill=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(16))

    return Image.composite(overlay, base, mask)


def add_noise(img: Image.Image, strength: int = 6) -> Image.Image:
    """Very subtle paper-grain noise to kill JPEG banding on dark fields."""
    import random
    noise = Image.new("L", img.size, 128)
    px = noise.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            px[x, y] = 128 + random.randint(-strength, strength)
    noise = noise.filter(ImageFilter.GaussianBlur(0.4))
    return Image.composite(img, img.filter(ImageFilter.GaussianBlur(0)), noise)


# ---------------------------------------------------------------------------
# Cinematic background — navy/gold silk drape + gold bokeh
# ---------------------------------------------------------------------------

def cinematic_background(size: tuple[int, int]) -> Image.Image:
    """Navy-to-amber gradient with gold bokeh and silk-drape curves.
    Deliberately NOT a plain black field."""
    import math
    import random

    W, H = size
    # 1) Base diagonal gradient: deep navy top-left → warmer aubergine-gold bottom-right
    base = Image.new("RGB", size, NAVY_DEEP)
    px = base.load()
    for y in range(H):
        for x in range(W):
            t = (x / W) * 0.55 + (y / H) * 0.45
            # Blend navy_deep -> navy_soft with a hint of warmth
            r = int(NAVY_DEEP[0] * (1 - t) + (40 + 30 * t) * t)
            g = int(NAVY_DEEP[1] * (1 - t) + (38 + 18 * t) * t)
            b = int(NAVY_DEEP[2] * (1 - t) + (55 + 12 * t) * t)
            px[x, y] = (max(0, min(255, r)),
                        max(0, min(255, g)),
                        max(0, min(255, b)))

    # 2) Warm amber radial glow on the right (where the owl will sit)
    glow = Image.new("RGB", size, (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = int(W * 0.78), H // 2
    max_r = int(max(W, H) * 0.7)
    for i in range(max_r, 0, -4):
        k = (1 - i / max_r) ** 2
        color = (
            int(min(255, GOLD[0] * 0.7 * k)),
            int(min(255, GOLD[1] * 0.5 * k)),
            int(min(255, GOLD[2] * 0.25 * k)),
        )
        gd.ellipse((cx - i, cy - i, cx + i, cy + i), fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    base = Image.blend(base, glow, 0.60)

    # 3) Silk-drape curves: soft sweeping bands suggesting fabric in motion
    drape = Image.new("RGBA", size, (0, 0, 0, 0))
    dd = ImageDraw.Draw(drape)
    for i, amp in enumerate([90, 130, 170, 80, 110]):
        phase = i * 0.9
        freq = 0.0025 + i * 0.0004
        shade = 18 + i * 6
        alpha = 55 - i * 6
        color = (GOLD[0], GOLD[1] - shade, GOLD[2] - shade, max(10, alpha))
        pts = []
        y_center = H * (0.22 + i * 0.16)
        for x in range(0, W + 8, 8):
            y = y_center + amp * math.sin(freq * x + phase)
            pts.append((x, y))
        # Build a thick stroke by drawing band polygon
        top = [(x, y - 60 - i * 8) for x, y in pts]
        bot = [(x, y + 60 + i * 8) for x, y in reversed(pts)]
        dd.polygon(top + bot, fill=color)
    drape = drape.filter(ImageFilter.GaussianBlur(40))
    base = Image.alpha_composite(base.convert("RGBA"), drape).convert("RGB")

    # 4) Gold bokeh — three size tiers for depth
    bokeh = Image.new("RGBA", size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(bokeh)
    random.seed(42)
    # Large soft bokeh
    for _ in range(14):
        x = random.randint(-40, W + 40)
        y = random.randint(-20, H + 20)
        r = random.randint(60, 140)
        a = random.randint(28, 60)
        bd.ellipse((x - r, y - r, x + r, y + r),
                   fill=(GOLD_BRIGHT[0], GOLD_BRIGHT[1], GOLD_BRIGHT[2], a))
    # Medium bokeh
    for _ in range(26):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.randint(22, 50)
        a = random.randint(45, 90)
        bd.ellipse((x - r, y - r, x + r, y + r),
                   fill=(GOLD_BRIGHT[0], GOLD_BRIGHT[1], GOLD_BRIGHT[2], a))
    bokeh_large = bokeh.filter(ImageFilter.GaussianBlur(14))

    # Sharp tiny sparkles
    sparkle = Image.new("RGBA", size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sparkle)
    for _ in range(55):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.randint(2, 6)
        a = random.randint(160, 230)
        sd.ellipse((x - r, y - r, x + r, y + r),
                   fill=(255, 235, 180, a))
    sparkle = sparkle.filter(ImageFilter.GaussianBlur(1.2))

    base_rgba = base.convert("RGBA")
    base_rgba = Image.alpha_composite(base_rgba, bokeh_large)
    base_rgba = Image.alpha_composite(base_rgba, sparkle)

    # 5) Left-side darkening for profile-pic safe zone + text legibility
    shade = Image.new("RGBA", size, (0, 0, 0, 0))
    sh = ImageDraw.Draw(shade)
    # Subtle left vignette so profile pic contrasts + text reads
    for i in range(W // 2):
        a = int(max(0, 120 - (i / (W / 2)) * 120))
        sh.line([(i, 0), (i, H)], fill=(5, 8, 12, a))
    base_rgba = Image.alpha_composite(base_rgba, shade)

    return base_rgba.convert("RGB")


# ---------------------------------------------------------------------------
# X PROFILE AVATAR — 1500x1500, owl dominant
# ---------------------------------------------------------------------------

def build_x_avatar(out_name: str = "x-avatar.jpg") -> Path:
    size = 1500
    # Rich radial backdrop
    canvas = radial_gradient((size, size), NAVY_SOFT, NAVY_DEEP,
                             center=(size // 2, size // 2),
                             radius_scale=0.75).convert("RGB")

    # Gold glow disc behind the owl — the secret sauce
    glow = Image.new("RGB", (size, size), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(40):
        r = int(size * 0.50 - i * 8)
        if r <= 0:
            break
        alpha = int(255 * (1 - i / 40) ** 2)
        color = (
            min(255, int(GOLD[0] * 0.55 * alpha / 255) + NAVY_DEEP[0]),
            min(255, int(GOLD[1] * 0.40 * alpha / 255) + NAVY_DEEP[1]),
            min(255, int(GOLD[2] * 0.22 * alpha / 255) + NAVY_DEEP[2]),
        )
        gd.ellipse((size // 2 - r, size // 2 - r,
                    size // 2 + r, size // 2 + r), fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    canvas = Image.blend(canvas, glow, 0.55)

    # Owl — 88% of canvas
    owl_d = int(size * 0.88)
    owl = prepare_owl_circle(owl_d)
    owl_x = (size - owl_d) // 2
    owl_y = (size - owl_d) // 2
    canvas.paste(owl, (owl_x, owl_y), owl)

    # Dual gold rings — outer bold, inner hairline
    draw = ImageDraw.Draw(canvas)
    outer_r = owl_d // 2 + 14
    inner_r = owl_d // 2 + 4
    draw.ellipse((size // 2 - outer_r, size // 2 - outer_r,
                  size // 2 + outer_r, size // 2 + outer_r),
                 outline=GOLD_BRIGHT, width=10)
    draw.ellipse((size // 2 - inner_r, size // 2 - inner_r,
                  size // 2 + inner_r, size // 2 + inner_r),
                 outline=GOLD_DEEP, width=2)

    # Deeper vignette for cinematic edge falloff
    vignette = Image.new("L", (size, size), 255)
    vd = ImageDraw.Draw(vignette)
    for i in range(30):
        r = int(size * (0.95 - i * 0.02))
        if r <= 0:
            break
        vd.ellipse((size // 2 - r, size // 2 - r,
                    size // 2 + r, size // 2 + r),
                   fill=int(255 - i * 4))
    vignette = vignette.filter(ImageFilter.GaussianBlur(80))
    dark = Image.new("RGB", (size, size), (0, 0, 0))
    canvas = Image.composite(canvas, dark, vignette)

    out = ASSETS / out_name
    canvas.save(out, "JPEG", quality=94, optimize=True, progressive=True)
    return out


# ---------------------------------------------------------------------------
# X HEADER — 1500x500, cinematic, owl integrated, safe-zone aware
# ---------------------------------------------------------------------------

def build_x_header(out_name: str = "x-header.jpg") -> Path:
    """X header with real NYC skyline photo + enhanced owl composited on top."""
    W, H = 1500, 500

    # 1) Load NYC skyline source (2400x3200 portrait) and crop the skyline
    # band, then resize to target. We take y=600..1400 (800px tall strip)
    # which keeps the buildings + golden-hour sky + a sliver of reflection.
    skyline = Image.open(ROOT / "scripts" / "sources" / "nyc-skyline.jpg").convert("RGB")
    sw, sh = skyline.size
    if sh > sw:
        # Portrait source -> crop skyline band (y = 0.19*H .. 0.44*H)
        crop_top = int(sh * 0.19)
        crop_bot = int(sh * 0.44)
        band = skyline.crop((0, crop_top, sw, crop_bot))
        skyline = band.resize((W, H), Image.LANCZOS)
    else:
        # Landscape source -> resize width to W then crop a 500-tall strip
        # biased to the BOTTOM half where the skyline + its reflection live.
        new_h = int(sh * W / sw)
        skyline = skyline.resize((W, new_h), Image.LANCZOS)
        # Take strip from ~42% down so we capture full skyline + waterline
        crop_top = max(0, min(new_h - H, int(new_h * 0.42)))
        skyline = skyline.crop((0, crop_top, W, crop_top + H))

    # 2) Gentle grade — preserve the golden hour mood, boost a touch of contrast
    from PIL import ImageEnhance
    skyline = ImageEnhance.Contrast(skyline).enhance(1.12)
    skyline = ImageEnhance.Brightness(skyline).enhance(1.02)
    skyline = ImageEnhance.Color(skyline).enhance(1.05)

    canvas = skyline.convert("RGB")

    # 3) LIGHT overall darkening (keeps skyline crisp) + localised chyron
    #    behind the wordmark so it stays readable.
    darken = Image.new("RGBA", (W, H), (0, 0, 0, 40))  # ~15% global wash
    canvas = Image.alpha_composite(canvas.convert("RGBA"), darken).convert("RGB")

    # Chyron — a soft semi-transparent rectangle behind the wordmark zone.
    # This is the trick: text is legible without drowning the skyline.
    chyron = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(chyron)
    # Vertical gradient rectangle from left edge in, fading to the right
    for x in range(420, 1060):
        # Softer in the middle, feather at left and right
        edge = min(1, (x - 420) / 70, (1060 - x) / 70)
        a = int(165 * edge)
        cdraw.line([(x, 120), (x, 340)], fill=(8, 10, 16, a), width=1)
    chyron = chyron.filter(ImageFilter.GaussianBlur(22))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), chyron).convert("RGB")

    # 4) Amber radial glow where the owl will be placed (right side)
    owl_cx, owl_cy = int(W * 0.80), H // 2
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(42):
        r = int(340 - i * 7)
        if r <= 0:
            break
        alpha = (1 - i / 42) ** 2
        color = (
            int(min(255, GOLD_BRIGHT[0] * 0.85 * alpha)),
            int(min(255, GOLD_BRIGHT[1] * 0.60 * alpha)),
            int(min(255, GOLD_BRIGHT[2] * 0.30 * alpha)),
        )
        gd.ellipse((owl_cx - r, owl_cy - r, owl_cx + r, owl_cy + r),
                   fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    canvas = Image.blend(canvas, glow, 0.28)

    # 5) Owl — bold 440px with triple gold ring
    owl_d = 440
    owl = prepare_owl_circle(owl_d)
    owl_x = owl_cx - owl_d // 2
    owl_y = owl_cy - owl_d // 2
    canvas.paste(owl, (owl_x, owl_y), owl)

    draw = ImageDraw.Draw(canvas)
    r_outer = owl_d // 2 + 16
    r_mid = owl_d // 2 + 6
    r_inner = owl_d // 2 + 1
    draw.ellipse((owl_cx - r_outer, owl_cy - r_outer,
                  owl_cx + r_outer, owl_cy + r_outer),
                 outline=GOLD_BRIGHT, width=9)
    draw.ellipse((owl_cx - r_mid, owl_cy - r_mid,
                  owl_cx + r_mid, owl_cy + r_mid),
                 outline=GOLD_DEEP, width=2)
    draw.ellipse((owl_cx - r_inner, owl_cy - r_inner,
                  owl_cx + r_inner, owl_cy + r_inner),
                 outline=GOLD_BRIGHT, width=1)

    # 6) Gold hairline frame top + bottom
    draw.line([(40, 18), (W - 40, 18)], fill=GOLD, width=1)
    draw.line([(40, H - 18), (W - 40, H - 18)], fill=GOLD, width=1)

    # 7) Top labels
    f_label = load_inter(18)
    label = "E S T .   M M X X I V   ·   N Y C"
    lbox = draw.textbbox((0, 0), label, font=f_label)
    lw = lbox[2] - lbox[0]
    draw.text((W - 60 - lw, 34), label, font=f_label, fill=GOLD_BRIGHT)

    f_label2 = load_inter(16)
    draw.text((56, 34),
              "T H E   A I   P E R F O R M A N C E   S T U D I O",
              font=f_label2, fill=GOLD)

    # 8) Wordmark block at x=440 (safe from X's profile pic overlay)
    f_word = load_fraunces(150)
    word = "BRIVO"
    wbox = draw.textbbox((0, 0), word, font=f_word)
    ww = wbox[2] - wbox[0]
    wh = wbox[3] - wbox[1]
    wx = 440
    wy = 130

    # Multi-pass drop shadow for photo-grade legibility
    for dx, dy in [(6, 7), (4, 5), (2, 3), (-1, 3)]:
        draw.text((wx + dx, wy + dy), word, font=f_word, fill=(4, 6, 10))
    draw.text((wx, wy), word, font=f_word, fill=IVORY)

    # Gold hairline under wordmark
    draw.line([(wx + 6, wy + wh + 18), (wx + ww - 6, wy + wh + 18)],
              fill=GOLD_BRIGHT, width=2)

    # Tagline
    f_tag = load_inter(22)
    tag = "A I   P E R F O R M A N C E   S T U D I O"
    draw.text((wx + 8, wy + wh + 32), tag, font=f_tag, fill=(4, 6, 10))
    draw.text((wx + 6, wy + wh + 30), tag, font=f_tag, fill=GOLD_BRIGHT)

    # Italic descriptor
    f_desc = load_fraunces(26, italic=True)
    desc = "Custom sites. Voice agents. Pipeline that moves."
    draw.text((wx + 8, wy + wh + 72), desc, font=f_desc, fill=(4, 6, 10))
    draw.text((wx + 6, wy + wh + 70), desc, font=f_desc,
              fill=(232, 235, 242))

    # 9) CTA pill — bottom-right with amber halo
    f_cta = load_inter(20)
    cta = "brivomarketing.com"
    cbox = draw.textbbox((0, 0), cta, font=f_cta)
    cw = cbox[2] - cbox[0]
    ch = cbox[3] - cbox[1]
    pill_pad_x, pill_pad_y = 22, 12
    pill_w = cw + pill_pad_x * 2
    pill_h = ch + pill_pad_y * 2
    pill_x = W - 60 - pill_w
    pill_y = H - 60 - pill_h

    glow_pill = Image.new("RGBA", (pill_w + 48, pill_h + 48), (0, 0, 0, 0))
    ImageDraw.Draw(glow_pill).rounded_rectangle(
        (24, 24, pill_w + 24, pill_h + 24),
        radius=pill_h // 2,
        fill=(GOLD_BRIGHT[0], GOLD_BRIGHT[1], GOLD_BRIGHT[2], 150),
    )
    glow_pill = glow_pill.filter(ImageFilter.GaussianBlur(18))
    canvas.paste(glow_pill, (pill_x - 24, pill_y - 24), glow_pill)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h),
        radius=pill_h // 2, fill=GOLD_BRIGHT,
    )
    draw.text((pill_x + pill_pad_x, pill_y + pill_pad_y - 4),
              cta, font=f_cta, fill=INK)

    out = ASSETS / out_name
    canvas.save(out, "JPEG", quality=94, optimize=True, progressive=True)
    return out


def main() -> None:
    a = build_x_avatar()
    print(f"  -> {a.relative_to(ROOT)} ({a.stat().st_size // 1024} KB)")
    h = build_x_header()
    print(f"  -> {h.relative_to(ROOT)} ({h.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
