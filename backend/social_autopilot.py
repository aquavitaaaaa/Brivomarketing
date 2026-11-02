"""Daily Instagram autopilot.

Modes (settings.mode):
  auto    — system picks the best local posting time per weekday and posts hands-off
  timed   — you pick the daily time (settings.post_time, HH:MM in settings.timezone), hands-off
  manual  — a draft is generated daily; nothing publishes until you approve it

Publishing channels (first available wins):
  1. Instagram Graph API — META_ACCESS_TOKEN + IG_BUSINESS_ACCOUNT_ID + PUBLIC_BASE_URL
  2. Direct account connected in /admin/social/direct (instagrapi)
  3. Otherwise the post stays 'queued' and the paired-host scheduler publishes it.
"""
import os
import asyncio
import logging
import random
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_admin

logger = logging.getLogger("autopilot")
router = APIRouter(prefix="/admin/social/autopilot")

PUBLIC_DIR = Path(__file__).resolve().parent.parent / "frontend" / "public"
SHOT_DIR = PUBLIC_DIR / "kit-assets" / "social"

DEFAULTS = {
    "enabled": False,
    "mode": "auto",
    "post_time": "12:00",
    "timezone": "America/New_York",
    "posts_per_day": 4,
}
AUTO_TIMES = {0: "12:00", 1: "11:30", 2: "12:00", 3: "18:30", 4: "11:00", 5: "10:00", 6: "17:00"}

SHOTS = {
    "dwj-site": ("DWJ Home Services", "New site shipped for DWJ Home Services, a Tampa Bay pool-cage and lanai screen pro. Homeowners snap a photo and an AI estimator returns a price in seconds. Fast quotes win local jobs.", "#webdesign #localbusiness #leadgen #tampabay #brivo"),
    "dwj-stat": ("DWJ financing", "Financing from $89/month shown on every CTA, plus a photo-to-price AI estimator. That is how a local contractor answers 'how much?' before the competitor picks up the phone.", "#conversion #localseo #smallbusiness #webdesign #brivo"),
    "dwj-before-after": ("DWJ before/after", "Storm-wrecked to showroom-new. The site we built for DWJ Home Services leads with the transformation, because proof beats promises.", "#beforeandafter #poolcage #tampabay #webdesign #brivo"),
    "loba-site": ("LOBA Catskill Restaurant", "New site shipped for LOBA, a charcoal-fire restaurant in Tannersville, NY. A table-finder above the fold, signature dishes up front, every farm named. Hunger, meet booking button.", "#restaurantmarketing #webdesign #catskills #hospitality #brivo"),
    "loba-stat": ("LOBA provenance", "9 farms, named on the menu. LOBA's provenance ledger turns 'locally sourced' from a buzzword into a reason to reserve. Storytelling that books tables.", "#restaurant #storytelling #branding #catskills #brivo"),
    "loba-hearth": ("LOBA hearth", "Come hungry. Leave with a story. Designing hospitality sites that feel like the room before you walk in.", "#hospitalitydesign #restaurantwebsite #branding #brivo"),
    "keepercache-site": ("KeeperCache", "KeeperCache: sports-management OS rebuilt from the ground up. Signup-to-activation went from 12% to 47%. Onboarding is the product.", "#saas #ux #productdesign #cro #brivo"),
    "koa-site": ("KOA", "A booking engine that holds its nerve at peak season. Evergreen SEO meets summer demand.", "#seo #booking #travel #webdesign #brivo"),
    "instalease-site": ("InstaLease", "Leasing is emotional before it is transactional. A premium marketplace with a lead engine that routes qualified enquiries straight to brokers.", "#realestate #marketplace #webdesign #brivo"),
    "sportbotai-site": ("SportBot AI", "Math-first credibility for an AI analytics platform. We translated the model into trust.", "#ai #analytics #saas #branding #brivo"),
    "lawyer-site": ("Autonomous Law", "Serious tools deserve serious design. A homepage managing partners actually trust.", "#legaltech #saas #branding #brivo"),
    "cta-audit": ("Free audit CTA", "Free this week: a 30-minute growth audit. We tear down your site and funnel and hand you the three fixes worth the most revenue. DM AUDIT to claim a slot.", "#growth #cro #marketing #freeaudit #brivo"),
}
SHOWCASE_ROTATION = ["dwj-site", "loba-site", "dwj-stat", "loba-stat", "dwj-before-after", "loba-hearth",
                     "keepercache-site", "cta-audit", "koa-site", "instalease-site", "sportbotai-site", "lawyer-site"]


def attach(db) -> None:
    router.db = db  # type: ignore[attr-defined]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


async def get_settings(db) -> dict:
    doc = await db.settings.find_one({"_id": "ig_autopilot"}) or {}
    doc.pop("_id", None)
    return {**DEFAULTS, **doc}


