"""
Content factory — turns a 'days × posts/day' request into a batch of
ready-to-post social entries following the BrivoMarketing weekly rhythm.

Captions: Gemini 3 Pro via the Khaelyx LLM stack (text)
Images:   Nano Banana via the Khaelyx LLM stack (image generation)

Theme rotation comes straight from the brand kit playbook page:
  Mon = Receipts        (client wins, screenshot vibe)
  Tue = Teardown        (carousel-style breakdown of a site)
  Wed = BTS             (studio in motion)
  Thu = Heat            (hot take on a trend)
  Fri = Case note       (one paragraph + one chart)
  Sat = Quiet           (no post)
  Sun = Essay           (long-form thinking)
"""
from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

WEEKLY_THEMES = {
    0: ("receipts",  "A client win — quick stat reveal in BrivoMarketing voice. Concrete number, one line of opinion, one CTA."),
    1: ("teardown",  "A short teardown of a generic site that under-performs. Confident, one number, light snark."),
    2: ("bts",       "Behind-the-scenes from BrivoMarketing studio. Process line + contrast moment. Short."),
    3: ("heat",      "A hot take on a current marketing/design trend. Polarising but well-argued."),
    4: ("casenote",  "A one-paragraph case note: client problem → what we did → measurable lift."),
    5: None,                                                                                # Saturday quiet
    6: ("essay",     "Long-form (carousel) opening — thinking out loud for founders."),
}

KIT_DIR = Path("/app/frontend/public/kit-assets")
GEN_DIR = KIT_DIR / "generated"
GEN_DIR.mkdir(parents=True, exist_ok=True)


FALLBACK_CAPTIONS = {
    "receipts":  ("Quick receipt — last week we shipped a custom site that lifted CVR by +27% in 11 days. Speed is a feature. Reply AUDIT for the breakdown.", "#growth #performance #receipts #cro"),
    "teardown":  ("A teardown for the founders in the back: when the hero takes 3.4s to paint, you're hemorrhaging revenue you'll never know about. Fix the load before the copy.", "#webdesign #performance #teardown"),
    "bts":       ("Studio in motion — 6 prototypes burned, 1 chosen, shipped at 2:14am. The right detail is the one nobody notices. That's the whole job.", "#bts #studio #craft"),
    "heat":      ("Hot take: 'AI websites' that all look the same are the new Squarespace. The moat isn't the model — it's the taste running it.", "#hottake #ai #branding"),
    "casenote":  ("Case note: founder came in with a 1.8% conversion rate. We rebuilt the funnel in 16 days. Now sitting at 5.4%. Same traffic, 3× the revenue.", "#casestudy #cro #performance"),
    "essay":     ("Essay drop — Why most founder sites under-convert: they're written for the founder, not the customer. Three signs your hero is leaking and how to fix it. Carousel ↓", "#founder #essay #conversion"),
}


