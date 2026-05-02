"""Generate 9 square tiles for the Instagram takeover grid.

Writes to /tmp/ig-tiles/tile-01.jpg ... tile-09.jpg
Mix of real asset crops + branded poster tiles using the Brivo palette.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT  = Path(__file__).resolve().parent.parent
AS    = ROOT / "frontend" / "public" / "kit-assets"
FONTS = ROOT / "scripts" / "fonts"
OUT   = Path("/tmp/ig-tiles")
OUT.mkdir(exist_ok=True, parents=True)

SIZE = 1080
NAVY = (11, 27, 43)
GOLD = (184, 134, 76)
GOLD_HI = (212, 169, 113)
IVORY = (251, 250, 246)
CREAM = (245, 215, 164)
NAVY_SOFT = (20, 40, 63)


def center_crop(img: Image.Image, size: int) -> Image.Image:
    w, h = img.size
    s = min(w, h)
    left = (w - s) // 2
    top  = (h - s) // 2
    img = img.crop((left, top, left + s, top + s))
    return img.resize((size, size), Image.LANCZOS)


def tile_real(src: str, out: Path) -> None:
    """Center-crop and resize a real asset."""
    im = Image.open(AS / src).convert("RGB")
    center_crop(im, SIZE).save(out, "JPEG", quality=88)


def tile_color(out: Path, bg, text: str, subtext: str,
               text_color, text_font_size: int = 150, italic: bool = False,
               accent: tuple | None = None) -> None:
    im = Image.new("RGB", (SIZE, SIZE), bg)
    d = ImageDraw.Draw(im)

    font_main_path = str(FONTS / ("FrauncesItalic.ttf" if italic else "Fraunces.ttf"))
    font_sub_path  = str(FONTS / "Inter.ttf")

    font_main = ImageFont.truetype(font_main_path, text_font_size)
    font_sub  = ImageFont.truetype(font_sub_path, 36)

    # wrap main text
    lines = text.split("\n")
    total_h = sum(d.textbbox((0, 0), ln, font=font_main)[3] - d.textbbox((0, 0), ln, font=font_main)[1]
                  for ln in lines) + (len(lines) - 1) * 20
    y = (SIZE - total_h) // 2 - 40
    for ln in lines:
        bbox = d.textbbox((0, 0), ln, font=font_main)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        d.text(((SIZE - w) // 2, y), ln, fill=text_color, font=font_main)
        y += h + 20

    if subtext:
        bbox = d.textbbox((0, 0), subtext, font=font_sub)
        w = bbox[2] - bbox[0]
        d.text(((SIZE - w) // 2, SIZE - 100), subtext, fill=text_color, font=font_sub)

    if accent:
        # thin ring top-center
        ar = 60
        cx, cy = SIZE // 2, 120
        d.ellipse((cx - ar, cy - ar, cx + ar, cy + ar),
                  outline=accent, width=3)

    im.save(out, "JPEG", quality=88)


def tile_stat(out: Path, big: str, label: str, client: str) -> None:
    """Navy tile with huge gold stat number."""
    im = Image.new("RGB", (SIZE, SIZE), NAVY)
    d  = ImageDraw.Draw(im)

    # glow
    glow = Image.new("RGB", (SIZE, SIZE), NAVY)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((SIZE - 400, SIZE - 400, SIZE + 100, SIZE + 100),
               fill=(80, 60, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    im = Image.blend(im, glow, 0.6)
    d = ImageDraw.Draw(im)

    font_big   = ImageFont.truetype(str(FONTS / "Fraunces.ttf"), 290)
    font_lbl   = ImageFont.truetype(str(FONTS / "Inter.ttf"), 32)
    font_client = ImageFont.truetype(str(FONTS / "FrauncesItalic.ttf"), 42)

    bbox = d.textbbox((0, 0), big, font=font_big)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((SIZE - w) // 2, (SIZE - h) // 2 - 60), big, fill=GOLD_HI, font=font_big)

    bbox = d.textbbox((0, 0), label, font=font_lbl)
    w = bbox[2] - bbox[0]
    d.text(((SIZE - w) // 2, SIZE // 2 + 140), label, fill=IVORY, font=font_lbl)

    bbox = d.textbbox((0, 0), client, font=font_client)
    w = bbox[2] - bbox[0]
    d.text(((SIZE - w) // 2, SIZE - 130), client, fill=GOLD_HI, font=font_client)

    # small eyebrow top
    font_eye = ImageFont.truetype(str(FONTS / "Inter.ttf"), 28)
    eye = "CLIENT RECEIPTS · 2026"
    bbox = d.textbbox((0, 0), eye, font=font_eye)
    w = bbox[2] - bbox[0]
    d.text(((SIZE - w) // 2, 90), eye, fill=GOLD_HI, font=font_eye)

    im.save(out, "JPEG", quality=88)


def tile_quote(out: Path, quote: str, attribution: str,
               bg=IVORY, fg=NAVY) -> None:
    im = Image.new("RGB", (SIZE, SIZE), bg)
    d = ImageDraw.Draw(im)

    font_quote = ImageFont.truetype(str(FONTS / "FrauncesItalic.ttf"), 58)
    font_quote_big = ImageFont.truetype(str(FONTS / "Fraunces.ttf"), 220)
    font_attr = ImageFont.truetype(str(FONTS / "Inter.ttf"), 28)

    # giant opening quote
    d.text((70, 40), "\u201C", fill=GOLD, font=font_quote_big)

    # wrap quote
    words = quote.split()
    lines, cur = [], ""
    max_w = SIZE - 140
    for w in words:
        test = (cur + " " + w).strip()
        if d.textbbox((0, 0), test, font=font_quote)[2] > max_w:
            lines.append(cur)
            cur = w
        else:
            cur = test
    if cur:
        lines.append(cur)

    y = 260
    for ln in lines:
        d.text((70, y), ln, fill=fg, font=font_quote)
        y += 70

    d.text((70, SIZE - 90), f"— {attribution}", fill=GOLD, font=font_attr)

    im.save(out, "JPEG", quality=88)


def tile_wordmark_poster(out: Path, bg, fg, accent, label: str) -> None:
    im = Image.new("RGB", (SIZE, SIZE), bg)
    d = ImageDraw.Draw(im)

    # Top hairline
    d.rectangle((60, 60, SIZE - 60, 62), fill=accent)
    d.rectangle((60, SIZE - 62, SIZE - 60, SIZE - 60), fill=accent)

    # Owl crest at top-center
    owl_path = AS / "owl-logo.jpg"
    if owl_path.exists():
        owl = Image.open(owl_path).convert("RGB")
        owl = center_crop(owl, 220)
        # circular mask
        mask = Image.new("L", owl.size, 0)
        ImageDraw.Draw(mask).ellipse((0, 0, owl.size[0], owl.size[1]), fill=255)
        ox = (SIZE - 220) // 2
        oy = 170
        im.paste(owl, (ox, oy), mask)
        # gold ring
        d.ellipse((ox - 4, oy - 4, ox + 224, oy + 224), outline=accent, width=3)

    font_word = ImageFont.truetype(str(FONTS / "Fraunces.ttf"), 110)
    font_tag  = ImageFont.truetype(str(FONTS / "FrauncesItalic.ttf"), 44)
    font_lbl  = ImageFont.truetype(str(FONTS / "Inter.ttf"), 28)

    bbox = d.textbbox((0, 0), "BrivoMarketing.", font=font_word)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((SIZE - w) // 2, 470), "BrivoMarketing.", fill=fg, font=font_word)

    tag = "A brand built to move markets."
    bbox = d.textbbox((0, 0), tag, font=font_tag)
    w = bbox[2] - bbox[0]
    d.text(((SIZE - w) // 2, 640), tag, fill=accent, font=font_tag)

    bbox = d.textbbox((0, 0), label, font=font_lbl)
    w = bbox[2] - bbox[0]
    d.text(((SIZE - w) // 2, 100), label, fill=accent, font=font_lbl)

    im.save(out, "JPEG", quality=88)


def tile_press(out: Path) -> None:
    im = Image.new("RGB", (SIZE, SIZE), IVORY)
    d = ImageDraw.Draw(im)

    font_lbl = ImageFont.truetype(str(FONTS / "Inter.ttf"), 28)
    font_q = ImageFont.truetype(str(FONTS / "FrauncesItalic.ttf"), 54)
    font_outlet = ImageFont.truetype(str(FONTS / "Fraunces.ttf"), 44)

    # "AS FEATURED IN" header
    hdr = "AS FEATURED IN"
    bbox = d.textbbox((0, 0), hdr, font=font_lbl)
    w = bbox[2] - bbox[0]
    d.text(((SIZE - w) // 2, 80), hdr, fill=GOLD, font=font_lbl)
    d.rectangle(((SIZE - 100) // 2, 132, (SIZE + 100) // 2, 134), fill=GOLD)

    # outlet names stacked
    outlets = ["TechCrunch", "Forbes", "Fast Company", "Bloomberg"]
    y = 200
    for o in outlets:
        bbox = d.textbbox((0, 0), o, font=font_outlet)
        w = bbox[2] - bbox[0]
        d.text(((SIZE - w) // 2, y), o, fill=NAVY, font=font_outlet)
        y += 80

    # pull quote bottom
    quote = '\u201CThe studio every\nfounder wishes they\nhired sooner.\u201D'
    y = 640
    for ln in quote.split("\n"):
        bbox = d.textbbox((0, 0), ln, font=font_q)
        w = bbox[2] - bbox[0]
        d.text(((SIZE - w) // 2, y), ln, fill=NAVY, font=font_q)
        y += 66

    im.save(out, "JPEG", quality=88)


def main() -> None:
    # 9 tiles total, newest (top-left) first in IG reverse-chron
    #  1 (top-left)  · Wordmark poster
    #  2            · Stat +318% Obsidian
    #  3            · Quote from testimonial (Maya)
    #  4            · Real IG post (cropped)
    #  5 (center)   · Press tile "As featured in"
    #  6            · Stat +412% Vault
    #  7            · Real IG cover cropped
    #  8            · Wordmark black-on-gold
    #  9            · Real IG story cropped
    tile_wordmark_poster(OUT / "t01.jpg", NAVY, IVORY, GOLD_HI, "BRIVO · PERFORMANCE STUDIO")
    tile_stat(OUT / "t02.jpg", "+318%", "REVENUE · 90 DAYS", "Obsidian Apparel")
    tile_quote(OUT / "t03.jpg",
               "We hit our annual revenue target in five months.",
               "Maya Okonkwo, CMO · Obsidian Apparel")
    tile_real("instagram-post.jpg",  OUT / "t04.jpg")
    tile_press(OUT / "t05.jpg")
    tile_stat(OUT / "t06.jpg", "+412%", "QUALIFIED LEADS", "Vault Finance")
    tile_real("instagram-cover.jpg", OUT / "t07.jpg")
    tile_wordmark_poster(OUT / "t08.jpg", (184, 134, 76), NAVY, NAVY, "VOL. 01 · THE BRAND SYSTEM")
    tile_real("instagram-story.jpg", OUT / "t09.jpg")

    print("Generated 9 IG tiles in", OUT)


if __name__ == "__main__":
    main()
