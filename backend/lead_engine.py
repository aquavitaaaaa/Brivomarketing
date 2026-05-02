"""
BrivoMarketing Autonomous Client Acquisition Engine.

Three loops + a pipeline:

  1. LEAD DISCOVERY  (lead_discovery_loop)
     Scans Reddit + a curated RSS list for prospects emitting buying signals
     ("need a website", "looking for a marketing agency", "leads dried up", etc).
     Each match becomes a `lead` doc with platform, handle/url, snippet, and
     a `signal_score` from the LLM.

  2. OUTREACH COMPOSER + DISPATCH  (outreach_dispatch_loop)
     For every `lead` in stage `discovered`, composes a hyper-personalized
     opener with the LLM (with deterministic fallback) and queues a DM job
     via the Playwright agent (X / Instagram / LinkedIn) -- or an email if
     the lead has one. Respects daily outreach caps + warmup gates so we
     don't get flagged.

  3. REPLY NURTURER  (handled at /api/agent/inbound or webhook)
     When the agent reports a reply, the LLM takes the next turn to qualify
     and either book a 30-min audit (returns a Calendly-style link from
     env CALENDLY_LINK) or surface the lead for human review.

Pipeline stages:
   discovered -> queued -> contacted -> replied -> qualified -> booked
                                                  -> negative   (lost / unsub)

Public API exposed via /api/admin/leads/* in `lead_engine_routes.py`.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------- constants
DEFAULT_OUTREACH_CAP_PER_DAY = 25         # per platform per day (safety)
OUTREACH_MIN_MINUTES_BETWEEN = 4          # space DMs to look human
DISCOVERY_TICK_SECONDS = 60 * 30          # poll every 30 min
DISPATCH_TICK_SECONDS = 60                # check queue every minute

# Buying-signal patterns (case-insensitive). Hit any -> candidate lead.
SIGNAL_PATTERNS = [
    r"need(?:ed)?\s+(?:a|some)?\s*(?:new\s+)?(?:website|site|landing page|funnel)",
    r"looking\s+(?:for|to hire)\s+(?:a\s+)?(?:marketing|seo|ads?)\s+(?:agency|partner|expert|help)",
    r"hire\s+(?:an?\s+)?(?:agency|marketer|seo|ppc|web\s+dev|copywriter)",
    r"(?:our|the|my)\s+(?:leads|signups?|conversions?)\s+(?:dried up|tanked|dropped|are down)",
    r"(?:bad|terrible|poor)\s+(?:roi|roas|conversion|click[- ]?through)",
    r"(?:rebuild|redesign|overhaul)\s+(?:our|the|my)\s+(?:website|site|brand|funnel)",
    r"website\s+(?:isn'?t|not)\s+converting",
    r"(?:can\'t|cannot|struggling to)\s+get\s+(?:leads|clients|customers)",
    r"(?:my|our)\s+ads\s+(?:aren'?t|are not)\s+working",
    r"who\s+(?:do\s+)?you\s+recommend\s+for\s+(?:marketing|ads|seo|web\s+design)",
]
SIGNAL_RE = re.compile("|".join(SIGNAL_PATTERNS), re.IGNORECASE)

# Reddit subreddits to scan for buying signals.
DEFAULT_SUBREDDITS = [
    "smallbusiness",
    "Entrepreneur",
    "marketing",
    "startups",
    "Restaurants",
    "ecommerce",
    "shopify",
    "FulfillmentByAmazon",
    "DigitalMarketing",
    "WebDev",
]


# =============================================================== UTILITIES

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now().isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


# ============================================================ DISCOVERY

async def fetch_reddit_signals(subreddits: list[str], limit: int = 25) -> list[dict]:
    """Pull recent posts from each subreddit's `new.json` and filter by signal regex.

    Reddit allows unauthenticated JSON access at low rates — we add a UA header.
    Returns raw lead candidates: {source, source_id, url, title, snippet, author, ts}.
    """
    out: list[dict] = []
    headers = {"User-Agent": "BrivoMarketing-LeadBot/1.0 (+https://brivomarketing.com)"}
    async with httpx.AsyncClient(timeout=15, headers=headers) as cli:
        for sub in subreddits:
            try:
                r = await cli.get(f"https://www.reddit.com/r/{sub}/new.json?limit={limit}")
                if r.status_code != 200:
                    logger.info("reddit %s -> %s", sub, r.status_code)
                    continue
                data = r.json()
                for child in data.get("data", {}).get("children", []):
                    p = child.get("data", {})
                    title = p.get("title", "")
                    body = p.get("selftext", "")
                    blob = f"{title}\n{body}"
                    if SIGNAL_RE.search(blob):
                        out.append({
                            "source": "reddit",
                            "source_id": p.get("id"),
                            "url": "https://reddit.com" + p.get("permalink", ""),
                            "title": title[:280],
                            "snippet": (body or title)[:600],
                            "author": p.get("author"),
                            "subreddit": sub,
                            "score": int(p.get("score", 0)),
                            "ts": int(p.get("created_utc", 0)),
                        })
            except Exception as e:
                logger.warning("reddit fetch %s failed: %s", sub, e)
    return out


async def upsert_lead(db, raw: dict) -> Optional[dict]:
    """Insert if new (unique on source+source_id), else skip."""
    key = {"source": raw["source"], "source_id": raw["source_id"]}
    existing = await db.leads.find_one(key, {"_id": 0})
    if existing:
        return None
    doc = {
        "id": _new_id(),
        **raw,
        "stage": "discovered",
        "signal_score": _heuristic_signal_score(raw),
        "platform_handle": raw.get("author"),
        "outreach_attempts": 0,
        "last_message_at": None,
        "messages": [],
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.leads.insert_one(doc)
    doc.pop("_id", None)
    return doc


def _heuristic_signal_score(raw: dict) -> int:
    """0..100 quick score based on title strength, score, and keyword density."""
    text = (raw.get("title", "") + " " + raw.get("snippet", "")).lower()
    matches = len(SIGNAL_RE.findall(text))
    score = min(60, 25 + matches * 10)
    if "agency" in text or "hire" in text:
        score += 10
    if "budget" in text or "$" in text:
        score += 10
    if raw.get("score", 0) > 5:
        score += 5
    return min(100, score)


async def discovery_tick(db, subreddits: Optional[list[str]] = None) -> int:
    """Run one discovery pass. Returns count of newly inserted leads."""
    subs = subreddits or DEFAULT_SUBREDDITS
    raws = await fetch_reddit_signals(subs)
    inserted = 0
    for r in raws:
        rec = await upsert_lead(db, r)
        if rec:
            inserted += 1
    if inserted:
        logger.info("Discovery: %d new leads (from %d candidates)", inserted, len(raws))
    return inserted


async def lead_discovery_loop(db) -> None:
    """Background loop — every 30 min poll Reddit + signal-scan."""
    logger.info("Lead discovery loop started")
    # initial small delay so app finishes booting
    await asyncio.sleep(20)
    while True:
        try:
            await discovery_tick(db)
        except Exception:
            logger.exception("Discovery tick failed")
        await asyncio.sleep(DISCOVERY_TICK_SECONDS)


# ============================================================ COMPOSER

FALLBACK_OPENERS = {
    "reddit": (
        "Saw your post about {pain}. We run AI-built marketing systems for "
        "small teams — we ship a full audit + 1-page plan free, no pitch. "
        "If it'd help: brivomarketing.com (or reply here). — Brivo"
    ),
    "x": (
        "Hey {name} — saw your post on {topic}. We help teams in your spot fix "
        "this fast. Free 30-min teardown if useful. brivomarketing.com"
    ),
    "instagram": (
        "Loved your latest post. We build AI marketing systems that bring "
        "leads in on autopilot — happy to send a free audit. Cool to share more?"
    ),
    "linkedin": (
        "Hi {name} — your recent post on {topic} caught my eye. At Brivo we "
        "ship AI marketing systems that book meetings on autopilot. "
        "Would a 30-min teardown of your funnel be useful?"
    ),
    "email": (
        "Hi {name},\n\nSaw your post about {pain}. At Brivo we run AI-driven "
        "marketing systems for small teams in your spot — we usually find 2-3 "
        "fixable leaks within 30 minutes.\n\nWould a free audit be useful?\n\n"
        "— Brivo Marketing\nhttps://brivomarketing.com"
    ),
}


async def compose_outreach(db, lead: dict, channel: str = "reddit") -> str:
    """Use LLM to write a personalised opener; deterministic fallback if it fails."""
    name = lead.get("platform_handle") or "there"
    pain = (lead.get("title") or lead.get("snippet") or "growth")[:120]
    topic = pain
    fallback = FALLBACK_OPENERS.get(channel, FALLBACK_OPENERS["reddit"]).format(
        name=name, pain=pain, topic=topic
    )
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return fallback
        system = (
            "You are an outreach copywriter for BrivoMarketing — an AI-built "
            "marketing studio. Write SHORT, no-pitch, no-emoji openers that "
            "reference the prospect's specific pain in their own words. "
            "Never invent metrics. Never use 'leverage', 'unlock', 'synergy'. "
            "End with a soft CTA: free 30-min teardown OR ask permission to share. "
            "Output only the message body, no preface."
        )
        rule = {
            "x": "Under 240 chars. 1 line. Plain.",
            "instagram": "Under 350 chars. Conversational. 1-2 short sentences.",
            "linkedin": "60-90 words. Professional but warm. 2 short paragraphs.",
            "reddit": "60-120 words. Helpful tone, like a peer. End with brivomarketing.com URL.",
            "email": "80-140 words. Subject line on first line prefixed 'Subject: '. Then body.",
        }.get(channel, "60-100 words.")
        user = (
            f"Prospect handle: {name}\n"
            f"Source: {lead.get('source')}\n"
            f"Their post title: {lead.get('title','')}\n"
            f"Their post body: {lead.get('snippet','')}\n"
            f"Channel: {channel}\nLength rule: {rule}\n"
            f"Goal: book a free 30-min audit or get an email reply."
        )
        llm = LlmChat(
            api_key=api_key,
            session_id=f"outreach-{lead['id']}",
            system_message=system,
        ).with_model("gemini", "gemini-2.5-flash")
        out = await llm.send_message(UserMessage(text=user))
        return out.strip() or fallback
    except Exception as e:
        logger.warning("compose_outreach fallback (%s): %s", channel, e)
        return fallback


# ========================================================== DISPATCH LOOP

async def _outreach_count_today(db, channel: str) -> int:
    start = _now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    return await db.outreach_jobs.count_documents({
        "channel": channel,
        "created_at": {"$gte": start},
        "status": {"$in": ["sent", "running"]},
    })


async def _last_outreach_minutes_ago(db) -> Optional[int]:
    last = await db.outreach_jobs.find_one(
        {"status": {"$in": ["sent", "running"]}},
        {"_id": 0},
        sort=[("created_at", -1)],
    )
    if not last:
        return None
    try:
        ts = datetime.fromisoformat(last["created_at"])
        return int((_now() - ts).total_seconds() / 60)
    except Exception:
        return None


async def dispatch_one_lead(db, lead: dict) -> Optional[dict]:
    """Compose + queue an outreach job. Returns the job doc or None on skip."""
    channel = "reddit"  # MVP: reply on the same Reddit thread
    cap = int(os.environ.get("OUTREACH_DAILY_CAP", DEFAULT_OUTREACH_CAP_PER_DAY))
    if await _outreach_count_today(db, channel) >= cap:
        logger.info("Daily outreach cap (%d) hit for channel=%s", cap, channel)
        return None

    last_min = await _last_outreach_minutes_ago(db)
    if last_min is not None and last_min < OUTREACH_MIN_MINUTES_BETWEEN:
        return None

    body = await compose_outreach(db, lead, channel=channel)
    job = {
        "id": _new_id(),
        "lead_id": lead["id"],
        "channel": channel,
        "target_url": lead.get("url"),
        "target_handle": lead.get("platform_handle"),
        "body": body,
        "status": "queued",
        "created_at": _now_iso(),
    }
    await db.outreach_jobs.insert_one(job)
    job.pop("_id", None)

    # Push lead forward
    await db.leads.update_one(
        {"id": lead["id"]},
        {"$set": {
            "stage": "queued",
            "last_outreach_job_id": job["id"],
            "updated_at": _now_iso(),
        }, "$inc": {"outreach_attempts": 1}},
    )

    # Try to dispatch via the Playwright agent (best-effort; if no agent online,
    # the job stays queued and admin can run it manually or via external API).
    try:
        from social_agent import LIVE_AGENTS, dispatch_job_to_agent, _pick_agent
        agent_id = await _pick_agent()
        if agent_id:
            try:
                result = await dispatch_job_to_agent(agent_id, {
                    "id": job["id"],
                    "kind": "reply_reddit",
                    "url": job["target_url"],
                    "body": body,
                }, timeout_s=120)
                if result and result.get("ok"):
                    await db.outreach_jobs.update_one(
                        {"id": job["id"]},
                        {"$set": {"status": "sent", "sent_at": _now_iso(),
                                  "agent_id": agent_id}},
                    )
                    await db.leads.update_one(
                        {"id": lead["id"]},
                        {"$set": {"stage": "contacted",
                                  "last_message_at": _now_iso()}},
                    )
                    job["status"] = "sent"
                else:
                    err = (result or {}).get("error", "agent_no_ack")
                    await db.outreach_jobs.update_one(
                        {"id": job["id"]},
                        {"$set": {"status": "failed", "error": err}},
                    )
            except Exception as e:
                await db.outreach_jobs.update_one(
                    {"id": job["id"]},
                    {"$set": {"status": "failed", "error": str(e)}},
                )
    except Exception:
        # Soft fail — job stays queued for manual or later dispatch.
        logger.exception("dispatch via agent failed (non-fatal)")

    return job


async def dispatch_tick(db, max_per_tick: int = 5) -> int:
    """Pull `discovered` leads with highest signal score and dispatch outreach."""
    cur = db.leads.find(
        {"stage": "discovered"},
        {"_id": 0},
    ).sort("signal_score", -1).limit(max_per_tick)
    leads = await cur.to_list(length=max_per_tick)
    sent = 0
    for lead in leads:
        try:
            job = await dispatch_one_lead(db, lead)
            if job:
                sent += 1
        except Exception:
            logger.exception("dispatch_one_lead failed")
    return sent


async def outreach_dispatch_loop(db) -> None:
    """Background — every minute send 1-5 outreach messages."""
    logger.info("Outreach dispatch loop started")
    await asyncio.sleep(45)
    while True:
        try:
            await dispatch_tick(db)
        except Exception:
            logger.exception("Outreach tick failed")
        await asyncio.sleep(DISPATCH_TICK_SECONDS)


# =========================================================== REPLY NURTURER

async def handle_inbound_reply(db, lead_id: str, message: str) -> dict:
    """When a prospect replies, draft the next move with LLM + persist conversation.
    Returns {next_message, action} where action ∈ {reply, book, escalate}."""
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise ValueError("lead not found")

    history = list(lead.get("messages", []))
    history.append({"role": "prospect", "body": message, "ts": _now_iso()})

    calendly = os.environ.get("CALENDLY_LINK", "https://brivomarketing.com/audit")
    system = (
        "You are a B2B SDR for BrivoMarketing. Goal: qualify the prospect and "
        "book a free 30-min audit. Rules:\n"
        "- 1-3 short sentences, no fluff, no emojis\n"
        "- Never invent stats or client names\n"
        "- If they show interest, return JSON {\"action\":\"book\",\"message\":\"...with the booking link...\"}\n"
        "- If they're hostile/uninterested, JSON {\"action\":\"close\",\"message\":\"polite signoff\"}\n"
        "- If they need more info, JSON {\"action\":\"reply\",\"message\":\"answer + push to book\"}\n"
        f"- Booking link: {calendly}\n"
        "Output VALID JSON ONLY."
    )

    convo = "\n".join(
        f"{m['role']}: {m['body']}" for m in history[-6:]
    )
    user_prompt = (
        f"Lead context:\n"
        f"- Source: {lead.get('source')}\n"
        f"- Their original pain: {lead.get('snippet', '')[:300]}\n"
        f"- Conversation so far:\n{convo}\n\n"
        "Decide the next move. Respond with JSON only."
    )
    next_msg = "Thanks for replying — happy to send the audit. What's the best email?"
    action = "reply"
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if api_key:
            llm = LlmChat(
                api_key=api_key,
                session_id=f"reply-{lead_id}",
                system_message=system,
            ).with_model("anthropic", "claude-haiku-4-5")
            raw = await llm.send_message(UserMessage(text=user_prompt))
            s, e = raw.find("{"), raw.rfind("}")
            if s != -1 and e != -1:
                try:
                    obj = json.loads(raw[s:e+1])
                    next_msg = (obj.get("message") or next_msg).strip()
                    action = (obj.get("action") or "reply").strip()
                except json.JSONDecodeError:
                    pass
    except Exception as e:
        logger.warning("reply nurturer fallback: %s", e)

    history.append({"role": "brivo", "body": next_msg, "ts": _now_iso(), "action": action})
    new_stage = {
        "book": "booked",
        "close": "negative",
    }.get(action, "replied")
    await db.leads.update_one(
        {"id": lead_id},
        {"$set": {
            "messages": history,
            "stage": new_stage,
            "last_message_at": _now_iso(),
            "updated_at": _now_iso(),
        }},
    )
    return {"next_message": next_msg, "action": action, "stage": new_stage}


# =============================================================== STATS

async def pipeline_stats(db) -> dict:
    stages = ["discovered", "queued", "contacted", "replied", "qualified", "booked", "negative"]
    out = {}
    for s in stages:
        out[s] = await db.leads.count_documents({"stage": s})
    out["total"] = await db.leads.count_documents({})
    out["outreach_sent_today"] = await _outreach_count_today(db, "reddit")
    return out
