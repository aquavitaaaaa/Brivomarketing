"""
Social-media automation helpers — caption generator + model seeds.

Most of the real posting / DM handling will come online once the user plugs in
platform OAuth tokens. For now we focus on:
  - AI-drafted captions (works today via the managed AI stack)
  - DB schemas for scheduled posts + DM templates
  - Account-connection stubs returning 'not connected' status per platform
"""
import os
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import List

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)


PLATFORMS = ["instagram", "linkedin", "x"]


# Per-platform style guidance baked into the prompt.
PLATFORM_HINTS = {
    "instagram": "Casual, visual, 100-220 words. 3-6 relevant hashtags at the end. Emoji okay in moderation.",
    "linkedin": "Professional, story-led, 100-300 words. A hook line, 2-3 short paragraphs, a clear takeaway. No hashtags at the top; 3-5 at the bottom.",
    "x": "Punchy, conversational, 1-2 short paragraphs MAX. Under 270 characters total if possible. Hooks the reader fast.",
}


SOCIAL_AGENT_SEED = {
    "name": "Brivo Social Writer",
    "role": "social",
    "provider": "anthropic",
    "model": "claude-sonnet-4-5-20250929",
    "temperature": 0.9,
    "enabled": True,
    "is_default": True,
    "description": "Generates platform-tuned social captions for Brivo + clients.",
    "system_prompt": (
        "You are the lead social copywriter at BrivoMarketing — a high-performance "
        "AI marketing studio. You draft platform-native captions that convert. "
        "Rules:\n"
        "- Lead with a hook that stops the scroll\n"
        "- Match the voice of the brief the user gives you\n"
        "- Never invent metrics or client names\n"
        "- Match the tone and length hints for each platform\n"
        "- Output VALID JSON ONLY — no prose, no code fences\n"
    ),
}


DM_AGENT_SEED = {
    "name": "Brivo DM Responder",
    "role": "social_dm",
    "provider": "anthropic",
    "model": "claude-haiku-4-5",
    "temperature": 0.6,
    "enabled": True,
    "is_default": True,
    "description": "Replies to incoming DMs as Brivo. Qualifies, books, polite.",
    "system_prompt": (
        "You are replying to an inbound DM on Instagram/LinkedIn/X on behalf of "
        "BrivoMarketing. Keep replies to 1–3 sentences. Be warm, confident, and "
        "always move the conversation toward booking a 30-minute audit or asking "
        "for the prospect's email. Never make up stats or client names."
    ),
}


