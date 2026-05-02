"""Generate premium profile avatars featuring the Brivo owl mark.

Produces three 1080x1080 JPG variants optimised for Instagram / X / LinkedIn
/ YouTube profile photos (they all display as a centred circle crop):

    avatar-owl-dark.jpg     Owl on navy          -> primary IG + X + YT
    avatar-owl-light.jpg    Owl on ivory         -> LinkedIn company page
    avatar-owl-gold.jpg     Owl on gold          -> accent / press use

All three keep the owl mark safely inside the platform's circular crop
(we place it inside an inner circle ~82% of the canvas), so nothing gets
chopped when IG masks the image into a circle.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "frontend" / "public" / "kit-assets"
FONTS = ROOT / "scripts" / "fonts"

SIZE = 1080
NAVY = (11, 15, 20)
IVORY = (245, 241, 234)
GOLD = (201, 169, 97)
GOLD_DEEP = (166, 135, 70)
INK = (15, 24, 36)

OWL_SRC = ASSETS / "owl-logo.jpg"


def load_fraunces(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / "Fraunces.ttf"), size)


def load_inter(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / "Inter.ttf"), size)


def prepare_owl_circle(diameter: int) -> Image.Image:
    """Return a circular PNG-style crop of the owl logo, transparent edges."""
    owl = Image.open(OWL_SRC).convert("RGB")
    # Crop to square (centre) first so the owl sits in the middle
    w, h = owl.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    owl_sq = owl.crop((left, top, left + side, top + side))
    owl_sq = owl_sq.resize((diameter, diameter), Image.LANCZOS)

    # Build a circular alpha mask
    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, diameter, diameter), fill=255)

    out = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    out.paste(owl_sq, (0, 0), mask)
    return out


def draw_gold_ring(canvas: Image.Image, cx: int, cy: int, r: int,
                   thickness: int = 6, color=(201, 169, 97)) -> None:
    draw = ImageDraw.Draw(canvas)
    bbox = (cx - r, cy - r, cx + r, cy + r)
    draw.ellipse(bbox, outline=color, width=thickness)


def build_avatar(bg: tuple[int, int, int],
                 ring_color: tuple[int, int, int],
                 wordmark_color: tuple[int, int, int],
                 tagline_color: tuple[int, int, int],
                 out_name: str,
                 include_wordmark: bool = True) -> Path:
    canvas = Image.new("RGB", (SIZE, SIZE), bg)

    # Subtle radial vignette for depth
    vignette = Image.new("L", (SIZE, SIZE), 0)
    vd = ImageDraw.Draw(vignette)
    for i in range(12):
        alpha = int(6 + i * 3)
        r = int(SIZE * (0.95 - i * 0.04))
        vd.ellipse((SIZE // 2 - r, SIZE // 2 - r,
                    SIZE // 2 + r, SIZE // 2 + r), fill=alpha)
    vignette = vignette.filter(ImageFilter.GaussianBlur(40))
    darken = Image.new("RGB", (SIZE, SIZE), (0, 0, 0))
    canvas = Image.composite(canvas, darken, Image.eval(vignette, lambda v: 255 - v))

    # Owl mark — 74% of canvas, centred slightly above middle so wordmark fits
    owl_d = int(SIZE * 0.74)
    owl = prepare_owl_circle(owl_d)
    owl_x = (SIZE - owl_d) // 2
    owl_y = int(SIZE * 0.10)
    canvas.paste(owl, (owl_x, owl_y), owl)

    # Thin gold ring around owl for definition
    draw_gold_ring(canvas, SIZE // 2, owl_y + owl_d // 2, owl_d // 2 + 4,
                   thickness=4, color=ring_color)

    if include_wordmark:
        draw = ImageDraw.Draw(canvas)
        # BRIVO wordmark
        f_word = load_fraunces(110)
        word = "BRIVO"
        wbox = draw.textbbox((0, 0), word, font=f_word)
        ww = wbox[2] - wbox[0]
        wh = wbox[3] - wbox[1]
        wx = (SIZE - ww) // 2
        wy = int(SIZE * 0.82) - wh // 2
        draw.text((wx, wy), word, font=f_word, fill=wordmark_color)

        # Tagline / spaced caps
        f_tag = load_inter(28)
        tag = "A I   P E R F O R M A N C E   S T U D I O"
        tbox = draw.textbbox((0, 0), tag, font=f_tag)
        tw = tbox[2] - tbox[0]
        tx = (SIZE - tw) // 2
        ty = wy + wh + 22
        draw.text((tx, ty), tag, font=f_tag, fill=tagline_color)

    # Outer hairline frame (very subtle)
    pad = 18
    ImageDraw.Draw(canvas).rectangle(
        (pad, pad, SIZE - pad, SIZE - pad),
        outline=(ring_color[0], ring_color[1], ring_color[2]), width=2,
    )

    out_path = ASSETS / out_name
    canvas.save(out_path, "JPEG", quality=92, optimize=True, progressive=True)
    return out_path


def build_icon_avatar(bg: tuple[int, int, int],
                      ring_color: tuple[int, int, int],
                      out_name: str) -> Path:
    """Owl-dominant avatar — no wordmark. Owl fills ~94% of the canvas
    so it stays bold and recognisable even at 40px profile-pic size."""
    canvas = Image.new("RGB", (SIZE, SIZE), bg)

    # Vignette for depth
    vignette = Image.new("L", (SIZE, SIZE), 0)
    vd = ImageDraw.Draw(vignette)
    for i in range(10):
        alpha = int(5 + i * 3)
        r = int(SIZE * (0.95 - i * 0.04))
        vd.ellipse((SIZE // 2 - r, SIZE // 2 - r,
                    SIZE // 2 + r, SIZE // 2 + r), fill=alpha)
    vignette = vignette.filter(ImageFilter.GaussianBlur(40))
    darken = Image.new("RGB", (SIZE, SIZE), (0, 0, 0))
    canvas = Image.composite(canvas, darken, Image.eval(vignette, lambda v: 255 - v))

    owl_d = int(SIZE * 0.94)
    owl = prepare_owl_circle(owl_d)
    owl_x = (SIZE - owl_d) // 2
    owl_y = (SIZE - owl_d) // 2
    canvas.paste(owl, (owl_x, owl_y), owl)

    # Bold gold ring
    draw_gold_ring(canvas, SIZE // 2, SIZE // 2, owl_d // 2 + 6,
                   thickness=8, color=ring_color)

    out_path = ASSETS / out_name
    canvas.save(out_path, "JPEG", quality=94, optimize=True, progressive=True)
    return out_path


def main() -> None:
    # Primary profile avatar — owl fills the circle, no text. This is what
    # goes on IG / X / YT / TikTok profile photos.
    p = build_icon_avatar(bg=NAVY, ring_color=GOLD,
                          out_name="avatar-owl-icon.jpg")
    print(f"  -> {p.relative_to(ROOT)} ({p.stat().st_size // 1024} KB)")

    # Wordmarked variants — for press / LinkedIn / larger surfaces
    variants = [
        dict(bg=NAVY, ring_color=GOLD, wordmark_color=GOLD,
             tagline_color=(200, 188, 160), out_name="avatar-owl-dark.jpg"),
        dict(bg=IVORY, ring_color=GOLD_DEEP, wordmark_color=INK,
             tagline_color=(90, 80, 60), out_name="avatar-owl-light.jpg"),
        dict(bg=GOLD, ring_color=INK, wordmark_color=INK,
             tagline_color=(40, 30, 10), out_name="avatar-owl-gold.jpg"),
    ]
    for v in variants:
        p = build_avatar(**v)
        print(f"  -> {p.relative_to(ROOT)} ({p.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