def _tz(name: str) -> ZoneInfo:
    try:
        return ZoneInfo(name)
    except Exception:
        return ZoneInfo(DEFAULTS["timezone"])


def _slot_utc(settings: dict, local_day: datetime) -> datetime:
    tz = _tz(settings["timezone"])
    hhmm = AUTO_TIMES[local_day.weekday()] if settings["mode"] == "auto" else settings["post_time"]
    try:
        h, m = [int(x) for x in hhmm.split(":")]
    except Exception:
        h, m = 12, 0
    return local_day.replace(hour=h, minute=m, second=0, microsecond=0, tzinfo=tz).astimezone(timezone.utc)


# ------------------------------------------------------------ channels
def graph_configured() -> bool:
    return all(os.environ.get(k, "").strip() for k in ("META_ACCESS_TOKEN", "IG_BUSINESS_ACCOUNT_ID", "PUBLIC_BASE_URL"))


async def direct_account(db) -> Optional[dict]:
    return await db.direct_accounts.find_one({"platform": "instagram", "status": {"$ne": "error"}})


async def channel_status(db) -> dict:
    acc = await direct_account(db)
    return {
        "graph_api": graph_configured(),
        "direct_account": acc["username"] if acc else None,
        "active": "graph_api" if graph_configured() else ("direct" if acc else "paired_host"),
    }


async def _publish_graph(image_url: str, caption: str) -> dict:
    ig = os.environ["IG_BUSINESS_ACCOUNT_ID"].strip()
    token = os.environ["META_ACCESS_TOKEN"].strip()
    full = os.environ["PUBLIC_BASE_URL"].rstrip("/") + image_url if image_url.startswith("/") else image_url
    base = f"https://graph.facebook.com/v21.0/{ig}"
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(f"{base}/media", data={"image_url": full, "caption": caption, "access_token": token})
        if r.status_code >= 300:
            raise RuntimeError(f"media create: {r.text[:200]}")
        cid = r.json()["id"]
        r = await c.post(f"{base}/media_publish", data={"creation_id": cid, "access_token": token})
        if r.status_code >= 300:
            raise RuntimeError(f"media publish: {r.text[:200]}")
        mid = r.json()["id"]
        p = await c.get(f"https://graph.facebook.com/v21.0/{mid}", params={"fields": "permalink", "access_token": token})
        return {"url": p.json().get("permalink") if p.status_code < 300 else None, "channel": "graph_api"}


async def _publish_direct(db, acc: dict, image_url: str, caption: str) -> dict:
    import instagram_direct as igd
    path = await igd._resolve_image(image_url)
    result, new_settings = await asyncio.to_thread(
        igd._post_photo_sync, acc["username"], igd._dec(acc["password_enc"]),
        acc.get("proxy"), acc.get("settings"), str(path), caption)
    await db.direct_accounts.update_one(
        {"id": acc["id"]}, {"$set": {"settings": new_settings, "status": "connected", "last_error": None}})
    return {"url": f"https://www.instagram.com/p/{result['code']}/", "channel": "direct"}


async def publish_post(db, post: dict) -> dict:
    """Returns {ok, url, channel, error}. Only called when a server channel exists."""
    image = post.get("image_url")
    if not image:
        return {"ok": False, "error": "post has no image (Instagram requires one)"}
    try:
        if graph_configured():
            res = await _publish_graph(image, post["caption"])
        else:
            acc = await direct_account(db)
            res = await _publish_direct(db, acc, image, post["caption"])
        return {"ok": True, **res}
    except Exception as e:
        return {"ok": False, "error": str(e)[:240]}


# ------------------------------------------------------------ generation
async def _caption_for(theme: str, hint: str) -> tuple[str, str]:
    from social_content import _gen_caption
    cap = await _gen_caption(theme, hint, "instagram")
    return cap["caption"], cap.get("hashtags", "")


async def _pick_shot(db) -> str:
    used = [p.get("shot") async for p in db.social_posts.find(
        {"source": "autopilot", "shot": {"$ne": None}}, {"shot": 1, "_id": 0}).sort("created_at", -1).limit(len(SHOWCASE_ROTATION))]
    for slug in SHOWCASE_ROTATION:
        if slug not in used and (SHOT_DIR / f"{slug}.jpg").exists():
            return slug
    return random.choice([s for s in SHOWCASE_ROTATION if (SHOT_DIR / f"{s}.jpg").exists()])


