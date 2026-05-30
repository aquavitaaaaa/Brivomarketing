#!/usr/bin/env python3
"""
Direct Instagram Poster Backend Test Suite
Tests auth protection, input validation, and error handling for instagram_direct.py endpoints.

IMPORTANT: Does NOT attempt real Instagram login (no real credentials/proxy).
Only verifies: auth protection, input validation, clean error handling (no 500s/stack traces).
"""

import requests
import json
import sys
from typing import Optional

# Backend URL from frontend/.env
BACKEND_URL = "https://platform-roadmap-2.preview.emergentagent.com/api"

# Admin credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoOps2026!"

# Test state
admin_token: Optional[str] = None

def log_step(step_num: str, description: str):
    """Log the current test step."""
    print(f"\n{'='*80}")
    print(f"STEP {step_num}: {description}")
    print('='*80)

def log_pass(message: str):
    """Log a passing test."""
    print(f"✅ PASS: {message}")

def log_fail(message: str, response: Optional[requests.Response] = None):
    """Log a failing test and exit."""
    print(f"❌ FAIL: {message}")
    if response:
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:500]}")
    sys.exit(1)

def make_request(
    method: str,
    endpoint: str,
    data: Optional[dict] = None,
    auth: bool = False,
    expected_status: int = 200,
    allow_multiple_status: list = None
) -> requests.Response:
    """Make an HTTP request and validate the response."""
    url = f"{BACKEND_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if auth and admin_token:
        headers["Authorization"] = f"Bearer {admin_token}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=data, timeout=30)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # Check if status matches expected or is in allowed list
        if allow_multiple_status:
            if resp.status_code not in allow_multiple_status:
                log_fail(
                    f"Expected status in {allow_multiple_status}, got {resp.status_code}",
                    resp
                )
        elif resp.status_code != expected_status:
            log_fail(
                f"Expected status {expected_status}, got {resp.status_code}",
                resp
            )
        
        return resp
    except requests.exceptions.RequestException as e:
        log_fail(f"Request failed: {e}")
        sys.exit(1)

def test_admin_login():
    """Get admin JWT token."""
    global admin_token
    
    log_step("0", "POST /api/auth/admin/login - Get admin token")
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    resp = make_request("POST", "/auth/admin/login", data=payload)
    data = resp.json()
    
    if "token" not in data:
        log_fail("Login response missing 'token' field", resp)
    
    admin_token = data["token"]
    log_pass(f"Admin login successful, token captured")

def test_accounts_without_token():
    """Test GET /api/admin/social/direct/accounts WITHOUT token (expect 401/403)."""
    log_step("1a", "GET /api/admin/social/direct/accounts WITHOUT token (expect 401/403)")
    
    # Make request without auth
    resp = make_request(
        "GET", 
        "/admin/social/direct/accounts",
        auth=False,
        allow_multiple_status=[401, 403]
    )
    
    log_pass(f"Correctly rejected with status {resp.status_code} (401 or 403)")

def test_accounts_with_token():
    """Test GET /api/admin/social/direct/accounts WITH admin token (expect 200 + JSON array)."""
    log_step("1b", "GET /api/admin/social/direct/accounts WITH admin token (expect 200)")
    
    resp = make_request(
        "GET",
        "/admin/social/direct/accounts",
        auth=True,
        expected_status=200
    )
    
    data = resp.json()
    
    # Verify it's a list (likely empty)
    if not isinstance(data, list):
        log_fail(f"Expected JSON array, got {type(data)}", resp)
    
    log_pass(f"Returned 200 with JSON array (length: {len(data)})")

def test_connect_without_token():
    """Test POST /api/admin/social/direct/connect WITHOUT token (expect 401/403)."""
    log_step("2a", "POST /api/admin/social/direct/connect WITHOUT token (expect 401/403)")
    
    payload = {
        "username": "brivo_test_nonexistent_x9",
        "password": "definitely-wrong-pass",
        "proxy": None
    }
    
    resp = make_request(
        "POST",
        "/admin/social/direct/connect",
        data=payload,
        auth=False,
        allow_multiple_status=[401, 403]
    )
    
    log_pass(f"Correctly rejected with status {resp.status_code} (401 or 403)")

