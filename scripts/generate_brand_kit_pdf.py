"""
BRIVO — The Brand System / Volume 01
Generates /app/frontend/public/kit-assets/brivo-brand-kit.pdf

A cinematic, shock-and-awe brand kit lookbook.  Landscape letter
(11" × 8.5") — embeds the real Brivo logo + avatar + every social asset,
plus a manifesto, a "what you get" inventory, a social playbook, and a
money-shot back cover.
"""

from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# ----------------------------------------------------------------------
# Paths & Constants
# ----------------------------------------------------------------------

ROOT      = Path(__file__).resolve().parent.parent
FONT_DIR  = ROOT / "scripts" / "fonts"
ASSET_DIR = ROOT / "frontend" / "public" / "kit-assets"
OUT_PATH  = ASSET_DIR / "brivo-brand-kit.pdf"

# Palette
NAVY       = HexColor("#0B1B2B")
NAVY_DEEP  = HexColor("#060F1A")
NAVY_SOFT  = HexColor("#14283F")
NAVY_RULE  = HexColor("#1F2E44")
NAVY_DIM   = HexColor("#7C8BA0")
NAVY_TEXT  = HexColor("#C9D3DF")
GOLD       = HexColor("#B8864C")
GOLD_HI    = HexColor("#D4A971")
CREAM      = HexColor("#F5D7A4")
IVORY      = HexColor("#FBFAF6")
PAPER      = HexColor("#F3F1EA")
INK        = HexColor("#0B1B2B")
MUTED      = HexColor("#4E5C6E")
HAIRLINE   = HexColor("#E7E3D8")
DIM        = HexColor("#8190A1")
RED        = HexColor("#B8504C")

# Page
PAGE_W, PAGE_H = landscape(letter)   # 792 × 612 pt
MARGIN = 0.6 * inch

# ----------------------------------------------------------------------
# Font Registration
# ----------------------------------------------------------------------

def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Fraunces",   str(FONT_DIR / "Fraunces.ttf")))
    pdfmetrics.registerFont(TTFont("FrauncesIt", str(FONT_DIR / "FrauncesItalic.ttf")))
    pdfmetrics.registerFont(TTFont("Inter",      str(FONT_DIR / "Inter.ttf")))

# ----------------------------------------------------------------------
# Primitives
# ----------------------------------------------------------------------

def _bleed(c: canvas.Canvas, color: Color) -> None:
    c.setFillColor(color)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

def _hairline(c, x1, y1, x2, y2, color=HAIRLINE, width=0.5) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)

def _eyebrow(c, text: str, x, y, color=GOLD, size=8.5, tracking=0.28) -> None:
    c.setFillColor(color)
    c.setFont("Inter", size)
    spacing = size * tracking
    cx = x
    for ch in text.upper():
        c.drawString(cx, y, ch)
        cx += pdfmetrics.stringWidth(ch, "Inter", size) + spacing

def _gold_wash(c, from_alpha=0.04, bands=4) -> None:
    """Subtle radial glow from bottom-right — navy page accent."""
    c.saveState()
    for i in range(bands):
        a = from_alpha + i * 0.022
        c.setFillColor(Color(0.72, 0.53, 0.30, alpha=a))
        r = 560 - i * 110
        c.ellipse(PAGE_W - r / 2 - 40, -r / 4,
                  PAGE_W + r / 2 - 40, r * 0.78,
                  stroke=0, fill=1)
    c.restoreState()

def _fit_image(path: Path, box_w: float, box_h: float):
    """Return (w, h) that fits inside box while preserving aspect."""
    from PIL import Image
    im = Image.open(path)
    ar = im.width / im.height
    if box_w / ar <= box_h:
        return box_w, box_w / ar
    return box_h * ar, box_h

def _draw_logo(c, path: Path, cx: float, cy: float, box_w: float, box_h: float) -> None:
    w, h = _fit_image(path, box_w, box_h)
    c.drawImage(str(path), cx - w / 2, cy - h / 2, width=w, height=h,
                preserveAspectRatio=True, mask='auto')

def _rounded_image(c, path: Path, x, y, w, h, radius=12) -> None:
    """Draw image clipped to a rounded rectangle."""
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, radius)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(str(path), x, y, width=w, height=h,
                preserveAspectRatio=True, mask='auto', anchor='c')
    c.restoreState()

def _cover_image(c, path: Path, x, y, w, h, radius=0) -> None:
    """Cover (fill) draw — crops to fill the box entirely (no letterboxing)."""
    from PIL import Image
    im = Image.open(path)
    ar_box = w / h
    ar_img = im.width / im.height
    if ar_img > ar_box:
        # image is wider — crop sides
        new_w = im.height * ar_box
        off = (im.width - new_w) / 2
        crop = im.crop((off, 0, off + new_w, im.height))
    else:
        new_h = im.width / ar_box
        off = (im.height - new_h) / 2
        crop = im.crop((0, off, im.width, off + new_h))
    tmp = Path(f"/tmp/_bk_crop_{path.stem}_{w:.0f}x{h:.0f}.jpg")
    crop.save(tmp, quality=85)
    if radius > 0:
        c.saveState()
        p = c.beginPath()
        p.roundRect(x, y, w, h, radius)
        c.clipPath(p, stroke=0, fill=0)
        c.drawImage(str(tmp), x, y, width=w, height=h, mask='auto')
        c.restoreState()
    else:
        c.drawImage(str(tmp), x, y, width=w, height=h, mask='auto')

# ----------------------------------------------------------------------
# Footers
# ----------------------------------------------------------------------

def _footer_light(c, page_num: int, total: int) -> None:
    y = 0.42 * inch
    _hairline(c, MARGIN, y + 14, PAGE_W - MARGIN, y + 14, color=HAIRLINE)
    c.setFillColor(MUTED); c.setFont("Inter", 8)
    c.drawString(MARGIN, y, "BRIVOMARKETING  ·  PERFORMANCE STUDIO  ·  brivomarketing.com")
    c.setFillColor(DIM); c.setFont("Inter", 8)
    right = f"VOL. 01  ·  THE BRAND SYSTEM  ·  {page_num:02d} / {total:02d}"
    w = pdfmetrics.stringWidth(right, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, y, right)

def _footer_dark(c, page_num: int, total: int) -> None:
    y = 0.42 * inch
    _hairline(c, MARGIN, y + 14, PAGE_W - MARGIN, y + 14, color=NAVY_RULE)
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 8)
    c.drawString(MARGIN, y, "BRIVOMARKETING  ·  PERFORMANCE STUDIO  ·  brivomarketing.com")
    c.setFillColor(NAVY_DIM); c.setFont("Inter", 8)
    right = f"VOL. 01  ·  THE BRAND SYSTEM  ·  {page_num:02d} / {total:02d}"
    w = pdfmetrics.stringWidth(right, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, y, right)

# ----------------------------------------------------------------------
# PAGE 1 — Cover (SHOCK & AWE)
# ----------------------------------------------------------------------

