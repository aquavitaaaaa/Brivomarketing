from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_admin,
    seed_admin,
)
import bland_client
import analytics_utils
import email_client
import agents as agents_module
import social_agent
import asyncio

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="BrivoMarketing API")
api_router = APIRouter(prefix="/api")


# =====================================================================
# MODELS
# =====================================================================
class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    service_interest: str
    budget: Optional[str] = None
    message: str
    source: Optional[str] = None
    roi_snapshot: Optional[Dict[str, Any]] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    service_interest: str
    budget: Optional[str] = None
    message: str
    source: Optional[str] = None
    roi_snapshot: Optional[Dict[str, Any]] = None


class RoiLeadCreate(BaseModel):
    email: EmailStr
    revenue: float
    roas: float
    spend: float
    lift: float


class AnalyticsEventCreate(BaseModel):
    event: str  # 'pageview' | 'cta_click' | 'section_view'
    path: str
    referrer: Optional[str] = None
    session_id: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OutboundCallRequest(BaseModel):
    phone_number: str
    name: Optional[str] = None
    company: Optional[str] = None
    task: Optional[str] = None


class OperatorToggleRequest(BaseModel):
    enabled: bool


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------- Agents --------------------
class AgentCreate(BaseModel):
    name: str
    role: str = "chat"  # chat | voice | email
    provider: str = "anthropic"
    model: str = "claude-sonnet-4-5-20250929"
    system_prompt: str
    description: Optional[str] = ""
    temperature: Optional[float] = 0.7
    enabled: bool = True
    is_default: bool = False


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    description: Optional[str] = None
    temperature: Optional[float] = None
    enabled: Optional[bool] = None
    is_default: Optional[bool] = None


# =====================================================================
# AI System Message
# =====================================================================
BRIVO_SYSTEM_MESSAGE = """You are BrivoMarketing AI — the in-house strategist for BrivoMarketing, a high-performance digital marketing & web design studio.

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

Tone: Confident, sharp, direct. Sound like a top-tier strategist who closes deals — not a chatbot. Keep replies tight (2-4 sentences). Use line breaks for readability when listing items. Always nudge interested visitors to "Start a Project" via the inquiry form on the page when they show buying intent. Never invent client names or fake stats. If asked something off-topic, redirect to marketing/web."""


# =====================================================================
# PUBLIC ROUTES
# =====================================================================
@api_router.get("/")
async def root():
    return {"message": "BrivoMarketing API live"}


@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate, request: Request):
    inquiry = Inquiry(**payload.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['ip'] = analytics_utils.client_ip_from_request(request)
    doc['ua'] = request.headers.get("user-agent")
    await db.inquiries.insert_one(doc)
    logger.info(f"New inquiry from {inquiry.email} — {inquiry.service_interest}")
    asyncio.create_task(email_client.send_new_lead_notification(doc))
    return inquiry


@api_router.post("/inquiries/roi", response_model=Inquiry)
async def create_roi_lead(payload: RoiLeadCreate, request: Request):
    """Convenience endpoint for the ROI calculator form (email-only)."""
    snapshot = {
        "revenue": payload.revenue,
        "roas": payload.roas,
        "spend": payload.spend,
        "lift": payload.lift,
    }
    inquiry = Inquiry(
        name="ROI calculator lead",
        email=payload.email,
        service_interest="Audit request",
        message=(
            f"ROI calculator submission. Projected lift: ${payload.lift:,.0f}/yr "
            f"(revenue ${payload.revenue:,.0f}, current ROAS {payload.roas}x, "
            f"spend ${payload.spend:,.0f}/mo)."
        ),
        source="roi-calculator",
        roi_snapshot=snapshot,
    )
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['ip'] = analytics_utils.client_ip_from_request(request)
    doc['ua'] = request.headers.get("user-agent")
    await db.inquiries.insert_one(doc)
    logger.info(f"ROI lead from {inquiry.email} — lift ${payload.lift:,.0f}")
    asyncio.create_task(email_client.send_new_lead_notification(doc))
    return inquiry


@api_router.post("/analytics/event")
async def track_event(payload: AnalyticsEventCreate, request: Request):
    ip = analytics_utils.client_ip_from_request(request)
    ua = request.headers.get("user-agent")
    ua_info = analytics_utils.parse_user_agent(ua)
    geo = await analytics_utils.resolve_geo(ip)

    doc = {
        "id": str(uuid.uuid4()),
        "event": payload.event,
        "path": payload.path,
        "referrer": payload.referrer,
        "session_id": payload.session_id,
        "meta": payload.meta or {},
        "ip": ip,
        "ua": ua,
        **ua_info,
        **geo,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.analytics_events.insert_one(doc)
    return {"ok": True}


# =====================================================================
# AUTH
# =====================================================================
@api_router.post("/auth/admin/login")
async def admin_login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user["_id"]), email)
    return {
        "token": token,
        "user": {"email": email, "role": "admin", "name": user.get("name", "Admin")},
    }


