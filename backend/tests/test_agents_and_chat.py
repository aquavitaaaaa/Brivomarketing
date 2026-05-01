"""Tests for new Agents + Chat Sessions admin features.

Covers:
- Default agent seeded on startup (Brivo Strategist, role=chat, is_default=True)
- Agent CRUD: create, patch, delete (default protection, single-default flip)
- /api/admin/agents/models returns 6 entries
- Public /api/chat creates chat_sessions doc with visitor metadata
- Public /api/chat with same session_id continues conversation (message_count +=2)
- Editing default agent's system_prompt affects /api/chat output (soft check)
- Admin chat sessions list + detail
- Auth gating on admin/agents and admin/chat/sessions
"""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("REACT_APP_BACKEND_URL"):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break

ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoOps2026!"


@pytest.fixture(scope="module")
def token():
    r = requests.post(
        f"{BASE_URL}/api/auth/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------- Auth gating ----------------
def test_admin_agents_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/agents", timeout=15)
    assert r.status_code == 401


def test_admin_chat_sessions_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/chat/sessions", timeout=15)
    assert r.status_code == 401


# ---------------- Models ----------------
def test_agent_models_six(auth):
    r = requests.get(f"{BASE_URL}/api/admin/agents/models", headers=auth, timeout=15)
    assert r.status_code == 200
    options = r.json()["options"]
    assert isinstance(options, list)
    assert len(options) == 6
    for o in options:
        assert "provider" in o and "model" in o and "label" in o


# ---------------- Seed ----------------
def test_default_agent_seeded(auth):
    r = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth, timeout=15)
    assert r.status_code == 200
    agents = r.json()
    chat_agents = [a for a in agents if a["role"] == "chat"]
    assert len(chat_agents) >= 1
    defaults = [a for a in chat_agents if a.get("is_default")]
    assert len(defaults) == 1
    assert defaults[0]["name"] == "Brivo Strategist"


# ---------------- Agent CRUD ----------------
def test_agent_crud_lifecycle(auth):
    # CREATE non-default agent
    name = f"TEST_Agent_{uuid.uuid4().hex[:6]}"
    r = requests.post(
        f"{BASE_URL}/api/admin/agents",
        headers=auth,
        json={
            "name": name,
            "role": "chat",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "system_prompt": "You are a test agent.",
            "is_default": False,
        },
        timeout=15,
    )
    assert r.status_code == 200, r.text
    agent = r.json()
    aid = agent["id"]
    assert agent["name"] == name
    assert agent["is_default"] is False

    # PATCH name
    r2 = requests.patch(
        f"{BASE_URL}/api/admin/agents/{aid}",
        headers=auth,
        json={"name": name + "_v2"},
        timeout=15,
    )
    assert r2.status_code == 200
    assert r2.json()["name"] == name + "_v2"

    # DELETE non-default succeeds
    r3 = requests.delete(f"{BASE_URL}/api/admin/agents/{aid}", headers=auth, timeout=15)
    assert r3.status_code == 200


def test_default_agent_delete_blocked(auth):
    # Get the existing default
    r = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth, timeout=15)
    defaults = [a for a in r.json() if a["role"] == "chat" and a.get("is_default")]
    assert defaults
    did = defaults[0]["id"]
    rd = requests.delete(f"{BASE_URL}/api/admin/agents/{did}", headers=auth, timeout=15)
    assert rd.status_code == 400


def test_default_flip_on_set_default_true(auth):
    # Create a second chat agent, then mark it default — original should flip off
    r = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth, timeout=15)
    original_default = [a for a in r.json() if a["role"] == "chat" and a.get("is_default")][0]
    original_id = original_default["id"]

    name = f"TEST_DefaultFlip_{uuid.uuid4().hex[:6]}"
    rc = requests.post(
        f"{BASE_URL}/api/admin/agents",
        headers=auth,
        json={
            "name": name,
            "role": "chat",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "system_prompt": "Flip test",
            "is_default": False,
        },
        timeout=15,
    )
    new_id = rc.json()["id"]

    # Promote new agent to default
    rp = requests.patch(
        f"{BASE_URL}/api/admin/agents/{new_id}",
        headers=auth,
        json={"is_default": True},
        timeout=15,
    )
    assert rp.status_code == 200
    assert rp.json()["is_default"] is True

    # Verify original flipped to False
    r2 = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth, timeout=15)
    by_id = {a["id"]: a for a in r2.json()}
    assert by_id[original_id]["is_default"] is False
    assert by_id[new_id]["is_default"] is True

    # Restore original as default
    requests.patch(
        f"{BASE_URL}/api/admin/agents/{original_id}",
        headers=auth,
        json={"is_default": True},
        timeout=15,
    )
    requests.delete(f"{BASE_URL}/api/admin/agents/{new_id}", headers=auth, timeout=15)

    # Sanity restore
    r3 = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth, timeout=15)
    assert any(a["id"] == original_id and a.get("is_default") for a in r3.json())


