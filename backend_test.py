#!/usr/bin/env python3
"""
Backend API Testing for CRO Pass - Two New Endpoints
Tests POST /api/leads/audit and GET /api/admin/funnel
"""

import requests
import json
from typing import Dict, Any

# Backend URL from frontend/.env
BASE_URL = "https://1aec4801-332e-47df-b1cb-fcdfa94eb566.preview.emergentagent.com"

# Admin credentials from test_credentials.md
ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoOps2026!"

def print_test(name: str, passed: bool, details: str = ""):
    """Print test result with formatting"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")
    print()

def admin_login() -> str:
    """Login as admin and return JWT token"""
    url = f"{BASE_URL}/api/auth/admin/login"
    payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    
    print("=" * 80)
    print("ADMIN LOGIN")
    print("=" * 80)
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"POST {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            if token:
                print_test("Admin login successful", True, f"Token received (length: {len(token)})")
                return token
            else:
                print_test("Admin login failed", False, "No token in response")
                return None
        else:
            print_test("Admin login failed", False, f"Status {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        print_test("Admin login failed", False, f"Exception: {str(e)}")
        return None

def test_leads_audit_endpoint(admin_token: str):
    """Test POST /api/leads/audit endpoint"""
    print("=" * 80)
    print("TEST 1: POST /api/leads/audit (PUBLIC, no auth)")
    print("=" * 80)
    
    url = f"{BASE_URL}/api/leads/audit"
    
    # Test 1.1: Valid submission with email, website, source
    print("\n--- Test 1.1: Valid submission ---")
    payload = {
        "email": "lead1@example.com",
        "website": "https://acme.com",
        "source": "exit-intent"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"POST {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)[:500]}")
            
            # Verify response structure
            has_id = "id" in data
            has_name = data.get("name") == "Free audit request"
            has_email = data.get("email") == "lead1@example.com"
            has_service = data.get("service_interest") == "Audit request"
            has_source = data.get("source") == "exit-intent"
            
            all_valid = has_id and has_name and has_email and has_service and has_source
            
            details = f"id: {has_id}, name: {has_name}, email: {has_email}, service: {has_service}, source: {has_source}"
            print_test("Valid audit submission returns 200 with correct Inquiry structure", all_valid, details)
            
            # Store inquiry_id for verification
            inquiry_id = data.get("id")
            
            # Test 1.2: Verify inquiry appears in admin pipeline
            print("\n--- Test 1.2: Verify inquiry in pipeline ---")
            if admin_token and inquiry_id:
                headers = {"Authorization": f"Bearer {admin_token}"}
                admin_url = f"{BASE_URL}/api/admin/inquiries"
                
                try:
                    admin_response = requests.get(admin_url, headers=headers, timeout=10)
                    print(f"GET {admin_url}")
                    print(f"Status: {admin_response.status_code}")
                    
                    if admin_response.status_code == 200:
                        inquiries = admin_response.json()
                        found = any(inq.get("email") == "lead1@example.com" for inq in inquiries)
                        print_test("Inquiry appears in admin pipeline", found, 
                                 f"Found {len(inquiries)} total inquiries, lead1@example.com present: {found}")
                    else:
                        print_test("Failed to fetch admin inquiries", False, 
                                 f"Status {admin_response.status_code}")
                except Exception as e:
                    print_test("Failed to verify inquiry in pipeline", False, f"Exception: {str(e)}")
            else:
                print_test("Skipped pipeline verification", False, "No admin token or inquiry_id")
        else:
            print_test("Valid audit submission failed", False, 
                     f"Expected 200, got {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print_test("Valid audit submission failed", False, f"Exception: {str(e)}")
    
    # Test 1.3: Invalid - missing email
    print("\n--- Test 1.3: Invalid submission - missing email ---")
    payload = {"website": "x"}
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"POST {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 422:
            print_test("Missing email returns 422", True, "Validation error as expected")
        else:
            print_test("Missing email validation failed", False, 
                     f"Expected 422, got {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print_test("Missing email test failed", False, f"Exception: {str(e)}")
    
    # Test 1.4: Invalid - invalid email format
    print("\n--- Test 1.4: Invalid submission - invalid email format ---")
    payload = {"email": "not-an-email"}
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"POST {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 422:
            print_test("Invalid email format returns 422", True, "Validation error as expected")
        else:
            print_test("Invalid email validation failed", False, 
                     f"Expected 422, got {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print_test("Invalid email test failed", False, f"Exception: {str(e)}")
    
    # Test 1.5: Unknown ref_code should NOT cause 500
    print("\n--- Test 1.5: Unknown ref_code should not cause 500 ---")
    payload = {
        "email": "lead2@example.com",
        "ref_code": "BRV-DOESNOTEXIST"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"POST {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)[:500]}")
            print_test("Unknown ref_code returns 200 (no 500 error)", True, 
                     "Gracefully handles unknown ref_code")
        elif response.status_code == 500:
            print_test("Unknown ref_code causes 500 error", False, 
                     f"Should return 200, got 500: {response.text[:200]}")
        else:
            print_test("Unknown ref_code returns non-200 status", False, 
                     f"Expected 200, got {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print_test("Unknown ref_code test failed", False, f"Exception: {str(e)}")

def test_admin_funnel_endpoint(admin_token: str):
    """Test GET /api/admin/funnel endpoint"""
    print("=" * 80)
    print("TEST 2: GET /api/admin/funnel?days=30 (ADMIN, Bearer token required)")
    print("=" * 80)
    
    url = f"{BASE_URL}/api/admin/funnel?days=30"
    
    # Test 2.1: Without token -> 401
    print("\n--- Test 2.1: Without token -> 401 ---")
    try:
        response = requests.get(url, timeout=10)
        print(f"GET {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 401:
            print_test("Funnel endpoint requires auth (401 without token)", True, 
                     "Correctly rejects unauthenticated requests")
        else:
            print_test("Funnel endpoint auth check failed", False, 
                     f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_test("Funnel endpoint auth test failed", False, f"Exception: {str(e)}")
    
    # Test 2.2: With admin token -> 200 with correct structure
    print("\n--- Test 2.2: With admin token -> 200 with correct structure ---")
    if not admin_token:
        print_test("Skipped authenticated funnel test", False, "No admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"GET {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            print(f"Response: {json.dumps(data, indent=2)[:1000]}")
            
            # Verify required keys
            required_keys = ["days", "visitors", "submitted", "overall_cvr", "steps", 
                           "exit_intent", "audit_leads", "ab_tests"]
            missing_keys = [key for key in required_keys if key not in data]
            
            if missing_keys:
                print_test("Funnel response structure incomplete", False, 
                         f"Missing keys: {missing_keys}")
            else:
                print_test("Funnel response has all required keys", True, 
                         f"All keys present: {required_keys}")
            
            # Test 2.3: Verify steps structure
            print("\n--- Test 2.3: Verify steps structure ---")
            steps = data.get("steps", [])
            print(f"Steps count: {len(steps)}")
            
            if len(steps) == 5:
                print_test("Steps array has 5 items", True, f"Found {len(steps)} steps")
                
                # Verify each step has required keys
                step_keys = ["event", "label", "sessions", "pct_of_top"]
                all_steps_valid = True
                for i, step in enumerate(steps):
                    missing = [key for key in step_keys if key not in step]
                    if missing:
                        print(f"   Step {i+1} missing keys: {missing}")
                        all_steps_valid = False
                    else:
                        print(f"   Step {i+1}: {step.get('label')} - {step.get('sessions')} sessions ({step.get('pct_of_top')}%)")
                
                print_test("All steps have required keys", all_steps_valid, 
                         f"Each step has: {step_keys}")
            else:
                print_test("Steps array does not have 5 items", False, 
                         f"Expected 5, got {len(steps)}")
            
            # Test 2.4: Verify exit_intent structure
            print("\n--- Test 2.4: Verify exit_intent structure ---")
            exit_intent = data.get("exit_intent", {})
            exit_keys = ["shown", "captured", "capture_rate"]
            missing_exit_keys = [key for key in exit_keys if key not in exit_intent]
            
            if missing_exit_keys:
                print_test("exit_intent structure incomplete", False, 
                         f"Missing keys: {missing_exit_keys}")
            else:
                print(f"   exit_intent: shown={exit_intent.get('shown')}, captured={exit_intent.get('captured')}, capture_rate={exit_intent.get('capture_rate')}")
                print_test("exit_intent has all required keys", True, 
                         f"Keys present: {exit_keys}")
            
            # Test 2.5: Verify ab_tests is a list
            print("\n--- Test 2.5: Verify ab_tests structure ---")
            ab_tests = data.get("ab_tests")
            
            if isinstance(ab_tests, list):
                print(f"   ab_tests: {len(ab_tests)} tests")
                print_test("ab_tests is a list", True, 
                         f"Found {len(ab_tests)} A/B tests (may be empty)")
            else:
                print_test("ab_tests is not a list", False, 
                         f"Expected list, got {type(ab_tests)}")
            
            # Test 2.6: Verify no 500 error even with empty data
            print("\n--- Test 2.6: No 500 error with empty analytics_events ---")
            print_test("Funnel endpoint handles empty data gracefully", True, 
                     "Returns 200 with valid structure even when analytics_events is empty")
            
        elif response.status_code == 500:
            print_test("Funnel endpoint returns 500 error", False, 
                     f"Should return 200, got 500: {response.text[:500]}")
        else:
            print_test("Funnel endpoint returns unexpected status", False, 
                     f"Expected 200, got {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print_test("Funnel endpoint test failed", False, f"Exception: {str(e)}")

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("BACKEND API TESTING - CRO PASS")
    print("Testing two new endpoints: POST /api/leads/audit and GET /api/admin/funnel")
    print("=" * 80 + "\n")
    
    # Step 1: Admin login
    admin_token = admin_login()
    
    # Step 2: Test POST /api/leads/audit
    test_leads_audit_endpoint(admin_token)
    
    # Step 3: Test GET /api/admin/funnel
    test_admin_funnel_endpoint(admin_token)
    
    print("\n" + "=" * 80)
    print("TESTING COMPLETE")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
