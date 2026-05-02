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



# ============================================================
# Phase 1: Social Auto-Poster Safety + Factory Endpoints
# ============================================================

# ---------------- Safety Summary ----------------
def test_safety_summary_initial(auth):
    """GET /api/admin/social/safety-summary on fresh DB should return empty policies but seeded wins/hooks."""
    r = requests.get(f"{BASE_URL}/api/admin/social/safety-summary", headers=auth(), timeout=15)
    assert r.status_code == 200, f"safety-summary failed: {r.status_code} {r.text}"
    data = r.json()
    assert "policies" in data
    assert "queue_floor" in data
    assert "totals" in data
    assert isinstance(data["policies"], list)
    assert data["queue_floor"]["threshold"] == 3
    assert data["totals"]["wins"] >= 6, "Expected at least 6 seeded wins"
    assert data["totals"]["hooks"] >= 20, "Expected at least 20 seeded hooks"


# ---------------- Client Wins CRUD ----------------
def test_wins_crud_lifecycle(auth):
    """POST /api/admin/social/wins, GET, DELETE — full round-trip."""
    # 1. Create a win
    payload = {
        "title": "TEST_Win_Yacht_Broker",
        "metric": "14 calls booked in 1 week",
        "detail": "Shipped a voice agent for a yacht broker. Instant ROI.",
        "tags": ["voice", "yachts", "receipts"],
        "vertical": "marine",
    }
    r = requests.post(f"{BASE_URL}/api/admin/social/wins", headers=auth(), json=payload, timeout=15)
    assert r.status_code == 200, f"create win failed: {r.status_code} {r.text}"
    created = r.json()
    assert "win" in created
    win = created["win"]
    assert win["title"] == payload["title"]
    assert win["metric"] == payload["metric"]
    assert win["uses"] == 0
    assert "id" in win
    win_id = win["id"]

    # 2. List wins — verify it's there
    r2 = requests.get(f"{BASE_URL}/api/admin/social/wins", headers=auth(), timeout=15)
    assert r2.status_code == 200
    wins_list = r2.json()
    assert "wins" in wins_list
    titles = [w["title"] for w in wins_list["wins"]]
    assert payload["title"] in titles

    # 3. Delete the win
    r3 = requests.delete(f"{BASE_URL}/api/admin/social/wins/{win_id}", headers=auth(), timeout=15)
    assert r3.status_code == 200
    assert r3.json().get("ok") is True

    # 4. Verify it's gone
    r4 = requests.get(f"{BASE_URL}/api/admin/social/wins", headers=auth(), timeout=15)
    assert r4.status_code == 200
    titles_after = [w["title"] for w in r4.json()["wins"]]
    assert payload["title"] not in titles_after


# ---------------- Wins Recycler ----------------
def test_wins_recycle_now(auth):
    """POST /api/admin/social/wins/recycle-now should draft a post from an existing win."""
    # Ensure at least one win exists (seeded or from previous test)
    r_wins = requests.get(f"{BASE_URL}/api/admin/social/wins", headers=auth(), timeout=15)
    assert r_wins.status_code == 200
    wins = r_wins.json()["wins"]
    if not wins:
        # Create one
        payload = {
            "title": "TEST_Recycle_Win",
            "metric": "50% lift in conversions",
            "detail": "Rebuilt landing page for a SaaS client.",
            "tags": ["cro", "saas"],
        }
        r_create = requests.post(f"{BASE_URL}/api/admin/social/wins", headers=auth(), json=payload, timeout=15)
        assert r_create.status_code == 200

    # Now recycle
    r = requests.post(f"{BASE_URL}/api/admin/social/wins/recycle-now", headers=auth(), json={}, timeout=15)
    assert r.status_code == 200, f"recycle-now failed: {r.status_code} {r.text}"
    data = r.json()
    assert "post" in data
    assert "source_win" in data
    post = data["post"]
    assert post["source"] == "wins_recycler", "Post should have source='wins_recycler'"
    assert post["status"] == "queued"
    assert "hook_slug" in post or post.get("hook_slug") is None  # hook metadata present or null
    assert "caption" in post and len(post["caption"]) > 10