async def seed_default_social_agents(db) -> None:
    """Seed 'social' and 'social_dm' default agents if none exist yet."""
    for seed in (SOCIAL_AGENT_SEED, DM_AGENT_SEED):
        existing = await db.agents.find_one({"role": seed["role"]})
        if existing is None:
            doc = {
                "id": str(uuid.uuid4()),
                **seed,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.agents.insert_one(doc)


async def _resolve_agent(db, role: str = "social") -> dict:
    agent = await db.agents.find_one(
        {"role": role, "is_default": True, "enabled": True}, {"_id": 0}
    )
    if agent:
        return agent
    # Fallback to default chat agent if no social agent exists.
    return await db.agents.find_one(
        {"role": "chat", "is_default": True, "enabled": True}, {"_id": 0}
    )


async def generate_post_variants(
    db,
    brief: str,
    platforms: List[str],
    tone: str = "",
    count: int = 3,
) -> List[dict]:
    """Return `count` caption variants per platform tuned via the social agent."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("LLM key not configured")

    agent = await _resolve_agent(db, "social")
    if not agent:
        raise RuntimeError("No social or chat agent available")

    requested = [p for p in platforms if p in PLATFORMS] or PLATFORMS
    hints = "\n".join(
        f"- {p.upper()}: {PLATFORM_HINTS[p]}" for p in requested
    )

    user_prompt = (
        f"Brief: {brief}\n"
        f"Tone: {tone or 'on-brand (confident, sharp, results-first)'}\n"
        f"Platforms requested: {', '.join(requested)}\n\n"
        f"Platform style rules:\n{hints}\n\n"
        f"Produce {count} distinct variants. For each variant return an object with "
        f"fields: 'variant' (1..N), 'platform' (one of the requested platforms), "
        f"'content' (the post body), 'hashtags' (space-separated, e.g. '#brand #growth'). "
        f"Vary hook angles across variants. Respond with JSON: "
        f'{{"variants": [{{"variant":1,"platform":"instagram","content":"...","hashtags":"#a #b"}}, ...]}}'
    )

    session_id = f"social-gen-{uuid.uuid4()}"
    try:
        llm = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=agent["system_prompt"],
        ).with_model(agent["provider"], agent["model"])
        raw = await llm.send_message(UserMessage(text=user_prompt))
    except Exception as e:
        # Graceful fallback when LLM budget is exhausted, key invalid, or any provider error.
        # We return a deterministic stub so downstream scheduling/cross-post still succeeds.
        logger.warning("LLM generation unavailable, returning fallback variants: %s", e)
        return _fallback_variants(brief, requested, count, reason=str(e))

    return _parse_variants(raw, requested, count)


def _fallback_variants(brief: str, platforms: List[str], count: int, reason: str = "") -> List[dict]:
    """Deterministic fallback variants when the LLM is unavailable.

    Generates a basic but on-brand caption per platform using the brief itself
    so the cross-post pipeline can still queue posts for human review.
    """
    brief_short = (brief or "").strip()
    if len(brief_short) > 220:
        brief_short = brief_short[:217].rsplit(" ", 1)[0] + "…"

    base_hashtags = {
        "instagram": "#brivomarketing #aimarketing #growth #performance #marketingstudio",
        "linkedin": "#aimarketing #growthmarketing #performance",
        "x": "#aimarketing #growth",
    }
    out: List[dict] = []
    for i in range(max(count, 1)):
        plat = platforms[i % len(platforms)]
        if plat == "x":
            content = f"{brief_short}\n\nReply AUDIT for a free 30-min teardown."
        elif plat == "linkedin":
            content = (
                f"{brief_short}\n\n"
                "If this resonates, we ship AI-driven marketing systems that book meetings on autopilot. "
                "Open to a quick chat? — BrivoMarketing"
            )
        else:  # instagram
            content = (
                f"{brief_short}\n\n"
                "We build AI marketing systems that bring leads in while you sleep. DM 'AUDIT' for a free teardown."
            )
        out.append({
            "variant": i + 1,
            "platform": plat,
            "content": content,
            "hashtags": base_hashtags.get(plat, ""),
            "fallback": True,
            "fallback_reason": reason[:200] if reason else "llm_unavailable",
        })
    return out


def _parse_variants(raw: str, platforms: List[str], count: int) -> List[dict]:
    """Best-effort JSON extraction. Falls back to splitting by double-newline."""
    text = raw.strip()
    # Strip code fences if present
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    # Find first '{' and last '}' to be safe
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        try:
            obj = json.loads(text[start : end + 1])
            vs = obj.get("variants") or []
            # Normalise
            out = []
            for i, v in enumerate(vs):
                out.append({
                    "variant": i + 1,
                    "platform": v.get("platform") or platforms[i % len(platforms)],
                    "content": (v.get("content") or "").strip(),
                    "hashtags": (v.get("hashtags") or "").strip(),
                })
            if out:
                return out
        except json.JSONDecodeError:
            pass
    # Fallback: return the raw text as one variant per requested platform
    return [
        {
            "variant": i + 1,
            "platform": platforms[i % len(platforms)],
            "content": raw.strip(),
            "hashtags": "",
        }
        for i in range(min(count, len(platforms)))
    ]


def account_status_stub() -> List[dict]:
    """Skeleton — lists every platform and whether OAuth creds are in env."""
    return [
        {
            "platform": "instagram",
            "connected": bool(os.environ.get("META_ACCESS_TOKEN", "").strip()),
            "env_var": "META_ACCESS_TOKEN",
            "docs": "https://developers.facebook.com/docs/instagram-api",
        },
        {
            "platform": "linkedin",
            "connected": bool(os.environ.get("LINKEDIN_ACCESS_TOKEN", "").strip()),
            "env_var": "LINKEDIN_ACCESS_TOKEN",
            "docs": "https://learn.microsoft.com/linkedin/marketing",
        },
        {
            "platform": "x",
            "connected": bool(os.environ.get("X_BEARER_TOKEN", "").strip()),
            "env_var": "X_BEARER_TOKEN",
            "docs": "https://developer.x.com/en/docs/x-api",
        },
    ]
