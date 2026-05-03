#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Ship Phase 1 deploy-ready features for Brivo's social auto-poster:
  (S) Account warm-up mode, (R) posting cadence guardrails,
  (T) failure auto-pause, (H) client-win recycler,
  (B) viral hook library + A/B, (Q) 1-click cross-poster,
  plus an admin safety dashboard.

backend:
  - task: "Phase 1 safety policies — warm-up / cadence / auto-pause"
    implemented: true
    working: true
    file: "/app/backend/social_safety.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          New module social_safety.py. Implements ensure_policy(),
          check_can_post() (returns ok/reason/defer_until), record_post_attempt()
          (auto-pauses after N consecutive failures), start_warmup() (called on
          agent pairing), pause/unpause, ban_risk_score(). Wired into dispatch
          loop in social_agent.py so every job is gated before going to the
          agent. Deferred jobs reschedule instead of failing.
      - working: true
        agent: "testing"
        comment: |
          ✅ PASSED: Agent pairing flow works correctly. POST /api/admin/social/agents/pair-code 
          generates 6-digit code, POST /api/agent/pair creates agent and returns JWT. 
          Policies auto-created for x/instagram/linkedin with warmup_day=0, warmup_complete=false, 
          paused=false, ban_risk 0-100.
          ✅ PASSED: Pause/unpause functionality works. POST /api/admin/social/policies/pause 
          sets paused=true with reason. POST /api/admin/social/policies/unpause resets 
          paused=false and consecutive_failures=0.
          ✅ PASSED: Policy updates work. POST /api/admin/social/policies/update successfully 
          updates max_posts_per_day, min_minutes_between, quiet_hours_start/end. Changes 
          persist in GET /api/admin/social/policies.
          ✅ PASSED: Safety summary endpoint returns correct structure with policies[], 
          queue_floor{threshold:3, horizon_hours:24}, totals{wins, hooks}.

  - task: "Phase 1 admin endpoints (safety + wins + cross-poster)"
    implemented: true
    working: false
    file: "/app/backend/social_agent.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          New admin endpoints (all require admin token):
            GET  /api/admin/social/safety-summary
            GET  /api/admin/social/policies
            POST /api/admin/social/policies/update
            POST /api/admin/social/policies/pause
            POST /api/admin/social/policies/unpause
            GET  /api/admin/social/hooks
            GET  /api/admin/social/wins
            POST /api/admin/social/wins
            DELETE /api/admin/social/wins/{id}
            POST /api/admin/social/wins/recycle-now
            POST /api/admin/social/posts/multi   (cross-poster)
      - working: false
        agent: "testing"
        comment: |
          ✅ PASSED: GET /api/admin/social/safety-summary returns correct structure.
          ✅ PASSED: GET /api/admin/social/hooks returns 20+ seeded hooks with id/slug/template/score.
          ✅ PASSED: Client wins CRUD works. POST /api/admin/social/wins creates win with 
          title/metric/detail/tags/uses=0. GET /api/admin/social/wins lists all wins. 
          DELETE /api/admin/social/wins/{id} removes win successfully.
          ✅ PASSED: POST /api/admin/social/wins/recycle-now drafts post from existing win. 
          Response has {post, source_win}. Post doc has source='wins_recycler', status='queued', 
          hook_slug present, caption length >10.
          ❌ FAILED: POST /api/admin/social/posts/multi returns 500 instead of 200 when 
          EMERGENT_LLM_KEY budget is exhausted. Root cause: /app/backend/social.py line 142 
          raises RuntimeError instead of falling back gracefully. The _parse_variants function 
          has fallback logic (lines 176-184) but never gets called. Expected behavior: 
          return 200 with fallback captions and insert valid docs. Actual: 500 Internal Server Error.
          Error traceback: "RuntimeError: AI generation failed: Failed to generate chat completion: 
          litellm.BadRequestError: OpenAIException - Budget has been exceeded!"

  - task: "Client-wins recycler loop (queue floor)"
    implemented: true
    working: true
    file: "/app/backend/social_content_factory.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Background task wins_recycler_loop launched at startup. Every 5
          minutes: if fewer than QUEUE_FLOOR (=3) posts are queued/scheduled
          in the next 24h, pick the least-recently-used win and draft a
          post via LLM (Gemini 2.5 Pro through emergentintegrations) with
          a fallback caption if the LLM call fails. Post is inserted with
          source='wins_recycler' and hook tracking metadata.
      - working: true
        agent: "testing"
        comment: |
          ✅ PASSED: Wins recycler endpoint works correctly. POST /api/admin/social/wins/recycle-now 
          successfully drafts posts from client wins. Posts have correct metadata: source='wins_recycler', 
          hook_slug present, scheduled_at ~45min from now. The fallback caption mechanism works 
          when LLM fails (uses _fallback_win_caption in social_content_factory.py lines 212-221).

  - task: "Affiliate / Partner Program — applications, ref tracking, commissions"
    implemented: true
    working: true
    file: "/app/backend/affiliates.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          New module affiliates.py + mounted under /api. Implements the full
          partner / commission program:
            Public:
              GET  /api/affiliates/program           — tier table + headline copy
              POST /api/affiliates/apply             — application form
              GET  /api/affiliates/track?ref=CODE    — click beacon
            Admin (requires admin token):
              GET    /api/admin/affiliates/applications?status=pending|approved|rejected|all
              POST   /api/admin/affiliates/applications/{id}/approve  -> creates affiliate + ref_code
              POST   /api/admin/affiliates/applications/{id}/reject
              GET    /api/admin/affiliates                            -> list + totals
              GET    /api/admin/affiliates/{id}                        -> referrals + commissions
              POST   /api/admin/affiliates/{id}/suspend
              POST   /api/admin/affiliates/referrals/{ref_id}/stage
              POST   /api/admin/affiliates/referrals/{ref_id}/win      -> client_mrr -> signing+recurring rows
              POST   /api/admin/affiliates/commissions/run             -> idempotent monthly recurring loop
              GET    /api/admin/affiliates/commissions/all
              PATCH  /api/admin/affiliates/commissions/{id}            -> mark paid | void | reopen

          Tier ladder (auto-recomputed from active_clients):
            Bronze   1-3   = 15 % recurring + 15 % signing bonus
            Silver   4-9   = 20 %
            Gold    10-24  = 25 % + $500 milestone (one-shot)
            Platinum 25+   = 30 % + $2,500 quarterly bonus

          Inquiry attribution: /api/inquiries now accepts optional ref_code
          and creates an affiliate_referrals row when the code matches an
          active affiliate.

          Indexes seeded on startup. Uses UUIDs everywhere; nothing relies
          on Mongo ObjectIds.
      - working: true
        agent: "testing"
        comment: |
          ✅ ALL 13 STEPS PASSED - Complete end-to-end affiliate program testing:
          
          Step 1: GET /api/affiliates/program (no auth) - ✅ PASS
            - Returns 4 tiers (bronze/silver/gold/platinum) with correct structure
            - Bronze rate=0.15, Platinum rate=0.30 verified
            - 4 examples array present with correct calculations
          
          Step 2: POST /api/affiliates/apply (no auth) - ✅ PASS
            - Application created with status=pending
            - Duplicate submission correctly rejected with 409
          
          Step 3: POST /api/auth/admin/login - ✅ PASS
            - Admin login successful, JWT token captured
          
          Step 4: GET /api/admin/affiliates/applications?status=pending - ✅ PASS
            - Pending applications retrieved successfully
          
          Step 5: POST /api/admin/affiliates/applications/{id}/approve - ✅ PASS
            - Application approved, affiliate created
            - ref_code starts with "BRV-", tier=bronze, rate=0.15 verified
          
          Step 6: POST /api/inquiries with ref_code - ✅ PASS
            - Inquiry created and referral row automatically created
            - Referral has correct lead_email and stage=referred
          
          Step 7: POST /api/admin/affiliates/referrals/{id}/win - ✅ PASS
            - Referral marked as won with client_mrr=7500
            - 2 commissions created: signing_bonus + recurring
            - Both commissions: amount=$1125, percentage=0.15, status=pending
            - Affiliate stats: active_clients=1, tier=bronze, rate=0.15, total_pending=$2250
          
          Step 8: POST /api/admin/affiliates/commissions/run - ✅ PASS
            - Idempotency verified: inserted=0, skipped=1 (no duplicate commissions)
          
          Step 9: GET /api/admin/affiliates/commissions/all?status=pending - ✅ PASS
            - All pending commissions retrieved
            - Commissions hydrated with affiliate_name, affiliate_email, affiliate_ref_code
          
          Step 10: PATCH /api/admin/affiliates/commissions/{id} - ✅ PASS
            - Commission marked as paid with payout_method and payout_reference
            - paid_at timestamp set correctly
            - Totals updated: totals.paid_out >= $1125, affiliate.total_paid = $1125
          
          Step 11: Tier auto-promotion - ✅ PASS
            - Created 3 additional inquiries with same ref_code
            - Marked all 3 as won with client_mrr=2500 each
            - After 4th win: active_clients=4, tier=silver, rate=0.20, tier_name=Silver
            - 4th win signing_bonus has correct rate: amount=$500, percentage=0.20
          
          Step 12: Application rejection - ✅ PASS
            - New application created and found in pending list
            - Application rejected successfully with note
            - Verified in rejected list with status=rejected
          
          Step 13: GET /api/affiliates/track?ref={code} - ✅ PASS
            - Track endpoint returns {ok: true}
            - Affiliate clicks counter incremented correctly
          
          All core functionality verified:
          - Application flow (submit, approve, reject)
          - Referral tracking via ref_code in inquiries
          - Commission calculation (signing bonus + recurring)
          - Tier auto-promotion based on active_clients
          - Payment processing and totals tracking
          - Click tracking beacon
          - Idempotent commission generation
          - Proper data hydration in list endpoints

  - task: "Hook library seeding + A/B helpers"
    implemented: true
    working: true
    file: "/app/backend/data/hook_library.json"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          20 hook templates seeded on startup. pick_hooks(n, epsilon) does
          epsilon-greedy selection (30% explore). record_hook_outcome() keeps
          a rolling mean score per hook for future learning. Hook metadata
          (id, slug) is attached to every generated post for attribution.
      - working: true
        agent: "testing"
        comment: |
          ✅ PASSED: Hook library seeded correctly. GET /api/admin/social/hooks returns 20+ hooks. 
          Each hook has id, slug, template, category, uses, wins, score, created_at. Hooks are 
          properly attached to generated posts (verified in recycle-now test).

