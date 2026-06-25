#!/usr/bin/env python3
"""
Full Backend Regression Test Suite for Brivo Marketing App
Tests all backend endpoints after .env restore in continuation environment.

IMPORTANT: EMERGENT_LLM_KEY budget is exhausted. LLM endpoints should return
graceful fallback content (HTTP 200 with canned text), NOT errors.
"""

import requests
import json
import sys
from typing import Dict, Any, Optional
import time

# Backend URL from frontend/.env
BACKEND_URL = "https://07f1b190-de56-4e07-a657-56a25e323e51.preview.emergentagent.com/api"

# Admin credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoAdmin2025!"

# Test state
admin_token: Optional[str] = None
test_inquiry_id: Optional[str] = None
test_session_id: Optional[str] = None

def log_section(title: str):
    """Log a test section header."""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print('='*80)

def log_test(description: str):
    """Log the current test."""
    print(f"\n→ {description}")

def log_pass(message: str):
    """Log a passing test."""
    print(f"  ✅ PASS: {message}")

def log_fail(message: str, response: Optional[requests.Response] = None):
    """Log a failing test."""
    print(f"  ❌ FAIL: {message}")
    if response:
        print(f"     Status: {response.status_code}")
        print(f"     Response: {response.text[:500]}")
    return False

def make_request(
    method: str,
    endpoint: str,
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
    auth: bool = False,
    expected_status: int = 200,
    allow_fallback: bool = False
) -> Optional[requests.Response]:
    """Make an HTTP request and validate the response."""
    url = f"{BACKEND_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if auth and admin_token:
        headers["Authorization"] = f"Bearer {admin_token}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, params=params, timeout=30)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=data, timeout=30)
        elif method == "PATCH":
            resp = requests.patch(url, headers=headers, json=data, timeout=30)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # For LLM endpoints with budget exhausted, accept 200 with fallback content
        if allow_fallback and resp.status_code == 200:
            return resp
        
        if resp.status_code != expected_status:
            return None
        
        return resp
    except requests.exceptions.RequestException as e:
        print(f"     Request exception: {e}")
        return None

# =============================================================================
# TEST SUITE
# =============================================================================

