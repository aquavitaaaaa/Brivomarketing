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
    W, H = 1500, 500

    # Dark radial backdrop with glow pulled to the right of centre where
    # the owl will sit
    canvas = radial_gradient((W, H), NAVY_SOFT, NAVY_DEEP,
                             center=(int(W * 0.78), H // 2),
                             radius_scale=0.65).convert("RGB")

    # Amber glow disc behind owl
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    owl_cx, owl_cy = int(W * 0.78), H // 2
    for i in range(30):
        r = int(260 - i * 7)
        if r <= 0:
            break
        alpha = (1 - i / 30) ** 2
        color = (
            int(min(255, GOLD[0] * 0.55 * alpha + NAVY_DEEP[0])),
            int(min(255, GOLD[1] * 0.40 * alpha + NAVY_DEEP[1])),
            int(min(255, GOLD[2] * 0.22 * alpha + NAVY_DEEP[2])),
        )
        gd.ellipse((owl_cx - r, owl_cy - r, owl_cx + r, owl_cy + r),
                   fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(45))
    canvas = Image.blend(canvas, glow, 0.55)

    # Owl — 380px diameter, right side, centred vertically
    owl_d = 380
    owl = prepare_owl_circle(owl_d)
    owl_x = owl_cx - owl_d // 2
    owl_y = owl_cy - owl_d // 2
    canvas.paste(owl, (owl_x, owl_y), owl)

    # Dual gold rings around owl
    draw = ImageDraw.Draw(canvas)
    outer_r = owl_d // 2 + 10
    inner_r = owl_d // 2 + 3
    draw.ellipse((owl_cx - outer_r, owl_cy - outer_r,
                  owl_cx + outer_r, owl_cy + outer_r),
                 outline=GOLD_BRIGHT, width=6)
    draw.ellipse((owl_cx - inner_r, owl_cy - inner_r,
                  owl_cx + inner_r, owl_cy + inner_r),
                 outline=GOLD_DEEP, width=2)

    # Gold hairline rules at top + bottom for editorial frame
    draw.line([(40, 18), (W - 40, 18)], fill=GOLD_DEEP, width=1)
    draw.line([(40, H - 18), (W - 40, H - 18)], fill=GOLD_DEEP, width=1)

    # Top-right small-caps label
    f_label = load_inter(18)
    label = "E S T .   M M X X I V   ·   N Y C"
    lbox = draw.textbbox((0, 0), label, font=f_label)
    lw = lbox[2] - lbox[0]
    draw.text((W - 60 - lw, 34), label, font=f_label, fill=GOLD)

    # ----- Central wordmark block -----
    # X's profile pic overlay lives roughly x=73..207 on desktop and can
    # shift on mobile — we start the wordmark at x=440 for a clean buffer.
    # Wordmark
    f_word = load_fraunces(140)
    word = "BRIVO"
    wbox = draw.textbbox((0, 0), word, font=f_word)
    ww = wbox[2] - wbox[0]
    wh = wbox[3] - wbox[1]
    wx = 440
    wy = 140
    draw.text((wx, wy), word, font=f_word, fill=IVORY)

    # Tagline
    f_tag = load_inter(22)
    tag = "A I   P E R F O R M A N C E   S T U D I O"
    draw.text((wx + 6, wy + wh + 26), tag, font=f_tag, fill=GOLD)

    # Italic descriptor
    f_desc = load_fraunces(26, italic=True)
    desc = "Custom sites. Voice agents. Pipeline that moves."
    draw.text((wx + 6, wy + wh + 68), desc, font=f_desc,
              fill=(200, 205, 215))

    # CTA pill — bottom-right, outside the mobile-cropped zone
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
    draw.rounded_rectangle(
        (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h),
        radius=pill_h // 2, fill=GOLD,
    )
    draw.text((pill_x + pill_pad_x, pill_y + pill_pad_y - 4),
              cta, font=f_cta, fill=INK)

    # Subtle grain over whole canvas
    grain = Image.new("L", canvas.size, 0)
    import random
    gpx = grain.load()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            gpx[x, y] = random.randint(0, 10)
    grain = grain.filter(ImageFilter.GaussianBlur(0.3))
    black = Image.new("RGB", canvas.size, (0, 0, 0))
    canvas = Image.composite(black, canvas, grain)

    out = ASSETS / out_name
    canvas.save(out, "JPEG", quality=93, optimize=True, progressive=True)
    return out


def main() -> None:
    a = build_x_avatar()
    print(f"  -> {a.relative_to(ROOT)} ({a.stat().st_size // 1024} KB)")
    h = build_x_header()
    print(f"  -> {h.relative_to(ROOT)} ({h.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
