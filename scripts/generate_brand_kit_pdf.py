"""
Brivo — Brand System (Vol. 01)
Generates /app/frontend/public/kit-assets/brivo-brand-kit.pdf

A magazine-grade, editorial brand kit PDF. Landscape letter (11" x 8.5")
lookbook format. Uses the Fraunces + Inter type system that the live
marketing site ships with so the document is pixel-correct to the brand.
"""

from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# ----------------------------------------------------------------------
# Paths & Constants
# ----------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "scripts" / "fonts"
ASSET_DIR = ROOT / "frontend" / "public" / "kit-assets"
OUT_PATH = ASSET_DIR / "brivo-brand-kit.pdf"

# Palette
NAVY       = HexColor("#0B1B2B")
NAVY_DEEP  = HexColor("#060F1A")
NAVY_SOFT  = HexColor("#14283F")
GOLD       = HexColor("#B8864C")
GOLD_HI    = HexColor("#D4A971")
CREAM      = HexColor("#F5D7A4")
IVORY      = HexColor("#FBFAF6")
PAPER      = HexColor("#F3F1EA")
INK        = HexColor("#0B1B2B")
MUTED      = HexColor("#4E5C6E")
HAIRLINE   = HexColor("#E7E3D8")
DIM        = HexColor("#8190A1")

# Page
PAGE_W, PAGE_H = landscape(letter)   # 792 x 612 pt
MARGIN = 0.6 * inch

# ----------------------------------------------------------------------
# Font Registration
# ----------------------------------------------------------------------

def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Fraunces",    str(FONT_DIR / "Fraunces.ttf")))
    pdfmetrics.registerFont(TTFont("FrauncesIt",  str(FONT_DIR / "FrauncesItalic.ttf")))
    pdfmetrics.registerFont(TTFont("Inter",       str(FONT_DIR / "Inter.ttf")))


# ----------------------------------------------------------------------
# Shared primitives
# ----------------------------------------------------------------------

def _bleed(c: canvas.Canvas, color: Color) -> None:
    c.setFillColor(color)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)


def _hairline(c: canvas.Canvas, x1, y1, x2, y2, color=HAIRLINE, width=0.5) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)


def _eyebrow(c: canvas.Canvas, text: str, x, y, color=GOLD, size=7.5) -> None:
    """Uppercase, wide-tracked micro-label."""
    c.setFillColor(color)
    c.setFont("Inter", size)
    # fake letter-spacing via char-by-char render
    spacing = size * 0.28
    cursor = x
    for ch in text.upper():
        c.drawString(cursor, y, ch)
        cursor += pdfmetrics.stringWidth(ch, "Inter", size) + spacing


def _draw_logo_mark(c: canvas.Canvas, cx: float, cy: float, r: float,
                    mark_color=GOLD, bg_color=None) -> None:
    """Monogram 'B' lockup inside a circle — the Brivo owl-inspired badge."""
    if bg_color is not None:
        c.setFillColor(bg_color)
        c.circle(cx, cy, r, stroke=0, fill=1)
    # ring
    c.setStrokeColor(mark_color)
    c.setLineWidth(r * 0.10)
    c.circle(cx, cy, r * 0.92, stroke=1, fill=0)
    # inner 'B' via serif glyph
    c.setFillColor(mark_color)
    c.setFont("Fraunces", r * 1.35)
    glyph_w = pdfmetrics.stringWidth("B", "Fraunces", r * 1.35)
    c.drawString(cx - glyph_w / 2.0, cy - r * 0.46, "B")


def _page_footer(c: canvas.Canvas, page_num: int, total: int,
                 ink=MUTED, dim=DIM) -> None:
    y = 0.42 * inch
    _hairline(c, MARGIN, y + 14, PAGE_W - MARGIN, y + 14, color=HAIRLINE)
    c.setFillColor(ink)
    c.setFont("Inter", 8)
    c.drawString(MARGIN, y, "Brivo  ·  Performance Studio  ·  brivomarketing.com")
    c.setFillColor(dim)
    right_text = f"VOL. 01 · THE BRAND SYSTEM  ·  {page_num:02d} / {total:02d}"
    w = pdfmetrics.stringWidth(right_text, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, y, right_text)


def _dark_footer(c: canvas.Canvas, page_num: int, total: int) -> None:
    y = 0.42 * inch
    _hairline(c, MARGIN, y + 14, PAGE_W - MARGIN, y + 14, color=HexColor("#223249"))
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN, y, "Brivo  ·  Performance Studio  ·  brivomarketing.com")
    c.setFillColor(HexColor("#7C8BA0"))
    right_text = f"VOL. 01 · THE BRAND SYSTEM  ·  {page_num:02d} / {total:02d}"
    w = pdfmetrics.stringWidth(right_text, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, y, right_text)


# ----------------------------------------------------------------------
# Pages
# ----------------------------------------------------------------------