async def build_post(db, *, slug: Optional[str] = None, scheduled_at: datetime, status: str) -> dict:
    """Weekday-driven: alternating client showcase cards and AI-written brand content."""
    wd = scheduled_at.astimezone(timezone.utc).weekday()
    showcase_day = wd in (1, 3, 5, 6) or slug is not None
    theme, caption, tags, image = "showcase", "", "", None
    if showcase_day or slug:
        slug = slug or await _pick_shot(db)
        title, caption, tags = SHOTS[slug]
        image = f"/kit-assets/social/{slug}.jpg"
        theme = "showcase"
        try:
            from social_content import _gen_caption
            cap = await _gen_caption("showcase", f"Announce the client project '{title}'. USE ONLY THESE FACTS: {caption} "
                f"Do NOT invent metrics, results, quotes, before-states or client history. Under 120 words, confident, one CTA.", "instagram")
            caption, tags = cap["caption"] or caption, cap.get("hashtags") or tags
        except Exception:
            logger.info("LLM caption unavailable, using curated caption for %s", slug)
    else:
        from social_content import WEEKLY_THEMES, _gen_image
        pair = WEEKLY_THEMES.get(wd) or ("essay", "Short founder-focused thought.")
        theme, hint = pair
        caption, tags = await _caption_for(theme, hint)
        image = await _gen_image(theme, caption)
        if not image:
            slug = await _pick_shot(db)
            image = f"/kit-assets/social/{slug}.jpg"
    doc = {
        "id": str(uuid.uuid4()),
        "caption": f"{caption}\n\n{tags}".strip(),
        "image_url": image, "video_url": None,
        "platforms": ["instagram"],
        "scheduled_at": _iso(scheduled_at),
        "theme": theme, "status": status,
        "created_at": _iso(_now()), "created_by": "autopilot",
        "ai_generated": True, "source": "autopilot", "shot": slug,
    }
    await db.social_posts.insert_one(dict(doc))
    return doc


def _daily_slots_utc(settings: dict, local_day: datetime) -> list:
    """4 randomized slots per day (07:00–21:00 local) when posts_per_day=4,
    else the classic single timed/auto slot. Jittered each day."""
    ppd = int(settings.get("posts_per_day", 1) or 1)
    tz = _tz(settings["timezone"])
    if ppd <= 1:
        return [_slot_utc(settings, local_day)]
    base_day = local_day.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=tz)
    windows = [(7, 10), (11, 14), (15, 18), (19, 21)]
    slots = []
    for i in range(min(ppd, 4)):
        lo, hi = windows[i]
        h = random.randint(lo, hi)
        m = random.randint(0, 59)
        slots.append((base_day + timedelta(hours=h, minutes=m)).astimezone(timezone.utc))
    return sorted(slots)


async def autopilot_tick(db) -> None:
    s = await get_settings(db)
    now = _now()
    if s["enabled"]:
        tz = _tz(s["timezone"])
        local = now.astimezone(tz)
        today = local.strftime("%Y-%m-%d")
        ppd = int(s.get("posts_per_day", 1) or 1)
        made_today = await db.social_posts.count_documents({"source": "autopilot", "autopilot_date": today})
        if made_today < ppd and local.hour >= 6:
            created = 0
            for slot in _daily_slots_utc(s, local):
                if made_today + created >= ppd:
                    break
                if slot < now:
                    slot = now + timedelta(minutes=2 + created * 3)
                status = "draft" if s["mode"] == "manual" else "queued"
                doc = await build_post(db, scheduled_at=slot, status=status)
                await db.social_posts.update_one({"id": doc["id"]}, {"$set": {"autopilot_date": today}})
                logger.info("Autopilot created %s post for %s (%s)", status, today, doc["scheduled_at"])
                created += 1

    ch = await channel_status(db)
    if ch["active"] == "paired_host":
        return
    while True:
        post = await db.social_posts.find_one_and_update(
            {"source": "autopilot", "status": "queued", "scheduled_at": {"$lte": _iso(now)}},
            {"$set": {"status": "running", "started_at": _iso(_now())}}, projection={"_id": 0})
        if not post:
            return
        res = await publish_post(db, post)
        if res["ok"]:
            await db.social_posts.update_one({"id": post["id"]}, {"$set": {
                "status": "published", "completed_at": _iso(_now()), "permalink": res.get("url"), "channel": res["channel"]}})
            logger.info("Autopilot published %s via %s", post["id"], res["channel"])
        else:
            await db.social_posts.update_one({"id": post["id"]}, {"$set": {
                "status": "failed", "completed_at": _iso(_now()), "error": res["error"]}})
            logger.warning("Autopilot publish failed: %s", res["error"])
            try:
                import alerts
                await alerts._record(db, "social_failed", "Instagram post failed", res["error"],
                                     {"ok": False, "error": "n/a"}, {"ok": False, "error": "n/a"}, post["id"])
            except Exception:
                pass


async def autopilot_loop(db) -> None:
    logger.info("Instagram autopilot loop started")
    while True:
        try:
            await autopilot_tick(db)
        except Exception:
            logger.exception("autopilot tick failed")
        await asyncio.sleep(60)