# -------------------------------------------------------------------- caption
async def _gen_caption(theme: str, hint: str, platform: str) -> dict:
    """Returns {'caption': ..., 'hashtags': '...'} via Gemini.

    Falls back to a curated template if the LLM key is over budget /
    unavailable — that way the queue keeps working and tops back up to
    AI-generated captions automatically once balance is restored.
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ["EMERGENT_LLM_KEY"]

    system = (
        "You are the lead social copywriter at BrivoMarketing — a high-performance "
        "AI marketing studio. Voice: confident, concrete, no fluff, never invents "
        "metrics or client names. Output VALID JSON ONLY, no prose, no fences."
    )
    user = (
        f"Theme today: {theme.upper()}\n"
        f"What that means: {hint}\n"
        f"Platform: {platform}\n"
        f"Length rules:\n"
        f"  - x: <270 chars TOTAL, 1-2 short paragraphs.\n"
        f"  - instagram: 100-220 words, 3-6 hashtags at the very end.\n"
        f"  - linkedin: 100-300 words, hook line + 2-3 short paragraphs + one takeaway.\n"
        f"Use real-feeling but generic stat ranges (e.g. \"+27%\", \"<48h\"); never name a client.\n"
        f"Respond with JSON: {{\"caption\":\"...\",\"hashtags\":\"#a #b #c\"}}"
    )

    llm = LlmChat(
        api_key=api_key,
        session_id=f"social-{uuid.uuid4()}",
        system_message=system,
    ).with_model("gemini", "gemini-2.5-pro")
    try:
        raw = await llm.send_message(UserMessage(text=user))
        return _parse_caption(raw)
    except Exception as e:
        logger.warning("Caption LLM failed (%s) — using fallback for theme=%s", e, theme)
        cap, tags = FALLBACK_CAPTIONS.get(theme, FALLBACK_CAPTIONS["receipts"])
        return {"caption": cap, "hashtags": tags}


def _parse_caption(raw: str) -> dict:
    text = raw.strip().strip("`")
    if text.lower().startswith("json"):
        text = text[4:].lstrip()
    s, e = text.find("{"), text.rfind("}")
    if s != -1 and e != -1:
        try:
            obj = json.loads(text[s : e + 1])
            return {
                "caption": (obj.get("caption") or "").strip(),
                "hashtags": (obj.get("hashtags") or "").strip(),
            }
        except json.JSONDecodeError:
            pass
    return {"caption": raw.strip()[:1200], "hashtags": ""}


# ---------------------------------------------------------------------- image
async def _gen_image(theme: str, caption: str) -> Optional[str]:
    """Generate a 1080x1080 brand-tile via Nano Banana (Gemini image).

    Returns a public URL path under /kit-assets/generated/<id>.png or None on
    failure (caller can still post text-only).
    """
    api_key = os.environ["EMERGENT_LLM_KEY"]

    prompt = (
        "Editorial brand poster, 1:1 square, BrivoMarketing palette: "
        "deep navy (#0B1B2B), gold (#B8864C), cream (#F5D7A4), ivory. "
        "Theme: " + theme + ". "
        "Style: high-end magazine, premium typography, lots of negative space, "
        "subtle film grain, very minimal, NO logos, NO real brand names, NO faces. "
        "Caption inspiration: " + caption[:160]
    )

    # Use Nano Banana via emergentintegrations
    try:
        from emergentintegrations.llm.gemini.image_generation import (
            GeminiImageGeneration,
        )
        gen = GeminiImageGeneration(api_key=api_key)
        out_bytes = await gen.generate_images(
            prompt=prompt,
            model="gemini-2.5-flash-image-preview",
            number_of_images=1,
        )
        if not out_bytes:
            return None
        first = out_bytes[0] if isinstance(out_bytes, list) else out_bytes
        if isinstance(first, str):
            first = base64.b64decode(first)
        fname = f"{uuid.uuid4().hex}.png"
        out_path = GEN_DIR / fname
        out_path.write_bytes(first)
        return f"/kit-assets/generated/{fname}"
    except Exception as e:
        logger.warning("Image generation skipped (%s)", e)
        return None


# ----------------------------------------------------------------- entrypoint
async def generate_post_batch(
    db,
    days: int,
    platforms: list[str],
    posts_per_day: int,
    admin_email: str,
) -> list[dict]:
    """Walk forward `days` days, skipping Sat (quiet), and build posts."""
    created: list[dict] = []
    base = datetime.now(timezone.utc).replace(hour=15, minute=0, second=0, microsecond=0)
    if base < datetime.now(timezone.utc):
        base += timedelta(days=1)

    for day_offset in range(days):
        day = base + timedelta(days=day_offset)
        wd = day.weekday()
        theme_pair = WEEKLY_THEMES.get(wd)
        if not theme_pair:
            continue
        theme, hint = theme_pair

        for slot in range(posts_per_day):
            slot_at = day + timedelta(hours=slot * 4)  # spread across day if multi
            # one captioned post fans across all platforms requested
            primary = platforms[0] if platforms else "x"
            try:
                cap = await _gen_caption(theme, hint, primary)
            except Exception as e:
                logger.exception("Caption gen failed (%s) — skipping slot", e)
                continue

            caption_full = cap["caption"]
            if cap["hashtags"]:
                caption_full = f"{caption_full}\n\n{cap['hashtags']}"

            image_url = await _gen_image(theme, cap["caption"])

            doc = {
                "id": str(uuid.uuid4()),
                "caption": caption_full,
                "image_url": image_url,
                "video_url": None,
                "platforms": platforms,
                "scheduled_at": slot_at.isoformat(),
                "theme": theme,
                "status": "queued",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": admin_email,
                "ai_generated": True,
            }
            await db.social_posts.insert_one(doc)
            doc.pop("_id", None)
            created.append(doc)

    return created