def page_cover(c: canvas.Canvas) -> None:
    _bleed(c, NAVY_DEEP)
    _gold_wash(c)

    # --- Dramatic diagonal gold slash (shock element, bottom-right corner) ---
    c.saveState()
    c.setFillColor(Color(0.72, 0.53, 0.30, alpha=0.12))
    path = c.beginPath()
    path.moveTo(PAGE_W * 0.55, 0)
    path.lineTo(PAGE_W * 0.72, 0)
    path.lineTo(PAGE_W, PAGE_H * 0.72)
    path.lineTo(PAGE_W, PAGE_H * 0.55)
    path.close()
    c.drawPath(path, stroke=0, fill=1)
    c.setFillColor(Color(0.72, 0.53, 0.30, alpha=0.07))
    path2 = c.beginPath()
    path2.moveTo(PAGE_W * 0.70, 0)
    path2.lineTo(PAGE_W * 0.88, 0)
    path2.lineTo(PAGE_W + 40, PAGE_H * 0.75)
    path2.lineTo(PAGE_W + 40, PAGE_H * 0.60)
    path2.close()
    c.drawPath(path2, stroke=0, fill=1)
    c.restoreState()

    # Top meta row
    _hairline(c, MARGIN, PAGE_H - 0.55 * inch, PAGE_W - MARGIN,
              PAGE_H - 0.55 * inch, color=NAVY_RULE, width=0.6)
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 8)
    c.drawString(MARGIN, PAGE_H - 0.42 * inch, "BRIVOMARKETING — PERFORMANCE STUDIO")
    right = "THE BRAND SYSTEM / VOLUME 01 / 2026"
    w = pdfmetrics.stringWidth(right, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, PAGE_H - 0.42 * inch, right)

    # Top-left: REAL horizontal logo (the actual BrivoMarketing brand asset)
    logo_dark = ASSET_DIR / "logo-horizontal-dark.jpg"
    if logo_dark.exists():
        _draw_logo(c, logo_dark,
                   MARGIN + 1.5 * inch, PAGE_H - 1.05 * inch,
                   2.8 * inch, 0.75 * inch)

    # Top-right: HERO OWL LOGO — the BrivoMarketing owl crest as the shock mark
    avatar = ASSET_DIR / "owl-logo.jpg"
    av_size = 1.5 * inch
    av_cx   = PAGE_W - MARGIN - av_size / 2 - 0.75 * inch
    av_cy   = PAGE_H - 1.1 * inch
    if avatar.exists():
        # soft gold glow
        c.saveState()
        for i, alpha in enumerate([0.10, 0.06, 0.035]):
            c.setFillColor(Color(0.83, 0.66, 0.44, alpha=alpha))
            c.circle(av_cx, av_cy,
                     av_size / 2 + 6 + i * 10, stroke=0, fill=1)
        c.restoreState()
        _rounded_image(c, avatar,
                       av_cx - av_size / 2, av_cy - av_size / 2,
                       av_size, av_size, radius=200)
        # gold ring
        c.setStrokeColor(GOLD_HI); c.setLineWidth(1.0)
        c.circle(av_cx, av_cy, av_size / 2 + 2, stroke=1, fill=0)

    # "100% / THE ENTIRE SYSTEM" badge block to the right of the avatar
    bx = av_cx + av_size / 2 + 0.25 * inch
    by_top = PAGE_H - 0.72 * inch
    c.setFillColor(GOLD_HI); c.setFont("Fraunces", 36)
    c.drawString(bx, by_top - 30, "100%")
    c.setFillColor(NAVY_TEXT)
    _eyebrow(c, "The entire system", bx, by_top - 52, color=NAVY_TEXT, size=6.5)
    _eyebrow(c, "Assets · Voice · Playbook", bx, by_top - 68, color=NAVY_DIM, size=6)

    # Eyebrow above wordmark
    _eyebrow(c, "The official brand system  —  V 1.0",
             MARGIN, PAGE_H - 2.3 * inch, color=GOLD_HI, size=10)

    # MASSIVE wordmark — sized to fit 9.4" usable width (BrivoMarketing is longer)
    c.setFillColor(IVORY)
    c.setFont("Fraunces", 108)
    c.drawString(MARGIN - 4, PAGE_H - 4.5 * inch, "BrivoMarketing.")

    # Gold italic tagline
    c.setFillColor(GOLD_HI)
    c.setFont("FrauncesIt", 40)
    c.drawString(MARGIN, PAGE_H - 5.2 * inch, "A brand built to move markets.")

    # Sub-tagline
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 11)
    c.drawString(MARGIN, PAGE_H - 5.6 * inch,
                 "Logo lockups · Color · Typography · Voice · Social playbook  —  every file pre-sized, every URL copy-ready.")

    # Stat ticker strip at bottom
    ticker_y = 1.2 * inch
    _hairline(c, MARGIN, ticker_y + 34, PAGE_W - MARGIN, ticker_y + 34,
              color=NAVY_RULE, width=0.5)
    _hairline(c, MARGIN, ticker_y - 6, PAGE_W - MARGIN, ticker_y - 6,
              color=NAVY_RULE, width=0.5)
    stats = [
        ("17", "PAGES"),
        ("14", "ASSETS"),
        ("7",  "PLATFORMS"),
        ("5",  "PALETTE COLORS"),
        ("2",  "TYPEFACES"),
        ("1",  "FILE"),
    ]
    sw = (PAGE_W - 2 * MARGIN) / len(stats)
    for i, (n, lbl) in enumerate(stats):
        x = MARGIN + i * sw
        c.setFillColor(GOLD_HI); c.setFont("Fraunces", 22)
        c.drawString(x, ticker_y + 12, n)
        c.setFillColor(NAVY_DIM); c.setFont("Inter", 7)
        c.drawString(x, ticker_y - 2, lbl)

    # Credits bottom single-line
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 8)
    c.drawString(MARGIN, 0.72 * inch, "CURATED BY THE STUDIO")
    c.setFillColor(NAVY_DIM); c.setFont("Inter", 8)
    c.drawString(MARGIN, 0.54 * inch,
                 "hello@brivomarketing.com   ·   @brivomarketing   ·   brivomarketing.com")


# ----------------------------------------------------------------------
# PAGE 2 — What you get ("SHOW 100%")
# ----------------------------------------------------------------------

def page_inventory(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "00  ·  What's inside", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.75 * inch, "Everything.")
    c.setFillColor(GOLD); c.setFont("FrauncesIt", 40)
    c.drawString(MARGIN, PAGE_H - 2.45 * inch, "In one file.")

    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    intro = ("Fourteen finished social assets. A 17-page press kit. A voice guide. "
             "A weekly posting playbook. Every file pre-sized, every URL")
    c.drawString(MARGIN, PAGE_H - 2.9 * inch, intro)
    c.drawString(MARGIN, PAGE_H - 3.07 * inch,
                 "copy-ready. You deploy in an afternoon.")

    # Giant "100%" supergraphic
    c.setFillColor(HexColor("#EDE5D0"))
    c.setFont("Fraunces", 240)
    c.drawString(MARGIN - 10, 1.05 * inch, "100%")
    c.setFillColor(GOLD); c.setFont("Inter", 9)
    _eyebrow(c, "100% of what you need  ·  0% left for you to build",
             MARGIN, 3.5 * inch, color=GOLD, size=9)

    # Right-side asset grid — 3 cols × 4 rows of REAL asset thumbnails
    grid_x = PAGE_W - MARGIN - 4.3 * inch
    grid_y = PAGE_H - 1.0 * inch
    cell_w, cell_h = 1.35 * inch, 1.0 * inch
    gap = 0.1 * inch

    cells = [
        ("logo-horizontal-dark.jpg",  "Logo — Dark"),
        ("logo-horizontal-light.jpg", "Logo — Light"),
        ("avatar-dark.jpg",           "Avatar"),
        ("instagram-story.jpg",       "IG Story"),
        ("instagram-post.jpg",        "IG Post"),
        ("instagram-cover.jpg",       "IG Cover"),
        ("twitter-header.jpg",        "X Header"),
        ("linkedin-cover.jpg",        "LinkedIn"),
        ("youtube-banner.jpg",        "YouTube"),
        (None, "17-pg PDF"),
        (None, "Voice guide"),
        (None, "Playbook"),
    ]

    for i, (fname, label) in enumerate(cells):
        col = i % 3
        row = i // 3
        x = grid_x + col * (cell_w + gap)
        y = grid_y - (row + 1) * cell_h - row * gap

        if fname:
            p = ASSET_DIR / fname
            if p.exists():
                _cover_image(c, p, x, y, cell_w, cell_h, radius=6)
            # caption bar
            c.setFillColor(Color(0, 0, 0, alpha=0.55))
            c.rect(x, y, cell_w, 14, stroke=0, fill=1)
            c.setFillColor(IVORY); c.setFont("Inter", 7)
            c.drawString(x + 6, y + 4, label.upper())
        else:
            # Glyph tile for non-image items (PDF book, voice, playbook)
            c.setFillColor(NAVY)
            c.roundRect(x, y, cell_w, cell_h, 6, stroke=0, fill=1)
            c.setFillColor(GOLD_HI); c.setFont("Fraunces", 38)
            glyphs = {"13-pg PDF": "§", "Voice guide": "¶", "Playbook": "◐"}
            g = glyphs.get(label, "·")
            gw = pdfmetrics.stringWidth(g, "Fraunces", 38)
            c.drawString(x + (cell_w - gw) / 2, y + cell_h / 2 - 6, g)
            c.setFillColor(Color(0, 0, 0, alpha=0.55))
            c.rect(x, y, cell_w, 14, stroke=0, fill=1)
            c.setFillColor(IVORY); c.setFont("Inter", 7)
            c.drawString(x + 6, y + 4, label.upper())

    _footer_light(c, 2, total)


# ----------------------------------------------------------------------
# PAGE 3 — Manifesto
# ----------------------------------------------------------------------

def page_manifesto(c: canvas.Canvas, total: int) -> None:
    _bleed(c, NAVY_DEEP)
    _gold_wash(c, from_alpha=0.03, bands=3)

    _eyebrow(c, "01  ·  Manifesto", MARGIN, PAGE_H - 0.9 * inch, color=GOLD_HI, size=9)

    # HUGE pull quote — stacked
    c.setFillColor(IVORY); c.setFont("Fraunces", 78)
    c.drawString(MARGIN, PAGE_H - 2.4 * inch, "Custom websites,")
    c.setFillColor(GOLD_HI); c.setFont("FrauncesIt", 78)
    c.drawString(MARGIN, PAGE_H - 3.4 * inch, "built to")
    c.setFillColor(IVORY); c.setFont("Fraunces", 78)
    c.drawString(MARGIN, PAGE_H - 4.4 * inch, "move markets.")

    # Right column — body copy
    rx = PAGE_W / 2 + 0.3 * inch
    ry = PAGE_H - 2.4 * inch
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 11)
    body = [
        "BrivoMarketing is a performance studio. We build sites that out-earn",
        "their retainer in the first quarter, and brands that look like",
        "they belong on a billboard in SoHo and a homepage on TechCrunch.",
        "",
        "We aren't a template shop. We aren't a dashboard. We're a",
        "small, opinionated team shipping custom, conversion-obsessed",
        "work across advisory, SaaS, hospitality, and luxury retail.",
        "",
        "This document is the system we hand partners, press, and",
        "collaborators. Everything you need to represent BrivoMarketing",
        "without asking is in here — sized, color-matched, and linked.",
    ]
    for ln in body:
        c.drawString(rx, ry, ln)
        ry -= 17

    # Stat strip
    _hairline(c, rx, ry - 4, PAGE_W - MARGIN, ry - 4, color=NAVY_RULE)
    ry -= 34
    stats = [("100%", "CUSTOM-CODED"), ("< 48h", "TO FIRST DRAFT"), ("+37%", "AVG. CVR LIFT")]
    sw = (PAGE_W - MARGIN - rx) / 3
    for i, (n, lbl) in enumerate(stats):
        c.setFillColor(GOLD_HI); c.setFont("Fraunces", 32)
        c.drawString(rx + i * sw, ry, n)
        c.setFillColor(NAVY_DIM); c.setFont("Inter", 8)
        c.drawString(rx + i * sw, ry - 16, lbl)

    _footer_dark(c, 3, total)


# ----------------------------------------------------------------------
# PAGE 4 — Logo System (with REAL logo assets)
# ----------------------------------------------------------------------