@api_router.get("/auth/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return admin


# =====================================================================
# ADMIN — LEADS
# =====================================================================
@api_router.get("/admin/inquiries")
async def list_inquiries(admin: dict = Depends(get_current_admin)):
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.patch("/admin/inquiries/{inquiry_id}")
async def update_inquiry_status(
    inquiry_id: str,
    body: Dict[str, Any],
    admin: dict = Depends(get_current_admin),
):
    status = body.get("status")
    if status not in ("new", "contacted", "qualified", "won", "lost"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"status": status}})
    return {"ok": True}


# =====================================================================
# ADMIN — ANALYTICS
# =====================================================================
@api_router.get("/admin/analytics/summary")
async def analytics_summary(
    days: int = 7,
    admin: dict = Depends(get_current_admin),
):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    match = {"created_at": {"$gte": since}}

    # Totals
    total_events = await db.analytics_events.count_documents(match)
    total_pageviews = await db.analytics_events.count_documents(
        {**match, "event": "pageview"}
    )
    total_inquiries = await db.inquiries.count_documents(
        {"created_at": {"$gte": since}}
    )

    # Unique sessions (pageviews)
    unique_sessions_pipeline = [
        {"$match": {**match, "event": "pageview"}},
        {"$group": {"_id": "$session_id"}},
        {"$count": "count"},
    ]
    unique_sessions = 0
    async for d in db.analytics_events.aggregate(unique_sessions_pipeline):
        unique_sessions = d.get("count", 0)

    # Aggregations
    async def agg_by(field: str, limit: int = 8):
        pipeline = [
            {"$match": {**match, "event": "pageview", field: {"$ne": None}}},
            {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit},
        ]
        out = []
        async for d in db.analytics_events.aggregate(pipeline):
            out.append({"label": d["_id"] or "Unknown", "count": d["count"]})
        return out

    by_country = await agg_by("country")
    by_device = await agg_by("device")
    by_browser = await agg_by("browser")
    by_os = await agg_by("os")
    by_path = await agg_by("path", limit=10)

    # Top referrers
    ref_pipeline = [
        {"$match": {**match, "event": "pageview", "referrer": {"$nin": [None, ""]}}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8},
    ]
    by_referrer = []
    async for d in db.analytics_events.aggregate(ref_pipeline):
        by_referrer.append({"label": d["_id"], "count": d["count"]})

    # Daily series (pageviews per day)
    daily_pipeline = [
        {"$match": {**match, "event": "pageview"}},
        {
            "$group": {
                "_id": {"$substr": ["$created_at", 0, 10]},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    daily = []
    async for d in db.analytics_events.aggregate(daily_pipeline):
        daily.append({"date": d["_id"], "count": d["count"]})

    # CTA clicks leaderboard
    cta_pipeline = [
        {"$match": {**match, "event": "cta_click"}},
        {"$group": {"_id": "$meta.id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    cta_clicks = []
    async for d in db.analytics_events.aggregate(cta_pipeline):
        cta_clicks.append({"label": d["_id"] or "unknown", "count": d["count"]})

    return {
        "range_days": days,
        "totals": {
            "events": total_events,
            "pageviews": total_pageviews,
            "unique_sessions": unique_sessions,
            "inquiries": total_inquiries,
        },
        "by_country": by_country,
        "by_device": by_device,
        "by_browser": by_browser,
        "by_os": by_os,
        "by_path": by_path,
        "by_referrer": by_referrer,
        "daily_pageviews": daily,
        "cta_clicks": cta_clicks,
    }


@api_router.get("/admin/analytics/recent")
async def analytics_recent(admin: dict = Depends(get_current_admin)):
    docs = await db.analytics_events.find(
        {"event": "pageview"}, {"_id": 0}
    ).sort("created_at", -1).limit(30).to_list(30)
    return docs


# =====================================================================
# ADMIN — OPERATOR (Bland.ai)
# =====================================================================
@api_router.get("/admin/operator/status")
async def operator_status(admin: dict = Depends(get_current_admin)):
    settings = await db.settings.find_one({"_id": "operator"}) or {}
    return {
        "configured": bland_client.is_configured(),
        "inbound_enabled": settings.get("inbound_enabled", False),
        "inbound_number": os.environ.get("BLAND_INBOUND_NUMBER", ""),
        "pathway_id": os.environ.get("BLAND_PATHWAY_ID", ""),
        "webhook_secret_set": bool(os.environ.get("BLAND_WEBHOOK_SECRET", "").strip()),
        "email_configured": email_client.is_configured(),
        "notify_email": os.environ.get("NOTIFY_EMAIL", ""),
    }


@api_router.post("/admin/operator/toggle")
async def operator_toggle(
    payload: OperatorToggleRequest,
    request: Request,
    admin: dict = Depends(get_current_admin),
):
    if payload.enabled:
        # Attempt to configure the inbound number live
        inbound = os.environ.get("BLAND_INBOUND_NUMBER", "").strip()
        if not inbound:
            raise HTTPException(
                status_code=400,
                detail="Set BLAND_INBOUND_NUMBER in backend/.env to enable inbound.",
            )
        webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhooks/bland"
        await bland_client.configure_inbound_number(
            phone_number=inbound,
            pathway_id=os.environ.get("BLAND_PATHWAY_ID") or None,
            webhook_url=webhook_url,
            prompt=(
                "You are the AI operator for BrivoMarketing, an elite AI performance "
                "marketing studio. Answer friendly and professional. Qualify the caller "
                "(what brand, what problem, approximate budget), then offer to book a "
                "30-minute audit with a Brivo strategist. Collect full name, email, "
                "company, and the best callback number. Keep it to under 3 minutes."
            ),
        )
    await db.settings.update_one(
        {"_id": "operator"},
        {"$set": {"inbound_enabled": payload.enabled}},
        upsert=True,
    )
    return {"ok": True, "inbound_enabled": payload.enabled}


@api_router.post("/admin/operator/call")
async def operator_outbound_call(
    payload: OutboundCallRequest,
    request: Request,
    admin: dict = Depends(get_current_admin),
):
    name = payload.name or "a prospect"
    company = payload.company or "their company"
    task = payload.task or (
        f"You are calling {name} from {company} on behalf of BrivoMarketing, an AI "
        f"performance marketing studio. Introduce yourself, confirm interest, and "
        f"book a 30-minute audit call. Collect email and best callback time. "
        f"Keep the call under 3 minutes. Be friendly and confident."
    )
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhooks/bland"
    result = await bland_client.start_outbound_call(
        phone_number=payload.phone_number,
        task=task,
        pathway_id=os.environ.get("BLAND_PATHWAY_ID") or None,
        from_number=os.environ.get("BLAND_FROM_NUMBER") or None,
        webhook_url=webhook_url,
    )

    # Log intent in DB regardless of Bland response
    await db.calls.insert_one({
        "id": str(uuid.uuid4()),
        "direction": "outbound",
        "phone_number": payload.phone_number,
        "name": payload.name,
        "company": payload.company,
        "status": "queued",
        "bland_call_id": result.get("call_id"),
        "batch_id": result.get("batch_id"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True, **result}


@api_router.get("/admin/calls")
async def list_calls(admin: dict = Depends(get_current_admin)):
    docs = await db.calls.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


# =====================================================================
# BLAND WEBHOOK
# =====================================================================
@api_router.post("/webhooks/bland")
async def bland_webhook(request: Request):
    raw = await request.body()
    signature = request.headers.get("X-Webhook-Signature") or request.headers.get(
        "x-webhook-signature"
    )
    if not bland_client.verify_webhook_signature(raw, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    import json
    try:
        payload = json.loads(raw.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    variables = payload.get("variables") or {}
    bland_call_id = payload.get("call_id")

    # Upsert into calls collection by bland_call_id
    call_doc = {
        "id": str(uuid.uuid4()),
        "direction": "inbound" if not payload.get("outbound") else "outbound",
        "phone_number": payload.get("to") or payload.get("from"),
        "from_number": payload.get("from"),
        "to_number": payload.get("to"),
        "status": "completed",
        "call_length": payload.get("call_length"),
        "transcript": payload.get("transcript"),
        "corrected_transcript": payload.get("corrected_transcript"),
        "recording_url": payload.get("recording_url"),
        "variables": variables,
        "bland_call_id": bland_call_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if bland_call_id:
        await db.calls.update_one(
            {"bland_call_id": bland_call_id},
            {"$set": call_doc},
            upsert=True,
        )
    else:
        await db.calls.insert_one(call_doc)

    # If the pathway captured enough, mirror into inquiries
    if variables.get("email") or variables.get("customer_email"):
        email = variables.get("email") or variables.get("customer_email")
        try:
            await db.inquiries.insert_one({
                "id": str(uuid.uuid4()),
                "name": variables.get("name") or variables.get("customer_name") or "Phone lead",
                "email": email,
                "company": variables.get("company"),
                "service_interest": variables.get("service") or "Audit request",
                "budget": variables.get("budget"),
                "message": f"Captured via AI operator call ({call_doc['direction']}). "
                           f"Duration {payload.get('call_length')}s. "
                           f"Transcript: {(payload.get('transcript') or '')[:400]}",
                "source": f"operator-{call_doc['direction']}",
                "status": "new",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:
            logger.exception("Failed to mirror call to inquiries")

    return {"ok": True}


# =====================================================================
# CHAT (existing)
# =====================================================================
@api_router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = payload.session_id or str(uuid.uuid4())

    # Resolve the active chat agent (admin-editable).
    agent = await agents_module.get_default_chat_agent(db)
    if agent:
        system_prompt = agent["system_prompt"]
        provider = agent.get("provider", "anthropic")
        model = agent.get("model", "claude-sonnet-4-5-20250929")
    else:
        system_prompt = BRIVO_SYSTEM_MESSAGE
        provider = "anthropic"
        model = "claude-sonnet-4-5-20250929"

    prior = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)

    # Upsert session metadata on first message so admin can see visitor info.
    if not prior:
        ip = analytics_utils.client_ip_from_request(request)
        ua = request.headers.get("user-agent")
        ua_info = analytics_utils.parse_user_agent(ua)
        geo = await analytics_utils.resolve_geo(ip)
        await db.chat_sessions.update_one(
            {"session_id": session_id},
            {
                "$setOnInsert": {
                    "session_id": session_id,
                    "first_message": payload.message,
                    "ip": ip,
                    "ua": ua,
                    **ua_info,
                    **geo,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "agent_id": agent.get("id") if agent else None,
                }
            },
            upsert=True,
        )

    user_msg = ChatMessage(session_id=session_id, role="user", content=payload.message)
    user_doc = user_msg.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.chat_messages.insert_one(user_doc)

    if prior:
        history_lines = [f"{m['role'].upper()}: {m['content']}" for m in prior]
        history_block = "\n".join(history_lines)
        composite_text = (
            f"<conversation_so_far>\n{history_block}\n</conversation_so_far>\n\n"
            f"USER (new message): {payload.message}"
        )
    else:
        composite_text = payload.message

    try:
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_prompt,
        ).with_model(provider, model)
        reply_text = await llm.send_message(UserMessage(text=composite_text))
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    asst_msg = ChatMessage(session_id=session_id, role="assistant", content=reply_text)
    asst_doc = asst_msg.model_dump()
    asst_doc['created_at'] = asst_doc['created_at'].isoformat()
    await db.chat_messages.insert_one(asst_doc)

    # Bump session stats
    await db.chat_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "last_message": payload.message,
                "last_reply": reply_text,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$inc": {"message_count": 2},
        },
        upsert=True,
    )

    return ChatResponse(session_id=session_id, reply=reply_text)


# =====================================================================
# ADMIN — AGENTS
# =====================================================================
@api_router.get("/admin/agents/models")
async def list_agent_models(admin: dict = Depends(get_current_admin)):
    return {"options": agents_module.MODEL_OPTIONS}


@api_router.get("/admin/agents")
async def list_agents(admin: dict = Depends(get_current_admin)):
    docs = await db.agents.find({}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return docs


@api_router.post("/admin/agents")
async def create_agent(payload: AgentCreate, admin: dict = Depends(get_current_admin)):
    doc = payload.model_dump()
    now = datetime.now(timezone.utc).isoformat()
    doc.update({"id": str(uuid.uuid4()), "created_at": now, "updated_at": now})

    # Whitelist (provider, model)
    allowed = {(o["provider"], o["model"]) for o in agents_module.MODEL_OPTIONS}
    if (doc["provider"], doc["model"]) not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model: {doc['provider']}/{doc['model']}",
        )

    # Only one default per role
    if doc["is_default"]:
        await db.agents.update_many(
            {"role": doc["role"], "is_default": True},
            {"$set": {"is_default": False}},
        )
    await db.agents.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/admin/agents/{agent_id}")
async def update_agent(
    agent_id: str,
    payload: AgentUpdate,
    admin: dict = Depends(get_current_admin),
):
    changes = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if not changes:
        raise HTTPException(status_code=400, detail="Nothing to update")

    existing = await db.agents.find_one({"id": agent_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Whitelist provider/model if either is being changed
    if "provider" in changes or "model" in changes:
        prov = changes.get("provider", existing["provider"])
        mdl = changes.get("model", existing["model"])
        allowed = {(o["provider"], o["model"]) for o in agents_module.MODEL_OPTIONS}
        if (prov, mdl) not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported model: {prov}/{mdl}",
            )

    # Enforce single-default per role
    if changes.get("is_default") is True:
        role = changes.get("role", existing["role"])
        await db.agents.update_many(
            {"role": role, "is_default": True, "id": {"$ne": agent_id}},
            {"$set": {"is_default": False}},
        )

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.agents.update_one({"id": agent_id}, {"$set": changes})
    updated = await db.agents.find_one({"id": agent_id}, {"_id": 0})
    return updated


@api_router.delete("/admin/agents/{agent_id}")
async def delete_agent(agent_id: str, admin: dict = Depends(get_current_admin)):
    existing = await db.agents.find_one({"id": agent_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    if existing.get("is_default"):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the default agent. Set another agent as default first.",
        )
    await db.agents.delete_one({"id": agent_id})
    return {"ok": True}


# =====================================================================
# ADMIN — CHAT SESSIONS (visitor messages)
# =====================================================================
@api_router.get("/admin/chat/sessions")
async def list_chat_sessions(admin: dict = Depends(get_current_admin)):
    sessions = await db.chat_sessions.find({}, {"_id": 0}).sort("updated_at", -1).to_list(500)
    # Fill in missing message counts from chat_messages for older sessions
    for s in sessions:
        if s.get("message_count") is None:
            s["message_count"] = await db.chat_messages.count_documents(
                {"session_id": s["session_id"]}
            )
    return sessions


@api_router.get("/admin/chat/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    admin: dict = Depends(get_current_admin),
):
    session = await db.chat_sessions.find_one(
        {"session_id": session_id}, {"_id": 0}
    )
    messages = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    return {"session": session, "messages": messages}


# =====================================================================
# APP MOUNT
# =====================================================================
app.include_router(api_router)

# Mount the social-agent router (admin endpoints + agent pair + WebSocket).
social_agent.attach(db)
app.include_router(social_agent.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
    except Exception:
        pass
    try:
        await db.inquiries.create_index("email")
        await db.inquiries.create_index("created_at")
        await db.analytics_events.create_index("created_at")
        await db.analytics_events.create_index("session_id")
        await db.calls.create_index("bland_call_id", unique=True, sparse=True)
        await db.chat_sessions.create_index("session_id", unique=True)
        await db.chat_sessions.create_index("updated_at")
        await db.chat_messages.create_index("session_id")
        await db.agents.create_index("id", unique=True)
    except Exception:
        pass
    await seed_admin(db)
    await agents_module.seed_default_agents(db)
    # social agent indexes
    try:
        await db.social_agents.create_index("id", unique=True)
        await db.social_posts.create_index("scheduled_at")
        await db.social_posts.create_index("status")
        await db.social_jobs.create_index("created_at")
        await db.pair_codes.create_index("code")
        await db.pair_codes.create_index("expires_at", expireAfterSeconds=0)
        # Phase 1 indexes
        await db.social_account_policies.create_index(
            [("agent_id", 1), ("platform", 1)], unique=True
        )
        await db.hook_library.create_index("slug", unique=True)
        await db.hook_library.create_index("score")
        await db.client_wins.create_index("last_used_at")
    except Exception:
        pass
    # Seed hook library + client wins (idempotent)
    try:
        import social_content_factory as _scf
        await _scf.seed_hook_library(db)
        await _scf.seed_wins(db)
    except Exception:
        logger.exception("Phase 1 seeding failed (non-fatal)")
    # Kick off the auto-poster scheduler in the background
    asyncio.create_task(social_agent.scheduler_loop(db))
    # Kick off the client-win recycler so the queue never goes dry
    try:
        import social_content_factory as _scf
        asyncio.create_task(_scf.wins_recycler_loop(db))
    except Exception:
        logger.exception("wins_recycler_loop failed to start")
    logger.info("Admin seeded. Ready.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
