"""End-to-end smoke test for the social auto-poster + URL-leak guardrail.

Covers:
- admin login
- pair-code issuance for a new host
- LLM/fallback content generation
- dry-run preview endpoint (the one that lets admin eyeball exactly what will
  be posted before any Mac/Win/Linux host is paired)
- URL leak scrub: no generated caption or preview body should contain a
  literal .com / .ai hostname belonging to Brivo's own site.

These tests are resilient to EMERGENT_LLM_KEY budget exhaustion — they fall
back to deterministic templates that still respect the URL-scrub rule.
"""
import os
import re
import uuid
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://growth-funnel-8.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

URL_LEAK_RE = re.compile(r"\bbrivomarketing\.(?:com|ai)\b", re.IGNORECASE)


@pytest.fixture(scope="module")
def admin_token():
    email = os.environ.get("ADMIN_EMAIL", "admin@brivomarketing.com")
    pw = os.environ.get("ADMIN_PASSWORD", "BrivoOps2026!")
    r = requests.post(
        f"{API}/auth/admin/login",
        json={"email": email, "password": pw},
        timeout=20,
    )
    assert r.status_code == 200, r.text
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


class TestPairCode:
    def test_issue_pair_code(self, auth_headers):
        r = requests.post(
            f"{API}/admin/social/agents/pair-code",
            headers=auth_headers,
            json={"name": "pytest-autoposter-smoke"},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "code" in data and len(data["code"]) >= 4
        assert "expires_at" in data


class TestAutoposterContent:
    def test_generate_batch_and_no_url_leaks(self, auth_headers):
        r = requests.post(
            f"{API}/admin/social/posts/generate",
            headers=auth_headers,
            json={"days": 2, "platforms": ["x", "instagram", "linkedin"], "posts_per_day": 1},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("created", 0) >= 1
        posts = data.get("posts") or []
        assert posts, "no posts returned"

        for p in posts:
            caption = p.get("caption") or ""
            assert not URL_LEAK_RE.search(caption), (
                f"URL leak in caption: {caption[:200]!r}"
            )
            assert "_id" not in p

        # Keep the first post id around for the preview test
        TestAutoposterContent.sample_post_id = posts[0]["id"]

    def test_dry_run_preview(self, auth_headers):
        post_id = getattr(TestAutoposterContent, "sample_post_id", None)
        assert post_id, "preview test requires generate test to run first"
        r = requests.get(
            f"{API}/admin/social/posts/{post_id}/preview",
            headers=auth_headers,
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("dry_run") is True
        previews = data.get("previews") or []
        assert previews, "preview returned no platform renderings"

        for pv in previews:
            assert pv.get("platform") in {"x", "instagram", "linkedin"}
            assert "rendered_body" in pv
            assert "character_count" in pv
            assert not URL_LEAK_RE.search(pv["rendered_body"] or ""), (
                f"URL leak in preview: {pv['rendered_body'][:200]!r}"
            )
            # X-specific: truncated to 280 chars
            if pv["platform"] == "x":
                assert pv["character_count"] <= 280


class TestDashboardHealth:
    def test_dashboard_reports_queued_count(self, auth_headers):
        r = requests.get(f"{API}/admin/social/dashboard", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        for key in ["queued", "published", "failed", "agents_total", "agents_online"]:
            assert key in data, f"missing {key} in dashboard"
        assert isinstance(data["agents_online"], int)

    def test_safety_summary_per_platform(self, auth_headers):
        r = requests.get(f"{API}/admin/social/safety-summary", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        # May be empty if no agents have been paired — just check shape
        assert "policies" in data


class TestChatURLScrub:
    def test_chat_fallback_has_no_url_leak(self):
        """Even when the LLM budget is exhausted, visitor chat must not leak
        a .com / .ai URL in the fallback handoff."""
        r = requests.post(
            f"{API}/chat",
            json={"message": f"smoke-{uuid.uuid4().hex[:6]}"},
            timeout=90,
        )
        assert r.status_code == 200
        reply = r.json().get("reply", "")
        assert reply
        assert not URL_LEAK_RE.search(reply), f"URL leak in chat: {reply!r}"
