"""
Lead Engine (Client Acquisition) + cross-post fallback tests.
Tests all /api/admin/leads/* routes + /api/admin/outreach/jobs +
regression of /api/admin/social/posts/multi with LLM fallback.
"""
import os
import time
import uuid

import pytest
import requests

def _load_backend_url():
    u = os.environ.get("REACT_APP_BACKEND_URL")
    if not u:
        try:
            with open("/app/frontend/.env") as f:
                for line in f:
                    if line.startswith("REACT_APP_BACKEND_URL="):
                        u = line.split("=", 1)[1].strip()
                        break
        except Exception:
            pass
    return (u or "").rstrip("/")


BASE_URL = _load_backend_url()
assert BASE_URL, "REACT_APP_BACKEND_URL not configured"

ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoOps2026!"


# ---------------------------------------------------------------- fixtures
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{BASE_URL}/api/auth/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                     timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def imported_lead_id(session, auth):
    """Import a unique TEST lead and return its id."""
    sid = f"TEST_{uuid.uuid4().hex[:8]}"
    payload = {"leads": [{
        "source": "reddit",
        "source_id": sid,
        "url": f"https://reddit.com/r/smallbusiness/comments/{sid}",
        "title": "TEST need a website — leads dried up",
        "snippet": "TEST — Looking for a marketing agency to rebuild our funnel.",
        "author": "TEST_author",
    }]}
    r = session.post(f"{BASE_URL}/api/admin/leads/import",
                     headers=auth, json=payload, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["inserted"] == 1
    # find the lead
    r = session.get(f"{BASE_URL}/api/admin/leads?stage=discovered&limit=500",
                    headers=auth, timeout=30)
    assert r.status_code == 200
    leads = r.json()["leads"]
    match = [l for l in leads if l.get("source_id") == sid]
    assert match, "imported lead not found"
    return match[0]["id"]


# ---------------------------------------------------------------- AUTH
class TestAuth:
    def test_pipeline_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/admin/leads/pipeline", timeout=20)
        assert r.status_code in (401, 403), r.status_code

    def test_list_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/admin/leads", timeout=20)
        assert r.status_code in (401, 403)

    def test_import_requires_auth(self, session):
        r = session.post(f"{BASE_URL}/api/admin/leads/import",
                         json={"leads": []}, timeout=20)
        assert r.status_code in (401, 403)

    def test_outreach_jobs_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/admin/outreach/jobs", timeout=20)
        assert r.status_code in (401, 403)


# -------------------------------------------------------------- PIPELINE
class TestPipeline:
    def test_pipeline_shape(self, session, auth):
        r = session.get(f"{BASE_URL}/api/admin/leads/pipeline",
                        headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("discovered", "queued", "contacted", "replied",
                  "qualified", "booked", "negative", "total",
                  "outreach_sent_today"):
            assert k in d, f"missing {k} in pipeline"
            assert isinstance(d[k], int), f"{k} not int"
        # total >= sum of stages (deleted stages count toward total)
        stage_sum = sum(d[s] for s in (
            "discovered", "queued", "contacted", "replied",
            "qualified", "booked", "negative"))
        assert d["total"] >= stage_sum


# ---------------------------------------------------------------- LIST + GET
class TestList:
    def test_list_all(self, session, auth, imported_lead_id):
        r = session.get(f"{BASE_URL}/api/admin/leads?limit=100",
                        headers=auth, timeout=30)
        assert r.status_code == 200
        leads = r.json()["leads"]
        assert isinstance(leads, list)
        assert any(l["id"] == imported_lead_id for l in leads)

    def test_list_filter_stage(self, session, auth, imported_lead_id):
        r = session.get(f"{BASE_URL}/api/admin/leads?stage=discovered&limit=200",
                        headers=auth, timeout=30)
        assert r.status_code == 200
        leads = r.json()["leads"]
        for l in leads:
            assert l["stage"] == "discovered"
        # sorted desc by signal_score
        scores = [l.get("signal_score", 0) for l in leads]
        assert scores == sorted(scores, reverse=True)

    def test_list_invalid_stage(self, session, auth):
        r = session.get(f"{BASE_URL}/api/admin/leads?stage=bogus",
                        headers=auth, timeout=30)
        assert r.status_code == 400

    def test_get_lead_by_id(self, session, auth, imported_lead_id):
        r = session.get(f"{BASE_URL}/api/admin/leads/{imported_lead_id}",
                        headers=auth, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == imported_lead_id
        assert d["source"] == "reddit"
        assert "messages" in d

    def test_get_lead_404(self, session, auth):
        r = session.get(f"{BASE_URL}/api/admin/leads/does-not-exist",
                        headers=auth, timeout=30)
        assert r.status_code == 404


# ---------------------------------------------------------------- IMPORT
class TestImport:
    def test_import_idempotent(self, session, auth):
        sid = f"TEST_IDEMP_{uuid.uuid4().hex[:6]}"
        raw = {"leads": [{
            "source": "reddit", "source_id": sid,
            "url": f"https://reddit.com/x/{sid}",
            "title": "TEST idempotent import",
            "snippet": "looking for a marketing agency",
            "author": "TEST_x",
        }]}
        r1 = session.post(f"{BASE_URL}/api/admin/leads/import",
                          headers=auth, json=raw, timeout=30)
        assert r1.status_code == 200
        assert r1.json()["inserted"] == 1
        # duplicate -> inserted=0
        r2 = session.post(f"{BASE_URL}/api/admin/leads/import",
                          headers=auth, json=raw, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["inserted"] == 0
        assert r2.json()["submitted"] == 1

    def test_import_empty_ok(self, session, auth):
        r = session.post(f"{BASE_URL}/api/admin/leads/import",
                         headers=auth, json={"leads": []}, timeout=30)
        assert r.status_code == 200
        assert r.json() == {"inserted": 0, "submitted": 0}


# ---------------------------------------------------------------- DISCOVER
class TestDiscover:
    def test_discover_now(self, session, auth):
        r = session.post(f"{BASE_URL}/api/admin/leads/discover-now",
                         headers=auth, json={}, timeout=90)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "new_leads" in d and isinstance(d["new_leads"], int)
        assert d["new_leads"] >= 0
        assert "pipeline" in d and "total" in d["pipeline"]


# ---------------------------------------------------------------- STAGE
class TestStage:
    def test_stage_invalid(self, session, auth, imported_lead_id):
        r = session.post(f"{BASE_URL}/api/admin/leads/{imported_lead_id}/stage",
                         headers=auth, json={"stage": "banana"}, timeout=30)
        assert r.status_code == 400

    def test_stage_valid_transition(self, session, auth, imported_lead_id):
        r = session.post(f"{BASE_URL}/api/admin/leads/{imported_lead_id}/stage",
                         headers=auth, json={"stage": "qualified"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["stage"] == "qualified"
        # verify persisted
        g = session.get(f"{BASE_URL}/api/admin/leads/{imported_lead_id}",
                        headers=auth, timeout=30)
        assert g.json()["stage"] == "qualified"
        # restore to discovered so downstream tests still work
        session.post(f"{BASE_URL}/api/admin/leads/{imported_lead_id}/stage",
                     headers=auth, json={"stage": "discovered"}, timeout=30)

    def test_stage_404(self, session, auth):
        r = session.post(f"{BASE_URL}/api/admin/leads/nope/stage",
                         headers=auth, json={"stage": "qualified"}, timeout=30)
        assert r.status_code == 404


# ---------------------------------------------------------------- DISPATCH
class TestDispatch:
    def test_dispatch_lead(self, session, auth, imported_lead_id):
        r = session.post(f"{BASE_URL}/api/admin/leads/{imported_lead_id}/dispatch",
                         headers=auth, json={}, timeout=120)
        # 200 on first dispatch OR 429 if recent spacing blocks
        assert r.status_code in (200, 429), r.text
        if r.status_code == 200:
            job = r.json().get("job")
            assert job and job.get("id") and job.get("lead_id") == imported_lead_id
            assert job["status"] in ("queued", "sent", "failed")
            assert job.get("body")  # composed outreach body exists
            # Verify lead advanced
            g = session.get(
                f"{BASE_URL}/api/admin/leads/{imported_lead_id}",
                headers=auth, timeout=30)
            stage = g.json()["stage"]
            assert stage in ("queued", "contacted", "failed")


# ---------------------------------------------------------------- REPLY
class TestReply:
    def test_reply_runs(self, session, auth, imported_lead_id):
        r = session.post(f"{BASE_URL}/api/admin/leads/{imported_lead_id}/reply",
                         headers=auth,
                         json={"message": "Sure — tell me more about pricing."},
                         timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "next_message" in d and d["next_message"]
        assert d.get("action") in ("reply", "book", "close")
        assert d.get("stage") in ("replied", "booked", "negative")
        # verify messages persisted with BOTH roles
        g = session.get(f"{BASE_URL}/api/admin/leads/{imported_lead_id}",
                        headers=auth, timeout=30)
        msgs = g.json().get("messages", [])
        roles = {m["role"] for m in msgs}
        assert "prospect" in roles
        assert "brivo" in roles

    def test_reply_empty_rejected(self, session, auth, imported_lead_id):
        r = session.post(f"{BASE_URL}/api/admin/leads/{imported_lead_id}/reply",
                         headers=auth, json={"message": ""}, timeout=30)
        assert r.status_code == 422


# ---------------------------------------------------------------- JOBS
class TestJobs:
    def test_outreach_jobs_list(self, session, auth):
        r = session.get(f"{BASE_URL}/api/admin/outreach/jobs",
                        headers=auth, timeout=30)
        assert r.status_code == 200
        jobs = r.json()["jobs"]
        assert isinstance(jobs, list)
        # sorted desc by created_at
        ts = [j.get("created_at") for j in jobs if j.get("created_at")]
        assert ts == sorted(ts, reverse=True)


# -------------------------------- CROSS-POST FALLBACK (regression from bug)
class TestCrossPostFallback:
    def test_multi_post_returns_200_with_fallback(self, session, auth):
        """
        Even if LLM budget is exhausted, /admin/social/posts/multi must return
        200 with deterministic stub variants and queued posts — never 500.
        """
        payload = {
            "brief": "TEST cross-post fallback — 5 ways to get more leads without paying an agency",
            "tone": "receipts",
            "platforms": ["x", "instagram", "linkedin"],
        }
        r = session.post(f"{BASE_URL}/api/admin/social/posts/multi",
                         headers=auth, json=payload, timeout=90)
        assert r.status_code == 200, f"expected 200, got {r.status_code}: {r.text}"
        body = r.json()
        posts = body.get("created") or body.get("posts") or []
        assert len(posts) == 3, f"expected 3 posts, got {len(posts)}"
        # each post must have a non-empty caption (fallback or LLM)
        for p in posts:
            assert p.get("caption") and len(p["caption"]) > 10
            assert p.get("status") == "queued"
            assert len(p.get("platforms", [])) == 1
        seen = {p["platforms"][0] for p in posts}
        assert seen == {"x", "instagram", "linkedin"}



# ====================================================== NEW IN ITERATION 6

# --------------------------- AUTH on new endpoints (route-ordering guard)
class TestNewEndpointsAuth:
    def test_analytics_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/admin/leads/analytics", timeout=20)
        assert r.status_code in (401, 403), r.status_code

    def test_auto_qualify_requires_auth(self, session):
        r = session.post(f"{BASE_URL}/api/admin/leads/auto-qualify",
                         json={}, timeout=20)
        assert r.status_code in (401, 403)

    def test_qualify_one_requires_auth(self, session):
        r = session.post(
            f"{BASE_URL}/api/admin/leads/some-id/qualify",
            json={}, timeout=20)
        assert r.status_code in (401, 403)


# --------------------------- ANALYTICS structure
class TestAnalytics:
    def test_analytics_shape(self, session, auth):
        r = session.get(f"{BASE_URL}/api/admin/leads/analytics",
                        headers=auth, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for key in ("funnel", "rates", "outreach_7d",
                    "top_sources", "top_subreddits"):
            assert key in d, f"analytics missing {key}"
        for k in ("leads", "contacted", "replied", "booked"):
            assert k in d["funnel"] and isinstance(d["funnel"][k], int)
        for k in ("reply_rate_pct", "book_rate_pct"):
            assert k in d["rates"]
            assert isinstance(d["rates"][k], (int, float))
        for k in ("sent", "failed", "queued"):
            assert k in d["outreach_7d"] and isinstance(d["outreach_7d"][k], int)
        assert isinstance(d["top_sources"], list)
        assert isinstance(d["top_subreddits"], list)

    def test_analytics_route_not_captured_by_dynamic(self, session, auth):
        """If route ordering were wrong, GET /admin/leads/analytics would hit
        the dynamic /admin/leads/{lead_id} handler and return 404."""
        r = session.get(f"{BASE_URL}/api/admin/leads/analytics",
                        headers=auth, timeout=30)
        assert r.status_code == 200, \
            f"route ordering broken: analytics captured by dynamic handler ({r.status_code})"


# --------------------------- QUALIFY ONE
class TestQualifyOne:
    def test_qualify_one_lead(self, session, auth, imported_lead_id):
        r = session.post(
            f"{BASE_URL}/api/admin/leads/{imported_lead_id}/qualify",
            headers=auth, json={}, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "qualifier" in d
        q = d["qualifier"]
        for k in ("score", "vertical", "urgency", "fit_summary",
                  "recommendation", "qualifier"):
            assert k in q, f"qualifier missing {k}"
        assert isinstance(q["score"], int)
        assert 0 <= q["score"] <= 100
        assert q["qualifier"] in ("llm", "fallback")
        assert q["urgency"] in ("low", "medium", "high")
        # persist check — signal_score should be updated + qualifier attached
        g = session.get(f"{BASE_URL}/api/admin/leads/{imported_lead_id}",
                        headers=auth, timeout=30)
        assert g.status_code == 200
        gd = g.json()
        assert "qualifier" in gd, "qualifier not persisted on lead"
        assert gd["qualifier"]["score"] == q["score"]
        assert gd["signal_score"] == q["score"]

    def test_qualify_one_404(self, session, auth):
        r = session.post(
            f"{BASE_URL}/api/admin/leads/does-not-exist-xyz/qualify",
            headers=auth, json={}, timeout=30)
        assert r.status_code == 404


# --------------------------- AUTO-QUALIFY
class TestAutoQualify:
    def test_auto_qualify(self, session, auth, imported_lead_id):
        # ensure at least one discovered lead exists (imported_lead_id may have
        # moved — import a fresh one)
        sid = f"TEST_AQ_{uuid.uuid4().hex[:6]}"
        session.post(f"{BASE_URL}/api/admin/leads/import",
                     headers=auth, json={"leads": [{
                         "source": "reddit", "source_id": sid,
                         "url": f"https://reddit.com/x/{sid}",
                         "title": "TEST auto-qualify target",
                         "snippet": "need a new website, leads dried up",
                         "author": "TEST_aq",
                     }]}, timeout=30)

        r = session.post(
            f"{BASE_URL}/api/admin/leads/auto-qualify",
            headers=auth, json={"limit": 5, "min_score": 60}, timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("processed", "high_fit", "results"):
            assert k in d, f"auto-qualify missing {k}"
        assert isinstance(d["processed"], int)
        assert isinstance(d["high_fit"], int)
        assert isinstance(d["results"], list)
        assert d["processed"] <= 5
        # Each result must contain the qualifier keys
        for item in d["results"]:
            for k in ("id", "score", "vertical", "urgency",
                      "recommendation", "qualifier"):
                assert k in item, f"result missing {k}"
            assert 0 <= item["score"] <= 100
            assert item["qualifier"] in ("llm", "fallback")


# --------------------------- ROUTE ORDERING regression
class TestRouteOrdering:
    """All literal /admin/leads/{X} routes must resolve to their handler
    (not to the dynamic {lead_id} route)."""

    def test_import_still_works(self, session, auth):
        sid = f"TEST_ORDER_{uuid.uuid4().hex[:6]}"
        r = session.post(f"{BASE_URL}/api/admin/leads/import",
                         headers=auth, json={"leads": [{
                             "source": "reddit", "source_id": sid,
                             "url": f"https://reddit.com/x/{sid}",
                             "title": "TEST route ordering",
                             "snippet": "looking for a marketing agency",
                             "author": "TEST_ord",
                         }]}, timeout=30)
        assert r.status_code == 200, r.text
        # specifically NOT 404 (would mean captured by dynamic)
        assert r.json().get("inserted") == 1

    def test_discover_now_still_works(self, session, auth):
        r = session.post(f"{BASE_URL}/api/admin/leads/discover-now",
                         headers=auth, json={}, timeout=90)
        assert r.status_code == 200, r.text
        assert "new_leads" in r.json()

    def test_auto_qualify_literal_route(self, session, auth):
        r = session.post(f"{BASE_URL}/api/admin/leads/auto-qualify",
                         headers=auth, json={"limit": 1}, timeout=90)
        assert r.status_code == 200, \
            f"auto-qualify captured by dynamic handler: {r.status_code} {r.text}"

    def test_analytics_literal_route(self, session, auth):
        r = session.get(f"{BASE_URL}/api/admin/leads/analytics",
                        headers=auth, timeout=30)
        assert r.status_code == 200

    def test_dynamic_route_still_works_for_valid_uuid(self, session, auth,
                                                      imported_lead_id):
        r = session.get(
            f"{BASE_URL}/api/admin/leads/{imported_lead_id}",
            headers=auth, timeout=30)
        assert r.status_code == 200
        assert r.json()["id"] == imported_lead_id