def page_cover(c: canvas.Canvas) -> None:
    _bleed(c, NAVY_DEEP)

    # subtle radial glow (faked with concentric rectangles is complex — use a fat ellipse)
    c.saveState()
    for i, alpha in enumerate([0.035, 0.055, 0.09]):
        c.setFillColor(Color(0.72, 0.53, 0.30, alpha=alpha))
        r = 520 - i * 120
        c.ellipse(PAGE_W - r/2 - 60, -r/4, PAGE_W + r/2 - 60, r * 0.75, stroke=0, fill=1)
    c.restoreState()

    # top meta row
    _hairline(c, MARGIN, PAGE_H - 0.55 * inch, PAGE_W - MARGIN,
              PAGE_H - 0.55 * inch, color=HexColor("#2A3A52"), width=0.6)
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN, PAGE_H - 0.42 * inch, "BRIVO — PERFORMANCE STUDIO")
    right = "THE BRAND SYSTEM / VOLUME 01 / 2026"
    w = pdfmetrics.stringWidth(right, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, PAGE_H - 0.42 * inch, right)

    # Eyebrow
    _eyebrow(c, "The official brand system", MARGIN, PAGE_H - 1.15 * inch, color=GOLD, size=9)

    # Huge wordmark
    c.setFillColor(IVORY)
    c.setFont("Fraunces", 230)
    c.drawString(MARGIN - 8, PAGE_H - 3.7 * inch, "Brivo.")

    # Gold italic sub
    c.setFillColor(GOLD_HI)
    c.setFont("FrauncesIt", 44)
    c.drawString(MARGIN, PAGE_H - 4.45 * inch, "A brand built to move markets.")

    # Tagline block
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 11)
    lines = [
        "Logo lockups · Color · Typography · Voice · Social playbook",
        "Every asset sized, every rule written, every link ready to ship.",
    ]
    ly = PAGE_H - 5.15 * inch
    for ln in lines:
        c.drawString(MARGIN, ly, ln)
        ly -= 15

    # Owl/monogram disc bottom right
    _draw_logo_mark(c, PAGE_W - 1.35 * inch, 1.45 * inch, 0.75 * inch,
                    mark_color=GOLD_HI)

    # Credits bottom left
    _hairline(c, MARGIN, 1.0 * inch, MARGIN + 2.8 * inch, 1.0 * inch,
              color=HexColor("#2A3A52"))
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN, 0.78 * inch, "CURATED BY THE STUDIO")
    c.setFillColor(HexColor("#7C8BA0"))
    c.drawString(MARGIN, 0.6 * inch, "hello@brivomarketing.com")
    c.drawString(MARGIN, 0.45 * inch, "@brivomarketing")


def page_toc(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "Contents  ·  Volume 01", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 64)
    c.drawString(MARGIN, PAGE_H - 1.9 * inch, "Index.")

    items = [
        ("01", "Manifesto",             "What we build and who we build it for", "03"),
        ("02", "Logo system",           "Wordmark, monogram, clear-space, minimums", "04"),
        ("03", "Color system",          "HEX · RGB · CMYK · accessibility pairings",  "05"),
        ("04", "Typography",            "Fraunces + Inter — the editorial pair",      "06"),
        ("05", "Usage: do / don't",     "How to keep the mark sharp",                 "07"),
        ("06", "Instagram kit",         "Story, post, highlight — in context",        "08"),
        ("07", "X & LinkedIn",          "Profile covers that anchor the feed",        "09"),
        ("08", "YouTube channel",       "Channel art + safe-area guide",              "10"),
        ("09", "Voice & tone",          "How Brivo sounds, always",                   "11"),
        ("10", "Social playbook",       "Cadence, caption formulas, hashtag ladder",  "12"),
        ("11", "Asset index",           "Every file, every URL, every dimension",     "13"),
    ]

    x_num = MARGIN
    x_title = MARGIN + 0.7 * inch
    x_sub = MARGIN + 3.4 * inch
    x_page_right = PAGE_W - MARGIN

    y = PAGE_H - 2.6 * inch
    for num, title, sub, pg in items:
        _hairline(c, MARGIN, y + 18, PAGE_W - MARGIN, y + 18, color=HAIRLINE, width=0.4)
        c.setFillColor(GOLD)
        c.setFont("Inter", 9)
        c.drawString(x_num, y, num)
        c.setFillColor(INK)
        c.setFont("Fraunces", 18)
        c.drawString(x_title, y, title)
        c.setFillColor(MUTED)
        c.setFont("Inter", 9)
        c.drawString(x_sub, y, sub)
        c.setFillColor(INK)
        c.setFont("Inter", 10)
        w = pdfmetrics.stringWidth(pg, "Inter", 10)
        c.drawString(x_page_right - w, y, pg)
        y -= 24

    _page_footer(c, 2, total)


def page_manifesto(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "01  ·  Manifesto", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)

    # Left column
    col_w = (PAGE_W - 2 * MARGIN - 0.5 * inch) / 2

    # HUGE pull quote
    c.setFillColor(INK)
    c.setFont("Fraunces", 62)
    c.drawString(MARGIN, PAGE_H - 2.2 * inch, "Custom")
    c.drawString(MARGIN, PAGE_H - 3.1 * inch, "websites,")
    c.setFillColor(GOLD)
    c.setFont("FrauncesIt", 62)
    c.drawString(MARGIN, PAGE_H - 4.0 * inch, "built to")
    c.setFillColor(INK)
    c.setFont("Fraunces", 62)
    c.drawString(MARGIN, PAGE_H - 4.9 * inch, "move markets.")

    # Right column — body copy
    rx = MARGIN + col_w + 0.5 * inch
    ry = PAGE_H - 2.2 * inch

    c.setFillColor(MUTED)
    c.setFont("Inter", 10.5)
    paragraphs = [
        "Brivo is a performance studio. We build sites that out-earn their",
        "retainer in the first quarter, and brands that look like they",
        "belong on a billboard in SoHo and a homepage on TechCrunch.",
        "",
        "We aren't a template shop. We aren't a dashboard. We're a small,",
        "opinionated team shipping custom, conversion-obsessed work",
        "across advisory, SaaS, hospitality, and luxury retail.",
        "",
        "This document is the system we hand partners, press, and",
        "collaborators. Everything you need to represent Brivo without",
        "asking is in here — sized, color-matched, and linked.",
    ]
    for line in paragraphs:
        c.drawString(rx, ry, line)
        ry -= 16

    # Stat row
    _hairline(c, rx, ry - 8, PAGE_W - MARGIN, ry - 8, color=HAIRLINE, width=0.6)
    ry -= 38
    stats = [("100%", "Custom-coded"), ("<48h", "To first draft"), ("+37%", "Avg. CVR lift")]
    sw = (PAGE_W - MARGIN - rx) / 3
    for i, (n, l) in enumerate(stats):
        c.setFillColor(INK)
        c.setFont("Fraunces", 28)
        c.drawString(rx + i * sw, ry, n)
        c.setFillColor(MUTED)
        c.setFont("Inter", 8.5)
        c.drawString(rx + i * sw, ry - 16, l.upper())

    _page_footer(c, 3, total)


