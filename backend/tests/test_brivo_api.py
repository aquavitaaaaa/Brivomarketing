"""Brivo Marketing API regression tests.

Covers:
- GET /api/ (welcome)
- POST /api/inquiries (create + persistence)
- GET /api/inquiries (list, no _id leak)
- POST /api/inquiries (validation: bad email, missing required)
- POST /api/chat (Claude via emergentintegrations + session continuity)
"""
import os
import re
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://sleek-professional.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestRoot:
    def test_root_welcome(self, client):
        r = client.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "brivo" in data["message"].lower()


# ---------- Inquiries ----------
class TestInquiries:
    def test_create_inquiry_and_persist(self, client):
        unique_email = f"test_{uuid.uuid4().hex[:8]}@brivomarketing.example.com"
        payload = {
            "name": "TEST Jane Doe",
            "email": unique_email,
            "company": "TEST Acme",
            "service_interest": "Web Design & Dev",
            "budget": "$7,500 – $15,000 / mo",
            "message": "TEST inquiry — please disregard.",
        }
        r = client.post(f"{API}/inquiries", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        body = r.json()
        # Field assertions
        assert body["name"] == payload["name"]
        assert body["email"] == payload["email"]
        assert body["service_interest"] == payload["service_interest"]
        assert body["message"] == payload["message"]
        assert "id" in body and isinstance(body["id"], str) and len(body["id"]) > 10
        assert "created_at" in body
        # ISO format check
        assert re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", body["created_at"])
        # No mongo _id leak
        assert "_id" not in body

        # Verify persistence via list
        r2 = client.get(f"{API}/inquiries", timeout=15)
        assert r2.status_code == 200
        items = r2.json()
        assert isinstance(items, list)
        assert any(i.get("email") == unique_email for i in items), "inquiry not persisted"
        # Ensure no _id key in any item
        for i in items:
            assert "_id" not in i

    def test_invalid_email_returns_4xx(self, client):
        payload = {
            "name": "TEST Bad",
            "email": "not-an-email",
            "service_interest": "SEO & Content",
            "message": "bad email test",
        }
        r = client.post(f"{API}/inquiries", json=payload, timeout=15)
        assert 400 <= r.status_code < 500, f"expected 4xx, got {r.status_code}"

    def test_missing_required_returns_4xx(self, client):
        # Missing message + service_interest
        r = client.post(
            f"{API}/inquiries",
            json={"name": "TEST X", "email": "x@y.com"},
            timeout=15,
        )
        assert 400 <= r.status_code < 500


# ---------- Chat ----------
class TestChat:
    def test_chat_no_session_returns_session_and_reply(self, client):
        r = client.post(
            f"{API}/chat",
            json={"message": "What does the Accelerate tier include?"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "session_id" in data and len(data["session_id"]) > 5
        assert "reply" in data and isinstance(data["reply"], str)
        assert len(data["reply"].strip()) > 5, "AI reply seems empty"

    def test_chat_session_continuity(self, client):
        # First turn — share a unique fact
        marker = f"CODEWORD-{uuid.uuid4().hex[:6].upper()}"
        r1 = client.post(
            f"{API}/chat",
            json={"message": f"Remember this codeword: {marker}. Acknowledge briefly."},
            timeout=90,
        )
        assert r1.status_code == 200
        sid = r1.json()["session_id"]
        assert sid

        # Second turn — recall
        r2 = client.post(
            f"{API}/chat",
            json={"session_id": sid, "message": "What was the codeword I just gave you? Reply with only the codeword."},
            timeout=90,
        )
        assert r2.status_code == 200
        reply = r2.json()["reply"]
        assert r2.json()["session_id"] == sid
        # Strict assertion: marker should appear in the recall response
        assert marker in reply, f"Session continuity failed. reply={reply!r}"
