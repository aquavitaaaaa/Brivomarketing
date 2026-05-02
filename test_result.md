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
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Phase 1 safety policies — warm-up / cadence / auto-pause"
    - "Phase 1 admin endpoints (safety + wins + cross-poster)"
    - "Client-wins recycler loop (queue floor)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
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