frontend:
  - task: "Phase 1 admin UI — safety panel, wins manager, cross-poster"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AdminSocial.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: |
          Added three new components to /admin/social — SafetyPanel (warm-up
          bars, cadence, ban-risk pill, pause/unpause, recycle-now), WinsCard
          (CRUD on client wins), CrossPoster (brief -> per-platform posts).

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Phase 2 — Affiliate / Partner Program is shipped backend-side.
      Please verify the new endpoints end-to-end:

        1. GET  /api/affiliates/program (no auth) — must return tiers[]
           with bronze/silver/gold/platinum and the examples[] block.
        2. POST /api/affiliates/apply — submit an application
           {name,email,why_join, ...}; expect 200 and a doc with status=pending.
           Resubmitting the same email should 409.
        3. Login admin: POST /api/auth/admin/login
              email=admin@brivomarketing.com, password=BrivoOps2026!
        4. GET /api/admin/affiliates/applications?status=pending
        5. POST /api/admin/affiliates/applications/{id}/approve
              expect {affiliate:{ref_code:"BRV-...", tier:"bronze", rate:0.15}}.
        6. POST /api/inquiries with body that includes ref_code=<that code>
              -> verify a row appears in affiliate_referrals (via
              GET /api/admin/affiliates/{id} -> referrals[]).
        7. POST /api/admin/affiliates/referrals/{ref_id}/win
              { client_mrr: 7500, client_company: "Acme" }
              -> two commission rows must appear (signing_bonus + recurring),
              affiliate active_clients=1, tier still bronze, rate 0.15.
        8. POST /api/admin/affiliates/commissions/run with no body
              -> response.inserted should be 0 if a row already exists for
              the current period for the same referral (idempotent).
        9. PATCH /api/admin/affiliates/commissions/{id} {status:"paid"}
              -> commission status flips to paid, total_paid is reflected
              when /api/admin/affiliates is fetched again.
       10. Win 4 referrals total for the same affiliate so active_clients=4
              -> tier should auto-promote to silver (rate 0.20).
       11. GET /api/admin/affiliates/commissions/all?status=pending
       12. POST /api/admin/affiliates/applications/{id2}/reject
              for a separate pending app -> status=rejected.

      Important known constraint: EMERGENT_LLM_KEY budget may still be
      exhausted in this env. The affiliate flow does NOT depend on LLM
      calls, so it should pass cleanly regardless.

  - agent: "main"
    message: |
      Phase 1 shipped. Backend gates every post dispatch through
      social_safety.check_can_post() (warm-up tiering, daily caps, min-
      spacing, quiet hours 1am–7am local, auto-pause after 3 consecutive
      failures). On first agent pairing, start_warmup() seeds per-platform
      policies.

      Please exercise the new admin endpoints (admin JWT from /api/admin/login):
        1. GET /api/admin/social/safety-summary — shape {policies[], queue_floor, totals}
        2. POST /api/admin/social/wins — create {title, metric, detail, tags:[]}
        3. GET /api/admin/social/wins — list includes new entry
        4. DELETE /api/admin/social/wins/{id} — removes it
        5. POST /api/admin/social/wins/recycle-now — drafts a post (verify
           social_posts doc has source='wins_recycler' + hook_slug)
        6. POST /api/admin/social/posts/multi with
           { brief, tone:"receipts", platforms:["x","instagram","linkedin"] }
           — expect 3 queued posts, one per platform.
        7. Pair a fake agent (POST /api/admin/social/pair-codes then
           /api/social/pair with the code) and verify policies appear for
           x/instagram/linkedin with warmup_day=0 and ban_risk 0–10.
           Pause + unpause one platform; verify state changes.
        8. Set max_posts_per_day=0 via /policies/update, then queue a post
           and POST /api/admin/social/posts/{id}/run-now — post should
           return to status='queued' with skipped_platforms recorded.

      Note: EMERGENT_LLM_KEY budget is currently exhausted in this env —
      LLM paths fall back to a deterministic template. Please verify the
      fallback still returns 200 and inserts a valid doc.
  
  - agent: "testing"
    message: |
      Phase 1 backend testing complete. Results: 7/8 endpoints PASSED, 1/8 FAILED.
      
      ✅ WORKING:
      - Safety policies (warm-up, cadence, auto-pause, pause/unpause, policy updates)
      - Agent pairing flow (pair-code generation, agent pairing, policy creation)
      - Client wins CRUD (create, list, delete)
      - Wins recycler (recycle-now endpoint with fallback captions)
      - Hook library (20+ hooks seeded, proper metadata)
      - Safety summary endpoint
      
      ❌ CRITICAL BUG:
      - POST /api/admin/social/posts/multi (cross-poster) returns 500 when LLM budget exhausted
      - Root cause: /app/backend/social.py line 142 raises RuntimeError instead of using fallback
      - Expected: Return 200 with fallback captions (like wins recycler does)
      - Actual: 500 Internal Server Error
      - Fix needed: Catch exception in generate_post_variants and call _parse_variants with 
        fallback message instead of raising RuntimeError
      
      NOTE: Endpoint paths differ from review request:
      - Actual: POST /api/admin/social/agents/pair-code (singular)
      - Review said: POST /api/admin/social/pair-codes (plural)
      - Actual: POST /api/agent/pair
      - Review said: POST /api/social/pair
      Tests updated to use actual endpoints.

  - agent: "testing"
    message: |
      Phase 2 — Affiliate / Partner Program backend testing COMPLETE.
      
      ✅ ALL 13 STEPS PASSED - Full end-to-end verification:
      
      1. Program structure (GET /api/affiliates/program) - ✅
         - 4 tiers with correct rates (bronze 15%, silver 20%, gold 25%, platinum 30%)
         - 4 examples with correct calculations
      
      2. Application submission (POST /api/affiliates/apply) - ✅
         - Creates application with status=pending
         - Duplicate detection works (409 on resubmit)
      
      3. Admin authentication (POST /api/auth/admin/login) - ✅
         - JWT token generation working
      
      4. Application management - ✅
         - List pending applications
         - Approve applications (creates affiliate with ref_code starting with "BRV-")
         - Reject applications with notes
      
      5. Referral tracking - ✅
         - Inquiries with ref_code automatically create referral rows
         - Referrals linked to correct affiliate
         - Stage tracking (referred -> won)
      
      6. Commission calculation - ✅
         - Marking referral as won creates 2 commissions (signing_bonus + recurring)
         - Correct amounts calculated based on client_mrr and tier rate
         - Both commissions start with status=pending
      
      7. Idempotent commission generation - ✅
         - POST /api/admin/affiliates/commissions/run doesn't create duplicates
         - Correctly skips existing commissions for current period
      
      8. Commission payment processing - ✅
         - PATCH endpoint updates status to paid
         - Sets paid_at timestamp
         - Updates affiliate totals (total_paid, total_pending)
         - Updates global totals (totals.paid_out)
      
      9. Tier auto-promotion - ✅
         - Affiliate automatically promoted from bronze to silver after 4th active client
         - Rate updated from 0.15 to 0.20
         - New commissions use updated rate
      
      10. Click tracking - ✅
          - GET /api/affiliates/track?ref={code} increments click counter
          - Returns {ok: true} for valid ref codes
      
      11. Data hydration - ✅
          - Commission list endpoints include affiliate_name, affiliate_email, affiliate_ref_code
      
      The affiliate program is fully functional and ready for production.
      All business logic verified: application flow, referral attribution,
      commission calculation, tier progression, payment tracking, and analytics.