def page_logo_system(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "02  ·  Logo system", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)

    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "The mark.")

    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    intro = "A serif wordmark, a circular monogram, and a restraint rule: never stretch, never recolor."
    c.drawString(MARGIN, PAGE_H - 2.05 * inch, intro)

    # Three tiles — Primary, Monogram, Minimum size
    tile_y = PAGE_H - 5.0 * inch
    tile_h = 2.5 * inch
    gap = 0.25 * inch
    tile_w = (PAGE_W - 2 * MARGIN - 2 * gap) / 3
    tiles = []
    for i in range(3):
        x = MARGIN + i * (tile_w + gap)
        tiles.append(x)

    # 1 — Primary wordmark on navy
    c.setFillColor(NAVY)
    c.roundRect(tiles[0], tile_y, tile_w, tile_h, 8, stroke=0, fill=1)
    c.setFillColor(IVORY)
    c.setFont("Fraunces", 54)
    word = "Brivo"
    w = pdfmetrics.stringWidth(word, "Fraunces", 54)
    c.drawString(tiles[0] + (tile_w - w) / 2, tile_y + tile_h / 2 - 14, word)
    c.setFillColor(GOLD_HI)
    c.setFont("Inter", 7.5)
    c.drawString(tiles[0] + 14, tile_y + 14, "PRIMARY WORDMARK  ·  FRAUNCES 500")

    # 2 — Monogram
    c.setFillColor(PAPER)
    c.roundRect(tiles[1], tile_y, tile_w, tile_h, 8, stroke=0, fill=1)
    _draw_logo_mark(c, tiles[1] + tile_w / 2, tile_y + tile_h / 2 + 4, 0.7 * inch,
                    mark_color=NAVY)
    c.setFillColor(MUTED)
    c.setFont("Inter", 7.5)
    c.drawString(tiles[1] + 14, tile_y + 14, "MONOGRAM  ·  BADGE USE")

    # 3 — Clear space
    c.setStrokeColor(HAIRLINE)
    c.setLineWidth(0.6)
    c.rect(tiles[2], tile_y, tile_w, tile_h, stroke=1, fill=0)
    # inner dashed box = clearspace
    inner = 0.55 * inch
    c.saveState()
    c.setDash(3, 3)
    c.setStrokeColor(GOLD)
    c.rect(tiles[2] + inner, tile_y + inner, tile_w - 2 * inner, tile_h - 2 * inner,
           stroke=1, fill=0)
    c.restoreState()
    c.setFillColor(INK)
    c.setFont("Fraunces", 36)
    word = "Brivo"
    w = pdfmetrics.stringWidth(word, "Fraunces", 36)
    c.drawString(tiles[2] + (tile_w - w) / 2, tile_y + tile_h / 2 - 10, word)
    c.setFillColor(MUTED)
    c.setFont("Inter", 7.5)
    c.drawString(tiles[2] + 14, tile_y + 14, "CLEAR SPACE  ·  EQUAL TO THE 'o' CAP-HEIGHT")

    # Rules row
    rules_y = tile_y - 0.7 * inch
    rules = [
        ("Minimum size",        "24 px digital  ·  20 mm print"),
        ("Background",          "Navy (#0B1B2B) or Ivory (#FBFAF6) — never on photography"),
        ("File types",          "SVG preferred · PNG for comps · JPG only when forced"),
        ("Never",               "Stretch, outline, drop-shadow, rotate, or re-color outside palette"),
    ]
    cw = (PAGE_W - 2 * MARGIN) / 4
    for i, (k, v) in enumerate(rules):
        x = MARGIN + i * cw
        c.setFillColor(GOLD)
        c.setFont("Inter", 7.5)
        c.drawString(x, rules_y, k.upper())
        c.setFillColor(INK)
        c.setFont("Inter", 9)
        c.drawString(x, rules_y - 14, v)
    _page_footer(c, 4, total)


