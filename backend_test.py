#!/usr/bin/env python3
"""
Affiliate / Partner Program Backend Test Suite
Tests all 13 steps as specified in the review request.
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from frontend/.env
BACKEND_URL = "https://growth-funnel-8.preview.emergentagent.com/api"

# Admin credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "admin@brivomarketing.com"
ADMIN_PASSWORD = "BrivoOps2026!"

# Test state
admin_token: Optional[str] = None
app_id_a: Optional[str] = None
ref_a: Optional[str] = None
aff_a: Optional[str] = None
referral_1: Optional[str] = None
comm_1: Optional[str] = None
app_z: Optional[str] = None

def log_step(step_num: int, description: str):
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
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
    auth: bool = False,
    expected_status: int = 200
) -> requests.Response:
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
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if resp.status_code != expected_status:
            log_fail(
                f"Expected status {expected_status}, got {resp.status_code}",
                resp
            )
        
        return resp
    except requests.exceptions.RequestException as e:
        log_fail(f"Request failed: {e}")
        sys.exit(1)

def test_step_1():
    """Step 1: GET /api/affiliates/program (no auth)"""
    log_step(1, "GET /api/affiliates/program (no auth)")
    
    resp = make_request("GET", "/affiliates/program")
    data = resp.json()
    
    # Verify tiers array
    if "tiers" not in data or len(data["tiers"]) != 4:
        log_fail("Expected 'tiers' array with 4 entries", resp)
    
    tiers = {t["id"]: t for t in data["tiers"]}
    
    # Verify Bronze tier
    if "bronze" not in tiers:
        log_fail("Bronze tier not found", resp)
    
    bronze = tiers["bronze"]
    if bronze["rate"] != 0.15:
        log_fail(f"Bronze rate should be 0.15, got {bronze['rate']}", resp)
    
    # Verify Platinum tier
    if "platinum" not in tiers:
        log_fail("Platinum tier not found", resp)
    
    platinum = tiers["platinum"]
    if platinum["rate"] != 0.30:
        log_fail(f"Platinum rate should be 0.30, got {platinum['rate']}", resp)
    
    # Verify examples array
    if "examples" not in data or len(data["examples"]) != 4:
        log_fail("Expected 'examples' array with 4 entries", resp)
    
    # Verify each tier has required fields
    for tier in data["tiers"]:
        required = ["id", "name", "min_active", "max_active", "rate", "perks"]
        for field in required:
            if field not in tier:
                log_fail(f"Tier {tier.get('id', 'unknown')} missing field: {field}", resp)
    
    log_pass("Program structure verified: 4 tiers (bronze 15%, platinum 30%), 4 examples")

def test_step_2():
    """Step 2: POST /api/affiliates/apply (no auth)"""
    global app_id_a
    
    log_step(2, "POST /api/affiliates/apply (no auth)")
    
    payload = {
        "name": "Sarah Mitchell",
        "email": "sarah.mitchell@techventures.io",
        "why_join": "I have a strong B2B network in the SaaS space with direct connections to 50+ decision makers",
        "phone": "+15551234567",
        "experience": "5 years as BDR at enterprise SaaS companies, consistently top 10% performer",
        "channels": "linkedin, email outreach, industry events",
        "audience_size": "10k+ LinkedIn connections, 3k newsletter subscribers",
        "expected_clients_per_month": "3-5 qualified leads per month"
    }
    
    resp = make_request("POST", "/affiliates/apply", data=payload)
    data = resp.json()
    
    # Verify response has id and status=pending
    if "id" not in data:
        log_fail("Response missing 'id' field", resp)
    
    if data.get("status") != "pending":
        log_fail(f"Expected status='pending', got '{data.get('status')}'", resp)
    
    app_id_a = data["id"]
    log_pass(f"Application created with id={app_id_a}, status=pending")
    
    # Test duplicate submission (should return 409)
    log_step("2b", "Resubmit same application (expect 409)")
    resp2 = make_request("POST", "/affiliates/apply", data=payload, expected_status=409)
    log_pass("Duplicate application correctly rejected with 409")

def test_step_3():
    """Step 3: Admin login"""
    global admin_token
    
    log_step(3, "POST /api/auth/admin/login")
    
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

def test_step_4():
    """Step 4: GET /api/admin/affiliates/applications?status=pending"""
    global app_id_a
    
    log_step(4, "GET /api/admin/affiliates/applications?status=pending")
    
    resp = make_request("GET", "/admin/affiliates/applications", params={"status": "pending"}, auth=True)
    data = resp.json()
    
    if "applications" not in data:
        log_fail("Response missing 'applications' field", resp)
    
    # Find our application
    apps = data["applications"]
    found = None
    for app in apps:
        if app.get("email") == "sarah.mitchell@techventures.io":
            found = app
            break
    
    if not found:
        log_fail(f"Application for sarah.mitchell@techventures.io not found in pending list", resp)
    
    app_id_a = found["id"]
    log_pass(f"Found pending application, captured APP_ID_A={app_id_a}")

def test_step_5():
    """Step 5: POST /api/admin/affiliates/applications/{app_id}/approve"""
    global ref_a, aff_a
    
    log_step(5, f"POST /api/admin/affiliates/applications/{app_id_a}/approve")
    
    resp = make_request("POST", f"/admin/affiliates/applications/{app_id_a}/approve", auth=True)
    data = resp.json()
    
    if "affiliate" not in data:
        log_fail("Response missing 'affiliate' field", resp)
    
    affiliate = data["affiliate"]
    
    # Verify ref_code starts with "BRV-"
    if "ref_code" not in affiliate or not affiliate["ref_code"].startswith("BRV-"):
        log_fail(f"Expected ref_code starting with 'BRV-', got '{affiliate.get('ref_code')}'", resp)
    
    # Verify tier=bronze, rate=0.15
    if affiliate.get("tier") != "bronze":
        log_fail(f"Expected tier='bronze', got '{affiliate.get('tier')}'", resp)
    
    if affiliate.get("rate") != 0.15:
        log_fail(f"Expected rate=0.15, got {affiliate.get('rate')}", resp)
    
    ref_a = affiliate["ref_code"]
    aff_a = affiliate["id"]
    
    log_pass(f"Application approved: ref_code={ref_a}, tier=bronze, rate=0.15, affiliate_id={aff_a}")

def test_step_6():
    """Step 6: POST /api/inquiries with ref_code, verify referral created"""
    global referral_1
    
    log_step(6, f"POST /api/inquiries with ref_code={ref_a}")
    
    payload = {
        "name": "James Chen",
        "email": "james.chen@acmecorp.com",
        "service_interest": "Accelerate Tier",
        "message": "Looking for comprehensive digital marketing services. Please send pricing and case studies.",
        "ref_code": ref_a
    }
    
    resp = make_request("POST", "/inquiries", data=payload)
    log_pass("Inquiry created successfully")
    
    # Verify referral was created
    log_step("6b", f"GET /api/admin/affiliates/{aff_a} - verify referral")
    
    resp2 = make_request("GET", f"/admin/affiliates/{aff_a}", auth=True)
    data = resp2.json()
    
    if "referrals" not in data:
        log_fail("Response missing 'referrals' field", resp2)
    
    referrals = data["referrals"]
    if len(referrals) == 0:
        log_fail("No referrals found for affiliate", resp2)
    
    # Find the referral for james.chen@acmecorp.com
    found = None
    for ref in referrals:
        if ref.get("lead_email") == "james.chen@acmecorp.com":
            found = ref
            break
    
    if not found:
        log_fail("Referral for james.chen@acmecorp.com not found", resp2)
    
    if found.get("stage") != "referred":
        log_fail(f"Expected stage='referred', got '{found.get('stage')}'", resp2)
    
    referral_1 = found["id"]
    log_pass(f"Referral created: id={referral_1}, lead_email=james.chen@acmecorp.com, stage=referred")

def test_step_7():
    """Step 7: POST /api/admin/affiliates/referrals/{referral_id}/win"""
    log_step(7, f"POST /api/admin/affiliates/referrals/{referral_1}/win")
    
    payload = {
        "client_mrr": 7500,
        "client_company": "Acme Corp"
    }
    
    resp = make_request("POST", f"/admin/affiliates/referrals/{referral_1}/win", data=payload, auth=True)
    log_pass("Referral marked as won")
    
    # Re-fetch affiliate details
    log_step("7b", f"GET /api/admin/affiliates/{aff_a} - verify commissions")
    
    resp2 = make_request("GET", f"/admin/affiliates/{aff_a}", auth=True)
    data = resp2.json()
    
    # Verify referral stage=won, client_mrr=7500
    referrals = data.get("referrals", [])
    ref = next((r for r in referrals if r["id"] == referral_1), None)
    
    if not ref:
        log_fail(f"Referral {referral_1} not found", resp2)
    
    if ref.get("stage") != "won":
        log_fail(f"Expected stage='won', got '{ref.get('stage')}'", resp2)
    
    if ref.get("client_mrr") != 7500:
        log_fail(f"Expected client_mrr=7500, got {ref.get('client_mrr')}", resp2)
    
    # Verify commissions
    commissions = data.get("commissions", [])
    if len(commissions) < 2:
        log_fail(f"Expected at least 2 commissions, got {len(commissions)}", resp2)
    
    # Find signing_bonus and recurring commissions
    signing = None
    recurring = None
    for comm in commissions:
        if comm.get("type") == "signing_bonus" and comm.get("referred_lead_id") == referral_1:
            signing = comm
        elif comm.get("type") == "recurring" and comm.get("referred_lead_id") == referral_1:
            recurring = comm
    
    if not signing:
        log_fail("signing_bonus commission not found", resp2)
    
    if not recurring:
        log_fail("recurring commission not found", resp2)
    
    # Verify amounts and percentages
    expected_amount = round(7500 * 0.15, 2)  # 1125
    
    if signing.get("amount") != expected_amount:
        log_fail(f"signing_bonus amount should be {expected_amount}, got {signing.get('amount')}", resp2)
    
    if signing.get("percentage") != 0.15:
        log_fail(f"signing_bonus percentage should be 0.15, got {signing.get('percentage')}", resp2)
    
    if signing.get("status") != "pending":
        log_fail(f"signing_bonus status should be 'pending', got '{signing.get('status')}'", resp2)
    
    if recurring.get("amount") != expected_amount:
        log_fail(f"recurring amount should be {expected_amount}, got {recurring.get('amount')}", resp2)
    
    if recurring.get("percentage") != 0.15:
        log_fail(f"recurring percentage should be 0.15, got {recurring.get('percentage')}", resp2)
    
    if recurring.get("status") != "pending":
        log_fail(f"recurring status should be 'pending', got '{recurring.get('status')}'", resp2)
    
    # Verify affiliate stats
    affiliate = data.get("affiliate", {})
    if affiliate.get("active_clients") != 1:
        log_fail(f"Expected active_clients=1, got {affiliate.get('active_clients')}", resp2)
    
    if affiliate.get("tier") != "bronze":
        log_fail(f"Expected tier='bronze', got '{affiliate.get('tier')}'", resp2)
    
    if affiliate.get("rate") != 0.15:
        log_fail(f"Expected rate=0.15, got {affiliate.get('rate')}", resp2)
    
    expected_pending = 2250  # 1125 + 1125
    if affiliate.get("total_pending") != expected_pending:
        log_fail(f"Expected total_pending={expected_pending}, got {affiliate.get('total_pending')}", resp2)
    
    log_pass(f"Commissions verified: 2 entries (signing_bonus + recurring), both $1125 @ 15%, status=pending")
    log_pass(f"Affiliate stats: active_clients=1, tier=bronze, rate=0.15, total_pending=$2250")

def test_step_8():
    """Step 8: POST /api/admin/affiliates/commissions/run (idempotency test)"""
    log_step(8, "POST /api/admin/affiliates/commissions/run")
    
    resp = make_request("POST", "/admin/affiliates/commissions/run", data={}, auth=True)
    data = resp.json()
    
    # Verify response structure
    if "period" not in data:
        log_fail("Response missing 'period' field", resp)
    
    if "inserted" not in data or "skipped" not in data:
        log_fail("Response missing 'inserted' or 'skipped' fields", resp)
    
    # Since we already inserted recurring commission in step 7, inserted should be 0
    if data["inserted"] != 0:
        log_fail(f"Expected inserted=0 (idempotency), got {data['inserted']}", resp)
    
    if data["skipped"] < 1:
        log_fail(f"Expected skipped>=1, got {data['skipped']}", resp)
    
    log_pass(f"Idempotency verified: period={data['period']}, inserted=0, skipped={data['skipped']}")

def test_step_9():
    """Step 9: GET /api/admin/affiliates/commissions/all?status=pending"""
    global comm_1
    
    log_step(9, "GET /api/admin/affiliates/commissions/all?status=pending")
    
    resp = make_request("GET", "/admin/affiliates/commissions/all", params={"status": "pending"}, auth=True)
    data = resp.json()
    
    if "commissions" not in data:
        log_fail("Response missing 'commissions' field", resp)
    
    commissions = data["commissions"]
    
    # Find commissions for our affiliate
    aff_comms = [c for c in commissions if c.get("affiliate_id") == aff_a]
    
    if len(aff_comms) < 2:
        log_fail(f"Expected at least 2 pending commissions for affiliate {aff_a}, got {len(aff_comms)}", resp)
    
    # Verify hydration (affiliate_name, affiliate_email, affiliate_ref_code)
    for comm in aff_comms:
        if "affiliate_name" not in comm:
            log_fail("Commission missing 'affiliate_name' field", resp)
        if "affiliate_email" not in comm:
            log_fail("Commission missing 'affiliate_email' field", resp)
        if "affiliate_ref_code" not in comm:
            log_fail("Commission missing 'affiliate_ref_code' field", resp)
    
    # Capture one signing_bonus commission id
    signing = next((c for c in aff_comms if c.get("type") == "signing_bonus"), None)
    if not signing:
        log_fail("No signing_bonus commission found for affiliate", resp)
    
    comm_1 = signing["id"]
    log_pass(f"Found {len(aff_comms)} pending commissions for affiliate, all hydrated with name/email/ref_code")
    log_pass(f"Captured signing_bonus commission id={comm_1}")

def test_step_10():
    """Step 10: PATCH /api/admin/affiliates/commissions/{comm_id} - mark as paid"""
    log_step(10, f"PATCH /api/admin/affiliates/commissions/{comm_1}")
    
    payload = {
        "status": "paid",
        "payout_method": "stripe",
        "payout_reference": "po_123456789"
    }
    
    resp = make_request("PATCH", f"/admin/affiliates/commissions/{comm_1}", data=payload, auth=True)
    data = resp.json()
    
    if "commission" not in data:
        log_fail("Response missing 'commission' field", resp)
    
    commission = data["commission"]
    
    if commission.get("status") != "paid":
        log_fail(f"Expected status='paid', got '{commission.get('status')}'", resp)
    
    if "paid_at" not in commission:
        log_fail("Commission missing 'paid_at' field", resp)
    
    log_pass(f"Commission marked as paid, paid_at set")
    
    # Verify totals updated
    log_step("10b", "GET /api/admin/affiliates - verify totals.paid_out")
    
    resp2 = make_request("GET", "/admin/affiliates", auth=True)
    data2 = resp2.json()
    
    if "totals" not in data2:
        log_fail("Response missing 'totals' field", resp2)
    
    totals = data2["totals"]
    if totals.get("paid_out", 0) < 1125:
        log_fail(f"Expected totals.paid_out >= 1125, got {totals.get('paid_out')}", resp2)
    
    # Verify affiliate's total_paid
    affiliates = data2.get("affiliates", [])
    aff = next((a for a in affiliates if a["id"] == aff_a), None)
    
    if not aff:
        log_fail(f"Affiliate {aff_a} not found in list", resp2)
    
    if aff.get("total_paid") != 1125:
        log_fail(f"Expected affiliate total_paid=1125, got {aff.get('total_paid')}", resp2)
    
    log_pass(f"Totals verified: totals.paid_out >= $1125, affiliate.total_paid = $1125")

def test_step_11():
    """Step 11: Tier auto-promotion - create 3 more referrals and mark as won"""
    log_step(11, "Tier auto-promotion: create 3 more inquiries with same ref_code")
    
    leads = [
        {
            "name": "Emily Rodriguez",
            "email": "emily.rodriguez@techstartup.io",
            "service_interest": "Ignite Tier",
            "message": "Early stage startup looking for digital marketing support"
        },
        {
            "name": "Michael Thompson",
            "email": "michael.thompson@growthco.com",
            "service_interest": "Accelerate Tier",
            "message": "Need comprehensive marketing strategy and execution"
        },
        {
            "name": "Lisa Wang",
            "email": "lisa.wang@innovatetech.com",
            "service_interest": "Dominate Tier",
            "message": "Enterprise client seeking full-stack marketing services"
        }
    ]
    
    referral_ids = []
    
    for i, lead in enumerate(leads, start=2):
        # Create inquiry
        payload = {**lead, "ref_code": ref_a}
        resp = make_request("POST", "/inquiries", data=payload)
        log_pass(f"Inquiry {i} created: {lead['email']}")
        
        # Get referral id
        resp2 = make_request("GET", f"/admin/affiliates/{aff_a}", auth=True)
        data = resp2.json()
        referrals = data.get("referrals", [])
        ref = next((r for r in referrals if r.get("lead_email") == lead["email"]), None)
        
        if not ref:
            log_fail(f"Referral for {lead['email']} not found")
        
        referral_ids.append(ref["id"])
        
        # Mark as won
        win_payload = {
            "client_mrr": 2500,
            "client_company": lead["name"].split()[1] + " Inc"
        }
        resp3 = make_request("POST", f"/admin/affiliates/referrals/{ref['id']}/win", data=win_payload, auth=True)
        log_pass(f"Referral {i} marked as won: {lead['email']}, MRR=$2500")
    
    # Verify tier promotion to Silver
    log_step("11b", f"GET /api/admin/affiliates/{aff_a} - verify tier=silver")
    
    resp = make_request("GET", f"/admin/affiliates/{aff_a}", auth=True)
    data = resp.json()
    affiliate = data.get("affiliate", {})
    
    if affiliate.get("active_clients") != 4:
        log_fail(f"Expected active_clients=4, got {affiliate.get('active_clients')}", resp)
    
    if affiliate.get("tier") != "silver":
        log_fail(f"Expected tier='silver', got '{affiliate.get('tier')}'", resp)
    
    if affiliate.get("rate") != 0.20:
        log_fail(f"Expected rate=0.20, got {affiliate.get('rate')}", resp)
    
    if affiliate.get("tier_name") != "Silver":
        log_fail(f"Expected tier_name='Silver', got '{affiliate.get('tier_name')}'", resp)
    
    log_pass(f"Tier auto-promotion verified: active_clients=4, tier=silver, rate=0.20, tier_name=Silver")
    
    # Verify 4th win has signing_bonus at 0.20 rate
    commissions = data.get("commissions", [])
    
    # Find the most recent signing_bonus (should be for the 4th referral)
    signing_bonuses = [c for c in commissions if c.get("type") == "signing_bonus"]
    signing_bonuses.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    if len(signing_bonuses) < 4:
        log_fail(f"Expected at least 4 signing_bonus commissions, got {len(signing_bonuses)}", resp)
    
    latest_signing = signing_bonuses[0]
    expected_amount = round(2500 * 0.20, 2)  # 500
    
    if latest_signing.get("amount") != expected_amount:
        log_fail(f"Latest signing_bonus amount should be {expected_amount}, got {latest_signing.get('amount')}", resp)
    
    if latest_signing.get("percentage") != 0.20:
        log_fail(f"Latest signing_bonus percentage should be 0.20, got {latest_signing.get('percentage')}", resp)
    
    log_pass(f"4th win signing_bonus verified: amount=$500, percentage=0.20")

def test_step_12():
    """Step 12: Reject an application"""
    global app_z
    
    log_step(12, "POST /api/affiliates/apply for new partner")
    
    payload = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "why_join": "Looking for side income",
        "phone": "+15559876543",
        "experience": "No prior experience",
        "channels": "social media",
        "audience_size": "500",
        "expected_clients_per_month": "1"
    }
    
    resp = make_request("POST", "/affiliates/apply", data=payload)
    data = resp.json()
    app_z = data["id"]
    log_pass(f"New application created: id={app_z}")
    
    # Get pending applications
    log_step("12b", "GET /api/admin/affiliates/applications?status=pending")
    resp2 = make_request("GET", "/admin/affiliates/applications", params={"status": "pending"}, auth=True)
    data2 = resp2.json()
    
    apps = data2.get("applications", [])
    found = next((a for a in apps if a["id"] == app_z), None)
    
    if not found:
        log_fail(f"Application {app_z} not found in pending list", resp2)
    
    log_pass(f"Application {app_z} found in pending list")
    
    # Reject application
    log_step("12c", f"POST /api/admin/affiliates/applications/{app_z}/reject")
    
    reject_payload = {"note": "Weak fit - insufficient experience and network"}
    resp3 = make_request("POST", f"/admin/affiliates/applications/{app_z}/reject", data=reject_payload, auth=True)
    log_pass(f"Application {app_z} rejected")
    
    # Verify in rejected list
    log_step("12d", "GET /api/admin/affiliates/applications?status=rejected")
    resp4 = make_request("GET", "/admin/affiliates/applications", params={"status": "rejected"}, auth=True)
    data4 = resp4.json()
    
    rejected_apps = data4.get("applications", [])
    found_rejected = next((a for a in rejected_apps if a["id"] == app_z), None)
    
    if not found_rejected:
        log_fail(f"Application {app_z} not found in rejected list", resp4)
    
    if found_rejected.get("status") != "rejected":
        log_fail(f"Expected status='rejected', got '{found_rejected.get('status')}'", resp4)
    
    log_pass(f"Application {app_z} verified in rejected list with status='rejected'")

def test_step_13():
    """Step 13: GET /api/affiliates/track?ref=<ref_code> (no auth)"""
    log_step(13, f"GET /api/affiliates/track?ref={ref_a}")
    
    resp = make_request("GET", "/affiliates/track", params={"ref": ref_a})
    data = resp.json()
    
    if data.get("ok") != True:
        log_fail(f"Expected {{ok: true}}, got {data}", resp)
    
    log_pass("Track endpoint returned {ok: true}")
    
    # Verify clicks incremented
    log_step("13b", "GET /api/admin/affiliates - verify clicks >= 1")
    
    resp2 = make_request("GET", "/admin/affiliates", auth=True)
    data2 = resp2.json()
    
    affiliates = data2.get("affiliates", [])
    aff = next((a for a in affiliates if a["id"] == aff_a), None)
    
    if not aff:
        log_fail(f"Affiliate {aff_a} not found", resp2)
    
    if aff.get("clicks", 0) < 1:
        log_fail(f"Expected clicks >= 1, got {aff.get('clicks')}", resp2)
    
    log_pass(f"Affiliate clicks verified: clicks={aff.get('clicks')}")

def main():
    """Run all test steps."""
    print("\n" + "="*80)
    print("AFFILIATE / PARTNER PROGRAM BACKEND TEST SUITE")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("="*80)
    
    try:
        test_step_1()
        test_step_2()
        test_step_3()
        test_step_4()
        test_step_5()
        test_step_6()
        test_step_7()
        test_step_8()
        test_step_9()
        test_step_10()
        test_step_11()
        test_step_12()
        test_step_13()
        
        print("\n" + "="*80)
        print("🎉 ALL 13 STEPS PASSED!")
        print("="*80)
        print("\nSummary:")
        print(f"  - Application flow: ✅")
        print(f"  - Referral tracking: ✅")
        print(f"  - Commission calculation: ✅")
        print(f"  - Tier auto-promotion: ✅")
        print(f"  - Payment processing: ✅")
        print(f"  - Click tracking: ✅")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