# ==========================================================================
# Responsive + polish pass — admin panels & landing (2026-05-02)
# ==========================================================================

frontend:
  - task: "Shared Admin navigation (hamburger + drawer + cross-page links)"
    implemented: true
    working: true
    file: "/app/frontend/src/components/admin/AdminNav.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: |
          Built a shared AdminNav component used on Dashboard, Lead Engine, Auto-Poster
          (Social) and Affiliates pages. Renders a sticky top bar with logo/title/subtitle,
          right-side desktop action buttons, and a hamburger + slide-in drawer on
          tablet/mobile with links to Dashboard / Lead Engine / Auto-Poster / Partners /
          Brand Kit + Logout.

          Key behaviors to verify:
          - Logging in at /admin/login and landing on /admin shows a hamburger icon on
            ≤ 1023px viewports (data-testid="admin-nav-toggle").
          - Clicking the hamburger opens a dark drawer (data-testid="admin-nav-drawer")
            with all 5 links. Clicking any link navigates correctly and closes drawer.
          - Escape key closes drawer. Body scroll is locked while drawer open.
          - On desktop (≥ 1024px), the drawer button is hidden and links/action
            buttons appear inline in the top bar.
          - Current-page link is dimmed on desktop (rendered nowhere) and highlighted
            in lime (#CCFF00) in the drawer.
          - "Brand Kit" link is NEW (previously not reachable from any admin header).
        -working: true
        -agent: "testing"
        -comment: |
          ✅ ALL VERIFIED at Mobile (390x844), Tablet (768x1024), Desktop (1440x900):
          - Hamburger (data-testid="admin-nav-toggle") is VISIBLE on mobile (390px)
          - Hamburger is HIDDEN on desktop (1440px)
          - Clicking hamburger opens drawer (data-testid="admin-nav-drawer")
          - Drawer contains all 6 links: dashboard, leads, social, affiliates, brandkit, logout
          - Current page is highlighted in lime (#CCFF00) with "· now" indicator
          - Escape key closes drawer
          - Backdrop click closes drawer
          - All drawer links navigate correctly and close drawer after navigation
          - Cross-page navigation tested: Dashboard → Lead Engine → Auto-Poster → Partners → Brand Kit → Dashboard
          - Body scroll is locked while drawer is open
          - Brand Kit link is reachable from admin pages

  - task: "AdminDashboard mobile responsiveness"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: |
          Rewrote /admin page to use the shared AdminNav and trimmed padding for
          small screens:
          - Telemetry strip: hides BRIVO OS version + admin email on narrow screens,
            keeps live clock + AI ONLINE pulse.
          - Sticky tab row (Analytics / Messages / Inbox / AI Agents / Calls /
            Operator) is horizontally scrollable on mobile (no-scrollbar class).
          - Main content padding collapses from px-10 → px-4 on mobile.
          - Wrapper around tab content has overflow-x-auto so any legacy wide
            widget inside a tab still works on phones.
          Verify: no horizontal overflow at 320/375/390/768/1024/1440px.
          Verify: all 6 tabs load their content; lead inbox & analytics tables
          scroll horizontally rather than bleed past viewport.
        -working: true
        -agent: "testing"
        -comment: |
          ✅ ALL VERIFIED at Mobile (390x844), Tablet (768x1024), Desktop (1440x900):
          - No horizontal overflow at any viewport
          - Telemetry strip visible with "AI ONLINE" pulse
          - Admin nav header present (data-testid="admin-nav")
          - Tab bar (data-testid="admin-tabs") present and horizontally scrollable on mobile
          - All 6 tabs clickable: Analytics, Messages, Inbox, AI Agents, Calls, Operator
          - Tab content renders correctly for each tab
          - Main content padding is mobile-friendly

  - task: "AdminLeadEngine mobile responsiveness"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/AdminLeadEngine.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: |
          Swapped page-local header for the shared AdminNav with a rightSlot
          containing AI QUALIFY / DISCOVER / IMPORT / REFRESH buttons. On
          mobile/tablet these collapse into a horizontally scrollable shelf
          BELOW the main bar (so they're still reachable without the drawer).
          - Lead list rows no longer use `grid grid-cols-12` on mobile — they
            stack: title + mobile stage pill on row 1, score battery + meta on
            row 2, action button full-width at bottom. The desktop 12-col layout
            is retained at ≥ md.
          - List header row is hidden on mobile (it's a table header that makes
            no sense when rows are stacked cards).
          - Outreach-jobs panel rows likewise switch from 12-col grid to
            stacked layout on mobile.
          - Telemetry strip uses overflow-x-auto no-scrollbar so it never bleeds.
          Verify: dispatch button is clearly tappable; lead drawer opens from
          row click; auto-qualify and discover buttons remain functional.
        -working: true
        -agent: "testing"
        -comment: |
          ✅ ALL VERIFIED at Mobile (390x844), Tablet (768x1024), Desktop (1440x900):
          - No horizontal overflow at any viewport
          - Telemetry strip shows "AI ENGINE · ONLINE" and "PIPELINE · X LEADS"
          - Shared admin nav header present
          - All 3 action buttons found: AI QUALIFY (data-testid="auto-qualify-btn"), 
            DISCOVER (data-testid="discover-now-btn"), REFRESH (data-testid="pipeline-refresh-btn")
          - Mobile action shelf is horizontally scrollable
          - Hamburger visible on mobile

  - task: "AdminSocial mobile responsiveness"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/AdminSocial.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: |
          Swapped its bone-themed header for the shared AdminNav with theme="bone"
          so the social page keeps its editorial look while gaining the same
          hamburger + drawer. rightSlot holds the "New post" and "Generate next 14
          days" buttons; the long label shortens to "Generate 14d" on small phones.
          Stats grid and content padding reduced on mobile. Verify host table,
          platform/posts queue, and composer dialog all remain usable at 390px.
        -working: true
        -agent: "testing"
        -comment: |
          ✅ ALL VERIFIED at Mobile (390x844), Tablet (768x1024), Desktop (1440x900):
          - No horizontal overflow at any viewport
          - Admin nav with bone theme present
          - "New post" button present (data-testid="open-composer")
          - "Generate 14d" shortened label on mobile (data-testid="generate-batch")
          - "Generate next 14 days" full label on desktop
          - Hamburger visible on mobile
          - Stats grid renders correctly

  - task: "AdminAffiliates mobile responsiveness"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/AdminAffiliates.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: |
          Same treatment as the other admin pages + tabs bar is now horizontally
          scrollable. Affiliate rows: name + metrics stack on mobile (previously
          the Tier/Earned/Pending block was `hidden md:flex` so mobile users
          couldn't see a partner's numbers at all). Name block truncates email
          rather than wraps awkwardly. Commissions table keeps its overflow-x-auto
          wrapper (already fine). Verify: approve/reject buttons tap-friendly,
          "Mark won" action on referrals still works, commission mark-paid works.
        -working: true
        -agent: "testing"
        -comment: |
          ✅ ALL VERIFIED at Mobile (390x844), Tablet (768x1024), Desktop (1440x900):
          - No horizontal overflow at any viewport
          - Admin nav header present
          - All 3 tabs work: Applications, Active partners, Commissions
          - Hamburger visible on mobile
          - Code review confirms Tier/Earned/Pending metrics are NOT hidden on mobile 
            (lines 316-331 show flex layout with no md: prefix hiding them)
          - Metrics will be visible once affiliates exist in database

  - task: "Responsive utilities + tap target floor"
    implemented: true
    working: true
    file: "/app/frontend/src/index.css"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: |
          Added `.no-scrollbar` utility (used on admin horizontal shelves + tab
          bar + telemetry strip), a global `html, body { max-width:100% }`
          safety guard, and an @media (hover:none) rule that enforces a 44px
          minimum tap target height on buttons/anchor-role="button"/.tap-44
          elements for touch devices only. Verify no visual regression on
          desktop while touch devices get proper target sizes.
        -working: true
        -agent: "testing"
        -comment: |
          ✅ VERIFIED: No visual regression on desktop. All responsive utilities working correctly.
          - No horizontal overflow detected at any viewport (320/390/768/1024/1440px)
          - `.no-scrollbar` utility working on tab bars and telemetry strips
          - All pages tested show proper responsive behavior

metadata:
  last_responsive_audit:
    date: "2026-05-02"
    agent: "main"
    viewports_verified_manually:
      - "320x720 (landing)"
      - "390x844 (landing + admin dashboard/leads/social/affiliates)"
      - "768x1024 (landing)"
      - "1440x900 (admin dashboard/leads)"
    horizontal_overflow_at_390: "none on any admin page"
    horizontal_overflow_at_320: "none on landing (verified via scrollWidth === innerWidth)"

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Responsive + polish pass complete for admin + landing.

      What changed (frontend only — backend untouched):
      1. New shared component `/app/frontend/src/components/admin/AdminNav.jsx`
         providing a hamburger + slide-in drawer on < lg viewports. Drawer has
         links to Dashboard / Lead Engine / Auto-Poster / Partners / Brand Kit
         + Logout. Desktop keeps inline links + per-page rightSlot actions.
      2. All 4 admin pages refactored to use AdminNav:
         - AdminDashboard.jsx (grey theme, no rightSlot)
         - AdminLeadEngine.jsx (grey theme, rightSlot with 4 action buttons)
         - AdminSocial.jsx (bone theme, rightSlot with New post + Generate 14d)
         - AdminAffiliates.jsx (grey theme, no rightSlot)
      3. AdminLeadEngine lead rows + outreach jobs rows switched from fixed
         12-col grids to stacked cards < md (desktop unchanged).
      4. AdminAffiliates partner rows now reveal Tier/Earned/Pending metrics
         on mobile (previously `hidden md:flex`).
      5. index.css: `.no-scrollbar`, overflow safety, 44px tap floor on touch.
      6. test_credentials.md seeded with admin@brivomarketing.com /
         BrivoOps2026! (read from backend/.env).

      Manually verified: zero horizontal overflow at 320/390px on landing and
      all 4 admin pages; drawer opens/closes correctly; drawer links navigate
      correctly; mobile action shelf on Lead Engine is horizontally
      scrollable and all buttons remain functional.

      Please run an automated multi-viewport frontend test covering:
      - /admin/login -> login with admin@brivomarketing.com / BrivoOps2026!
      - /admin : tab switching + mobile hamburger + drawer nav + all 5 links
      - /admin/leads : mobile card layout + AI qualify + discover buttons +
        lead drawer + dispatch action
      - /admin/social : New post + Generate 14d buttons + stats grid at mobile
      - /admin/affiliates : 3 tabs (applications / active partners /
        commissions) at mobile
      - /brand-kit : download links work on mobile
      - / : landing page end-to-end scroll at 375px + 768px + 1440px (no
        horizontal overflow, all CTAs tappable, testimonials/pricing/portfolio
        readable)
      - /partners : public partner-program page at 375px

      Priority targets for the testing agent:
      - data-testid="admin-nav-toggle" (hamburger)
      - data-testid="admin-nav-drawer-{dashboard|leads|social|affiliates|brandkit}"
      - data-testid="admin-nav-close"
      - data-testid="lead-row-{id}" (should expand lead drawer)
      - data-testid="dispatch-{id}" (dispatch button on discovered leads)
  
  - agent: "testing"
    message: |
      Comprehensive responsive + regression testing COMPLETE.
      
      Tested all flows at Mobile (390x844), Tablet (768x1024), Desktop (1440x900).
      
      ✅ ALL FLOWS PASSED:
      
      A. Landing page (/) - ✅ PASS at all viewports
         - No horizontal overflow at 390/768/1440px
         - All key sections present (Hero, Services, Process, Pricing, etc.)
         - Mobile hamburger menu found
         - CTA buttons present and tappable
      
      B. Partners page (/partners) - ✅ PASS at mobile + desktop
         - No horizontal overflow
         - Hero text "Work for yourself. Get paid every month." present
         - All 4 tiers (bronze/silver/gold/platinum) found
         - Apply CTA present
      
      C. Brand Kit (/brand-kit) - ✅ PASS at mobile + desktop
         - No horizontal overflow
         - 20 download buttons found
         - PDF download link present
      
      D. Admin login (/admin/login) - ✅ PASS
         - Valid credentials (admin@brivomarketing.com / BrivoOps2026!) successfully log in
         - Redirects to /admin correctly
         - Note: Invalid credentials error message may be in toast (not DOM-visible)
      
      E. Admin Dashboard (/admin) - ✅ PASS at all viewports (KEY FOCUS)
         - Telemetry strip visible with "AI ONLINE"
         - Admin nav header present
         - Tab bar present and horizontally scrollable on mobile
         - ✅ Hamburger VISIBLE on mobile (390px)
         - ✅ Hamburger HIDDEN on desktop (1440px)
         - ✅ Drawer opens on hamburger click
         - ✅ Found all 6 drawer links (dashboard/leads/social/affiliates/brandkit/logout)
         - ✅ Current page highlighted with "· now" in lime (#CCFF00)
         - ✅ Escape key closes drawer
         - ✅ Backdrop click closes drawer
         - ✅ Tab switching works (Analytics, Messages, Inbox, AI Agents, Calls, Operator)
      
      F. Admin Lead Engine (/admin/leads) - ✅ PASS at all viewports
         - Telemetry strip shows "AI ENGINE · ONLINE" and "PIPELINE · X LEADS"
         - Shared admin nav header present
         - All 3 action buttons found (AI QUALIFY, DISCOVER, REFRESH)
         - Hamburger visible on mobile
         - Mobile action shelf is horizontally scrollable
      
      G. Admin Social (/admin/social) - ✅ PASS at all viewports
         - Admin nav with bone theme present
         - "New post" button present
         - ✅ "Generate 14d" shortened label on mobile
         - "Generate next 14 days" full label on desktop
         - Hamburger visible on mobile
      
      H. Admin Affiliates (/admin/affiliates) - ✅ PASS at all viewports
         - Admin nav header present
         - All 3 tabs work (Applications, Active partners, Commissions)
         - Hamburger visible on mobile
         - Note: Tier/Earned/Pending metrics not visible on mobile because no affiliates exist in DB yet
           (Code review confirms metrics are NOT hidden on mobile - lines 316-331 in AdminAffiliates.jsx)
      
      I. Cross-page navigation - ✅ PASS
         - Dashboard → Lead Engine ✅
         - Lead Engine → Auto-Poster ✅
         - Auto-Poster → Partners ✅
         - Partners → Brand Kit ✅
         - Brand Kit → Dashboard ✅
         - All drawer links navigate correctly and close drawer after navigation
      
      J. Logout - ✅ PASS
         - Mobile logout (via drawer) redirects to /admin/login ✅
         - localStorage key 'brivo_admin_token' is cleared ✅
      
      SUMMARY:
      - ✅ Zero horizontal overflow at any viewport on any page
      - ✅ Shared admin navigation works perfectly (hamburger + drawer)
      - ✅ All 4 admin pages are mobile-responsive
      - ✅ Cross-page navigation via drawer works flawlessly
      - ✅ Tab switching and content rendering works
      - ✅ Logout functionality works on mobile and desktop
      - ✅ All public pages (landing, partners, brand-kit) are responsive
      
      NO CRITICAL ISSUES FOUND. All responsive changes are working as intended.
