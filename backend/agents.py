"""
Agent registry — admin-editable AI personas.

Each agent has: name, role (chat/voice/email), system_prompt, provider/model,
enabled, is_default. The public /api/chat endpoint resolves the default chat
agent at runtime so admins can edit prompts without a redeploy.
"""
import uuid
from datetime import datetime, timezone


# Default seed — matches the previously hardcoded BRIVO_SYSTEM_MESSAGE.
DEFAULT_AGENT_SEED = {
    "name": "Brivo Strategist",
    "role": "chat",
    "provider": "anthropic",
    "model": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "enabled": True,
    "is_default": True,
    "description": "Sharp, direct in-house strategist. Closes deals, never sounds like a bot.",
    "system_prompt": """You are BrivoMarketing AI — the in-house strategist for BrivoMarketing, a high-performance digital marketing & web design studio.

BrivoMarketing's services:
- Web Design & Development (custom, conversion-focused sites)
- SEO & Content Marketing (technical SEO, content strategy, link building)
- Paid Advertising (Google Ads, Meta Ads, TikTok, retargeting)
- Social Media Management (organic strategy, community, content creation)
- Branding & Logo Design (visual identity, brand systems)

Pricing tiers:
- IGNITE — $2,500/mo — for startups, 1 channel, basic site, monthly reporting
- ACCELERATE — $7,500/mo — multi-channel, custom site, weekly reports, dedicated strategist (MOST POPULAR)
- DOMINATE — $15,000+/mo — enterprise, full-stack execution, daily ops, priority everything

Tone: Confident, sharp, direct. Sound like a top-tier strategist who closes deals — not a chatbot. Keep replies tight (2-4 sentences). Use line breaks for readability when listing items. Always nudge interested visitors to "Start a Project" via the inquiry form on the page when they show buying intent. Never invent client names or fake stats. If asked something off-topic, redirect to marketing/web.""",
}


# Curated model options exposed in the admin UI. Picked to work with the
# Managed AI key (server-side only, never exposed to clients).
MODEL_OPTIONS = [
    {"provider": "anthropic", "model": "claude-sonnet-4-5-20250929", "label": "Claude Sonnet 4.5 (smart, default)"},
    {"provider": "anthropic", "model": "claude-haiku-4-5", "label": "Claude Haiku 4.5 (fast + cheap)"},
    {"provider": "openai", "model": "gpt-4o", "label": "GPT-4o (OpenAI flagship)"},
    {"provider": "openai", "model": "gpt-4o-mini", "label": "GPT-4o mini (fast + cheap)"},
    {"provider": "google", "model": "gemini-2.5-pro", "label": "Gemini 2.5 Pro"},
    {"provider": "google", "model": "gemini-2.5-flash", "label": "Gemini 2.5 Flash"},
]


async def seed_default_agents(db) -> None:
    """Insert the default chat agent once, if no chat agent exists."""
    existing = await db.agents.find_one({"role": "chat"})
    if existing is None:
        doc = {
            "id": str(uuid.uuid4()),
            **DEFAULT_AGENT_SEED,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.agents.insert_one(doc)


async def get_default_chat_agent(db) -> dict | None:
    """Return the agent the public /api/chat endpoint should use."""
    agent = await db.agents.find_one(
        {"role": "chat", "is_default": True, "enabled": True}, {"_id": 0}
    )
    if agent:
        return agent
    # Fallback: any enabled chat agent
    return await db.agents.find_one(
        {"role": "chat", "enabled": True}, {"_id": 0}
    )
