"""
Social safety layer — keeps the auto-poster from getting accounts banned.

Implements three Phase-1 features:
  S) Account warm-up mode (tiered posting limits by account age)
  R) Posting cadence guardrails (max/day, min-between, quiet hours)
  T) Failure auto-pause (N consecutive fails -> platform paused until admin resumes)

Public API:
  ensure_policy(db, agent_id, platform)   -> dict
  check_can_post(db, agent_id, platform)  -> (ok, reason, defer_until)
  record_post_attempt(db, agent_id, platform, ok, error=None) -> None
  start_warmup(db, agent_id, platforms=None) -> None
  ban_risk_score(policy) -> int (0..100, lower = safer)
  list_policies(db) -> list[dict]
  set_policy_override(db, agent_id, platform, **kwargs) -> dict
  unpause(db, agent_id, platform) -> dict

Every (agent_id, platform) pair gets exactly one policy doc. Missing ones
are auto-seeded with safe defaults on first lookup.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

logger = logging.getLogger(__name__)

SUPPORTED_PLATFORMS = ["x", "instagram", "linkedin"]

# ------------------------------------------------------------------ defaults
WARMUP_SCHEDULE = {
    # day index (0 = first 24h since warmup_started_at) -> limits
    0: {"max_posts": 0, "window": (10, 18)},     # Day 1 — no posts at all
    1: {"max_posts": 0, "window": (10, 18)},     # Day 2 — still no posts
    2: {"max_posts": 1, "window": (11, 17)},     # Day 3 — 1 post, mid-day only
    3: {"max_posts": 1, "window": (10, 18)},     # Day 4
    4: {"max_posts": 2, "window": (9, 19)},      # Day 5
    5: {"max_posts": 3, "window": (9, 20)},      # Day 6
    6: {"max_posts": 3, "window": (8, 21)},      # Day 7
}
WARMUP_DAYS = 7

DEFAULT_POLICY = {
    "max_posts_per_day": 6,
    "min_minutes_between": 45,
    "quiet_hours_start": 1,   # 24h local — default 1am..7am off-hours
    "quiet_hours_end": 7,
    "tz": "America/New_York",
    "failure_threshold": 3,   # 3 consecutive fails -> auto-pause
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now().isoformat()


def _day_bucket(dt: datetime, tz: str) -> str:
    """Return local-date bucket key like '2026-05-02' for the given UTC dt."""
    try:
        from zoneinfo import ZoneInfo
        local = dt.astimezone(ZoneInfo(tz))
    except Exception:
        local = dt
    return local.date().isoformat()


def _local_hour(dt: datetime, tz: str) -> int:
    try:
        from zoneinfo import ZoneInfo
        local = dt.astimezone(ZoneInfo(tz))
    except Exception:
        local = dt
    return local.hour


# ============================================================= POLICY LAYER

async def ensure_policy(db, agent_id: str, platform: str) -> dict:
    """Look up a policy doc; seed one with defaults if missing."""
    if platform not in SUPPORTED_PLATFORMS:
        raise ValueError(f"Unsupported platform: {platform}")
    doc = await db.social_account_policies.find_one(
        {"agent_id": agent_id, "platform": platform}, {"_id": 0}
    )
    if doc:
        return doc
    now_iso = _now_iso()
    doc = {
        "agent_id": agent_id,
        "platform": platform,
        "warmup_started_at": now_iso,
        "warmup_complete": False,
        "paused": False,
        "paused_reason": None,
        "paused_at": None,
        "consecutive_failures": 0,
        "last_posted_at": None,
        "post_counts": {},  # {'YYYY-MM-DD' (local date): int}
        "created_at": now_iso,
        "updated_at": now_iso,
        **DEFAULT_POLICY,
    }
    await db.social_account_policies.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def start_warmup(db, agent_id: str, platforms: Optional[list[str]] = None) -> None:
    """Called when a new agent pairs (or whenever admin adds a new account).
    Resets warmup_started_at to now for each requested platform."""
    plats = platforms or SUPPORTED_PLATFORMS
    now_iso = _now_iso()
    for p in plats:
        await db.social_account_policies.update_one(
            {"agent_id": agent_id, "platform": p},
            {"$set": {
                "agent_id": agent_id,
                "platform": p,
                "warmup_started_at": now_iso,
                "warmup_complete": False,
                "paused": False,
                "paused_reason": None,
                "paused_at": None,
                "consecutive_failures": 0,
                "updated_at": now_iso,
            },
             "$setOnInsert": {
                "created_at": now_iso,
                "last_posted_at": None,
                "post_counts": {},
                **DEFAULT_POLICY,
            }},
            upsert=True,
        )


def _warmup_day(policy: dict) -> Optional[int]:
    """Return current warmup day index (0-based) or None if warmup is complete."""
    if policy.get("warmup_complete"):
        return None
    started = policy.get("warmup_started_at")
    if not started:
        return 0
    try:
        start_dt = datetime.fromisoformat(started)
    except Exception:
        return 0
    elapsed = (_now() - start_dt).total_seconds() / 86400
    day = int(elapsed)
    if day >= WARMUP_DAYS:
        return None
    return max(0, day)


async def _maybe_complete_warmup(db, policy: dict) -> dict:
    """If >= WARMUP_DAYS since warmup_started_at, flip warmup_complete = True."""
    if policy.get("warmup_complete"):
        return policy
    wd = _warmup_day(policy)
    if wd is None:
        await db.social_account_policies.update_one(
            {"agent_id": policy["agent_id"], "platform": policy["platform"]},
            {"$set": {"warmup_complete": True, "updated_at": _now_iso()}},
        )
        policy["warmup_complete"] = True
    return policy


# =============================================================== GATE: POST

async def check_can_post(
    db, agent_id: str, platform: str
) -> tuple[bool, str, Optional[str]]:
    """Gate before dispatching a post job.

    Returns (ok, reason, defer_until_iso_or_None).
    If ok == False and defer_until is set, the scheduler should push the
    post's scheduled_at forward to that time instead of failing it hard.
    If defer_until is None the post is genuinely blocked (paused, etc.).
    """
    policy = await ensure_policy(db, agent_id, platform)
    policy = await _maybe_complete_warmup(db, policy)

    # 1) Manual / auto pause
    if policy.get("paused"):
        reason = policy.get("paused_reason") or "paused"
        return False, f"{platform}: paused ({reason})", None

    tz = policy.get("tz") or DEFAULT_POLICY["tz"]
    now = _now()
    hour = _local_hour(now, tz)

    # 2) Quiet hours — defer until quiet_hours_end
    qs = int(policy.get("quiet_hours_start", 1))
    qe = int(policy.get("quiet_hours_end", 7))
    in_quiet = (
        (qs < qe and qs <= hour < qe) or
        (qs > qe and (hour >= qs or hour < qe))
    )
    if in_quiet:
        # Defer to quiet_hours_end today (or tomorrow if already past)
        defer = now + timedelta(hours=max(1, (qe - hour) % 24 or 24))
        return False, f"{platform}: quiet hours ({qs:02d}:00-{qe:02d}:00)", defer.isoformat()

    # 3) Warm-up window
    wd = _warmup_day(policy)
    if wd is not None:
        rule = WARMUP_SCHEDULE.get(wd, {"max_posts": 0, "window": (9, 21)})
        if rule["max_posts"] == 0:
            return False, f"{platform}: warm-up day {wd+1}/{WARMUP_DAYS} (no posting)", None
        w_start, w_end = rule["window"]
        if not (w_start <= hour < w_end):
            defer = now + timedelta(hours=max(1, (w_start - hour) % 24 or 24))
            return False, f"{platform}: warm-up window {w_start:02d}:00-{w_end:02d}:00", defer.isoformat()

    # 4) Max-per-day (warmup-aware)
    day_key = _day_bucket(now, tz)
    today_count = int((policy.get("post_counts") or {}).get(day_key, 0))
    if wd is not None:
        day_max = WARMUP_SCHEDULE.get(wd, {}).get("max_posts", 1)
    else:
        day_max = int(policy.get("max_posts_per_day", 6))
    if today_count >= day_max:
        # Defer to midnight local + 1 hour
        from zoneinfo import ZoneInfo
        try:
            local = now.astimezone(ZoneInfo(tz))
        except Exception:
            local = now
        tomorrow = (local + timedelta(days=1)).replace(hour=9, minute=30, second=0, microsecond=0)
        return False, f"{platform}: daily cap {day_max} hit", tomorrow.astimezone(timezone.utc).isoformat()

    # 5) Min minutes between same-platform posts
    last = policy.get("last_posted_at")
    min_minutes = int(policy.get("min_minutes_between", 45))
    if last:
        try:
            last_dt = datetime.fromisoformat(last)
            delta = (now - last_dt).total_seconds() / 60
            if delta < min_minutes:
                defer = last_dt + timedelta(minutes=min_minutes)
                return False, f"{platform}: spacing {min_minutes}min (last {int(delta)}min ago)", defer.isoformat()
        except Exception:
            pass

    return True, "ok", None


# ======================================================= POST-HOC BOOKKEEPING

async def record_post_attempt(
    db, agent_id: str, platform: str, ok: bool, error: Optional[str] = None
) -> dict:
    """Update counters after a post job completes.

    On success: reset consecutive_failures, bump last_posted_at + today's count.
    On failure: ++ consecutive_failures. If it hits threshold, pause.
    """
    policy = await ensure_policy(db, agent_id, platform)
    tz = policy.get("tz") or DEFAULT_POLICY["tz"]
    now = _now()
    day_key = _day_bucket(now, tz)

    if ok:
        # increment today count, reset fail streak
        counts = policy.get("post_counts") or {}
        counts = {k: v for k, v in counts.items() if k >= (now - timedelta(days=14)).date().isoformat()}
        counts[day_key] = counts.get(day_key, 0) + 1
        await db.social_account_policies.update_one(
            {"agent_id": agent_id, "platform": platform},
            {"$set": {
                "last_posted_at": now.isoformat(),
                "post_counts": counts,
                "consecutive_failures": 0,
                "updated_at": now.isoformat(),
            }},
        )
        return {"ok": True, "today_count": counts[day_key]}

    # Failure path
    fails = int(policy.get("consecutive_failures", 0)) + 1
    threshold = int(policy.get("failure_threshold", 3))
    update = {
        "consecutive_failures": fails,
        "last_error": error,
        "last_error_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    paused = False
    if fails >= threshold:
        update.update({
            "paused": True,
            "paused_reason": f"auto: {fails} consecutive failures — last: {error or 'unknown'}",
            "paused_at": now.isoformat(),
        })
        paused = True
    await db.social_account_policies.update_one(
        {"agent_id": agent_id, "platform": platform},
        {"$set": update},
    )
    return {"ok": False, "consecutive_failures": fails, "paused": paused}


# ================================================================ ADMIN API

async def list_policies(db) -> list[dict]:
    cursor = db.social_account_policies.find({}, {"_id": 0})
    docs = await cursor.to_list(length=500)
    # enrich with computed fields
    for d in docs:
        d["warmup_day"] = _warmup_day(d)
        d["warmup_days_total"] = WARMUP_DAYS
        d["ban_risk"] = ban_risk_score(d)
    return docs


async def set_policy_override(
    db, agent_id: str, platform: str, **fields
) -> dict:
    """Patch a policy. Only whitelisted keys can be set."""
    allowed = {
        "max_posts_per_day", "min_minutes_between",
        "quiet_hours_start", "quiet_hours_end",
        "tz", "failure_threshold",
    }
    update = {k: v for k, v in fields.items() if k in allowed}
    if not update:
        raise ValueError("No valid fields to update")
    update["updated_at"] = _now_iso()
    await ensure_policy(db, agent_id, platform)
    await db.social_account_policies.update_one(
        {"agent_id": agent_id, "platform": platform},
        {"$set": update},
    )
    return await db.social_account_policies.find_one(
        {"agent_id": agent_id, "platform": platform}, {"_id": 0}
    )


async def unpause(db, agent_id: str, platform: str) -> dict:
    await ensure_policy(db, agent_id, platform)
    await db.social_account_policies.update_one(
        {"agent_id": agent_id, "platform": platform},
        {"$set": {
            "paused": False,
            "paused_reason": None,
            "paused_at": None,
            "consecutive_failures": 0,
            "updated_at": _now_iso(),
        }},
    )
    return await db.social_account_policies.find_one(
        {"agent_id": agent_id, "platform": platform}, {"_id": 0}
    )


async def pause(db, agent_id: str, platform: str, reason: str = "manual") -> dict:
    await ensure_policy(db, agent_id, platform)
    await db.social_account_policies.update_one(
        {"agent_id": agent_id, "platform": platform},
        {"$set": {
            "paused": True,
            "paused_reason": reason,
            "paused_at": _now_iso(),
            "updated_at": _now_iso(),
        }},
    )
    return await db.social_account_policies.find_one(
        {"agent_id": agent_id, "platform": platform}, {"_id": 0}
    )


# ========================================================== BAN-RISK SCORE

def ban_risk_score(policy: dict) -> int:
    """Cheap heuristic 0..100 — higher = riskier.

    Factors:
      - If paused -> 100
      - +20 per consecutive failure (capped)
      - +30 if in warm-up and today count >= day cap
      - +10 if >80% of daily cap already used
      - +20 if more than 6 posts in last 24h on a warming account
      - -10 if warmup_complete and no failures
    """
    if policy.get("paused"):
        return 100
    score = 0
    fails = int(policy.get("consecutive_failures", 0))
    score += min(60, fails * 20)

    wd = _warmup_day(policy)
    counts = policy.get("post_counts") or {}
    # today count proxy — pick the max of any recent day
    recent_counts = sorted(counts.values())[-1] if counts else 0

    if wd is not None:
        warm_cap = WARMUP_SCHEDULE.get(wd, {}).get("max_posts", 1)
        if recent_counts >= max(1, warm_cap):
            score += 30
        if recent_counts > 6:
            score += 20
    else:
        cap = int(policy.get("max_posts_per_day", 6))
        if recent_counts >= max(1, int(cap * 0.8)):
            score += 10

    if policy.get("warmup_complete") and fails == 0:
        score = max(0, score - 10)
    return max(0, min(100, score))
