"""Tests for alerts, social autopilot, portfolio inquiry flow, bland webhook (iteration 7)."""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fall back to reading frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "brivo_db")

ADMIN_EMAIL = "admin@brivo.com"
ADMIN_PASSWORD = "BrivoAdmin2026!"


@pytest.fixture(scope="module")
def db():
    return MongoClient(MONGO_URL)[DB_NAME]


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# -------------------- Alerts endpoints
class TestAlertsAuth:
    def test_status_requires_auth(self):
        assert requests.get(f"{API}/admin/alerts/status").status_code in (401, 403)

    def test_list_requires_auth(self):
        assert requests.get(f"{API}/admin/alerts").status_code in (401, 403)

    def test_test_requires_auth(self):
        assert requests.post(f"{API}/admin/alerts/test").status_code in (401, 403)

    def test_read_requires_auth(self):
        assert requests.post(f"{API}/admin/alerts/read").status_code in (401, 403)


class TestAlerts:
    def test_status(self, auth):
        r = requests.get(f"{API}/admin/alerts/status", headers=auth)
        assert r.status_code == 200
        d = r.json()
        for k in ("email_configured", "sms_configured", "hot_threshold", "daily_cap",
                  "bland_configured", "instagram_graph"):
            assert k in d
        assert isinstance(d["hot_threshold"], int)

    def test_list(self, auth):
        r = requests.get(f"{API}/admin/alerts", headers=auth)
        assert r.status_code == 200
        d = r.json()
        assert "alerts" in d and isinstance(d["alerts"], list)
        assert "unread" in d

    def test_send_test_creates_history_item(self, auth):
        pre = requests.get(f"{API}/admin/alerts", headers=auth).json()["alerts"]
        pre_count = len([a for a in pre if a.get("kind") == "test"])
        r = requests.post(f"{API}/admin/alerts/test", headers=auth)
        assert r.status_code == 200
        d = r.json()
        assert "email" in d and "sms" in d and "alert" in d
        # keys not set -> ok False
        assert d["email"]["ok"] is False
        assert d["sms"]["ok"] is False
        assert d["alert"]["kind"] == "test"
        assert d["alert"]["title"] == "Test alert"
        # verify persisted
        post = requests.get(f"{API}/admin/alerts", headers=auth).json()["alerts"]
        post_count = len([a for a in post if a.get("kind") == "test"])
        assert post_count == pre_count + 1

    def test_mark_read(self, auth):
        r = requests.post(f"{API}/admin/alerts/read", headers=auth)
        assert r.status_code == 200
        assert r.json().get("ok") is True
        d = requests.get(f"{API}/admin/alerts", headers=auth).json()
        assert d["unread"] == 0


