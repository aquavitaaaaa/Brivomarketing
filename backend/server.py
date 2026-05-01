from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="Brivo Marketing API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    service_interest: str
    budget: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    service_interest: str
    budget: Optional[str] = None
    message: str


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
    role: str  # 'user' | 'assistant'
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- AI System Message ----------
BRIVO_SYSTEM_MESSAGE = """You are Brivo AI — the in-house strategist for Brivo Marketing, a high-performance digital marketing & web design agency.

Brivo's services:
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


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Brivo Marketing API live"}


@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    inquiry = Inquiry(**payload.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.inquiries.insert_one(doc)
    logger.info(f"New inquiry from {inquiry.email} — {inquiry.service_interest}")
    return inquiry


@api_router.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries():
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


@api_router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = payload.session_id or str(uuid.uuid4())

    # Persist user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=payload.message)
    user_doc = user_msg.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.chat_messages.insert_one(user_doc)

    try:
        llm = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=BRIVO_SYSTEM_MESSAGE,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        reply_text = await llm.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logger.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    # Persist assistant message
    asst_msg = ChatMessage(session_id=session_id, role="assistant", content=reply_text)
    asst_doc = asst_msg.model_dump()
    asst_doc['created_at'] = asst_doc['created_at'].isoformat()
    await db.chat_messages.insert_one(asst_doc)

    return ChatResponse(session_id=session_id, reply=reply_text)


app.include_router(api_router)

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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
