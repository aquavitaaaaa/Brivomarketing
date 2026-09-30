"""Generate branded 1080x1350 Instagram cards from portfolio screenshots.
Run: python3 /app/scripts/make_social_cards.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PUB = Path("/app/frontend/public")
OUT = PUB / "kit-assets" / "social"
OUT.mkdir(parents=True, exist_ok=True)

NAVY, GOLD, CREAM, IVORY = (11, 27, 43), (184, 134, 76), (245, 215, 164), (251, 250, 246)
SERIF_B = "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf"
SERIF_I = "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
SANS_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
W, H = 1080, 1350


def font(p, s):
    return ImageFont.truetype(p, s)


def wrap(draw, text, fnt, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if draw.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def cover(img, w, h):
    r = max(w / img.width, h / img.height)
    img = img.resize((int(img.width * r) + 1, int(img.height * r) + 1), Image.LANCZOS)
    l, t = (img.width - w) // 2, 0
    return img.crop((l, t, l + w, t + h))


def screenshot_card(slug, kicker, headline, sub, src):
    im = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(im)
    d.text((72, 84), kicker.upper(), font=font(SANS_B, 24), fill=GOLD)
    y = 132
    for ln in wrap(d, headline, font(SERIF_B, 76), W - 144):
        d.text((72, y), ln, font=font(SERIF_B, 76), fill=IVORY)
        y += 88
    shot = cover(Image.open(PUB / src).convert("RGB"), W - 144, 700)
    mask = Image.new("L", shot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, shot.width, shot.height), 28, fill=255)
    top = y + 44
    im.paste(shot, (72, top), mask)
    d.rounded_rectangle((72, top, 72 + shot.width, top + shot.height), 28, outline=GOLD, width=3)
    sy = top + shot.height + 44
    for ln in wrap(d, sub, font(SANS, 32), W - 144)[:3]:
        d.text((72, sy), ln, font=font(SANS, 32), fill=CREAM)
        sy += 44
    d.text((72, H - 84), "BRIVO", font=font(SANS_B, 28), fill=IVORY)
    d.text((W - 72 - d.textlength("@brivomarketing", font=font(SANS, 26)), H - 82),
           "@brivomarketing", font=font(SANS, 26), fill=GOLD)
    im.save(OUT / f"{slug}.jpg", quality=88, optimize=True)


def stat_card(slug, kicker, big, label, sub, bgsrc):
    bg = cover(Image.open(PUB / bgsrc).convert("RGB"), W, H).filter(ImageFilter.GaussianBlur(14))
    im = Image.blend(bg, Image.new("RGB", (W, H), NAVY), 0.82)
    d = ImageDraw.Draw(im)
    d.text((72, 84), kicker.upper(), font=font(SANS_B, 24), fill=GOLD)
    f = font(SERIF_B, 250 if len(big) <= 5 else 190)
    d.text((72, 360), big, font=f, fill=IVORY)
    d.text((76, 660), label, font=font(SERIF_I, 58), fill=GOLD)
    d.line((72, 780, 260, 780), fill=GOLD, width=4)
    y = 820
    for ln in wrap(d, sub, font(SANS, 38), W - 144)[:5]:
        d.text((72, y), ln, font=font(SANS, 38), fill=CREAM)
        y += 54
    d.text((72, H - 84), "BRIVO", font=font(SANS_B, 28), fill=IVORY)
    d.text((W - 72 - d.textlength("@brivomarketing", font=font(SANS, 26)), H - 82),
           "@brivomarketing", font=font(SANS, 26), fill=GOLD)
    im.save(OUT / f"{slug}.jpg", quality=88, optimize=True)


def photo_card(slug, kicker, headline, src):
    im = cover(Image.open(PUB / src).convert("RGB"), W, H)
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for i in range(700):
        sd.line((0, H - i, W, H - i), fill=(11, 27, 43, int(235 * (1 - i / 700))))
    im = Image.alpha_composite(im.convert("RGBA"), shade).convert("RGB")
    d = ImageDraw.Draw(im)
    lines = wrap(d, headline, font(SERIF_B, 84), W - 144)
    y = H - 170 - len(lines) * 96
    d.text((72, y - 56), kicker.upper(), font=font(SANS_B, 24), fill=GOLD)
    for ln in lines:
        d.text((72, y), ln, font=font(SERIF_B, 84), fill=IVORY)
        y += 96
    d.text((72, H - 84), "BRIVO", font=font(SANS_B, 28), fill=IVORY)
    d.text((W - 72 - d.textlength("@brivomarketing", font=font(SANS, 26)), H - 82),
           "@brivomarketing", font=font(SANS, 26), fill=GOLD)
    im.save(OUT / f"{slug}.jpg", quality=88, optimize=True)


P = "portfolio/"
screenshot_card("dwj-site", "New site shipped", "DWJ Home Services", "Snap a photo of your damaged screen. Get a price in seconds. Built for Tampa Bay pool-cage pros.", P + "dwj-desktop.jpg")
stat_card("dwj-stat", "Client build · DWJ", "$89", "a month, shown upfront", "Financing on every CTA + an AI photo estimator turns roof-of-mind into booked jobs.", P + "dwj-desktop.jpg")
photo_card("dwj-before-after", "Before / after", "Storm-wrecked to showroom-new.", P + "dwj-after.jpg")
screenshot_card("loba-site", "New site shipped", "LOBA Catskill Restaurant", "Live-fire dining, a table-finder above the fold, and a menu that names every farm.", P + "loba-desktop.jpg")
stat_card("loba-stat", "Client build · LOBA", "9", "farms, named on the menu", "A provenance ledger and seasonal storytelling that turn scrollers into reservations.", P + "loba-desktop.jpg")
photo_card("loba-hearth", "Hospitality, designed", "Come hungry. Leave with a story.", P + "loba-mobile.jpg")
screenshot_card("keepercache-site", "Case study", "KeeperCache", "Sports-management OS. Signup to activation: 12% to 47%.", P + "keepercache-desktop.jpg")
screenshot_card("koa-site", "Case study", "KOA", "A booking engine that holds its nerve at peak season.", P + "koa-desktop.jpg")
screenshot_card("instalease-site", "Case study", "InstaLease", "Premium leasing marketplace with a lead engine built in.", P + "instalease-desktop.jpg")
screenshot_card("sportbotai-site", "Case study", "SportBot AI", "Math-first credibility for an AI analytics platform.", P + "sportbotai-desktop.jpg")
screenshot_card("lawyer-site", "Case study", "Autonomous Law", "A homepage managing partners actually trust.", P + "lawyer-desktop.jpg")
stat_card("cta-audit", "Free this week", "30", "minute growth audit", "We tear down your site and funnel and hand you the three fixes worth the most revenue. DM AUDIT.", P + "keepercache-desktop.jpg")
print(sorted(p.name for p in OUT.iterdir()))