# ------------------------------------------------------------ routes
class SettingsBody(BaseModel):
    enabled: Optional[bool] = None
    mode: Optional[str] = None
    post_time: Optional[str] = None
    timezone: Optional[str] = None
    posts_per_day: Optional[int] = None


class PostEdit(BaseModel):
    caption: Optional[str] = None
    scheduled_at: Optional[str] = None


class RunBody(BaseModel):
    slug: Optional[str] = None
    publish_now: bool = False


def _db():
    return router.db  # type: ignore[attr-defined]


@router.get("")
async def overview(admin=Depends(get_current_admin)):
    db = _db()
    s = await get_settings(db)
    tz = _tz(s["timezone"])
    local = _now().astimezone(tz)
    return {
        "settings": s,
        "channels": await channel_status(db),
        "next_slot": _iso(_slot_utc(s, local)) if _slot_utc(s, local) > _now() else _iso(_slot_utc(s, local + timedelta(days=1))),
        "auto_times": AUTO_TIMES,
        "local_now": local.strftime("%Y-%m-%d %H:%M"),
    }


@router.put("")
async def update_settings(body: SettingsBody, admin=Depends(get_current_admin)):
    db = _db()
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if "mode" in upd and upd["mode"] not in ("auto", "timed", "manual"):
        raise HTTPException(400, "mode must be auto, timed or manual")
    if "post_time" in upd:
        try:
            h, m = [int(x) for x in upd["post_time"].split(":")]
            assert 0 <= h < 24 and 0 <= m < 60
        except Exception:
            raise HTTPException(400, "post_time must be HH:MM")
    if "timezone" in upd:
        try:
            ZoneInfo(upd["timezone"])
        except Exception:
            raise HTTPException(400, "unknown timezone")
    if "posts_per_day" in upd:
        try:
            ppd = int(upd["posts_per_day"])
            assert 1 <= ppd <= 4
        except Exception:
            raise HTTPException(400, "posts_per_day must be 1-4")
        upd["posts_per_day"] = ppd
    await db.settings.update_one({"_id": "ig_autopilot"}, {"$set": upd}, upsert=True)
    return await get_settings(db)


@router.get("/posts")
async def list_posts(admin=Depends(get_current_admin)):
    db = _db()
    items = await db.social_posts.find({"source": "autopilot"}, {"_id": 0}).sort("created_at", -1).limit(40).to_list(length=40)
    return {"posts": items}


@router.post("/run-now")
async def run_now(body: RunBody, admin=Depends(get_current_admin)):
    db = _db()
    s = await get_settings(db)
    if body.slug and body.slug not in SHOTS:
        raise HTTPException(404, "Unknown social shot")
    status = "queued" if (body.publish_now or s["mode"] != "manual") else "draft"
    when = _now() + timedelta(seconds=5) if body.publish_now else max(_slot_utc(s, _now().astimezone(_tz(s["timezone"]))), _now() + timedelta(minutes=1))
    doc = await build_post(db, slug=body.slug, scheduled_at=when, status=status)
    doc.pop("_id", None)
    return {"post": doc}


@router.patch("/posts/{post_id}")
async def edit_post(post_id: str, body: PostEdit, admin=Depends(get_current_admin)):
    db = _db()
    upd = {k: v for k, v in body.model_dump().items() if v}
    r = await db.social_posts.update_one({"id": post_id, "source": "autopilot", "status": {"$in": ["draft", "queued"]}}, {"$set": upd})
    if not r.matched_count:
        raise HTTPException(404, "Post not editable")
    return {"ok": True}


@router.post("/posts/{post_id}/approve")
async def approve(post_id: str, publish_now: bool = True, admin=Depends(get_current_admin)):
    db = _db()
    upd = {"status": "queued", "approved_by": admin.get("email")}
    if publish_now:
        upd["scheduled_at"] = _iso(_now() + timedelta(seconds=5))
    r = await db.social_posts.update_one({"id": post_id, "source": "autopilot", "status": "draft"}, {"$set": upd})
    if not r.matched_count:
        raise HTTPException(404, "No such draft")
    return {"ok": True}


@router.post("/posts/{post_id}/skip")
async def skip(post_id: str, admin=Depends(get_current_admin)):
    db = _db()
    r = await db.social_posts.update_one(
        {"id": post_id, "source": "autopilot", "status": {"$in": ["draft", "queued"]}}, {"$set": {"status": "cancelled"}})
    if not r.matched_count:
        raise HTTPException(404, "Nothing to skip")
    return {"ok": True}


@router.get("/shots")
async def shots(admin=Depends(get_current_admin)):
    return {"shots": [
        {"slug": k, "title": v[0], "caption": v[1], "hashtags": v[2], "image_url": f"/kit-assets/social/{k}.jpg"}
        for k, v in SHOTS.items() if (SHOT_DIR / f"{k}.jpg").exists()
    ]}