def test_connect_with_token_bogus_creds():
    """Test POST /api/admin/social/direct/connect WITH admin token + bogus credentials.
    
    CRITICAL: Must return a HANDLED response (400/429 or 200 with status field).
    Must NOT return 500 or unhandled stack trace.
    """
    log_step("2b", "POST /api/admin/social/direct/connect WITH token + bogus creds (expect handled error)")
    
    payload = {
        "username": "brivo_test_nonexistent_x9",
        "password": "definitely-wrong-pass",
        "proxy": None
    }
    
    # Allow 200, 400, 429 - all are valid handled responses
    resp = make_request(
        "POST",
        "/admin/social/direct/connect",
        data=payload,
        auth=True,
        allow_multiple_status=[200, 400, 429]
    )
    
    # Check that we didn't get a 500 (unhandled error)
    if resp.status_code == 500:
        log_fail("Got 500 Internal Server Error - error not handled cleanly", resp)
    
    # If 200, verify it has a status field indicating challenge/2fa/error
    if resp.status_code == 200:
        data = resp.json()
        if "status" not in data:
            log_fail("200 response missing 'status' field", resp)
        
        # Valid status values: challenge_required, two_factor_required
        valid_statuses = ["challenge_required", "two_factor_required"]
        if data["status"] not in valid_statuses:
            log_fail(f"Unexpected status value: {data['status']}", resp)
        
        log_pass(f"Returned 200 with status='{data['status']}' (handled response)")
    else:
        # 400 or 429 - both are valid handled errors
        log_pass(f"Returned {resp.status_code} (handled error response)")
    
    # Verify no stack trace in response
    response_text = resp.text.lower()
    if "traceback" in response_text or "exception" in response_text:
        log_fail("Response contains stack trace or exception details (not clean)", resp)
    
    log_pass("No stack trace leaked in response (clean error handling)")

def test_post_with_nonexistent_account():
    """Test POST /api/admin/social/direct/post WITH admin token + non-existent account_id (expect 404)."""
    log_step("3", "POST /api/admin/social/direct/post WITH token + non-existent account_id (expect 404)")
    
    payload = {
        "account_id": "does-not-exist",
        "caption": "hi",
        "image_url": "/kit-assets/ig-posts/post-01.jpg"
    }
    
    resp = make_request(
        "POST",
        "/admin/social/direct/post",
        data=payload,
        auth=True,
        expected_status=404
    )
    
    log_pass("Correctly returned 404 for non-existent account_id")

def test_delete_nonexistent_account():
    """Test DELETE /api/admin/social/direct/{id} WITH admin token + non-existent id (expect 404)."""
    log_step("4", "DELETE /api/admin/social/direct/does-not-exist WITH token (expect 404)")
    
    resp = make_request(
        "DELETE",
        "/admin/social/direct/does-not-exist",
        auth=True,
        expected_status=404
    )
    
    log_pass("Correctly returned 404 for non-existent account id")

def main():
    """Run all test steps."""
    print("\n" + "="*80)
    print("DIRECT INSTAGRAM POSTER BACKEND TEST SUITE")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("="*80)
    print("\nIMPORTANT: This test does NOT attempt real Instagram login.")
    print("Only testing: auth protection, input validation, error handling.")
    print("="*80)
    
    try:
        test_admin_login()
        test_accounts_without_token()
        test_accounts_with_token()
        test_connect_without_token()
        test_connect_with_token_bogus_creds()
        test_post_with_nonexistent_account()
        test_delete_nonexistent_account()
        
        print("\n" + "="*80)
        print("🎉 ALL TESTS PASSED!")
        print("="*80)
        print("\nSummary:")
        print(f"  ✅ Auth protection working (401/403 without token)")
        print(f"  ✅ GET /accounts returns 200 + JSON array with token")
        print(f"  ✅ POST /connect handles bogus credentials cleanly (no 500)")
        print(f"  ✅ POST /post returns 404 for non-existent account")
        print(f"  ✅ DELETE returns 404 for non-existent account")
        print(f"  ✅ No stack traces leaked in error responses")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