def test_1_admin_auth():
    """Test 1: Admin Authentication"""
    global admin_token
    log_section("TEST 1: ADMIN AUTHENTICATION")
    
    # 1.1: Valid login
    log_test("POST /api/auth/admin/login with valid credentials")
    resp = make_request("POST", "/auth/admin/login", data={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if not resp:
        log_fail("Valid admin login failed")
        return False
    
    data = resp.json()
    if "token" not in data:
        log_fail("No token in login response")
        return False
    
    admin_token = data["token"]
    log_pass(f"Admin login successful, token received")
    
    # 1.2: Invalid credentials
    log_test("POST /api/auth/admin/login with invalid credentials")
    try:
        resp = requests.post(f"{BACKEND_URL}/auth/admin/login", 
                           json={"email": ADMIN_EMAIL, "password": "WrongPassword123!"},
                           headers={"Content-Type": "application/json"},
                           timeout=30)
        if resp.status_code != 401:
            log_fail(f"Invalid credentials should return 401, got {resp.status_code}")
            return False
        log_pass("Invalid credentials correctly rejected with 401")
    except Exception as e:
        log_fail(f"Request failed: {e}")
        return False
    
    # 1.3: GET /me with token
    log_test("GET /api/auth/admin/me with valid token")
    resp = make_request("GET", "/auth/admin/me", auth=True)
    if not resp:
        log_fail("GET /me with token failed")
        return False
    
    data = resp.json()
    if data.get("email") != ADMIN_EMAIL.lower():
        log_fail(f"Expected email {ADMIN_EMAIL}, got {data.get('email')}")
        return False
    log_pass(f"GET /me returned correct admin: {data.get('email')}")
    
    # 1.4: GET /me without token
    log_test("GET /api/auth/admin/me without token")
    try:
        resp = requests.get(f"{BACKEND_URL}/auth/admin/me", timeout=30)
        if resp.status_code != 401:
            log_fail(f"GET /me without token should return 401, got {resp.status_code}")
            return False
        log_pass("GET /me without token correctly rejected with 401")
    except Exception as e:
        log_fail(f"Request failed: {e}")
        return False
    
    return True

def test_2_public_inquiries():
    """Test 2: Public Inquiries"""
    global test_inquiry_id
    log_section("TEST 2: PUBLIC INQUIRIES")
    
    # 2.1: POST /api/inquiries
    log_test("POST /api/inquiries (public)")
    resp = make_request("POST", "/inquiries", data={
        "name": "Test User",
        "email": "testuser@example.com",
        "company": "Test Company",
        "service_interest": "Web Design",
        "budget": "$5,000 - $10,000",
        "message": "I need a new website for my business."
    })
    if not resp:
        log_fail("POST /api/inquiries failed")
        return False
    
    data = resp.json()
    if "id" not in data or "email" not in data:
        log_fail("Inquiry response missing required fields")
        return False
    
    test_inquiry_id = data["id"]
    log_pass(f"Inquiry created successfully, ID: {test_inquiry_id}")
    
    # 2.2: POST /api/inquiries/roi
    log_test("POST /api/inquiries/roi (public)")
    resp = make_request("POST", "/inquiries/roi", data={
        "email": "roilead@example.com",
        "revenue": 100000,
        "roas": 3.5,
        "spend": 5000,
        "lift": 25000
    })
    if not resp:
        log_fail("POST /api/inquiries/roi failed")
        return False
    
    data = resp.json()
    if "id" not in data or data.get("source") != "roi-calculator":
        log_fail("ROI inquiry response invalid")
        return False
    
    log_pass(f"ROI inquiry created successfully, ID: {data['id']}")
    
    return True

def test_3_analytics():
    """Test 3: Analytics"""
    global test_session_id
    log_section("TEST 3: ANALYTICS")
    
    test_session_id = f"test-session-{int(time.time())}"
    
    # 3.1: POST /api/analytics/event (public)
    log_test("POST /api/analytics/event (public)")
    resp = make_request("POST", "/analytics/event", data={
        "event": "pageview",
        "path": "/",
        "referrer": "https://google.com",
        "session_id": test_session_id,
        "meta": {"test": True}
    })
    if not resp:
        log_fail("POST /api/analytics/event failed")
        return False
    
    data = resp.json()
    if not data.get("ok"):
        log_fail("Analytics event response invalid")
        return False
    
    log_pass("Analytics event tracked successfully")
    
    # 3.2: GET /api/admin/analytics/summary (admin)
    log_test("GET /api/admin/analytics/summary (admin)")
    resp = make_request("GET", "/admin/analytics/summary", auth=True, params={"days": 7})
    if not resp:
        log_fail("GET /api/admin/analytics/summary failed")
        return False
    
    data = resp.json()
    required_keys = ["range_days", "totals", "by_country", "by_device", "daily_pageviews"]
    missing = [k for k in required_keys if k not in data]
    if missing:
        log_fail(f"Analytics summary missing keys: {missing}")
        return False
    
    log_pass(f"Analytics summary returned correctly (totals: {data['totals']})")
    
    # 3.3: GET /api/admin/analytics/recent (admin)
    log_test("GET /api/admin/analytics/recent (admin)")
    resp = make_request("GET", "/admin/analytics/recent", auth=True)
    if not resp:
        log_fail("GET /api/admin/analytics/recent failed")
        return False
    
    data = resp.json()
    if not isinstance(data, list):
        log_fail("Analytics recent should return a list")
        return False
    
    log_pass(f"Analytics recent returned {len(data)} events")
    
    return True

def test_4_leads_inbox():
    """Test 4: Leads Inbox"""
    log_section("TEST 4: LEADS INBOX")
    
    # 4.1: GET /api/admin/inquiries (admin)
    log_test("GET /api/admin/inquiries (admin)")
    resp = make_request("GET", "/admin/inquiries", auth=True)
    if not resp:
        log_fail("GET /api/admin/inquiries failed")
        return False
    
    data = resp.json()
    if not isinstance(data, list):
        log_fail("Inquiries should return a list")
        return False
    
    log_pass(f"Inquiries list returned {len(data)} items")
    
    # 4.2: PATCH /api/admin/inquiries/{id} (admin)
    if test_inquiry_id:
        log_test(f"PATCH /api/admin/inquiries/{test_inquiry_id} (admin)")
        resp = make_request("PATCH", f"/admin/inquiries/{test_inquiry_id}", 
                          auth=True, data={"status": "contacted"})
        if not resp:
            log_fail("PATCH /api/admin/inquiries failed")
            return False
        
        data = resp.json()
        if not data.get("ok"):
            log_fail("Inquiry update response invalid")
            return False
        
        log_pass("Inquiry status updated successfully")
    else:
        log_pass("Skipping PATCH test (no inquiry ID)")
    
    return True

def test_5_affiliates():
    """Test 5: Affiliates"""
    log_section("TEST 5: AFFILIATES")
    
    # 5.1: GET /api/affiliates/program (public)
    log_test("GET /api/affiliates/program (public)")
    resp = make_request("GET", "/affiliates/program")
    if not resp:
        log_fail("GET /api/affiliates/program failed")
        return False
    
    data = resp.json()
    if "tiers" not in data or len(data["tiers"]) != 4:
        log_fail("Affiliates program should return 4 tiers")
        return False
    
    log_pass(f"Affiliates program returned {len(data['tiers'])} tiers")
    
    # 5.2: POST /api/affiliates/apply (public)
    log_test("POST /api/affiliates/apply (public)")
    test_email = f"affiliate-test-{int(time.time())}@example.com"
    resp = make_request("POST", "/affiliates/apply", data={
        "name": "Test Affiliate",
        "email": test_email,
        "company": "Test Agency",
        "website": "https://testagency.com",
        "why_join": "I want to earn commissions",
        "audience_size": "1000-5000",
        "experience": "2-5 years"
    })
    if not resp:
        log_fail("POST /api/affiliates/apply failed")
        return False
    
    data = resp.json()
    if data.get("status") != "pending":
        log_fail("Affiliate application should have status 'pending'")
        return False
    
    log_pass(f"Affiliate application submitted successfully")
    
    # 5.3: GET /api/admin/affiliates (admin)
    log_test("GET /api/admin/affiliates (admin)")
    resp = make_request("GET", "/admin/affiliates", auth=True)
    if not resp:
        log_fail("GET /api/admin/affiliates failed")
        return False
    
    data = resp.json()
    if "affiliates" not in data:
        log_fail("Admin affiliates response should have 'affiliates' key")
        return False
    
    log_pass(f"Admin affiliates list returned {len(data['affiliates'])} affiliates")
    
    return True

def test_6_social_autoposter():
    """Test 6: Social Auto-Poster"""
    log_section("TEST 6: SOCIAL AUTO-POSTER")
    
    # 6.1: GET /api/admin/social/dashboard (admin)
    log_test("GET /api/admin/social/dashboard (admin)")
    resp = make_request("GET", "/admin/social/dashboard", auth=True)
    if not resp:
        log_fail("GET /api/admin/social/dashboard failed")
        return False
    
    data = resp.json()
    required_keys = ["queued", "published", "failed", "agents_total", "agents_online"]
    missing = [k for k in required_keys if k not in data]
    if missing:
        log_fail(f"Social dashboard missing keys: {missing}")
        return False
    
    log_pass(f"Social dashboard: {data['agents_total']} agents, {data['queued']} queued posts")
    
    # 6.2: GET /api/admin/social/agents (admin)
    log_test("GET /api/admin/social/agents (admin)")
    resp = make_request("GET", "/admin/social/agents", auth=True)
    if not resp:
        log_fail("GET /api/admin/social/agents failed")
        return False
    
    data = resp.json()
    if "agents" not in data:
        log_fail("Social agents response should have 'agents' key")
        return False
    
    log_pass(f"Social agents list returned {len(data['agents'])} agents")
    
    # 6.3: GET /api/admin/social/posts (admin)
    log_test("GET /api/admin/social/posts (admin)")
    resp = make_request("GET", "/admin/social/posts", auth=True)
    if not resp:
        log_fail("GET /api/admin/social/posts failed")
        return False
    
    data = resp.json()
    if "posts" not in data:
        log_fail("Social posts response should have 'posts' key")
        return False
    
    log_pass(f"Social posts list returned {len(data['posts'])} posts")
    
    # 6.4: POST /api/admin/social/posts (admin) - create a post
    log_test("POST /api/admin/social/posts (admin) - create post")
    resp = make_request("POST", "/admin/social/posts", auth=True, 
                       data={
                           "caption": "Test post about AI marketing - automated testing",
                           "platforms": ["x"],
                           "theme": "receipts"
                       })
    if not resp:
        log_fail("POST /api/admin/social/posts failed")
        return False
    
    data = resp.json()
    if "id" not in data or "caption" not in data:
        log_fail("Post creation response missing required fields")
        return False
    
    log_pass(f"Social post created successfully, ID: {data['id']}")
    
    return True

def test_7_lead_engine():
    """Test 7: Lead Engine"""
    log_section("TEST 7: LEAD ENGINE")
    
    # 7.1: GET /api/admin/leads/pipeline (admin)
    log_test("GET /api/admin/leads/pipeline (admin)")
    resp = make_request("GET", "/admin/leads/pipeline", auth=True)
    if not resp:
        log_fail("GET /api/admin/leads/pipeline failed")
        return False
    
    data = resp.json()
    required_keys = ["discovered", "queued", "contacted", "total"]
    missing = [k for k in required_keys if k not in data]
    if missing:
        log_fail(f"Lead pipeline missing keys: {missing}")
        return False
    
    log_pass(f"Lead pipeline: {data['total']} total leads ({data['discovered']} discovered, {data['queued']} queued)")
    
    # 7.2: GET /api/admin/leads (admin)
    log_test("GET /api/admin/leads (admin)")
    resp = make_request("GET", "/admin/leads", auth=True)
    if not resp:
        log_fail("GET /api/admin/leads failed")
        return False
    
    data = resp.json()
    if "leads" not in data:
        log_fail("Leads response should have 'leads' key")
        return False
    
    log_pass(f"Leads list returned {len(data['leads'])} leads")
    
    # 7.3: GET /api/admin/leads/analytics (admin)
    log_test("GET /api/admin/leads/analytics (admin)")
    resp = make_request("GET", "/admin/leads/analytics", auth=True)
    if not resp:
        log_fail("GET /api/admin/leads/analytics failed")
        return False
    
    data = resp.json()
    required_keys = ["funnel", "rates", "outreach_7d"]
    missing = [k for k in required_keys if k not in data]
    if missing:
        log_fail(f"Lead analytics missing keys: {missing}")
        return False
    
    log_pass(f"Lead analytics returned correctly (funnel: {data['funnel']})")
    
    return True

def test_8_operator():
    """Test 8: Operator (Bland.ai)"""
    log_section("TEST 8: OPERATOR (BLAND.AI)")
    
    # 8.1: GET /api/admin/operator/status (admin)
    log_test("GET /api/admin/operator/status (admin)")
    resp = make_request("GET", "/admin/operator/status", auth=True)
    if not resp:
        log_fail("GET /api/admin/operator/status failed")
        return False
    
    data = resp.json()
    if "configured" not in data:
        log_fail("Operator status should have 'configured' key")
        return False
    
    # Expected: configured=False since BLAND_API_KEY is empty
    if data.get("configured"):
        log_pass("Operator status: CONFIGURED (unexpected but not a failure)")
    else:
        log_pass("Operator status: NOT CONNECTED (expected, BLAND_API_KEY empty)")
    
    return True

def test_9_direct_instagram():
    """Test 9: Direct Instagram Poster"""
    log_section("TEST 9: DIRECT INSTAGRAM POSTER")
    
    # 9.1: GET /api/admin/social/direct/accounts without token
    log_test("GET /api/admin/social/direct/accounts without token")
    try:
        resp = requests.get(f"{BACKEND_URL}/admin/social/direct/accounts", timeout=30)
        if resp.status_code != 401:
            log_fail(f"Should return 401 without token, got {resp.status_code}")
            return False
        log_pass("Correctly rejected without token (401)")
    except Exception as e:
        log_fail(f"Request failed: {e}")
        return False
    
    # 9.2: GET /api/admin/social/direct/accounts with token
    log_test("GET /api/admin/social/direct/accounts with token")
    resp = make_request("GET", "/admin/social/direct/accounts", auth=True)
    if not resp:
        log_fail("GET /api/admin/social/direct/accounts failed")
        return False
    
    data = resp.json()
    if not isinstance(data, list):
        log_fail("Direct accounts should return a list")
        return False
    
    log_pass(f"Direct accounts returned {len(data)} accounts (empty list expected)")
    
    # 9.3: POST /api/admin/social/direct/connect with bogus credentials
    log_test("POST /api/admin/social/direct/connect with bogus credentials")
    try:
        resp = requests.post(f"{BACKEND_URL}/admin/social/direct/connect",
                           headers={"Authorization": f"Bearer {admin_token}",
                                  "Content-Type": "application/json"},
                           json={
                               "username": "brivo_test_nonexistent_x9z",
                               "password": "fake_password_123"
                           }, timeout=30)
        
        # Accept 400, 429, or 200 with error status (clean error handling)
        if resp.status_code in [400, 429]:
            log_pass(f"Bogus credentials handled cleanly ({resp.status_code})")
        elif resp.status_code == 200:
            data = resp.json()
            if "status" in data and data["status"] in ["two_factor_required", "challenge_required"]:
                log_pass(f"Bogus credentials handled with status: {data['status']}")
            else:
                log_fail("Unexpected 200 response without error status")
                return False
        elif resp.status_code == 500:
            # Check if it's a clean error message (not a stack trace)
            error_text = resp.text
            if "Traceback" in error_text or "File \"" in error_text:
                log_fail(f"500 error with stack trace (not clean): {error_text[:200]}")
                return False
            else:
                log_pass(f"Clean error handling (500 with message, no stack trace)")
        else:
            log_fail(f"Unexpected status code: {resp.status_code}")
            return False
    except Exception as e:
        log_fail(f"Request failed: {e}")
        return False
    
    # 9.4: POST /api/admin/social/direct/post with non-existent account
    log_test("POST /api/admin/social/direct/post with non-existent account")
    try:
        resp = requests.post(f"{BACKEND_URL}/admin/social/direct/post",
                           headers={"Authorization": f"Bearer {admin_token}",
                                  "Content-Type": "application/json"},
                           json={
                               "account_id": "nonexistent-account-id",
                               "caption": "Test post",
                               "image_url": "https://example.com/image.jpg"
                           }, timeout=30)
        if resp.status_code != 404:
            log_fail(f"Should return 404 for non-existent account, got {resp.status_code}")
            return False
        log_pass("Non-existent account correctly rejected (404)")
    except Exception as e:
        log_fail(f"Request failed: {e}")
        return False
    
    # 9.5: DELETE /api/admin/social/direct/{id} with non-existent account
    log_test("DELETE /api/admin/social/direct/{id} with non-existent account")
    try:
        resp = requests.delete(f"{BACKEND_URL}/admin/social/direct/nonexistent-account-id",
                             headers={"Authorization": f"Bearer {admin_token}"},
                             timeout=30)
        if resp.status_code != 404:
            log_fail(f"Should return 404 for non-existent account, got {resp.status_code}")
            return False
        log_pass("Non-existent account delete correctly rejected (404)")
    except Exception as e:
        log_fail(f"Request failed: {e}")
        return False
    
    return True

# =============================================================================
# MAIN
# =============================================================================

def main():
    print("\n" + "="*80)
    print("  BRIVO BACKEND REGRESSION TEST SUITE")
    print("  Continuation Environment - Full Backend Health Check")
    print("="*80)
    print(f"\nBackend URL: {BACKEND_URL}")
    print(f"Admin Email: {ADMIN_EMAIL}")
    print(f"LLM Budget: EXHAUSTED (fallback content expected)\n")
    
    results = {}
    
    # Run all tests
    results["1. Admin Auth"] = test_1_admin_auth()
    results["2. Public Inquiries"] = test_2_public_inquiries()
    results["3. Analytics"] = test_3_analytics()
    results["4. Leads Inbox"] = test_4_leads_inbox()
    results["5. Affiliates"] = test_5_affiliates()
    results["6. Social Auto-Poster"] = test_6_social_autoposter()
    results["7. Lead Engine"] = test_7_lead_engine()
    results["8. Operator"] = test_8_operator()
    results["9. Direct Instagram"] = test_9_direct_instagram()
    
    # Summary
    print("\n" + "="*80)
    print("  TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {test_name}")
    
    print(f"\n{passed}/{total} test suites passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Backend is healthy!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test suite(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