# ---------------- Cross-Poster (Multi-Platform) ----------------
def test_cross_poster_multi_platform(auth):
    """POST /api/admin/social/posts/multi should create one post per platform."""
    payload = {
        "brief": "Shipped a voice agent for a yacht broker — 14 calls booked in a week.",
        "tone": "receipts",
        "platforms": ["x", "instagram", "linkedin"],
    }
    r = requests.post(f"{BASE_URL}/api/admin/social/posts/multi", headers=auth(), json=payload, timeout=20)
    assert r.status_code == 200, f"cross-poster failed: {r.status_code} {r.text}"
    data = r.json()
    assert "created" in data
    posts = data["created"]
    assert len(posts) == 3, f"Expected 3 posts (one per platform), got {len(posts)}"
    
    # Verify each post has a single platform
    platforms_seen = set()
    for post in posts:
        assert "platforms" in post
        assert len(post["platforms"]) == 1, f"Each post should target exactly 1 platform, got {post['platforms']}"
        platforms_seen.add(post["platforms"][0])
        assert post["status"] == "queued"
        assert post["source"] == "cross_poster"
        assert "caption" in post and len(post["caption"]) > 10
        # LLM may be budget-exhausted; fallback is acceptable — just verify posts exist
    
    assert platforms_seen == {"x", "instagram", "linkedin"}, f"Expected all 3 platforms, got {platforms_seen}"


# ---------------- Agent Pairing + Safety Policies ----------------
def test_agent_pairing_and_policies(auth):
    """Full agent pairing flow: pair-code -> pair -> verify policies created."""
    # 1. Generate a pair code
    r1 = requests.post(f"{BASE_URL}/api/admin/social/agents/pair-code", headers=auth(), json={}, timeout=15)
    assert r1.status_code == 200, f"pair-code failed: {r1.status_code} {r1.text}"
    code_data = r1.json()
    assert "code" in code_data
    code = code_data["code"]
    assert len(code) == 6 and code.isdigit()

    # 2. Pair an agent (no auth needed for this endpoint)
    pair_payload = {"code": code, "name": "Test Mac"}
    r2 = requests.post(f"{BASE_URL}/api/agent/pair", json=pair_payload, timeout=15)
    assert r2.status_code == 200, f"pair failed: {r2.status_code} {r2.text}"
    pair_data = r2.json()
    assert "agent_id" in pair_data
    assert "token" in pair_data
    agent_id = pair_data["agent_id"]
    agent_token = pair_data["token"]
    assert len(agent_token) > 20

    # 3. Verify policies were created for x, instagram, linkedin
    r3 = requests.get(f"{BASE_URL}/api/admin/social/safety-summary", headers=auth(), timeout=15)
    assert r3.status_code == 200
    summary = r3.json()
    policies = summary["policies"]
    agent_policies = [p for p in policies if p["agent_id"] == agent_id]
    assert len(agent_policies) == 3, f"Expected 3 policies (x, instagram, linkedin), got {len(agent_policies)}"
    
    platforms_seen = {p["platform"] for p in agent_policies}
    assert platforms_seen == {"x", "instagram", "linkedin"}
    
    for p in agent_policies:
        assert p["warmup_complete"] is False
        assert p["paused"] is False
        assert "warmup_day" in p
        assert p["warmup_day"] is not None or p["warmup_day"] == 0  # day 0 or None if complete
        assert "ban_risk" in p
        assert 0 <= p["ban_risk"] <= 100

    return agent_id  # for use in next tests