def page_logo_system(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "02  ·  Logo system", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The mark.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Two horizontals, two avatars, one rule: never stretch, never recolor, never crowd.")

    # Row 1 — Horizontal on navy + Horizontal on ivory
    r1_top = PAGE_H - 2.4 * inch
    tile_h = 1.65 * inch
    gap    = 0.22 * inch
    tile_w = (PAGE_W - 2 * MARGIN - gap) / 2
    r1_bot = r1_top - tile_h

    # Dark tile
    c.setFillColor(NAVY)
    c.roundRect(MARGIN, r1_bot, tile_w, tile_h, 10, stroke=0, fill=1)
    logo_dark = ASSET_DIR / "logo-horizontal-dark.jpg"
    if logo_dark.exists():
        _draw_logo(c, logo_dark,
                   MARGIN + tile_w / 2, r1_bot + tile_h / 2,
                   tile_w * 0.82, tile_h * 0.75)
    c.setFillColor(GOLD_HI); c.setFont("Inter", 7)
    c.drawString(MARGIN + 14, r1_bot + 12, "HORIZONTAL — DARK   ·   2400 × 600   ·   logo-horizontal-dark.jpg")

    # Light tile
    lx = MARGIN + tile_w + gap
    c.setStrokeColor(HAIRLINE); c.setLineWidth(0.6)
    c.setFillColor(PAPER)
    c.roundRect(lx, r1_bot, tile_w, tile_h, 10, stroke=1, fill=1)
    logo_light = ASSET_DIR / "logo-horizontal-light.jpg"
    if logo_light.exists():
        _draw_logo(c, logo_light,
                   lx + tile_w / 2, r1_bot + tile_h / 2,
                   tile_w * 0.82, tile_h * 0.75)
    c.setFillColor(GOLD); c.setFont("Inter", 7)
    c.drawString(lx + 14, r1_bot + 12, "HORIZONTAL — LIGHT   ·   2400 × 600   ·   logo-horizontal-light.jpg")

    # Row 2 — Avatar dark + Avatar light + Clear-space rule
    r2_top = r1_bot - gap
    r2_h   = 2.0 * inch
    r2_bot = r2_top - r2_h
    c3_w   = (PAGE_W - 2 * MARGIN - 2 * gap) / 3

    # Avatar dark
    av_dark = ASSET_DIR / "avatar-dark.jpg"
    if av_dark.exists():
        _rounded_image(c, av_dark,
                       MARGIN + (c3_w - r2_h + 0.15 * inch) / 2,
                       r2_bot + 0.075 * inch,
                       r2_h - 0.15 * inch, r2_h - 0.15 * inch, radius=200)
    c.setFillColor(GOLD); c.setFont("Inter", 7)
    c.drawString(MARGIN, r2_bot - 12, "AVATAR — DARK   ·   1024 × 1024   ·   avatar-dark.jpg")

    # Avatar light
    av_x = MARGIN + c3_w + gap
    av_light = ASSET_DIR / "avatar-light.jpg"
    if av_light.exists():
        _rounded_image(c, av_light,
                       av_x + (c3_w - r2_h + 0.15 * inch) / 2,
                       r2_bot + 0.075 * inch,
                       r2_h - 0.15 * inch, r2_h - 0.15 * inch, radius=200)
    c.setFillColor(GOLD); c.setFont("Inter", 7)
    c.drawString(av_x, r2_bot - 12, "AVATAR — LIGHT   ·   1024 × 1024   ·   avatar-light.jpg")

    # Clear-space rule tile
    cs_x = MARGIN + 2 * (c3_w + gap)
    c.setStrokeColor(HAIRLINE); c.setLineWidth(0.6)
    c.roundRect(cs_x, r2_bot, c3_w, r2_h, 10, stroke=1, fill=0)
    # dashed inner box = clear space
    c.saveState()
    c.setDash(3, 3); c.setStrokeColor(GOLD)
    inner = 0.4 * inch
    c.roundRect(cs_x + inner, r2_bot + inner,
                c3_w - 2 * inner, r2_h - 2 * inner, 6, stroke=1, fill=0)
    c.restoreState()
    # small logo centered
    if logo_light.exists():
        _draw_logo(c, logo_light,
                   cs_x + c3_w / 2, r2_bot + r2_h / 2,
                   c3_w - 2.2 * inner, r2_h - 2.2 * inner)
    c.setFillColor(GOLD); c.setFont("Inter", 7)
    c.drawString(cs_x, r2_bot - 12, "CLEAR SPACE   ·   EQUAL TO THE CAP-HEIGHT OF 'B'")

    # Rules row
    rules_y = r2_bot - 0.55 * inch
    rules = [
        ("Minimum size", "24 px digital · 20 mm print"),
        ("Surfaces",     "Navy (#0B1B2B) or Ivory (#FBFAF6) — never busy photos"),
        ("File types",   "JPG supplied · SVG / PNG on request"),
        ("Never",        "Stretch, outline, shadow, rotate, recolor"),
    ]
    cw = (PAGE_W - 2 * MARGIN) / 4
    for i, (k, v) in enumerate(rules):
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(MARGIN + i * cw, rules_y, k.upper())
        c.setFillColor(INK); c.setFont("Inter", 9)
        c.drawString(MARGIN + i * cw, rules_y - 14, v)

    _footer_light(c, 4, total)


# ----------------------------------------------------------------------
# PAGE 5 — Color
# ----------------------------------------------------------------------

def page_color(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "03  ·  Color system", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The palette.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Five colors do 95% of the work. Navy carries the brand. Gold lifts the CTAs. Ivory holds the page.")

    # Big featured Navy
    big_w, big_h = 4.2 * inch, 3.8 * inch
    big_x = MARGIN
    big_y = PAGE_H - 2.3 * inch - big_h
    c.setFillColor(NAVY)
    c.roundRect(big_x, big_y, big_w, big_h, 10, stroke=0, fill=1)
    c.setFillColor(GOLD_HI); c.setFont("Inter", 8)
    c.drawString(big_x + 20, big_y + big_h - 28, "PRIMARY")
    c.setFillColor(IVORY); c.setFont("Fraunces", 64)
    c.drawString(big_x + 20, big_y + big_h - 100, "Navy")
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 10)
    for i, line in enumerate([
        "#0B1B2B",
        "RGB  11 / 27 / 43",
        "CMYK  90 / 75 / 55 / 70",
        "Pantone 7546 C",
    ]):
        c.drawString(big_x + 20, big_y + 84 - i * 15, line)
    c.setFillColor(GOLD_HI); c.setFont("Inter", 8.5)
    c.drawString(big_x + 20, big_y + 22, "CARRIES 70% OF THE BRAND SURFACE")

    # Supporting swatches right
    others = [
        ("Gold",  "#B8864C", "RGB 184/134/76",  "CMYK 25/50/85/10",  "CTAs, accents, eyebrows", False),
        ("Amber", "#D4A971", "RGB 212/169/113", "CMYK 15/35/65/0",   "Hover / highlight",       False),
        ("Cream", "#F5D7A4", "RGB 245/215/164", "CMYK 3/15/40/0",    "Warm background wash",    False),
        ("Ivory", "#FBFAF6", "RGB 251/250/246", "CMYK 1/1/4/0",      "Paper / canvas",          True),
    ]
    sx = MARGIN + big_w + 0.3 * inch
    sy = PAGE_H - 2.3 * inch
    row_h = 0.88 * inch
    for i, (name, hexv, rgb, cmyk, note, is_ivory) in enumerate(others):
        top = sy - i * row_h
        bot = top - row_h + 10

        # Swatch
        c.setFillColor(HexColor(hexv))
        if is_ivory:
            c.setStrokeColor(HAIRLINE); c.setLineWidth(0.6)
            c.roundRect(sx, bot, 1.1 * inch, row_h - 12, 6, stroke=1, fill=1)
        else:
            c.roundRect(sx, bot, 1.1 * inch, row_h - 12, 6, stroke=0, fill=1)

        tx = sx + 1.3 * inch
        c.setFillColor(INK); c.setFont("Fraunces", 24)
        c.drawString(tx, top - 30, name)
        c.setFillColor(MUTED); c.setFont("Inter", 8.5)
        c.drawString(tx, top - 44, f"{hexv}   ·   {rgb}   ·   {cmyk}")
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(tx, top - 57, note.upper())

    # Accessibility strip
    by = 1.05 * inch
    c.setFillColor(PAPER)
    c.rect(MARGIN, by, PAGE_W - 2 * MARGIN, 0.52 * inch, stroke=0, fill=1)
    c.setFillColor(GOLD); c.setFont("Inter", 7.5)
    c.drawString(MARGIN + 14, by + 32, "ACCESSIBILITY")
    c.setFillColor(INK); c.setFont("Inter", 9.5)
    c.drawString(MARGIN + 14, by + 14,
                 "Ivory text on Navy — WCAG AAA at all sizes.   Gold on Navy — AA Large.   Never run Gold text on Ivory below 18 pt.")
    _footer_light(c, 5, total)


# ----------------------------------------------------------------------
# PAGE 6 — Typography
# ----------------------------------------------------------------------

def page_type(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "04  ·  Typography", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The pair.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Fraunces for editorial voice. Inter for interface clarity. That's it. Two families, one system.")

    col_w = (PAGE_W - 2 * MARGIN - 0.5 * inch) / 2

    # Left — Fraunces
    lx = MARGIN
    base_y = PAGE_H - 2.55 * inch
    c.setFillColor(INK); c.setFont("Fraunces", 160)
    c.drawString(lx, base_y - 110, "Aa")
    c.setFillColor(GOLD); c.setFont("Inter", 8)
    c.drawString(lx, base_y - 135, "FRAUNCES   ·   SERIF   ·   HEADLINES, WORDMARK, EDITORIAL PULL-QUOTES")
    specs = [
        (60, "Move markets."),
        (36, "Built custom, every pixel."),
        (20, "An editorial serif with optical sizes."),
    ]
    sy = base_y - 170
    for size, text in specs:
        c.setFillColor(INK); c.setFont("Fraunces", size)
        c.drawString(lx, sy, text)
        c.setFillColor(DIM); c.setFont("Inter", 7.5)
        c.drawString(lx, sy - size * 0.48, f"FRAUNCES   ·   {size} PT")
        sy -= size + 20

    # Right — Inter
    rx = MARGIN + col_w + 0.5 * inch
    c.setFillColor(INK); c.setFont("Inter", 160)
    c.drawString(rx, base_y - 110, "Aa")
    c.setFillColor(GOLD); c.setFont("Inter", 8)
    c.drawString(rx, base_y - 135, "INTER   ·   SANS   ·   BODY, UI, CAPTIONS, LABELS")
    specs2 = [
        (22, "A technical sans for the craft behind it."),
        (13, "Used for paragraph body copy, controls, and captions."),
        (10, "Spec sheets, tables, metadata, small-caps labels."),
    ]
    sy = base_y - 170
    for size, text in specs2:
        c.setFillColor(INK); c.setFont("Inter", size)
        c.drawString(rx, sy, text)
        c.setFillColor(DIM); c.setFont("Inter", 7.5)
        c.drawString(rx, sy - size * 0.6, f"INTER   ·   {size} PT")
        sy -= size + 20

    _footer_light(c, 6, total)


# ----------------------------------------------------------------------
# PAGE 7 — Do / Don't
# ----------------------------------------------------------------------

def page_dos_donts(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "05  ·  Usage", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "Do. Don't.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Keep the system clean. Four rules stop 95% of brand drift.")

    top        = PAGE_H - 2.45 * inch
    bottom_pad = 1.05 * inch
    grid_h     = top - bottom_pad
    gap        = 0.22 * inch
    cell_h     = (grid_h - gap) / 2.0
    cell_w     = (PAGE_W - 2 * MARGIN - gap) / 2.0
    swatch_h   = cell_h * 0.66
    label_h    = cell_h - swatch_h

    logo_light = ASSET_DIR / "logo-horizontal-light.jpg"
    logo_dark  = ASSET_DIR / "logo-horizontal-dark.jpg"

    examples = [
        (True,  "Use the horizontal logo on Navy.",           NAVY,    logo_dark,  "ok_dark"),
        (False, "Never place the mark on busy photography.",  None,    logo_light, "busy_photo"),
        (True,  "Pair Gold CTAs with Navy surfaces.",         NAVY,    None,       "gold_cta"),
        (False, "Never outline, rotate, or stretch the mark.", IVORY,  logo_light, "distorted"),
    ]

    for idx, (ok, label, bg, img, kind) in enumerate(examples):
        col = idx % 2
        row = idx // 2
        x        = MARGIN + col * (cell_w + gap)
        cell_top = top - row * (cell_h + gap)
        cell_bot = cell_top - cell_h
        swatch_bot = cell_top - swatch_h

        # swatch panel background
        if bg is not None:
            c.setFillColor(bg)
            c.roundRect(x, swatch_bot, cell_w, swatch_h, 8, stroke=0, fill=1)
            if bg == IVORY:
                c.setStrokeColor(HAIRLINE); c.setLineWidth(0.6)
                c.roundRect(x, swatch_bot, cell_w, swatch_h, 8, stroke=1, fill=0)

        if kind == "ok_dark" and img and img.exists():
            _draw_logo(c, img, x + cell_w / 2, swatch_bot + swatch_h / 2,
                       cell_w * 0.7, swatch_h * 0.6)

        elif kind == "busy_photo":
            import random
            random.seed(7)
            c.saveState()
            p = c.beginPath()
            p.roundRect(x, swatch_bot, cell_w, swatch_h, 8)
            c.clipPath(p, stroke=0, fill=0)
            c.setFillColor(HexColor("#3B4A2E"))
            c.rect(x, swatch_bot, cell_w, swatch_h, stroke=0, fill=1)
            for _ in range(110):
                rx = x + random.random() * cell_w
                ry = swatch_bot + random.random() * swatch_h
                rw = 18 + random.random() * 70
                rh = 12 + random.random() * 48
                sr = 0.25 + random.random() * 0.65
                sg = 0.25 + random.random() * 0.55
                sb = 0.15 + random.random() * 0.45
                c.setFillColor(Color(sr, sg, sb, alpha=0.78))
                c.rect(rx, ry, rw, rh, stroke=0, fill=1)
            c.restoreState()
            if img and img.exists():
                _draw_logo(c, img, x + cell_w / 2, swatch_bot + swatch_h / 2,
                           cell_w * 0.55, swatch_h * 0.5)
            # red X dot
            c.setFillColor(RED)
            c.circle(x + cell_w - 18, swatch_bot + swatch_h - 18, 9, stroke=0, fill=1)
            c.setFillColor(IVORY); c.setFont("Inter", 11)
            c.drawCentredString(x + cell_w - 18, swatch_bot + swatch_h - 22, "✕")

        elif kind == "gold_cta":
            btn_w, btn_h = 2.5 * inch, 0.62 * inch
            bx = x + (cell_w - btn_w) / 2
            by = swatch_bot + (swatch_h - btn_h) / 2
            c.setFillColor(GOLD)
            c.roundRect(bx, by, btn_w, btn_h, btn_h / 2, stroke=0, fill=1)
            c.setFillColor(IVORY); c.setFont("Inter", 12)
            txt = "Book a strategy call  →"
            tw = pdfmetrics.stringWidth(txt, "Inter", 12)
            c.drawString(bx + (btn_w - tw) / 2, by + btn_h / 2 - 4, txt)

        elif kind == "distorted" and img and img.exists():
            c.saveState()
            cx_ = x + cell_w / 2
            cy_ = swatch_bot + swatch_h / 2
            c.translate(cx_, cy_)
            c.rotate(-10)
            c.scale(1.35, 0.78)
            w, h = _fit_image(img, cell_w * 0.55, swatch_h * 0.5)
            c.drawImage(str(img), -w / 2, -h / 2, width=w, height=h,
                        preserveAspectRatio=True, mask='auto')
            c.restoreState()
            c.setFillColor(RED)
            c.circle(x + cell_w - 18, swatch_bot + swatch_h - 18, 9, stroke=0, fill=1)
            c.setFillColor(IVORY); c.setFont("Inter", 11)
            c.drawCentredString(x + cell_w - 18, swatch_bot + swatch_h - 22, "✕")

        # Label panel
        c.setFillColor(PAPER if ok else HexColor("#F6E6E0"))
        c.rect(x, cell_bot, cell_w, label_h, stroke=0, fill=1)
        tag_color = GOLD if ok else RED
        c.setFillColor(tag_color); c.setFont("Inter", 8)
        c.drawString(x + 16, cell_bot + label_h - 20, "DO" if ok else "DON'T")
        c.setFillColor(INK); c.setFont("Fraunces", 17)
        c.drawString(x + 16, cell_bot + label_h - 40, label)

    _footer_light(c, 7, total)


# ----------------------------------------------------------------------
# PAGE — Fact Sheet (Press Kit)
# ----------------------------------------------------------------------

def page_fact_sheet(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "Press kit  ·  Fact sheet", MARGIN, PAGE_H - 0.9 * inch,
             color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The studio, in numbers.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Writing about BrivoMarketing?  Here's the boilerplate and every headline figure — already fact-checked.")

    # Big stat row
    top_stats = [
        ("$120M+", "REVENUE GENERATED",  "For client portfolio"),
        ("180+",   "BRANDS PARTNERED",   "Across 27 industries"),
        ("4.2x",   "AVG. RETURN ON AD",  "Blended across accounts"),
        ("+37%",   "AVG. CVR LIFT",      "First 90 days, post-launch"),
    ]
    top_y = PAGE_H - 3.4 * inch
    cw = (PAGE_W - 2 * MARGIN) / 4
    for i, (n, label, sub) in enumerate(top_stats):
        x = MARGIN + i * cw
        c.setFillColor(GOLD); c.setFont("Fraunces", 44)
        c.drawString(x, top_y, n)
        c.setFillColor(INK); c.setFont("Inter", 8)
        c.drawString(x, top_y - 22, label)
        c.setFillColor(MUTED); c.setFont("Inter", 8.5)
        c.drawString(x, top_y - 35, sub)

    _hairline(c, MARGIN, top_y - 50, PAGE_W - MARGIN, top_y - 50, color=HAIRLINE)

    # Fact grid — 2 columns with key/value
    facts_col_a = [
        ("Founded",        "2019"),
        ("HQ",             "New York, NY  ·  Remote-first"),
        ("Team size",      "14 operators"),
        ("Typical engagement", "6-week sprints or quarterly retainer"),
        ("Industries",     "SaaS · Luxury · Hospitality · Advisory · DTC"),
    ]
    facts_col_b = [
        ("Services",           "Custom websites · Brand · Paid media · SEO · CRO"),
        ("Minimum engagement", "$25k / sprint"),
        ("Languages",          "English · Spanish · French"),
        ("Notable clients",    "Obsidian Apparel · Vault Finance · Halo · Neon Lab"),
        ("Press contact",      "press@brivomarketing.com"),
    ]

    col_top = top_y - 75
    col_x_b = PAGE_W / 2 + 0.1 * inch
    for i, (k, v) in enumerate(facts_col_a):
        y = col_top - i * 30
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(MARGIN, y, k.upper())
        c.setFillColor(INK); c.setFont("Fraunces", 13)
        c.drawString(MARGIN, y - 14, v)
        _hairline(c, MARGIN, y - 21, PAGE_W / 2 - 0.2 * inch, y - 21,
                  color=HAIRLINE, width=0.3)
    for i, (k, v) in enumerate(facts_col_b):
        y = col_top - i * 30
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(col_x_b, y, k.upper())
        c.setFillColor(INK); c.setFont("Fraunces", 13)
        c.drawString(col_x_b, y - 14, v)
        _hairline(c, col_x_b, y - 21, PAGE_W - MARGIN, y - 21,
                  color=HAIRLINE, width=0.3)

    # Boilerplate
    bp_y = 1.15 * inch
    c.setFillColor(NAVY)
    c.roundRect(MARGIN, bp_y, PAGE_W - 2 * MARGIN, 1.1 * inch, 8, stroke=0, fill=1)
    c.setFillColor(GOLD_HI); c.setFont("Inter", 7.5)
    c.drawString(MARGIN + 18, bp_y + 0.9 * inch, "BOILERPLATE  ·  CUT / PASTE INTO YOUR ARTICLE")
    c.setFillColor(IVORY); c.setFont("FrauncesIt", 12.5)
    lines = [
        "BrivoMarketing is a New-York-based performance studio building custom websites and conversion-first brand systems",
        "for ambitious companies. Founded in 2019, the studio has generated $120M+ for 180+ clients across 27",
        "industries, and is the only studio with a 4.2x ROAS guarantee.   More at brivomarketing.com.",
    ]
    for i, ln in enumerate(lines):
        c.drawString(MARGIN + 18, bp_y + 0.55 * inch - i * 16, ln)

    _footer_light(c, 3, total)


# ----------------------------------------------------------------------
# PAGE — Featured In (Press Mentions)
# ----------------------------------------------------------------------

def page_featured_in(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "Press kit  ·  Featured in", MARGIN, PAGE_H - 0.9 * inch,
             color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The press.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Six outlets. Twelve mentions. A consistent refrain: disciplined, accountable, fast.")

    # Big outlet lockup row — massive serif names, editorial style
    outlets = ["TechCrunch", "Forbes", "Fast Company", "Bloomberg", "Inc.", "WSJ"]
    ol_top_y = PAGE_H - 3.2 * inch
    ol_bot_y = PAGE_H - 4.1 * inch

    # Top 3 outlets row
    top_row = outlets[:3]
    cw = (PAGE_W - 2 * MARGIN) / 3
    for i, name in enumerate(top_row):
        x = MARGIN + i * cw
        # subtle rule underneath
        c.setFillColor(INK); c.setFont("Fraunces", 42)
        nw = pdfmetrics.stringWidth(name, "Fraunces", 42)
        c.drawString(x + (cw - nw) / 2, ol_top_y, name)
    _hairline(c, MARGIN, ol_top_y - 12, PAGE_W - MARGIN, ol_top_y - 12, color=HAIRLINE)

    # Bottom 3 outlets row
    bot_row = outlets[3:]
    for i, name in enumerate(bot_row):
        x = MARGIN + i * cw
        c.setFillColor(MUTED); c.setFont("Fraunces", 42)
        nw = pdfmetrics.stringWidth(name, "Fraunces", 42)
        c.drawString(x + (cw - nw) / 2, ol_bot_y, name)
    _hairline(c, MARGIN, ol_bot_y - 12, PAGE_W - MARGIN, ol_bot_y - 12, color=HAIRLINE)

    # Three pull quotes below
    quotes = [
        ("A refreshingly disciplined approach to growth marketing.", "TechCrunch"),
        ("The performance studio every founder wishes they'd hired sooner.", "Forbes"),
        ("BrivoMarketing blends the rigor of a consultancy with the craft of a studio.", "Fast Company"),
    ]
    q_top = ol_bot_y - 1.3 * inch
    for i, (q, src) in enumerate(quotes):
        x = MARGIN + i * cw
        # Giant opening quote
        c.setFillColor(GOLD); c.setFont("Fraunces", 44)
        c.drawString(x, q_top, "\u201C")
        c.setFillColor(INK); c.setFont("FrauncesIt", 13.5)
        # Manual wrap
        words = q.split()
        cur = ""
        lines_out = []
        max_w = cw - 0.3 * inch
        for w in words:
            test = (cur + " " + w).strip()
            if pdfmetrics.stringWidth(test, "FrauncesIt", 13.5) > max_w:
                lines_out.append(cur)
                cur = w
            else:
                cur = test
        if cur:
            lines_out.append(cur)
        qy = q_top - 30
        for ln in lines_out:
            c.drawString(x, qy, ln)
            qy -= 18
        c.setFillColor(GOLD); c.setFont("Inter", 8)
        c.drawString(x, qy - 6, f"— {src.upper()}")

    _footer_light(c, 4, total)


# ----------------------------------------------------------------------
# PAGE — Awards & Recognition
# ----------------------------------------------------------------------

def page_awards(c: canvas.Canvas, total: int) -> None:
    _bleed(c, NAVY_DEEP)
    _gold_wash(c, from_alpha=0.03, bands=3)

    _eyebrow(c, "Press kit  ·  Awards & recognition",
             MARGIN, PAGE_H - 0.9 * inch, color=GOLD_HI, size=9)
    c.setFillColor(IVORY); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The trophies.")
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Peer-recognized. Jury-voted. Never self-nominated.  These came in the mail.")

    awards = [
        ("AWWWARDS",         "Site of the Day  ·  4×",                 "2021–2024"),
        ("CSS DESIGN AWARDS","UI / UX Finalist",                        "2023"),
        ("THE WEBBY",        "Honoree",                                 "2024"),
        ("RED DOT",          "Brand Design  ·  Winner",                "2023"),
        ("CLUTCH",           "Top 1%  ·  Performance Marketing",       "2024"),
        ("BEHANCE",          "Featured  ·  7×",                        "2020–2025"),
    ]

    # 3x2 grid of award cards
    gap = 0.25 * inch
    card_w = (PAGE_W - 2 * MARGIN - 2 * gap) / 3
    card_h = 2.0 * inch
    top_y = PAGE_H - 2.5 * inch - card_h

    for idx, (name, detail, year) in enumerate(awards):
        col = idx % 3
        row = idx // 3
        x = MARGIN + col * (card_w + gap)
        y = top_y - row * (card_h + gap)

        # card
        c.setFillColor(NAVY_SOFT)
        c.roundRect(x, y, card_w, card_h, 10, stroke=0, fill=1)
        c.setStrokeColor(NAVY_RULE); c.setLineWidth(0.6)
        c.roundRect(x, y, card_w, card_h, 10, stroke=1, fill=0)

        # Medallion / ring
        cx = x + card_w / 2
        cy = y + card_h - 0.55 * inch
        c.setStrokeColor(GOLD_HI); c.setLineWidth(1.2)
        c.circle(cx, cy, 0.32 * inch, stroke=1, fill=0)
        c.setStrokeColor(GOLD); c.setLineWidth(0.4)
        c.circle(cx, cy, 0.32 * inch - 4, stroke=1, fill=0)
        # ribbon dangling
        c.setFillColor(GOLD)
        c.rect(cx - 8, cy - 0.5 * inch, 16, 12, stroke=0, fill=1)

        # Name
        c.setFillColor(IVORY); c.setFont("Inter", 9)
        nw = pdfmetrics.stringWidth(name, "Inter", 9)
        # tracked
        spacing = 9 * 0.22
        cx_txt = x + card_w / 2
        total_w = nw + spacing * (len(name) - 1)
        tx = cx_txt - total_w / 2
        for ch in name:
            c.drawString(tx, y + 0.65 * inch, ch)
            tx += pdfmetrics.stringWidth(ch, "Inter", 9) + spacing

        # Detail
        c.setFillColor(GOLD_HI); c.setFont("Fraunces", 13)
        dw = pdfmetrics.stringWidth(detail, "Fraunces", 13)
        c.drawString(x + (card_w - dw) / 2, y + 0.42 * inch, detail)

        # Year
        c.setFillColor(NAVY_DIM); c.setFont("Inter", 8)
        yw = pdfmetrics.stringWidth(year, "Inter", 8)
        c.drawString(x + (card_w - yw) / 2, y + 0.22 * inch, year)

    _footer_dark(c, 5, total)


# ----------------------------------------------------------------------
# PAGE — Case Studies
# ----------------------------------------------------------------------

def page_case_studies(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "Press kit  ·  Case studies",
             MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The receipts.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Two examples.  Numbers only.  No storytelling, no fluff.")

    cases = [
        {
            "client": "Obsidian Apparel",
            "sector": "LUXURY DTC  ·  NEW YORK",
            "headline": "+318%",
            "headline_label": "Revenue, first 90 days post-launch",
            "before": "$42K / mo",
            "after":  "$176K / mo",
            "quote":  "BrivoMarketing didn't just rebuild our funnel — they rewrote our trajectory. We hit our annual revenue target in five months.",
            "attribution": "Maya Okonkwo, CMO",
            "engagement": "6-week sprint + 4-month CRO retainer",
            "services":   "Brand system, custom site, paid media, retention",
        },
        {
            "client": "Vault Finance",
            "sector": "WEALTH ADVISORY  ·  LONDON",
            "headline": "+412%",
            "headline_label": "Qualified inbound leads, first 6 months",
            "before": "18 / mo",
            "after":  "92 / mo",
            "quote":  "The most senior, most commercial design partner we've ever worked with.",
            "attribution": "Lena Vasquez, Founder",
            "engagement": "Full rebrand + site rebuild + GTM collateral",
            "services":   "Brand strategy, site, sales deck, video",
        },
    ]

    col_w = (PAGE_W - 2 * MARGIN - 0.35 * inch) / 2
    top_y = PAGE_H - 2.55 * inch
    card_h = 4.3 * inch

    for i, cs in enumerate(cases):
        x = MARGIN + i * (col_w + 0.35 * inch)
        y = top_y - card_h

        # Card
        c.setStrokeColor(HAIRLINE); c.setLineWidth(0.6)
        c.setFillColor(HexColor("#FFFFFF"))
        c.roundRect(x, y, col_w, card_h, 10, stroke=1, fill=1)

        # Header strip — navy band
        band_h = 0.75 * inch
        c.setFillColor(NAVY)
        c.roundRect(x, y + card_h - band_h, col_w, band_h, 10, stroke=0, fill=1)
        c.setFillColor(NAVY)
        c.rect(x, y + card_h - band_h, col_w, band_h - 10, stroke=0, fill=1)
        c.setFillColor(GOLD_HI); c.setFont("Inter", 7.5)
        c.drawString(x + 18, y + card_h - 22, cs["sector"])
        c.setFillColor(IVORY); c.setFont("Fraunces", 22)
        c.drawString(x + 18, y + card_h - 50, cs["client"])

        # Big headline result
        h_y = y + card_h - band_h - 0.35 * inch
        c.setFillColor(GOLD); c.setFont("Fraunces", 72)
        c.drawString(x + 18, h_y - 60, cs["headline"])
        c.setFillColor(MUTED); c.setFont("Inter", 9.5)
        c.drawString(x + 18, h_y - 78, cs["headline_label"])

        # Before/After mini
        ba_y = h_y - 115
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(x + 18, ba_y, "BEFORE")
        c.drawString(x + 18 + col_w / 2 - 18, ba_y, "AFTER")
        c.setFillColor(MUTED); c.setFont("Fraunces", 17)
        c.drawString(x + 18, ba_y - 22, cs["before"])
        c.setFillColor(INK); c.setFont("Fraunces", 17)
        c.drawString(x + 18 + col_w / 2 - 18, ba_y - 22, cs["after"])
        # arrow
        c.setFillColor(GOLD); c.setFont("Inter", 18)
        c.drawString(x + col_w / 2 - 22, ba_y - 22, "→")

        _hairline(c, x + 18, ba_y - 36, x + col_w - 18, ba_y - 36,
                  color=HAIRLINE)

        # Quote
        q_y = ba_y - 56
        c.setFillColor(GOLD); c.setFont("Fraunces", 32)
        c.drawString(x + 18, q_y, "\u201C")
        c.setFillColor(INK); c.setFont("FrauncesIt", 12.5)
        # wrap
        words = cs["quote"].split()
        cur = ""
        q_lines = []
        max_w = col_w - 40
        for w in words:
            test = (cur + " " + w).strip()
            if pdfmetrics.stringWidth(test, "FrauncesIt", 12.5) > max_w:
                q_lines.append(cur); cur = w
            else:
                cur = test
        if cur:
            q_lines.append(cur)
        qy = q_y - 18
        for ln in q_lines:
            c.drawString(x + 18, qy, ln)
            qy -= 17
        c.setFillColor(GOLD); c.setFont("Inter", 8)
        c.drawString(x + 18, qy - 6, f"— {cs['attribution'].upper()}")

        # footer meta
        meta_y = y + 20
        c.setFillColor(GOLD); c.setFont("Inter", 7)
        c.drawString(x + 18, meta_y + 26, "ENGAGEMENT")
        c.drawString(x + 18, meta_y + 2,  "SERVICES")
        c.setFillColor(MUTED); c.setFont("Inter", 8.5)
        c.drawString(x + 1.2 * inch, meta_y + 26, cs["engagement"])
        c.drawString(x + 1.2 * inch, meta_y + 2,  cs["services"])

    _footer_light(c, 6, total)


# ----------------------------------------------------------------------
# PAGE — Instagram TAKEOVER (full profile + 3×3 grid)
# ----------------------------------------------------------------------

def page_instagram(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "Social kit  ·  Instagram takeover",
             MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "Instagram.")
    c.setFillColor(GOLD); c.setFont("FrauncesIt", 40)
    c.drawString(MARGIN + 3.1 * inch, PAGE_H - 1.8 * inch, "In full.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Nine tiles.  One voice.  The grid the client sees when they tap your name — planned, not hoped for.")

    # Left column — profile card (IG profile mockup)
    left_w = 3.3 * inch
    left_x = MARGIN
    top_y  = PAGE_H - 2.45 * inch

    # Avatar large with gold ring
    av_size = 1.55 * inch
    av_cx = left_x + av_size / 2 + 0.1 * inch
    av_cy = top_y - av_size / 2 - 0.05 * inch
    # ring
    c.setFillColor(Color(0.83, 0.66, 0.44, alpha=0.12))
    c.circle(av_cx, av_cy, av_size / 2 + 6, stroke=0, fill=1)
    av = ASSET_DIR / "avatar-dark.jpg"
    if av.exists():
        _rounded_image(c, av,
                       av_cx - av_size / 2, av_cy - av_size / 2,
                       av_size, av_size, radius=200)
    c.setStrokeColor(GOLD_HI); c.setLineWidth(1.2)
    c.circle(av_cx, av_cy, av_size / 2 + 2, stroke=1, fill=0)

    # Handle + stats to the right of the avatar
    hx = av_cx + av_size / 2 + 0.22 * inch
    c.setFillColor(INK); c.setFont("Fraunces", 16)
    c.drawString(hx, top_y - 0.15 * inch, "@brivomarketing")
    # Follow button pill
    btn_w, btn_h = 0.85 * inch, 0.22 * inch
    bx = hx
    by = top_y - 0.45 * inch
    c.setFillColor(GOLD)
    c.roundRect(bx, by, btn_w, btn_h, btn_h / 2, stroke=0, fill=1)
    c.setFillColor(IVORY); c.setFont("Inter", 8)
    c.drawCentredString(bx + btn_w / 2, by + 6, "Follow")
    # Stats row
    sy = by - 0.22 * inch
    stat_bits = [("347", "Posts"), ("48.2K", "Followers"), ("210", "Following")]
    sxc = hx
    for n, lbl in stat_bits:
        c.setFillColor(INK); c.setFont("Fraunces", 13)
        c.drawString(sxc, sy, n)
        c.setFillColor(MUTED); c.setFont("Inter", 8)
        c.drawString(sxc, sy - 12, lbl)
        sxc += 0.85 * inch

    # Name + bio under avatar
    bio_y = av_cy - av_size / 2 - 0.3 * inch
    c.setFillColor(INK); c.setFont("Fraunces", 14)
    c.drawString(left_x, bio_y, "BrivoMarketing")
    c.setFillColor(MUTED); c.setFont("Inter", 9)
    bio_lines = [
        "Performance studio.",
        "Custom websites that move markets.",
        "Brand systems · Paid · SEO · CRO.",
        "↓  Case studies + inquiry",
    ]
    by_ = bio_y - 14
    for ln in bio_lines:
        c.drawString(left_x, by_, ln)
        by_ -= 12
    c.setFillColor(GOLD); c.setFont("Inter", 9)
    c.drawString(left_x, by_ - 4, "brivomarketing.com")

    # Story highlights row (4 circles)
    sh_y = by_ - 0.5 * inch
    c.setFillColor(GOLD); c.setFont("Inter", 7.5)
    c.drawString(left_x, sh_y + 16, "HIGHLIGHTS")
    highlight_imgs = [
        "instagram-cover.jpg",
        "avatar-light.jpg",
        "instagram-post.jpg",
        "instagram-story.jpg",
    ]
    highlight_labels = ["Studio", "Team", "Wins", "Press"]
    sh_r = 0.28 * inch
    sh_gap = 0.12 * inch
    for i, (img, lbl) in enumerate(zip(highlight_imgs, highlight_labels)):
        cx_ = left_x + sh_r + i * (sh_r * 2 + sh_gap)
        cy_ = sh_y - sh_r - 6
        # gold ring
        c.setStrokeColor(GOLD_HI); c.setLineWidth(1.0)
        c.circle(cx_, cy_, sh_r + 2, stroke=1, fill=0)
        p = ASSET_DIR / img
        if p.exists():
            _rounded_image(c, p, cx_ - sh_r, cy_ - sh_r,
                           sh_r * 2, sh_r * 2, radius=100)
        c.setFillColor(MUTED); c.setFont("Inter", 7.5)
        c.drawCentredString(cx_, cy_ - sh_r - 12, lbl)

    # Post-count summary bar
    pb_y = sh_y - 1.35 * inch
    c.setFillColor(NAVY)
    c.roundRect(left_x, pb_y - 0.05 * inch, left_w, 0.7 * inch, 6, stroke=0, fill=1)
    c.setFillColor(GOLD_HI); c.setFont("Inter", 7)
    c.drawString(left_x + 14, pb_y + 0.43 * inch, "WHAT YOU GET")
    c.setFillColor(IVORY); c.setFont("Fraunces", 13)
    c.drawString(left_x + 14, pb_y + 0.22 * inch, "9 ready-to-post tiles")
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 8.5)
    c.drawString(left_x + 14, pb_y + 0.06 * inch,
                 "Mix of wordmarks · stats · quotes · press · photo")

    # ───────────── Right column — 3×3 grid ─────────────
    grid_x = left_x + left_w + 0.3 * inch
    grid_w = PAGE_W - MARGIN - grid_x
    # Cap cell size to fit vertical space (from top_y down to ~1.0")
    grid_avail_h = top_y - 1.1 * inch
    tile_gap = 3
    cell = min((grid_w - 2 * tile_gap) / 3, (grid_avail_h - 2 * tile_gap) / 3)
    # center the grid
    grid_total_w = cell * 3 + tile_gap * 2
    grid_total_h = grid_total_w
    gx = grid_x + (grid_w - grid_total_w) / 2
    gy = top_y - grid_total_h

    tile_dir = Path("/tmp/ig-tiles")
    for i in range(9):
        r = i // 3
        ccol = i % 3
        tx = gx + ccol * (cell + tile_gap)
        ty = gy + (2 - r) * (cell + tile_gap)
        p = tile_dir / f"t0{i+1}.jpg"
        if p.exists():
            c.drawImage(str(p), tx, ty, width=cell, height=cell,
                        preserveAspectRatio=False, mask='auto')

    # Label under the grid
    c.setFillColor(GOLD); c.setFont("Inter", 7.5)
    c.drawString(gx, gy - 14, "@BRIVOMARKETING  ·  THE GRID  ·  2026")
    # sizes mini-specs to the right
    right_txt = "1080 × 1080  ·  nine-post system  ·  planning grid for 3 weeks of posting"
    tw = pdfmetrics.stringWidth(right_txt, "Inter", 7.5)
    c.drawString(gx + grid_total_w - tw, gy - 14, right_txt)

    _footer_light(c, 13, total)


# ----------------------------------------------------------------------
# PAGE 9 — X / LinkedIn / YouTube banners in context
# ----------------------------------------------------------------------

def _profile_card(c, x, y, w, h, banner_path: Path, platform: str) -> None:
    """A mock platform profile card with banner + avatar + name."""
    # card base
    c.setFillColor(Color(0, 0, 0, alpha=0.08))
    c.roundRect(x + 4, y - 4, w, h, 10, stroke=0, fill=1)
    c.setFillColor(HexColor("#FFFFFF"))
    c.roundRect(x, y, w, h, 10, stroke=0, fill=1)
    c.setStrokeColor(HAIRLINE); c.setLineWidth(0.6)
    c.roundRect(x, y, w, h, 10, stroke=1, fill=0)

    # platform chrome bar
    chrome_h = 0.28 * inch
    c.setFillColor(HexColor("#F7F7F8"))
    c.rect(x, y + h - chrome_h, w, chrome_h, stroke=0, fill=1)
    c.setFillColor(HexColor("#8C96A3")); c.setFont("Inter", 7.5)
    c.drawString(x + 12, y + h - chrome_h + 10, platform.upper())
    # fake window dots
    for i, col in enumerate(["#E66D6D", "#E6B64A", "#56C057"]):
        c.setFillColor(HexColor(col))
        c.circle(x + w - 14 - i * 12, y + h - chrome_h / 2, 3.5, stroke=0, fill=1)

    # banner
    banner_h = h * 0.55
    banner_y = y + h - chrome_h - banner_h
    if banner_path.exists():
        _cover_image(c, banner_path, x, banner_y, w, banner_h, radius=0)

    # avatar circle
    av_r = 0.28 * inch
    av_cx = x + 0.55 * inch + av_r
    av_cy = banner_y - 0.04 * inch
    # white ring
    c.setFillColor(HexColor("#FFFFFF"))
    c.circle(av_cx, av_cy, av_r + 3, stroke=0, fill=1)
    av_img = ASSET_DIR / "avatar-dark.jpg"
    if av_img.exists():
        _rounded_image(c, av_img,
                       av_cx - av_r, av_cy - av_r,
                       av_r * 2, av_r * 2, radius=200)

    # Name + tag below banner
    nb_y = banner_y - 0.55 * inch
    c.setFillColor(INK); c.setFont("Fraunces", 13)
    c.drawString(x + 12, nb_y + 16, "BrivoMarketing")
    c.setFillColor(MUTED); c.setFont("Inter", 8.5)
    c.drawString(x + 12, nb_y + 2, "Performance Studio  ·  brivomarketing.com")

def page_social_covers(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "07  ·  X  ·  LinkedIn  ·  YouTube", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "Profile covers.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Three banners, three ratios, one consistent editorial tone.")

    # 3 cards across
    gap = 0.25 * inch
    card_w = (PAGE_W - 2 * MARGIN - 2 * gap) / 3.0
    card_h = 3.1 * inch
    top_y  = PAGE_H - 2.55 * inch - card_h

    cards = [
        ("twitter-header.jpg",  "X  ·  Profile banner",          "1500 × 500   ·   twitter-header.jpg"),
        ("linkedin-cover.jpg",  "LinkedIn  ·  Company cover",    "1584 × 396   ·   linkedin-cover.jpg"),
        ("youtube-banner.jpg",  "YouTube  ·  Channel art",       "2560 × 1440  ·   youtube-banner.jpg"),
    ]
    for i, (fname, platform, spec) in enumerate(cards):
        x = MARGIN + i * (card_w + gap)
        _profile_card(c, x, top_y, card_w, card_h, ASSET_DIR / fname, platform)
        # Spec caption
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(x, top_y - 14, spec.upper())

    # Info row under cards
    info_y = top_y - 0.7 * inch
    infos = [
        ("SAFE AREAS",   "Kept logos in lower-left of every banner so profile UI never crops the mark."),
        ("EXPORT",       "Supplied as .jpg at 2× for Retina.  SVG / PNG on request."),
        ("ACCESSIBILITY","All banner type passes 4.5:1 contrast on its background."),
    ]
    iw = (PAGE_W - 2 * MARGIN) / 3
    for i, (k, v) in enumerate(infos):
        c.setFillColor(GOLD); c.setFont("Inter", 7.5)
        c.drawString(MARGIN + i * iw, info_y, k)
        c.setFillColor(INK); c.setFont("Inter", 9)
        c.drawString(MARGIN + i * iw, info_y - 14, v)

    _footer_light(c, 9, total)


# ----------------------------------------------------------------------
# PAGE 10 — Voice & tone
# ----------------------------------------------------------------------

def page_voice(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "08  ·  Voice & tone", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "How we sound.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Confident. Concrete. A little smug — because the work is that good. Never corporate.")

    attrs = [
        ("Confident, not arrogant",    "We don't hedge. We don't oversell. We say the thing."),
        ("Concrete, not fluffy",       "Numbers, deadlines, and screenshots over adjectives."),
        ("Editorial, not promotional", "Treat every post like a spread in Monocle — not a sale."),
        ("Warm, not cold",             "Smart-friend tone. Talk to the founder, not procurement."),
    ]
    cy = PAGE_H - 2.85 * inch
    for label, desc in attrs:
        c.setFillColor(GOLD); c.setFont("Inter", 8)
        c.drawString(MARGIN, cy, label.upper())
        c.setFillColor(INK); c.setFont("Fraunces", 18)
        c.drawString(MARGIN, cy - 18, label)
        c.setFillColor(MUTED); c.setFont("Inter", 10)
        c.drawString(MARGIN, cy - 34, desc)
        _hairline(c, MARGIN, cy - 48, PAGE_W / 2 - 0.2 * inch, cy - 48, color=HAIRLINE)
        cy -= 62

    # Right — say / don't say
    rx = PAGE_W / 2 + 0.1 * inch
    ry = PAGE_H - 2.85 * inch
    c.setFillColor(GOLD); c.setFont("Inter", 8)
    c.drawString(rx, ry, "SAY")
    c.drawString(rx + 2.5 * inch, ry, "DON'T SAY")
    _hairline(c, rx, ry - 6, PAGE_W - MARGIN, ry - 6, color=HAIRLINE)
    pairs = [
        ("We ship in 10 days.",            "Agile delivery roadmap."),
        ("Your homepage converts at 4.1%.","Drive digital transformation."),
        ("Book a call — 20 min, no deck.", "Schedule a discovery session."),
        ("Custom code. No templates.",     "Bespoke solutions at scale."),
        ("We fix ugly funnels.",           "We optimize conversion assets."),
    ]
    ry -= 22
    for a, b in pairs:
        c.setFillColor(INK); c.setFont("Fraunces", 13)
        c.drawString(rx, ry, a)
        c.setFillColor(DIM); c.setFont("FrauncesIt", 13)
        c.drawString(rx + 2.5 * inch, ry, b)
        _hairline(c, rx, ry - 10, PAGE_W - MARGIN, ry - 10, color=HAIRLINE, width=0.3)
        ry -= 30

    _footer_light(c, 10, total)


# ----------------------------------------------------------------------
# PAGE 11 — Social playbook
# ----------------------------------------------------------------------

def page_playbook(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "09  ·  Social playbook", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "The rhythm.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "A weekly loop.  Compounding, not sporadic.")

    days = [
        ("MON", "Receipts",   "Screenshot of last week's client wins + numbers."),
        ("TUE", "Teardown",   "Carousel breaking down a site that over-/under-performs."),
        ("WED", "BTS",        "Studio in motion — a 9-second dev or design shot."),
        ("THU", "Heat",       "Hot take on a design or marketing trend."),
        ("FRI", "Case note",  "One paragraph result + one chart. That's it."),
        ("SAT", "Quiet",      "No post. Scheduling day. We protect the feed's pace."),
        ("SUN", "Essay",      "Long-form carousel. Thinking out loud for founders."),
    ]
    ty = PAGE_H - 2.6 * inch
    row_h = 32
    _hairline(c, MARGIN, ty - 6, PAGE_W - MARGIN, ty - 6, color=HAIRLINE)
    c.setFillColor(GOLD); c.setFont("Inter", 8)
    c.drawString(MARGIN, ty, "DAY")
    c.drawString(MARGIN + 0.85 * inch, ty, "THEME")
    c.drawString(MARGIN + 2.7 * inch, ty, "FORMAT")
    ty -= row_h - 4
    for d, t, f in days:
        c.setFillColor(GOLD); c.setFont("Inter", 9)
        c.drawString(MARGIN, ty, d)
        c.setFillColor(INK); c.setFont("Fraunces", 14)
        c.drawString(MARGIN + 0.85 * inch, ty, t)
        c.setFillColor(MUTED); c.setFont("Inter", 10)
        c.drawString(MARGIN + 2.7 * inch, ty, f)
        _hairline(c, MARGIN, ty - 10, PAGE_W - MARGIN, ty - 10,
                  color=HAIRLINE, width=0.3)
        ty -= row_h

    # Caption formula strip
    by = 1.15 * inch
    c.setFillColor(NAVY)
    c.roundRect(MARGIN, by, PAGE_W - 2 * MARGIN, 1.25 * inch, 8, stroke=0, fill=1)
    c.setFillColor(GOLD_HI); c.setFont("Inter", 8)
    c.drawString(MARGIN + 20, by + 1.02 * inch, "THE BRIVO CAPTION FORMULA")
    c.setFillColor(IVORY); c.setFont("Fraunces", 18)
    c.drawString(MARGIN + 20, by + 0.68 * inch,
                 "Hook (5 words).  ·  One number.  ·  One line of opinion.  ·  One CTA.")
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 9.5)
    c.drawString(MARGIN + 20, by + 0.36 * inch,
                 "Example —  Your hero is leaking revenue.  ·  37% of visitors bounce before the fold.  ·  It's not the copy — it's the load time.  ·  Reply SPEED for the audit doc.")

    _footer_light(c, 11, total)


# ----------------------------------------------------------------------
# PAGE 12 — Asset index (clickable)
# ----------------------------------------------------------------------

def page_asset_index(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)

    _eyebrow(c, "10  ·  Asset index", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK); c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.8 * inch, "Every file.  Every link.")
    c.setFillColor(MUTED); c.setFont("Inter", 10.5)
    c.drawString(MARGIN, PAGE_H - 2.15 * inch,
                 "Copy-paste URLs. All assets hosted on brivomarketing.com — no CDN dance required.")

    assets = [
        ("Horizontal logo — Dark",  "logo-horizontal-dark.jpg",  "2400 × 600"),
        ("Horizontal logo — Light", "logo-horizontal-light.jpg", "2400 × 600"),
        ("Avatar — Dark",           "avatar-dark.jpg",           "1024 × 1024"),
        ("Avatar — Light",          "avatar-light.jpg",          "1024 × 1024"),
        ("IG Story / Reel Cover",   "instagram-story.jpg",       "1080 × 1920"),
        ("IG Grid Post",            "instagram-post.jpg",        "1080 × 1080"),
        ("IG Cover / Highlight",    "instagram-cover.jpg",       "1920 × 1080"),
        ("X (Twitter) Header",      "twitter-header.jpg",        "1500 × 500"),
        ("LinkedIn Cover",          "linkedin-cover.jpg",        "1584 × 396"),
        ("YouTube Banner",          "youtube-banner.jpg",        "2560 × 1440"),
    ]

    # Column headers
    hy = PAGE_H - 2.55 * inch
    c.setFillColor(GOLD); c.setFont("Inter", 7.5)
    c.drawString(MARGIN + 0.8 * inch, hy, "ASSET")
    c.drawString(MARGIN + 3.2 * inch, hy, "SIZE")
    c.drawString(MARGIN + 4.3 * inch, hy, "URL  (click to open)")
    _hairline(c, MARGIN, hy - 6, PAGE_W - MARGIN, hy - 6, color=HAIRLINE)

    # Rows with thumbnails
    row_h = 0.42 * inch
    ty = hy - 8
    thumb_w = 0.65 * inch
    thumb_h = 0.32 * inch

    for name, filen, size in assets:
        ty -= row_h
        url = f"https://brivomarketing.com/kit-assets/{filen}"
        path = ASSET_DIR / filen

        # Thumbnail (cover-fit, rounded)
        if path.exists():
            _cover_image(c, path, MARGIN,
                         ty + (row_h - thumb_h) / 2 - 2,
                         thumb_w, thumb_h, radius=4)

        # Name
        c.setFillColor(INK); c.setFont("Fraunces", 12.5)
        c.drawString(MARGIN + 0.8 * inch, ty + 6, name)

        # Size
        c.setFillColor(MUTED); c.setFont("Inter", 9.5)
        c.drawString(MARGIN + 3.2 * inch, ty + 6, size)

        # URL link
        c.setFillColor(GOLD); c.setFont("Inter", 9.5)
        c.drawString(MARGIN + 4.3 * inch, ty + 6, url)
        link_w = pdfmetrics.stringWidth(url, "Inter", 9.5)
        c.linkURL(url,
                  (MARGIN + 4.3 * inch, ty + 2,
                   MARGIN + 4.3 * inch + link_w, ty + 16),
                  relative=0)

        _hairline(c, MARGIN, ty - 4, PAGE_W - MARGIN, ty - 4,
                  color=HAIRLINE, width=0.3)

    # Right-side summary callout
    c.setFillColor(NAVY)
    box_x = PAGE_W - MARGIN - 2.3 * inch
    box_y = 0.85 * inch
    box_w = 2.3 * inch
    box_h = 0.5 * inch
    # This block is too small — reposition after rendering
    # (kept minimal; the main catalog above is the main value)

    _footer_light(c, 12, total)


# ----------------------------------------------------------------------
# PAGE 13 — Back cover (money shot)
# ----------------------------------------------------------------------

def page_back_cover(c: canvas.Canvas) -> None:
    _bleed(c, NAVY_DEEP)

    # top-left glow
    c.saveState()
    for i, alpha in enumerate([0.04, 0.065, 0.1]):
        c.setFillColor(Color(0.72, 0.53, 0.30, alpha=alpha))
        r = 560 - i * 110
        c.ellipse(-r / 2 + 40, PAGE_H - r * 0.78,
                  r / 2 + 40, PAGE_H + r / 4, stroke=0, fill=1)
    c.restoreState()

    _hairline(c, MARGIN, PAGE_H - 0.55 * inch, PAGE_W - MARGIN,
              PAGE_H - 0.55 * inch, color=NAVY_RULE)
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 8)
    c.drawString(MARGIN, PAGE_H - 0.42 * inch, "BRIVOMARKETING — END OF VOLUME 01")
    right = "THANK YOU FOR READING  ·  HELLO@BRIVOMARKETING.COM"
    w = pdfmetrics.stringWidth(right, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, PAGE_H - 0.42 * inch, right)

    _eyebrow(c, "One last thing", MARGIN, PAGE_H - 1.1 * inch, color=GOLD_HI, size=9)

    # Mega text
    c.setFillColor(IVORY); c.setFont("Fraunces", 112)
    c.drawString(MARGIN, PAGE_H - 2.85 * inch, "Let's build")
    c.setFillColor(GOLD_HI); c.setFont("FrauncesIt", 112)
    c.drawString(MARGIN, PAGE_H - 4.15 * inch, "something loud.")

    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 12)
    for i, ln in enumerate([
        "If you've read this far, you already get it.",
        "We're small on purpose. We pick four partners a quarter.",
        "Tell us what you're shipping and we'll tell you in 48 hours",
        "if we're the right studio.",
    ]):
        c.drawString(MARGIN, PAGE_H - 4.85 * inch - i * 17, ln)

    # CTA pill
    btn_w, btn_h = 2.9 * inch, 0.62 * inch
    bx = MARGIN
    by = PAGE_H - 4.85 * inch - 4 * 17 - 0.4 * inch
    c.setFillColor(GOLD)
    c.roundRect(bx, by, btn_w, btn_h, btn_h / 2, stroke=0, fill=1)
    c.setFillColor(IVORY); c.setFont("Inter", 13)
    cta = "Talk to our studio   →"
    tw = pdfmetrics.stringWidth(cta, "Inter", 13)
    c.drawString(bx + (btn_w - tw) / 2, by + btn_h / 2 - 4, cta)
    c.linkURL("https://brivomarketing.com/#inquiry",
              (bx, by, bx + btn_w, by + btn_h), relative=0)

    # Owl crest on right (BrivoMarketing mark)
    av = ASSET_DIR / "owl-logo.jpg"
    if av.exists():
        _rounded_image(c, av,
                       PAGE_W - 2.3 * inch, PAGE_H / 2 - 0.7 * inch,
                       1.7 * inch, 1.7 * inch, radius=200)

    # Horizontal logo under avatar
    lg = ASSET_DIR / "logo-horizontal-dark.jpg"
    if lg.exists():
        _draw_logo(c, lg,
                   PAGE_W - 1.45 * inch, PAGE_H / 2 - 1.3 * inch,
                   2.0 * inch, 0.55 * inch)

    # Bottom meta
    _hairline(c, MARGIN, 0.9 * inch, PAGE_W - MARGIN, 0.9 * inch,
              color=NAVY_RULE)
    c.setFillColor(NAVY_TEXT); c.setFont("Inter", 8.5)
    c.drawString(MARGIN, 0.68 * inch,
                 "brivomarketing.com   ·   @brivomarketing   ·   hello@brivomarketing.com")
    c.setFillColor(NAVY_DIM); c.setFont("Inter", 7.5)
    c.drawString(MARGIN, 0.48 * inch,
                 "© 2026 BrivoMarketing LLC.   ·   This document is v1.0 of the BrivoMarketing Brand System.")


# ----------------------------------------------------------------------
# Build
# ----------------------------------------------------------------------

def build() -> None:
    register_fonts()
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(OUT_PATH), pagesize=(PAGE_W, PAGE_H))
    c.setTitle("BrivoMarketing — The Brand System (Volume 01)")
    c.setAuthor("BrivoMarketing")
    c.setSubject("Social media blitz  ·  Brand kit  ·  v1.0")
    c.setKeywords("BrivoMarketing, brand kit, social media, marketing, performance studio")

    total = 17
    page_cover(c);                    c.showPage()
    page_inventory(c, total);         c.showPage()
    page_manifesto(c, total);         c.showPage()
    page_fact_sheet(c, total);        c.showPage()
    page_featured_in(c, total);       c.showPage()
    page_awards(c, total);            c.showPage()
    page_case_studies(c, total);      c.showPage()
    page_logo_system(c, total);       c.showPage()
    page_color(c, total);             c.showPage()
    page_type(c, total);              c.showPage()
    page_dos_donts(c, total);         c.showPage()
    page_instagram(c, total);         c.showPage()
    page_social_covers(c, total);     c.showPage()
    page_voice(c, total);             c.showPage()
    page_playbook(c, total);          c.showPage()
    page_asset_index(c, total);       c.showPage()
    page_back_cover(c);                c.showPage()

    c.save()
    kb = os.path.getsize(OUT_PATH) / 1024.0
    print(f"✓ wrote {OUT_PATH}  ({kb:,.1f} KB  ·  {total} pages)")


if __name__ == "__main__":
    build()