def page_color(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "03  ·  Color system", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "The palette.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "Five colors do 95% of the work. Navy carries the brand. Gold lifts the CTAs. Ivory holds the page.")

    swatches = [
        ("Navy",   "#0B1B2B", "RGB 11 / 27 / 43",   "CMYK 90 / 75 / 55 / 70", "Primary brand color", True),
        ("Gold",   "#B8864C", "RGB 184 / 134 / 76", "CMYK 25 / 50 / 85 / 10", "CTAs, accents, eyebrows", True),
        ("Amber",  "#D4A971", "RGB 212 / 169 / 113","CMYK 15 / 35 / 65 / 0",  "Hover / highlight layer", True),
        ("Cream",  "#F5D7A4", "RGB 245 / 215 / 164","CMYK 3 / 15 / 40 / 0",   "Warm background wash", False),
        ("Ivory",  "#FBFAF6", "RGB 251 / 250 / 246","CMYK 1 / 1 / 4 / 0",     "Paper / canvas", False),
    ]

    # Big featured swatch (Navy) left
    big_w = 4.0 * inch
    big_h = 3.8 * inch
    big_x = MARGIN
    big_y = PAGE_H - 2.4 * inch - big_h
    c.setFillColor(NAVY)
    c.roundRect(big_x, big_y, big_w, big_h, 10, stroke=0, fill=1)
    c.setFillColor(GOLD_HI)
    c.setFont("Inter", 8)
    c.drawString(big_x + 20, big_y + big_h - 28, "PRIMARY")
    c.setFillColor(IVORY)
    c.setFont("Fraunces", 56)
    c.drawString(big_x + 20, big_y + big_h - 95, "Navy")
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 10)
    c.drawString(big_x + 20, big_y + 80, "#0B1B2B")
    c.drawString(big_x + 20, big_y + 62, "RGB 11 / 27 / 43")
    c.drawString(big_x + 20, big_y + 44, "CMYK 90 / 75 / 55 / 70")
    c.setFillColor(GOLD_HI)
    c.drawString(big_x + 20, big_y + 20, "Carries 70% of the brand surface")

    # Right column — small swatch stack
    sx = MARGIN + big_w + 0.3 * inch
    sy = PAGE_H - 2.4 * inch
    row_h = 0.82 * inch
    col_items = [s for s in swatches if s[0] != "Navy"]
    avail_w = PAGE_W - MARGIN - sx
    for i, (name, hexv, rgb, cmyk, note, on_dark) in enumerate(col_items):
        top = sy - i * row_h
        bottom = top - row_h + 8
        c.setFillColor(HexColor(hexv))
        if name == "Ivory":
            c.setStrokeColor(HAIRLINE)
            c.setLineWidth(0.6)
            c.roundRect(sx, bottom, 1.1 * inch, row_h - 10, 6, stroke=1, fill=1)
        else:
            c.roundRect(sx, bottom, 1.1 * inch, row_h - 10, 6, stroke=0, fill=1)

        tx = sx + 1.3 * inch
        c.setFillColor(INK)
        c.setFont("Fraunces", 22)
        c.drawString(tx, top - 28, name)
        c.setFillColor(MUTED)
        c.setFont("Inter", 8.5)
        c.drawString(tx, top - 42, f"{hexv}   ·   {rgb}   ·   {cmyk}")
        c.setFillColor(GOLD)
        c.setFont("Inter", 8)
        c.drawString(tx, top - 56, note.upper())

    # Bottom ribbon — accessibility note
    by = 1.05 * inch
    c.setFillColor(PAPER)
    c.rect(MARGIN, by, PAGE_W - 2 * MARGIN, 0.5 * inch, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.setFont("Inter", 7.5)
    c.drawString(MARGIN + 14, by + 30, "ACCESSIBILITY")
    c.setFillColor(INK)
    c.setFont("Inter", 9.5)
    c.drawString(MARGIN + 14, by + 12,
                 "Ivory text on Navy passes WCAG AAA at all sizes · Gold on Navy passes AA Large · Never run Gold text on Ivory below 18 pt.")
    _page_footer(c, 5, total)


def page_type(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "04  ·  Typography", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "The pair.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "Fraunces for editorial voice. Inter for interface clarity. That's it. Two families, one system.")

    # Left — Fraunces
    col_w = (PAGE_W - 2 * MARGIN - 0.5 * inch) / 2
    lx = MARGIN
    ly = PAGE_H - 2.5 * inch
    c.setFillColor(INK)
    c.setFont("Fraunces", 150)
    c.drawString(lx, ly - 100, "Aa")
    c.setFillColor(GOLD)
    c.setFont("Inter", 8)
    c.drawString(lx, ly - 125, "FRAUNCES  ·  SERIF  ·  HEADLINES, WORDMARK, PULL-QUOTES")

    # Specimen lines
    specs = [
        (64, "Move markets."),
        (38, "Built custom, every pixel."),
        (22, "An editorial serif with optical sizes."),
    ]
    sy = ly - 160
    for size, text in specs:
        c.setFillColor(INK)
        c.setFont("Fraunces", size)
        c.drawString(lx, sy, text)
        c.setFillColor(DIM)
        c.setFont("Inter", 7.5)
        c.drawString(lx, sy - size * 0.45, f"FRAUNCES  ·  {size} PT")
        sy -= size + 22

    # Right — Inter
    rx = MARGIN + col_w + 0.5 * inch
    c.setFillColor(INK)
    c.setFont("Inter", 150)
    c.drawString(rx, ly - 100, "Aa")
    c.setFillColor(GOLD)
    c.setFont("Inter", 8)
    c.drawString(rx, ly - 125, "INTER  ·  SANS  ·  BODY, UI, CAPTIONS, LABELS")

    specs = [
        (22, "A technical sans for the craft behind it."),
        (13, "Used for paragraph body copy, controls, and captions."),
        (10, "Spec sheets, tables, metadata, small-caps labels."),
    ]
    sy = ly - 160
    for size, text in specs:
        c.setFillColor(INK)
        c.setFont("Inter", size)
        c.drawString(rx, sy, text)
        c.setFillColor(DIM)
        c.setFont("Inter", 7.5)
        c.drawString(rx, sy - size * 0.6, f"INTER  ·  {size} PT")
        sy -= size + 22

    _page_footer(c, 6, total)


def page_dos_donts(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "05  ·  Usage", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "Do. Don't.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "Keep the system clean. Four rules stop 95% of brand drift.")

    # 2 × 2 grid of rules — 4 cells stacked (2 cols × 2 rows)
    top        = PAGE_H - 2.35 * inch      # top of the cell area
    bottom_pad = 1.05 * inch               # leaves room for the page footer
    grid_h     = top - bottom_pad
    gap        = 0.22 * inch
    cell_h     = (grid_h - gap) / 2.0
    cell_w     = (PAGE_W - 2 * MARGIN - gap) / 2.0
    swatch_h   = cell_h * 0.64
    label_h    = cell_h - swatch_h

    examples = [
        (True,  "Use the wordmark on Navy or Ivory.",        NAVY,    IVORY,   "wordmark_navy"),
        (False, "Never place the mark on busy photography.", None,    IVORY,   "busy_photo"),
        (True,  "Pair Gold CTAs with Navy surfaces.",        NAVY,    GOLD,    "gold_cta"),
        (False, "Never outline, rotate, or stretch the mark.", IVORY, INK,     "distorted"),
    ]

    for idx, (ok, label, bg, fg, kind) in enumerate(examples):
        col = idx % 2
        row = idx // 2
        x        = MARGIN + col * (cell_w + gap)
        cell_top = top - row * (cell_h + gap)
        cell_bot = cell_top - cell_h
        swatch_bot = cell_top - swatch_h

        # Swatch panel
        if bg is not None:
            c.setFillColor(bg)
            c.roundRect(x, swatch_bot, cell_w, swatch_h, 8, stroke=0, fill=1)

        # Swatch content
        if kind == "wordmark_navy":
            c.setFillColor(IVORY)
            c.setFont("Fraunces", 58)
            word = "Brivo"
            tw = pdfmetrics.stringWidth(word, "Fraunces", 58)
            c.drawString(x + (cell_w - tw) / 2, swatch_bot + swatch_h / 2 - 18, word)

        elif kind == "busy_photo":
            # Fake busy photo background with warm/cool abstract rectangles
            import random
            random.seed(7)
            # clip to swatch region
            c.saveState()
            p = c.beginPath()
            p.roundRect(x, swatch_bot, cell_w, swatch_h, 8)
            c.clipPath(p, stroke=0, fill=0)
            # base wash
            c.setFillColor(HexColor("#3B4A2E"))
            c.rect(x, swatch_bot, cell_w, swatch_h, stroke=0, fill=1)
            for _ in range(110):
                rx = x + random.random() * cell_w
                ry = swatch_bot + random.random() * swatch_h
                rw = 18 + random.random() * 70
                rh = 12 + random.random() * 48
                rot = random.random()
                shade_r = 0.25 + random.random() * 0.65
                shade_g = 0.25 + random.random() * 0.55
                shade_b = 0.15 + random.random() * 0.45
                c.setFillColor(Color(shade_r, shade_g, shade_b, alpha=0.75))
                c.rect(rx, ry, rw, rh, stroke=0, fill=1)
            c.restoreState()
            # Mark on top (white, semi-transparent — hard to read on purpose)
            c.setFillColor(Color(1, 1, 1, alpha=0.88))
            c.setFont("Fraunces", 58)
            word = "Brivo"
            tw = pdfmetrics.stringWidth(word, "Fraunces", 58)
            c.drawString(x + (cell_w - tw) / 2, swatch_bot + swatch_h / 2 - 18, word)
            # Small red "X" crossmark corner
            c.setFillColor(HexColor("#B8504C"))
            c.circle(x + cell_w - 18, swatch_bot + swatch_h - 18, 9, stroke=0, fill=1)
            c.setFillColor(IVORY)
            c.setFont("Inter", 11)
            c.drawCentredString(x + cell_w - 18, swatch_bot + swatch_h - 22, "✕")

        elif kind == "gold_cta":
            # Pill CTA button
            btn_w, btn_h = 2.3 * inch, 0.6 * inch
            bx = x + (cell_w - btn_w) / 2
            by = swatch_bot + (swatch_h - btn_h) / 2
            c.setFillColor(GOLD)
            c.roundRect(bx, by, btn_w, btn_h, btn_h / 2, stroke=0, fill=1)
            c.setFillColor(IVORY)
            c.setFont("Inter", 12)
            btn_txt = "Book a strategy call"
            tw = pdfmetrics.stringWidth(btn_txt, "Inter", 12)
            c.drawString(bx + (btn_w - tw) / 2, by + btn_h / 2 - 4, btn_txt)
            # tiny arrow
            c.setFillColor(IVORY)
            c.setFont("Inter", 12)
            c.drawString(bx + (btn_w + tw) / 2 + 8, by + btn_h / 2 - 4, "→")

        elif kind == "distorted":
            # Rotated + stretched wordmark to illustrate misuse
            c.saveState()
            cx = x + cell_w / 2
            cy = swatch_bot + swatch_h / 2
            c.translate(cx, cy)
            c.rotate(-11)
            c.scale(1.35, 0.78)  # distort: wider + shorter
            c.setFillColor(INK)
            c.setFont("Fraunces", 58)
            word = "Brivo"
            tw = pdfmetrics.stringWidth(word, "Fraunces", 58)
            c.drawString(-tw / 2, -16, word)
            c.restoreState()
            # Small red "X" crossmark corner
            c.setFillColor(HexColor("#B8504C"))
            c.circle(x + cell_w - 18, swatch_bot + swatch_h - 18, 9, stroke=0, fill=1)
            c.setFillColor(IVORY)
            c.setFont("Inter", 11)
            c.drawCentredString(x + cell_w - 18, swatch_bot + swatch_h - 22, "✕")
            # also stroke border so the ivory swatch has an edge
            c.setStrokeColor(HAIRLINE)
            c.setLineWidth(0.6)
            c.roundRect(x, swatch_bot, cell_w, swatch_h, 8, stroke=1, fill=0)

        # Label panel beneath the swatch
        panel_color = PAPER if ok else HexColor("#F6E6E0")
        c.setFillColor(panel_color)
        c.rect(x, cell_bot, cell_w, label_h, stroke=0, fill=1)

        # Tag & description
        tag_color = GOLD if ok else HexColor("#B8504C")
        c.setFillColor(tag_color)
        c.setFont("Inter", 8)
        # consistent y baseline from the top of the label panel
        tag_y = cell_bot + label_h - 20
        desc_y = cell_bot + label_h - 40
        c.drawString(x + 16, tag_y, "DO" if ok else "DON'T")
        c.setFillColor(INK)
        c.setFont("Fraunces", 17)
        c.drawString(x + 16, desc_y, label)

    _page_footer(c, 7, total)


# ---------- Full-bleed "in-context" social pages ----------

def _draw_phone_frame(c: canvas.Canvas, x: float, y: float, w: float, h: float,
                      image_path: Path) -> None:
    # shadow
    c.setFillColor(Color(0, 0, 0, alpha=0.18))
    c.roundRect(x + 6, y - 6, w, h, 28, stroke=0, fill=1)
    # body
    c.setFillColor(HexColor("#0B0F15"))
    c.roundRect(x, y, w, h, 28, stroke=0, fill=1)
    # screen
    inset = 8
    c.setFillColor(HexColor("#000"))
    c.roundRect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, 22, stroke=0, fill=1)
    # notch
    notch_w = w * 0.32
    c.setFillColor(HexColor("#0B0F15"))
    c.roundRect(x + (w - notch_w) / 2, y + h - 22, notch_w, 16, 8, stroke=0, fill=1)
    # image
    c.drawImage(str(image_path),
                x + inset + 2, y + inset + 2,
                width=w - 2 * inset - 4, height=h - 2 * inset - 4,
                preserveAspectRatio=True, mask='auto', anchor='c')


def page_instagram(c: canvas.Canvas, total: int) -> None:
    _bleed(c, NAVY_DEEP)
    # accent block
    c.setFillColor(NAVY_SOFT)
    c.rect(0, 0, PAGE_W * 0.56, PAGE_H, stroke=0, fill=1)

    _eyebrow(c, "06  ·  Instagram kit", MARGIN, PAGE_H - 0.9 * inch, color=GOLD_HI, size=9)

    c.setFillColor(IVORY)
    c.setFont("Fraunces", 52)
    c.drawString(MARGIN, PAGE_H - 1.95 * inch, "Instagram")
    c.setFillColor(GOLD_HI)
    c.setFont("FrauncesIt", 48)
    c.drawString(MARGIN, PAGE_H - 2.65 * inch, "in context.")

    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 10.5)
    blurb = [
        "Story, post, and highlight — all pre-sized and poster-styled.",
        "Drop straight into Later, Buffer, or native IG.",
    ]
    yy = PAGE_H - 3.1 * inch
    for ln in blurb:
        c.drawString(MARGIN, yy, ln)
        yy -= 15

    # Spec table
    specs = [
        ("Story / Reel Cover",  "1080 × 1920",  "instagram-story.jpg"),
        ("Grid Post",           "1080 × 1080",  "instagram-post.jpg"),
        ("Cover / Highlight",   "1920 × 1080",  "instagram-cover.jpg"),
    ]
    ty = PAGE_H - 4.4 * inch
    c.setFillColor(GOLD_HI)
    c.setFont("Inter", 8)
    c.drawString(MARGIN, ty, "ASSET")
    c.drawString(MARGIN + 2.1 * inch, ty, "SIZE")
    c.drawString(MARGIN + 3.6 * inch, ty, "FILE")
    ty -= 10
    _hairline(c, MARGIN, ty, PAGE_W * 0.53, ty, color=HexColor("#2A3A52"))
    for name, size, filen in specs:
        ty -= 22
        c.setFillColor(IVORY)
        c.setFont("Fraunces", 13)
        c.drawString(MARGIN, ty, name)
        c.setFillColor(HexColor("#C9D3DF"))
        c.setFont("Inter", 10)
        c.drawString(MARGIN + 2.1 * inch, ty, size)
        c.setFont("Inter", 10)
        c.drawString(MARGIN + 3.6 * inch, ty, filen)
        _hairline(c, MARGIN, ty - 8, PAGE_W * 0.53, ty - 8, color=HexColor("#1F2E44"))

    # Phone frame on right with story image
    ph_w = 2.2 * inch
    ph_h = ph_w * 2.05
    ph_x = PAGE_W - MARGIN - ph_w - 0.4 * inch
    ph_y = (PAGE_H - ph_h) / 2 - 0.2 * inch
    story = ASSET_DIR / "instagram-story.jpg"
    if story.exists():
        _draw_phone_frame(c, ph_x, ph_y, ph_w, ph_h, story)

    # Small post card to the left of phone
    post_w = 1.8 * inch
    post_h = 1.8 * inch
    post_x = ph_x - post_w - 0.3 * inch
    post_y = ph_y + 0.3 * inch
    c.setFillColor(Color(0, 0, 0, alpha=0.25))
    c.roundRect(post_x + 4, post_y - 4, post_w, post_h, 10, stroke=0, fill=1)
    post = ASSET_DIR / "instagram-post.jpg"
    if post.exists():
        c.drawImage(str(post), post_x, post_y, post_w, post_h,
                    preserveAspectRatio=True, mask='auto', anchor='c')
    # label
    c.setFillColor(GOLD_HI)
    c.setFont("Inter", 7.5)
    c.drawString(post_x, post_y - 14, "GRID POST  ·  1:1")

    _dark_footer(c, 8, total)


def page_social_covers(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "07  ·  X  ·  LinkedIn  ·  YouTube", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "Profile covers.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "Three banners, three ratios, one consistent editorial tone.")

    # Three stacked banner mocks
    banners = [
        ("twitter-header.jpg",  "X (Twitter) Header",    "1500 × 500   ·   3:1 banner"),
        ("linkedin-cover.jpg",  "LinkedIn Company Cover","1584 × 396   ·   4:1 banner"),
        ("youtube-banner.jpg",  "YouTube Channel Art",   "2560 × 1440  ·  safe area 1546×423"),
    ]
    start_y = PAGE_H - 2.4 * inch
    avail_w = PAGE_W - 2 * MARGIN
    for i, (fname, label, spec) in enumerate(banners):
        path = ASSET_DIR / fname
        h = [1.0, 0.85, 1.25][i] * inch
        y = start_y - sum(
            [1.0 + 0.35, 0.85 + 0.35, 1.25 + 0.35][:i]
        ) * inch - h
        # shadow
        c.setFillColor(Color(0, 0, 0, alpha=0.08))
        c.roundRect(MARGIN + 3, y - 3, avail_w, h, 8, stroke=0, fill=1)
        # banner
        if path.exists():
            c.saveState()
            # clip region
            p = c.beginPath()
            p.roundRect(MARGIN, y, avail_w, h, 8)
            c.clipPath(p, stroke=0, fill=0)
            c.drawImage(str(path), MARGIN, y, avail_w, h,
                        preserveAspectRatio=True, mask='auto', anchor='c')
            c.restoreState()
        # meta label on right
        c.setFillColor(GOLD)
        c.setFont("Inter", 7.5)
        c.drawString(MARGIN, y - 14, label.upper() + "   ·   " + spec)

    _page_footer(c, 9, total)


def page_voice(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "09  ·  Voice & tone", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "How we sound.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "Confident. Concrete. A little smug — because the work is that good. Never corporate.")

    # Voice attributes
    attrs = [
        ("Confident, not arrogant",    "We don't hedge. We don't oversell. We say the thing."),
        ("Concrete, not fluffy",       "Numbers, deadlines, and screenshots over adjectives."),
        ("Editorial, not promotional", "Treat every post like a spread in Monocle — not a sale."),
        ("Warm, not cold",             "Smart-friend tone. Talk to the founder, not the procurement desk."),
    ]
    cy = PAGE_H - 2.8 * inch
    for label, desc in attrs:
        c.setFillColor(GOLD)
        c.setFont("Inter", 8)
        c.drawString(MARGIN, cy, label.upper())
        c.setFillColor(INK)
        c.setFont("Fraunces", 18)
        c.drawString(MARGIN, cy - 18, label)
        c.setFillColor(MUTED)
        c.setFont("Inter", 10)
        c.drawString(MARGIN, cy - 34, desc)
        _hairline(c, MARGIN, cy - 48, PAGE_W / 2 - 0.2 * inch, cy - 48, color=HAIRLINE)
        cy -= 60

    # Right — "say" / "don't say" table
    rx = PAGE_W / 2 + 0.1 * inch
    ry = PAGE_H - 2.8 * inch
    c.setFillColor(GOLD)
    c.setFont("Inter", 8)
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
    ry -= 20
    for a, b in pairs:
        c.setFillColor(INK)
        c.setFont("Fraunces", 12)
        c.drawString(rx, ry, a)
        c.setFillColor(DIM)
        c.setFont("FrauncesIt", 12)
        c.drawString(rx + 2.5 * inch, ry, b)
        _hairline(c, rx, ry - 10, PAGE_W - MARGIN, ry - 10, color=HAIRLINE, width=0.3)
        ry -= 28

    _page_footer(c, 10, total)


def page_playbook(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "10  ·  Social playbook", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "The rhythm.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "A weekly loop. Compounding, not sporadic.")

    # Weekly cadence grid
    days = [
        ("MON", "Receipts",    "Screenshot of last week's client wins + numbers."),
        ("TUE", "Teardown",    "Carousel breaking down a site that over-/under-performs."),
        ("WED", "BTS",         "Studio in motion — a 9-second dev or design shot."),
        ("THU", "Heat",        "Hot take on a design or marketing trend."),
        ("FRI", "Case note",   "One paragraph result + one chart. That's it."),
        ("SAT", "Quiet",       "No post. Scheduling day. We protect the feed's pace."),
        ("SUN", "Essay",       "Long-form carousel. Thinking out loud for founders."),
    ]
    ty = PAGE_H - 2.5 * inch
    row_h = 34
    _hairline(c, MARGIN, ty - 6, PAGE_W - MARGIN, ty - 6, color=HAIRLINE)
    c.setFillColor(GOLD)
    c.setFont("Inter", 8)
    c.drawString(MARGIN, ty, "DAY")
    c.drawString(MARGIN + 0.8 * inch, ty, "THEME")
    c.drawString(MARGIN + 2.6 * inch, ty, "FORMAT")
    ty -= row_h - 6
    for d, t, f in days:
        c.setFillColor(GOLD)
        c.setFont("Inter", 9)
        c.drawString(MARGIN, ty, d)
        c.setFillColor(INK)
        c.setFont("Fraunces", 14)
        c.drawString(MARGIN + 0.8 * inch, ty, t)
        c.setFillColor(MUTED)
        c.setFont("Inter", 10)
        c.drawString(MARGIN + 2.6 * inch, ty, f)
        _hairline(c, MARGIN, ty - 10, PAGE_W - MARGIN, ty - 10, color=HAIRLINE, width=0.3)
        ty -= row_h

    # Bottom strip — caption formula
    by = 1.3 * inch
    c.setFillColor(NAVY)
    c.roundRect(MARGIN, by, PAGE_W - 2 * MARGIN, 1.3 * inch, 8, stroke=0, fill=1)
    c.setFillColor(GOLD_HI)
    c.setFont("Inter", 8)
    c.drawString(MARGIN + 20, by + 1.05 * inch, "THE BRIVO CAPTION FORMULA")
    c.setFillColor(IVORY)
    c.setFont("Fraunces", 18)
    c.drawString(MARGIN + 20, by + 0.7 * inch, "Hook (5 words).  ·  One number.  ·  One line of opinion.  ·  One CTA.")
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 9.5)
    c.drawString(MARGIN + 20, by + 0.38 * inch,
                 "Example —  Your hero is leaking revenue.  ·  37% of visitors bounce before the fold.  ·  It's not the copy — it's the load time.  ·  Reply SPEED for the audit doc.")

    _page_footer(c, 11, total)


def page_asset_index(c: canvas.Canvas, total: int) -> None:
    _bleed(c, IVORY)
    _eyebrow(c, "11  ·  Asset index", MARGIN, PAGE_H - 0.9 * inch, color=GOLD, size=9)
    c.setFillColor(INK)
    c.setFont("Fraunces", 46)
    c.drawString(MARGIN, PAGE_H - 1.7 * inch, "Every file. Every link.")
    c.setFillColor(MUTED)
    c.setFont("Inter", 10)
    c.drawString(MARGIN, PAGE_H - 2.05 * inch,
                 "Copy-paste URLs. All assets are hosted on brivomarketing.com — no CDN dance required.")

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
    ty = PAGE_H - 2.5 * inch
    c.setFillColor(GOLD)
    c.setFont("Inter", 8)
    c.drawString(MARGIN, ty, "ASSET")
    c.drawString(MARGIN + 2.5 * inch, ty, "SIZE")
    c.drawString(MARGIN + 3.6 * inch, ty, "URL")
    _hairline(c, MARGIN, ty - 6, PAGE_W - MARGIN, ty - 6, color=HAIRLINE)
    ty -= 20
    for name, filen, size in assets:
        url = f"https://brivomarketing.com/kit-assets/{filen}"
        c.setFillColor(INK)
        c.setFont("Fraunces", 13)
        c.drawString(MARGIN, ty, name)
        c.setFillColor(MUTED)
        c.setFont("Inter", 10)
        c.drawString(MARGIN + 2.5 * inch, ty, size)
        c.setFillColor(GOLD)
        c.setFont("Inter", 10)
        c.drawString(MARGIN + 3.6 * inch, ty, url)
        # link
        link_w = pdfmetrics.stringWidth(url, "Inter", 10)
        c.linkURL(url, (MARGIN + 3.6 * inch, ty - 2,
                        MARGIN + 3.6 * inch + link_w, ty + 10), relative=0)
        _hairline(c, MARGIN, ty - 10, PAGE_W - MARGIN, ty - 10, color=HAIRLINE, width=0.3)
        ty -= 28

    _page_footer(c, 12, total)


def page_back_cover(c: canvas.Canvas) -> None:
    _bleed(c, NAVY_DEEP)

    # radial glow
    c.saveState()
    for i, alpha in enumerate([0.04, 0.065, 0.1]):
        c.setFillColor(Color(0.72, 0.53, 0.30, alpha=alpha))
        r = 520 - i * 120
        c.ellipse(-r/2 + 60, PAGE_H - r * 0.75, r/2 + 60, PAGE_H + r/4,
                  stroke=0, fill=1)
    c.restoreState()

    _hairline(c, MARGIN, PAGE_H - 0.55 * inch, PAGE_W - MARGIN,
              PAGE_H - 0.55 * inch, color=HexColor("#2A3A52"))
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 8)
    c.drawString(MARGIN, PAGE_H - 0.42 * inch, "BRIVO — END OF VOLUME 01")
    right = "THANK YOU FOR READING  ·  HELLO@BRIVOMARKETING.COM"
    w = pdfmetrics.stringWidth(right, "Inter", 8)
    c.drawString(PAGE_W - MARGIN - w, PAGE_H - 0.42 * inch, right)

    _eyebrow(c, "One last thing", MARGIN, PAGE_H - 1.15 * inch, color=GOLD, size=9)
    c.setFillColor(IVORY)
    c.setFont("Fraunces", 92)
    c.drawString(MARGIN, PAGE_H - 2.55 * inch, "Let's build")
    c.setFillColor(GOLD_HI)
    c.setFont("FrauncesIt", 92)
    c.drawString(MARGIN, PAGE_H - 3.7 * inch, "something loud.")

    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 11.5)
    lines = [
        "If you've read this far, you already get it.",
        "We're small on purpose. We pick four partners a quarter.",
        "Tell us what you're shipping and we'll tell you in 48 hours if we're the right studio.",
    ]
    ly = PAGE_H - 4.4 * inch
    for ln in lines:
        c.drawString(MARGIN, ly, ln)
        ly -= 17

    # CTA pill
    btn_w, btn_h = 2.6 * inch, 0.55 * inch
    bx = MARGIN
    by = ly - 0.35 * inch
    c.setFillColor(GOLD)
    c.roundRect(bx, by, btn_w, btn_h, btn_h / 2, stroke=0, fill=1)
    c.setFillColor(IVORY)
    c.setFont("Inter", 12)
    cta = "Talk to our studio  →"
    tw = pdfmetrics.stringWidth(cta, "Inter", 12)
    c.drawString(bx + (btn_w - tw) / 2, by + btn_h / 2 - 4, cta)
    c.linkURL("https://brivomarketing.com/#inquiry",
              (bx, by, bx + btn_w, by + btn_h), relative=0)

    # Signature on right
    _draw_logo_mark(c, PAGE_W - 1.8 * inch, PAGE_H / 2 + 0.3 * inch,
                    1.2 * inch, mark_color=GOLD_HI)
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 9)
    c.drawCentredString(PAGE_W - 1.8 * inch, PAGE_H / 2 - 1.3 * inch,
                        "B R I V O")
    c.setFillColor(HexColor("#7C8BA0"))
    c.setFont("Inter", 7.5)
    c.drawCentredString(PAGE_W - 1.8 * inch, PAGE_H / 2 - 1.5 * inch,
                        "PERFORMANCE STUDIO")

    # Bottom meta
    _hairline(c, MARGIN, 0.85 * inch, PAGE_W - MARGIN, 0.85 * inch,
              color=HexColor("#2A3A52"))
    c.setFillColor(HexColor("#C9D3DF"))
    c.setFont("Inter", 8.5)
    c.drawString(MARGIN, 0.6 * inch, "brivomarketing.com   ·   @brivomarketing   ·   hello@brivomarketing.com")
    c.setFillColor(HexColor("#7C8BA0"))
    c.setFont("Inter", 7.5)
    c.drawString(MARGIN, 0.42 * inch, "© 2026 Brivo Marketing LLC.  ·  This document is v1.0 of the Brivo Brand System.")