# ---------------- Public Chat: session metadata + continuity ----------------
def test_public_chat_creates_session_and_continues():
    # First message
    r1 = requests.post(
        f"{BASE_URL}/api/chat",
        json={"message": "Hi, what services do you offer?"},
        timeout=60,
    )
    assert r1.status_code == 200, r1.text
    body1 = r1.json()
    sid = body1["session_id"]
    assert sid
    assert isinstance(body1["reply"], str) and len(body1["reply"]) > 0

    # Second message — same session
    r2 = requests.post(
        f"{BASE_URL}/api/chat",
        json={"session_id": sid, "message": "Tell me about ACCELERATE pricing."},
        timeout=60,
    )
    assert r2.status_code == 200, r2.text
    assert r2.json()["session_id"] == sid

    # Verify session shows up in admin list with message_count=4
    tok = requests.post(
        f"{BASE_URL}/api/auth/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15,
    ).json()["token"]
    h = {"Authorization": f"Bearer {tok}"}
    rl = requests.get(f"{BASE_URL}/api/admin/chat/sessions", headers=h, timeout=15)
    assert rl.status_code == 200
    sessions = rl.json()
    match = [s for s in sessions if s["session_id"] == sid]
    assert match, "session not listed"
    sess = match[0]
    assert sess.get("message_count") == 4
    # Visitor meta keys present
    for k in ("ip", "device", "browser", "os"):
        assert k in sess

    # Detail endpoint
    rd = requests.get(
        f"{BASE_URL}/api/admin/chat/sessions/{sid}", headers=h, timeout=15
    )
    assert rd.status_code == 200
    detail = rd.json()
    assert detail["session"]["session_id"] == sid
    assert len(detail["messages"]) == 4
    roles = [m["role"] for m in detail["messages"]]
    assert roles == ["user", "assistant", "user", "assistant"]


# ---------------- Chat uses DB agent (prompt swap) ----------------
def test_chat_reflects_default_agent_prompt(auth):
    # Find default chat agent
    r = requests.get(f"{BASE_URL}/api/admin/agents", headers=auth, timeout=15)
    default_agent = [a for a in r.json() if a["role"] == "chat" and a.get("is_default")][0]
    aid = default_agent["id"]
    original_prompt = default_agent["system_prompt"]

    try:
        # Override prompt to force a marker
        new_prompt = (
            "You are a test assistant. ALWAYS begin every response with the literal "
            "token 'AGENT-OK:' and then a short reply. No exceptions."
        )
        rp = requests.patch(
            f"{BASE_URL}/api/admin/agents/{aid}",
            headers=auth,
            json={"system_prompt": new_prompt},
            timeout=15,
        )
        assert rp.status_code == 200

        # Small sleep to allow any in-flight cache (none expected — prompt is read live)
        time.sleep(1)

        # Send a chat with brand new session
        rc = requests.post(
            f"{BASE_URL}/api/chat",
            json={"message": "Hello"},
            timeout=60,
        )
        assert rc.status_code == 200, rc.text
        reply = rc.json()["reply"].strip()
        # Soft check: reply should start with AGENT-OK:
        assert reply.startswith("AGENT-OK:"), f"prompt swap not reflected: {reply[:120]!r}"
    finally:
        # Restore original prompt — critical for site behavior
        requests.patch(
            f"{BASE_URL}/api/admin/agents/{aid}",
            headers=auth,
            json={"system_prompt": original_prompt},
            timeout=15,
        )