# -------------------- Inquiry -> alert wiring
class TestInquiryAlert:
    def test_inquiry_creates_alert(self, auth):
        payload = {
            "name": "TEST_Inquiry Alert",
            "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
            "company": "TEST Co",
            "service_interest": "growth",
            "budget": "$5k",
            "message": "TEST inquiry for alert wiring",
        }
        r = requests.post(f"{API}/inquiries", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        inq = r.json()
        assert inq["email"] == payload["email"]
        # notify_inquiry is scheduled as an async task; wait briefly
        time.sleep(2)
        d = requests.get(f"{API}/admin/alerts", headers=auth).json()
        matches = [a for a in d["alerts"] if a.get("kind") == "inquiry"
                   and a.get("ref_id") == inq["id"]]
        assert matches, "no alert of kind=inquiry for this inquiry"
        a = matches[0]
        # keys unset -> both should degrade to 'skipped'
        assert a["email"].startswith("skipped") or a["email"] == "sent"
        assert a["sms"].startswith("skipped") or a["sms"] == "sent"


# -------------------- Bland webhook regression
class TestBlandWebhook:
    def test_bland_webhook_creates_inquiry_and_alert(self, auth):
        email = f"TEST_bland_{uuid.uuid4().hex[:6]}@example.com"
        payload = {
            "call_id": f"test-{uuid.uuid4()}",
            "from": "+15555550100",
            "to": "+15555550199",
            "call_length": 42,
            "completed": True,
            "concatenated_transcript": "hi this is a test",
            "variables": {"email": email, "name": "TEST Bland Caller",
                          "service_interest": "audit"},
        }
        r = requests.post(f"{API}/webhooks/bland", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        time.sleep(2)
        # inquiry mirrored
        alerts = requests.get(f"{API}/admin/alerts", headers=auth).json()["alerts"]
        assert any(a.get("kind") == "inquiry" and email in (a.get("detail") or "")
                   for a in alerts), "no inquiry alert for bland webhook email"


# -------------------- Autopilot endpoints
class TestAutopilotAuth:
    def test_overview_requires_auth(self):
        assert requests.get(f"{API}/admin/social/autopilot").status_code in (401, 403)

    def test_update_requires_auth(self):
        assert requests.put(f"{API}/admin/social/autopilot",
                            json={"enabled": False}).status_code in (401, 403)


class TestAutopilot:
    def test_overview(self, auth):
        r = requests.get(f"{API}/admin/social/autopilot", headers=auth)
        assert r.status_code == 200
        d = r.json()
        for k in ("settings", "channels", "next_slot", "auto_times", "local_now"):
            assert k in d
        assert d["settings"]["mode"] in ("auto", "timed", "manual")

    def test_shots(self, auth):
        r = requests.get(f"{API}/admin/social/autopilot/shots", headers=auth)
        assert r.status_code == 200
        shots = r.json()["shots"]
        slugs = {s["slug"] for s in shots}
        # DWJ + LOBA showcase images must exist
        assert "dwj-site" in slugs
        assert "loba-site" in slugs

    def test_update_validates_mode(self, auth):
        r = requests.put(f"{API}/admin/social/autopilot", headers=auth,
                         json={"mode": "bogus"})
        assert r.status_code == 400

    def test_update_validates_post_time(self, auth):
        r = requests.put(f"{API}/admin/social/autopilot", headers=auth,
                         json={"post_time": "99:99"})
        assert r.status_code == 400

    def test_update_validates_timezone(self, auth):
        r = requests.put(f"{API}/admin/social/autopilot", headers=auth,
                         json={"timezone": "Not/A_Real_Zone"})
        assert r.status_code == 400

    def test_update_mode_manual_persists(self, auth):
        r = requests.put(f"{API}/admin/social/autopilot", headers=auth,
                         json={"mode": "manual", "enabled": False})
        assert r.status_code == 200
        assert r.json()["mode"] == "manual"
        # verify via GET
        d = requests.get(f"{API}/admin/social/autopilot", headers=auth).json()
        assert d["settings"]["mode"] == "manual"

    def test_run_now_manual_creates_draft(self, auth):
        # ensure manual mode
        requests.put(f"{API}/admin/social/autopilot", headers=auth,
                     json={"mode": "manual", "enabled": False})
        r = requests.post(f"{API}/admin/social/autopilot/run-now",
                          headers=auth, json={"slug": "dwj-site"})
        assert r.status_code == 200
        post = r.json()["post"]
        assert post["status"] == "draft"
        assert post["shot"] == "dwj-site"
        assert post["image_url"] == "/kit-assets/social/dwj-site.jpg"
        # visible in list
        items = requests.get(f"{API}/admin/social/autopilot/posts",
                             headers=auth).json()["posts"]
        assert any(p["id"] == post["id"] for p in items)
        return post["id"]

    def test_run_now_bad_slug_404(self, auth):
        r = requests.post(f"{API}/admin/social/autopilot/run-now",
                          headers=auth, json={"slug": "does-not-exist"})
        assert r.status_code == 404

    def test_skip_cancels_post(self, auth):
        requests.put(f"{API}/admin/social/autopilot", headers=auth,
                     json={"mode": "manual", "enabled": False})
        r = requests.post(f"{API}/admin/social/autopilot/run-now",
                          headers=auth, json={"slug": "loba-site"})
        pid = r.json()["post"]["id"]
        r2 = requests.post(f"{API}/admin/social/autopilot/posts/{pid}/skip",
                           headers=auth)
        assert r2.status_code == 200
        items = requests.get(f"{API}/admin/social/autopilot/posts",
                             headers=auth).json()["posts"]
        got = next((p for p in items if p["id"] == pid), None)
        assert got and got["status"] == "cancelled"

    def test_edit_caption(self, auth):
        requests.put(f"{API}/admin/social/autopilot", headers=auth,
                     json={"mode": "manual", "enabled": False})
        r = requests.post(f"{API}/admin/social/autopilot/run-now",
                          headers=auth, json={"slug": "dwj-stat"})
        pid = r.json()["post"]["id"]
        r2 = requests.patch(f"{API}/admin/social/autopilot/posts/{pid}",
                            headers=auth, json={"caption": "TEST edited caption"})
        assert r2.status_code == 200
        items = requests.get(f"{API}/admin/social/autopilot/posts",
                             headers=auth).json()["posts"]
        got = next((p for p in items if p["id"] == pid), None)
        assert got and got["caption"] == "TEST edited caption"
        # cleanup
        requests.post(f"{API}/admin/social/autopilot/posts/{pid}/skip", headers=auth)

    def test_approve_draft_moves_to_queued(self, auth):
        requests.put(f"{API}/admin/social/autopilot", headers=auth,
                     json={"mode": "manual", "enabled": False})
        r = requests.post(f"{API}/admin/social/autopilot/run-now",
                          headers=auth, json={"slug": "loba-stat"})
        pid = r.json()["post"]["id"]
        r2 = requests.post(f"{API}/admin/social/autopilot/posts/{pid}/approve",
                           headers=auth)
        assert r2.status_code == 200
        items = requests.get(f"{API}/admin/social/autopilot/posts",
                             headers=auth).json()["posts"]
        got = next((p for p in items if p["id"] == pid), None)
        # no server channel -> stays 'queued' (autopilot tick will not publish)
        assert got and got["status"] in ("queued", "running", "failed")
        requests.post(f"{API}/admin/social/autopilot/posts/{pid}/skip", headers=auth)


# -------------------- Hot lead alert loop
class TestHotLeadAlert:
    def test_hot_lead_alert_generated(self, db, auth):
        # insert a hot lead directly
        lead_id = f"TEST_hot_{uuid.uuid4()}"
        db.leads.insert_one({
            "id": lead_id, "signal_score": 95, "source": "reddit",
            "title": "TEST Hot Lead Alert", "url": "https://example.com/x",
            "stage": "new", "created_at": "2026-01-01T00:00:00+00:00",
        })
        # loop ticks every 90s; wait up to ~110s
        deadline = time.time() + 110
        found = None
        while time.time() < deadline:
            time.sleep(10)
            l = db.leads.find_one({"id": lead_id}, {"_id": 0})
            if l and l.get("hot_alerted_at"):
                # look for hot_lead alert
                alerts = requests.get(f"{API}/admin/alerts", headers=auth).json()["alerts"]
                found = next((a for a in alerts if a.get("kind") == "hot_lead"), None)
                if found:
                    break
        assert found is not None, "hot_lead alert not generated within 110s"


# -------------------- Cleanup / restore
@pytest.fixture(scope="module", autouse=True)
def _restore(admin_token):
    yield
    auth = {"Authorization": f"Bearer {admin_token}"}
    # restore defaults: mode=auto, enabled=false
    requests.put(f"{API}/admin/social/autopilot", headers=auth,
                 json={"mode": "auto", "enabled": False})