# ----------------------------------------------------------------------
# Build
# ----------------------------------------------------------------------

def build() -> None:
    register_fonts()
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(OUT_PATH), pagesize=(PAGE_W, PAGE_H))
    c.setTitle("Brivo — The Brand System (Volume 01)")
    c.setAuthor("Brivo Marketing")
    c.setSubject("Social media blitz  ·  Brand kit  ·  v1.0")
    c.setKeywords("Brivo, brand kit, social media, marketing, performance studio")

    total = 13  # cover + 11 content + back cover

    page_cover(c);                      c.showPage()
    page_toc(c, total);                 c.showPage()
    page_manifesto(c, total);           c.showPage()
    page_logo_system(c, total);         c.showPage()
    page_color(c, total);               c.showPage()
    page_type(c, total);                c.showPage()
    page_dos_donts(c, total);           c.showPage()
    page_instagram(c, total);           c.showPage()
    page_social_covers(c, total);       c.showPage()
    page_voice(c, total);               c.showPage()
    page_playbook(c, total);            c.showPage()
    page_asset_index(c, total);         c.showPage()
    page_back_cover(c);                 c.showPage()

    c.save()
    size_kb = os.path.getsize(OUT_PATH) / 1024.0
    print(f"✓ wrote {OUT_PATH}  ({size_kb:,.1f} KB  ·  {total} pages)")


if __name__ == "__main__":
    build()
