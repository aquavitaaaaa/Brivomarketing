"""
Phase 1 content factory helpers:
  B) Hook library + A/B variant generation
  H) Client-win recycler (queue floor guarantor)
  Q) Cross-poster (single brief -> reformatted post per platform)

All three are glue around the existing caption-generation path in
`social_content.py` + the `social_posts` collection. They are deliberately
isolated so the scheduler + dispatcher can ignore them entirely.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent / "data"
QUEUE_FLOOR = 3            # keep at least N queued posts looking forward 24h
QUEUE_FLOOR_HORIZON_HRS = 24
RECYCLER_TICK_SECONDS = 300  # 5 min

PLATFORM_LENGTH = {
    "x":         "Punchy, under 270 characters, 1-2 paragraphs.",
    "instagram": "Casual, 100-220 words, 3-6 hashtags at the end.",
    "linkedin": "Professional, story-led, 100-300 words, one clear takeaway.",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# =========================================================== HOOK LIBRARY (B)

async def seed_hook_library(db) -> None:
    """Seed hook_library collection from data/hook_library.json if empty."""
    count = await db.hook_library.count_documents({})
    if count > 0:
        return
    path = DATA_DIR / "hook_library.json"
    try:
        raw = json.loads(path.read_text())
    except Exception as e:
        logger.warning("Could not load hook library: %s", e)
        return
    now = _now_iso()
    docs = [{
        "id": str(uuid.uuid4()),
        "slug": h["slug"],
        "template": h["template"],
        "category": h.get("category", "generic"),
        "uses": 0,
        "wins": 0,
        "score": 1.0,  # mean engagement, updated over time
        "created_at": now,
    } for h in raw]
    await db.hook_library.insert_many(docs)
    logger.info("Seeded %d hooks", len(docs))


async def pick_hooks(db, n: int = 3, epsilon: float = 0.3) -> list[dict]:
    """Epsilon-greedy hook selection.

    With prob ε we pick randomly (exploration). Otherwise we bias toward
    higher-score hooks (exploitation). Returns `n` distinct hooks.
    """
    hooks = await db.hook_library.find({}, {"_id": 0}).to_list(length=500)
    if not hooks:
        return []
    if len(hooks) <= n:
        return hooks
    if random.random() < epsilon:
        return random.sample(hooks, n)
    # weighted pick without replacement
    weights = [max(0.01, float(h.get("score", 1.0))) for h in hooks]
    chosen: list[dict] = []
    pool = list(zip(hooks, weights))
    for _ in range(n):
        total = sum(w for _, w in pool)
        r = random.uniform(0, total)
        acc = 0.0
        for i, (h, w) in enumerate(pool):
            acc += w
            if r <= acc:
                chosen.append(h)
                pool.pop(i)
                break
    return chosen


async def record_hook_outcome(db, hook_id: str, engagement: float = 1.0) -> None:
    """Bump a hook's use count + update its rolling mean score.
    engagement is any normalised metric (impressions/reach/likes/engagement-rate).
    """
    doc = await db.hook_library.find_one({"id": hook_id}, {"_id": 0})
    if not doc:
        return
    uses = int(doc.get("uses", 0)) + 1
    mean = float(doc.get("score", 1.0))
    # incremental mean update
    mean = mean + (engagement - mean) / uses
    await db.hook_library.update_one(
        {"id": hook_id},
        {"$set": {"uses": uses, "score": mean, "last_used_at": _now_iso()}},
    )


# ========================================================= CLIENT WINS (H)

async def seed_wins(db) -> None:
    """Seed client_wins collection from data/seed_wins.json if empty."""
    count = await db.client_wins.count_documents({})
    if count > 0:
        return
    path = DATA_DIR / "seed_wins.json"
    try:
        raw = json.loads(path.read_text())
    except Exception as e:
        logger.warning("Could not load wins seed: %s", e)
        return
    now = _now_iso()
    docs = [{
        "id": str(uuid.uuid4()),
        **w,
        "uses": 0,
        "last_used_at": None,
        "created_at": now,
    } for w in raw]
    await db.client_wins.insert_many(docs)
    logger.info("Seeded %d client wins", len(docs))


async def pick_least_recent_win(db) -> Optional[dict]:
    """Return a win that has been used least recently. Null if none exist."""
    cur = db.client_wins.find({}, {"_id": 0}).sort([
        ("last_used_at", 1),  # None first, then oldest
        ("uses", 1),
    ]).limit(1)
    lst = await cur.to_list(length=1)
    return lst[0] if lst else None


async def queue_floor_low(db) -> bool:
    """True if we have fewer than QUEUE_FLOOR queued posts scheduled in the
    next QUEUE_FLOOR_HORIZON_HRS hours."""
    now = datetime.now(timezone.utc)
    horizon = (now + timedelta(hours=QUEUE_FLOOR_HORIZON_HRS)).isoformat()
    count = await db.social_posts.count_documents({
        "status": {"$in": ["queued", "scheduled"]},
        "scheduled_at": {"$lte": horizon},
    })
    return count < QUEUE_FLOOR


async def draft_post_from_win(db, win: dict, platforms: Optional[list[str]] = None) -> dict:
    """Use the LLM (with graceful fallback) to write a 'receipts' post from a win,
    pick a hook from the library, and insert into social_posts."""
    from social import _resolve_agent  # lazy to avoid cycles

    platforms = platforms or ["x", "instagram", "linkedin"]
    hooks = await pick_hooks(db, n=1, epsilon=0.2)
    hook = hooks[0] if hooks else None

    caption, hashtags = _fallback_win_caption(win, hook)
    try:
        caption, hashtags = await _llm_win_caption(db, win, hook, platforms[0])
    except Exception as e:
        logger.warning("LLM win draft failed (%s) — using fallback", e)

    # Pin scheduled_at ~45 min from now so cadence guard has room
    when = (datetime.now(timezone.utc) + timedelta(minutes=45)).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "caption": f"{caption}\n\n{hashtags}".strip(),
        "image_url": None,
        "video_url": None,
        "platforms": platforms,
        "scheduled_at": when,
        "theme": "receipts",
        "status": "queued",
        "created_at": _now_iso(),
        "created_by": "wins_recycler",
        "ai_generated": True,
        "source": "wins_recycler",
        "source_win_id": win["id"],
        "hook_id": hook["id"] if hook else None,
        "hook_slug": hook["slug"] if hook else None,
    }
    await db.social_posts.insert_one(doc)
    doc.pop("_id", None)

    await db.client_wins.update_one(
        {"id": win["id"]},
        {"$set": {"last_used_at": _now_iso()}, "$inc": {"uses": 1}},
    )
    if hook:
        await db.hook_library.update_one(
            {"id": hook["id"]},
            {"$inc": {"uses": 1}, "$set": {"last_used_at": _now_iso()}},
        )
    return doc


def _fallback_win_caption(win: dict, hook: Optional[dict]) -> tuple[str, str]:
    metric = win.get("metric", "")
    detail = win.get("detail", "")
    lead = hook["template"].split("{")[0].strip().rstrip(":").rstrip(",") if hook else "Receipt"
    caption = (
        f"{lead}: {metric}. {detail} "
        "If you're leaking pipeline on a site you already own, we rebuild fast. Reply AUDIT."
    )
    tags = "#receipts #performance #growth #cro"
    return caption, tags


async def _llm_win_caption(
    db, win: dict, hook: Optional[dict], platform: str
) -> tuple[str, str]:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    api_key = os.environ["EMERGENT_LLM_KEY"]
    system = (
        "You are the lead social copywriter at BrivoMarketing — confident, "
        "concrete, no fluff. Never invents stats or client names. Output "
        "VALID JSON ONLY, no prose."
    )
    hook_hint = f'Open with a variation on: "{hook["template"]}"' if hook else "Open with a strong hook."
    user = (
        f"Brief: Draft a 'receipts' style post celebrating a client win.\n"
        f"Win: {win.get('title')}\n"
        f"Metric: {win.get('metric')}\n"
        f"Detail: {win.get('detail')}\n"
        f"Platform: {platform}\n"
        f"Platform rule: {PLATFORM_LENGTH.get(platform, '')}\n"
        f"{hook_hint}\n"
        f"Never name the client directly (use generic descriptor). End with a soft CTA.\n"
        f'Respond: {{"caption":"...","hashtags":"#a #b #c"}}'
    )
    llm = LlmChat(
        api_key=api_key,
        session_id=f"wins-{uuid.uuid4()}",
        system_message=system,
    ).with_model("gemini", "gemini-2.5-pro")
    raw = await llm.send_message(UserMessage(text=user))
    s, e = raw.find("{"), raw.rfind("}")
    if s != -1 and e != -1:
        try:
            obj = json.loads(raw[s : e + 1])
            return (obj.get("caption", "").strip(),
                    obj.get("hashtags", "").strip())
        except json.JSONDecodeError:
            pass
    # last-resort: just use raw text
    return raw.strip()[:500], ""


async def wins_recycler_loop(db) -> None:
    """Background: every 5 min, top up the queue from client wins if needed."""
    logger.info("Wins recycler loop started (floor=%d)", QUEUE_FLOOR)
    while True:
        try:
            if await queue_floor_low(db):
                win = await pick_least_recent_win(db)
                if win:
                    logger.info("Queue < floor. Recycling win: %s", win["title"])
                    await draft_post_from_win(db, win)
                else:
                    logger.debug("Queue low but no wins available to recycle")
        except Exception:
            logger.exception("Wins recycler tick failed")
        await asyncio.sleep(RECYCLER_TICK_SECONDS)


# ======================================================= CROSS-POSTER (Q)

async def multi_platform_from_brief(
    db,
    brief: str,
    tone: str,
    platforms: list[str],
    admin_email: str,
    schedule_at_iso: Optional[str] = None,
    image_url: Optional[str] = None,
) -> list[dict]:
    """Generate one platform-tailored caption per platform, queue each as a post.

    Returns the list of created social_posts docs.
    """
    from social import generate_post_variants

    plats = [p for p in platforms if p in PLATFORM_LENGTH.keys()] or list(PLATFORM_LENGTH.keys())
    # Use 1 variant per platform from the existing generator.
    variants = await generate_post_variants(
        db=db, brief=brief, platforms=plats, tone=tone, count=len(plats),
    )

    # Group by platform — ensure every requested platform has a variant
    by_platform: dict[str, dict] = {}
    for v in variants:
        by_platform.setdefault(v["platform"], v)
    for p in plats:
        if p not in by_platform:
            by_platform[p] = {"content": brief, "hashtags": "", "platform": p}

    # Optionally tag a hook for A/B tracking
    hooks = await pick_hooks(db, n=1, epsilon=0.3)
    hook = hooks[0] if hooks else None

    when = schedule_at_iso or _now_iso()
    created: list[dict] = []
    for p in plats:
        v = by_platform[p]
        cap = v.get("content", "").strip()
        tags = v.get("hashtags", "").strip()
        caption_full = f"{cap}\n\n{tags}".strip() if tags else cap
        doc = {
            "id": str(uuid.uuid4()),
            "caption": caption_full,
            "image_url": image_url,
            "video_url": None,
            "platforms": [p],
            "scheduled_at": when,
            "theme": None,
            "status": "queued",
            "created_at": _now_iso(),
            "created_by": admin_email,
            "ai_generated": True,
            "source": "cross_poster",
            "brief": brief[:600],
            "tone": tone,
            "hook_id": hook["id"] if hook else None,
            "hook_slug": hook["slug"] if hook else None,
        }
        await db.social_posts.insert_one(doc)
        doc.pop("_id", None)
        created.append(doc)
    if hook:
        await db.hook_library.update_one(
            {"id": hook["id"]},
            {"$inc": {"uses": 1}, "$set": {"last_used_at": _now_iso()}},
        )
    return created
