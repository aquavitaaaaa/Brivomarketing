"""Backend tests for Brivo Marketing API.

Covers:
- Public inquiry + ROI lead endpoints
- Analytics event beacon
- Admin auth (login / me)
- Admin leads CRUD (list + PATCH status)
- Admin analytics summary
- Admin operator status/toggle/call (skeleton — Bland not configured)
- Admin calls list
- Webhook signature rejection + acceptance in skeleton mode
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fall back to frontend/.env when running outside of container envvars
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("REACT_APP_BACKEND_URL"):
                BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                break

ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoOps2026!"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(api):
    r = api.post(
        f"{BASE_URL}/api/auth/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=20,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def auth(api, token):
    def h():
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return h


# ---------------- Health ----------------
def test_health_root(api):
    r = api.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    assert "message" in r.json()


# ---------------- Public: Inquiries ----------------
def test_create_inquiry_and_persist(api, auth):
    payload = {
        "name": "TEST_Inquiry User",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "company": "TEST Corp",
        "service_interest": "Paid Ads",
        "budget": "$7,500/mo",
        "message": "TEST automated inquiry",
        "source": "backend-test",
    }
    r = api.post(f"{BASE_URL}/api/inquiries", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["email"] == payload["email"]
    assert created["source"] == "backend-test"
    assert created["status"] == "new"
    assert "id" in created

    # Verify via admin list
    r2 = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=auth(), timeout=15)
    assert r2.status_code == 200
    emails = [d["email"] for d in r2.json()]
    assert payload["email"] in emails


def test_create_inquiry_invalid_email(api):
    r = api.post(
        f"{BASE_URL}/api/inquiries",
        json={
            "name": "X",
            "email": "not-an-email",
            "service_interest": "SEO",
            "message": "hi",
        },
        timeout=15,
    )
    assert r.status_code in (400, 422)


def test_roi_lead_snapshot(api, auth):
    email = f"roi_{uuid.uuid4().hex[:8]}@example.com"
    r = api.post(
        f"{BASE_URL}/api/inquiries/roi",
        json={"email": email, "revenue": 500000, "roas": 2.0, "spend": 10000, "lift": 120000},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["email"] == email
    assert body["source"] == "roi-calculator"
    assert body["roi_snapshot"]["lift"] == 120000

    # Confirm in admin list with roi_snapshot
    r2 = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=auth(), timeout=15)
    assert r2.status_code == 200
    match = [d for d in r2.json() if d["email"] == email]
    assert match and match[0].get("roi_snapshot", {}).get("lift") == 120000


# ---------------- Public: Analytics ----------------
def test_analytics_event_ok(api):
    r = api.post(
        f"{BASE_URL}/api/analytics/event",
        json={
            "event": "pageview",
            "path": "/",
            "session_id": f"test-{uuid.uuid4().hex[:8]}",
            "referrer": "https://example.com",
        },
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ---------------- Auth ----------------
def test_admin_login_wrong_password(api):
    r = api.post(
        f"{BASE_URL}/api/auth/admin/login",
        json={"email": ADMIN_EMAIL, "password": "wrong!"},
        timeout=15,
    )
    assert r.status_code == 401


def test_admin_me_requires_token(api):
    r = api.get(f"{BASE_URL}/api/auth/admin/me", timeout=15)
    assert r.status_code == 401


def test_admin_me_with_token(auth):
    r = requests.get(f"{BASE_URL}/api/auth/admin/me", headers=auth(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"


def test_admin_me_with_invalid_token():
    r = requests.get(
        f"{BASE_URL}/api/auth/admin/me",
        headers={"Authorization": "Bearer nope.nope.nope"},
        timeout=15,
    )
    assert r.status_code == 401


# ---------------- Admin: Leads status ----------------
def test_patch_inquiry_status(api, auth):
    # Create then patch
    email = f"patch_{uuid.uuid4().hex[:8]}@example.com"
    r = api.post(
        f"{BASE_URL}/api/inquiries",
        json={
            "name": "TEST patch",
            "email": email,
            "service_interest": "Web",
            "message": "Patch test",
        },
        timeout=15,
    )
    assert r.status_code == 200
    iid = r.json()["id"]

    # Invalid status
    r_bad = requests.patch(
        f"{BASE_URL}/api/admin/inquiries/{iid}",
        headers=auth(),
        json={"status": "bogus"},
        timeout=15,
    )
    assert r_bad.status_code == 400

    # Valid
    r_ok = requests.patch(
        f"{BASE_URL}/api/admin/inquiries/{iid}",
        headers=auth(),
        json={"status": "contacted"},
        timeout=15,
    )
    assert r_ok.status_code == 200
    assert r_ok.json().get("ok") is True

    # Verify persisted
    r_list = requests.get(f"{BASE_URL}/api/admin/inquiries", headers=auth(), timeout=15)
    match = [d for d in r_list.json() if d["id"] == iid]
    assert match and match[0]["status"] == "contacted"


def test_admin_inquiries_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/inquiries", timeout=15)
    assert r.status_code == 401


# ---------------- Admin: Analytics ----------------
def test_admin_analytics_summary(auth):
    r = requests.get(
        f"{BASE_URL}/api/admin/analytics/summary?days=7", headers=auth(), timeout=20
    )
    assert r.status_code == 200
    data = r.json()
    for k in (
        "range_days",
        "totals",
        "by_country",
        "by_device",
        "by_browser",
        "by_os",
        "by_path",
        "by_referrer",
        "daily_pageviews",
        "cta_clicks",
    ):
        assert k in data, f"missing key {k}"
    assert data["range_days"] == 7
    for k in ("events", "pageviews", "unique_sessions", "inquiries"):
        assert k in data["totals"]


def test_admin_analytics_recent(auth):
    r = requests.get(f"{BASE_URL}/api/admin/analytics/recent", headers=auth(), timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------- Admin: Operator (Bland not configured) ----------------
def test_operator_status_not_configured(auth):
    r = requests.get(f"{BASE_URL}/api/admin/operator/status", headers=auth(), timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["configured"] is False
    assert "inbound_enabled" in data


def test_operator_toggle_enable_without_inbound(auth):
    # BLAND_INBOUND_NUMBER is empty → 400
    r = requests.post(
        f"{BASE_URL}/api/admin/operator/toggle",
        headers=auth(),
        json={"enabled": True},
        timeout=15,
    )
    assert r.status_code == 400


def test_operator_toggle_disable_ok(auth):
    r = requests.post(
        f"{BASE_URL}/api/admin/operator/toggle",
        headers=auth(),
        json={"enabled": False},
        timeout=15,
    )
    assert r.status_code == 200


def test_operator_outbound_call_not_configured(auth):
    r = requests.post(
        f"{BASE_URL}/api/admin/operator/call",
        headers=auth(),
        json={"phone_number": "+14155551234", "name": "Test"},
        timeout=15,
    )
    # BLAND_API_KEY empty → 503
    assert r.status_code == 503


# ---------------- Admin: Calls ----------------
def test_list_calls(auth):
    r = requests.get(f"{BASE_URL}/api/admin/calls", headers=auth(), timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------- Webhook ----------------
def test_webhook_invalid_json_accepted_signature(api):
    # With no secret configured, verify returns True → but invalid JSON still 400
    r = api.post(
        f"{BASE_URL}/api/webhooks/bland",
        data="not-json",
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    assert r.status_code == 400


def test_webhook_valid_payload_skeleton(api):
    r = api.post(
        f"{BASE_URL}/api/webhooks/bland",
        json={"call_id": f"test-{uuid.uuid4().hex[:8]}", "to": "+14155551234", "from": "+19998887777"},
        timeout=15,
    )
    assert r.status_code == 200
    assert r.json().get("ok") is True