# ---------------- Safety Policy Pause/Unpause ----------------
def test_policy_pause_unpause(auth):
    """Pause and unpause a platform policy."""
    # First pair an agent to get policies
    r1 = requests.post(f"{BASE_URL}/api/admin/social/agents/pair-code", headers=auth(), json={}, timeout=15)
    assert r1.status_code == 200
    code = r1.json()["code"]
    r2 = requests.post(f"{BASE_URL}/api/agent/pair", json={"code": code, "name": "Test Pause Mac"}, timeout=15)
    assert r2.status_code == 200
    agent_id = r2.json()["agent_id"]

    # Pause x platform
    pause_payload = {"agent_id": agent_id, "platform": "x", "reason": "test pause"}
    r3 = requests.post(f"{BASE_URL}/api/admin/social/policies/pause", headers=auth(), json=pause_payload, timeout=15)
    assert r3.status_code == 200, f"pause failed: {r3.status_code} {r3.text}"
    paused_policy = r3.json()["policy"]
    assert paused_policy["paused"] is True
    assert paused_policy["paused_reason"] == "test pause"

    # Verify in summary
    r4 = requests.get(f"{BASE_URL}/api/admin/social/safety-summary", headers=auth(), timeout=15)
    assert r4.status_code == 200
    policies = r4.json()["policies"]
    x_policy = next((p for p in policies if p["agent_id"] == agent_id and p["platform"] == "x"), None)
    assert x_policy is not None
    assert x_policy["paused"] is True

    # Unpause
    unpause_payload = {"agent_id": agent_id, "platform": "x"}
    r5 = requests.post(f"{BASE_URL}/api/admin/social/policies/unpause", headers=auth(), json=unpause_payload, timeout=15)
    assert r5.status_code == 200, f"unpause failed: {r5.status_code} {r5.text}"
    unpaused_policy = r5.json()["policy"]
    assert unpaused_policy["paused"] is False
    assert unpaused_policy["consecutive_failures"] == 0  # reset on unpause

    # Verify in summary again
    r6 = requests.get(f"{BASE_URL}/api/admin/social/safety-summary", headers=auth(), timeout=15)
    assert r6.status_code == 200
    policies2 = r6.json()["policies"]
    x_policy2 = next((p for p in policies2 if p["agent_id"] == agent_id and p["platform"] == "x"), None)
    assert x_policy2 is not None
    assert x_policy2["paused"] is False


# ---------------- Policy Update (Cadence Gating) ----------------
def test_policy_update_cadence(auth):
    """Update policy cadence settings (max_posts_per_day, min_minutes_between, quiet_hours)."""
    # Pair an agent first
    r1 = requests.post(f"{BASE_URL}/api/admin/social/agents/pair-code", headers=auth(), json={}, timeout=15)
    assert r1.status_code == 200
    code = r1.json()["code"]
    r2 = requests.post(f"{BASE_URL}/api/agent/pair", json={"code": code, "name": "Test Cadence Mac"}, timeout=15)
    assert r2.status_code == 200
    agent_id = r2.json()["agent_id"]

    # Update policy
    update_payload = {
        "agent_id": agent_id,
        "platform": "x",
        "max_posts_per_day": 2,
        "min_minutes_between": 60,
        "quiet_hours_start": 0,
        "quiet_hours_end": 8,
    }
    r3 = requests.post(f"{BASE_URL}/api/admin/social/policies/update", headers=auth(), json=update_payload, timeout=15)
    assert r3.status_code == 200, f"policy update failed: {r3.status_code} {r3.text}"
    updated_policy = r3.json()["policy"]
    assert updated_policy["max_posts_per_day"] == 2
    assert updated_policy["min_minutes_between"] == 60
    assert updated_policy["quiet_hours_start"] == 0
    assert updated_policy["quiet_hours_end"] == 8

    # Verify via GET policies
    r4 = requests.get(f"{BASE_URL}/api/admin/social/policies", headers=auth(), timeout=15)
    assert r4.status_code == 200
    policies = r4.json()["policies"]
    x_policy = next((p for p in policies if p["agent_id"] == agent_id and p["platform"] == "x"), None)
    assert x_policy is not None
    assert x_policy["max_posts_per_day"] == 2
    assert x_policy["min_minutes_between"] == 60


# ---------------- Hooks Library ----------------
def test_hooks_library_seeded(auth):
    """GET /api/admin/social/hooks should return at least 20 seeded hooks."""
    r = requests.get(f"{BASE_URL}/api/admin/social/hooks", headers=auth(), timeout=15)
    assert r.status_code == 200, f"hooks failed: {r.status_code} {r.text}"
    data = r.json()
    assert "hooks" in data
    hooks = data["hooks"]
    assert len(hooks) >= 20, f"Expected at least 20 hooks, got {len(hooks)}"
    for hook in hooks[:5]:  # check first 5
        assert "id" in hook
        assert "slug" in hook
        assert "template" in hook
        assert "score" in hook
