import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// ---------- Public ----------
export const submitInquiry = (payload) =>
  axios.post(`${API}/inquiries`, payload).then((r) => r.data);

export const submitRoiLead = (payload) =>
  axios.post(`${API}/inquiries/roi`, payload).then((r) => r.data);

export const submitAudit = (payload) =>
  axios.post(`${API}/leads/audit`, payload).then((r) => r.data);

export const fetchFunnel = (days = 30) =>
  axios
    .get(`${API}/admin/funnel`, { headers: authHeaders(), params: { days } })
    .then((r) => r.data);

// ---------- Affiliate / Partner Program ----------
export const fetchAffiliateProgram = () =>
  axios.get(`${API}/affiliates/program`).then((r) => r.data);

export const submitAffiliateApplication = (payload) =>
  axios.post(`${API}/affiliates/apply`, payload).then((r) => r.data);

export const trackRefClick = (ref) =>
  axios.get(`${API}/affiliates/track`, { params: { ref } }).catch(() => null);

export const fetchAffiliateApplications = (status) =>
  axios.get(`${API}/admin/affiliates/applications`, {
    headers: authHeaders(),
    params: status ? { status } : {},
  }).then((r) => r.data);

export const approveAffiliateApplication = (id) =>
  axios.post(`${API}/admin/affiliates/applications/${id}/approve`, {}, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const rejectAffiliateApplication = (id, note) =>
  axios.post(`${API}/admin/affiliates/applications/${id}/reject`, { note }, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const fetchAffiliates = () =>
  axios.get(`${API}/admin/affiliates`, { headers: authHeaders() }).then((r) => r.data);

export const fetchAffiliateDetail = (id) =>
  axios.get(`${API}/admin/affiliates/${id}`, { headers: authHeaders() }).then((r) => r.data);

export const suspendAffiliate = (id, status) =>
  axios.post(`${API}/admin/affiliates/${id}/suspend`, { status }, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const updateReferralStage = (refId, stage) =>
  axios.post(`${API}/admin/affiliates/referrals/${refId}/stage`, { stage }, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const winReferral = (refId, payload) =>
  axios.post(`${API}/admin/affiliates/referrals/${refId}/win`, payload, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const runMonthlyCommissions = (period) =>
  axios.post(`${API}/admin/affiliates/commissions/run`, period ? { period } : {}, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const fetchCommissions = (params = {}) =>
  axios.get(`${API}/admin/affiliates/commissions/all`, {
    headers: authHeaders(),
    params,
  }).then((r) => r.data);

export const updateCommissionStatus = (id, payload) =>
  axios.patch(`${API}/admin/affiliates/commissions/${id}`, payload, {
    headers: authHeaders(),
  }).then((r) => r.data);

export const trackEvent = (event, path, extra = {}) => {
  try {
    let sessionId = localStorage.getItem("brivo_sid");
    if (!sessionId) {
      sessionId =
        (crypto?.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("brivo_sid", sessionId);
    }
    return axios
      .post(`${API}/analytics/event`, {
        event,
        path,
        referrer: document.referrer || null,
        session_id: sessionId,
        ...extra,
      })
      .catch(() => null);
  } catch {
    return null;
  }
};

export const sendChat = (sessionId, message) =>
  axios
    .post(`${API}/chat`, { session_id: sessionId, message })
    .then((r) => r.data);

// ---------- Admin (Bearer token) ----------
const authHeaders = () => {
  const t = localStorage.getItem("brivo_admin_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export const adminLogin = (email, password) =>
  axios
    .post(`${API}/auth/admin/login`, { email, password })
    .then((r) => r.data);

export const adminMe = () =>
  axios.get(`${API}/auth/admin/me`, { headers: authHeaders() }).then((r) => r.data);

export const fetchInquiries = () =>
  axios
    .get(`${API}/admin/inquiries`, { headers: authHeaders() })
    .then((r) => r.data);

export const updateInquiryStatus = (id, status) =>
  axios
    .patch(
      `${API}/admin/inquiries/${id}`,
      { status },
      { headers: authHeaders() }
    )
    .then((r) => r.data);

export const fetchAnalyticsSummary = (days = 7) =>
  axios
    .get(`${API}/admin/analytics/summary`, {
      headers: authHeaders(),
      params: { days },
    })
    .then((r) => r.data);

export const fetchRecentPageviews = () =>
  axios
    .get(`${API}/admin/analytics/recent`, { headers: authHeaders() })
    .then((r) => r.data);

// ---------- Clients (CRM) ----------
export const fetchClients = () =>
  axios
    .get(`${API}/admin/clients`, { headers: authHeaders() })
    .then((r) => r.data);

export const fetchClientDetail = (email) =>
  axios
    .get(`${API}/admin/clients/${encodeURIComponent(email)}`, {
      headers: authHeaders(),
    })
    .then((r) => r.data);

export const fetchInquiryAnalytics = (days = 30) =>
  axios
    .get(`${API}/admin/inquiries/analytics`, {
      headers: authHeaders(),
      params: { days },
    })
    .then((r) => r.data);

export const fetchOperatorStatus = () =>
  axios
    .get(`${API}/admin/operator/status`, { headers: authHeaders() })
    .then((r) => r.data);

export const toggleOperator = (enabled) =>
  axios
    .post(
      `${API}/admin/operator/toggle`,
      { enabled },
      { headers: authHeaders() }
    )
    .then((r) => r.data);

export const startOutboundCall = (payload) =>
  axios
    .post(`${API}/admin/operator/call`, payload, { headers: authHeaders() })
    .then((r) => r.data);

export const fetchCalls = () =>
  axios
    .get(`${API}/admin/calls`, { headers: authHeaders() })
    .then((r) => r.data);

// ---------- Social Auto-Poster ----------
export const socialDashboard = () =>
  axios.get(`${API}/admin/social/dashboard`, { headers: authHeaders() }).then((r) => r.data);

export const socialAgents = () =>
  axios.get(`${API}/admin/social/agents`, { headers: authHeaders() }).then((r) => r.data);

export const socialCreatePairCode = () =>
  axios.post(`${API}/admin/social/agents/pair-code`, {}, { headers: authHeaders() }).then((r) => r.data);

export const socialRevokeAgent = (id) =>
  axios.delete(`${API}/admin/social/agents/${id}`, { headers: authHeaders() }).then((r) => r.data);

// ---- Public pair-invite wizard ----
export const socialCreatePairInvite = (payload = {}) =>
  axios.post(`${API}/admin/social/pair-invite`, payload, { headers: authHeaders() }).then((r) => r.data);

export const publicGetPairInvite = (token) =>
  axios.get(`${API}/public/pair-invite/${token}`).then((r) => r.data);

export const publicClaimPairInvite = (token) =>
  axios.post(`${API}/public/pair-invite/${token}/claim`, {}).then((r) => r.data);

export const socialPosts = (status) =>
  axios.get(`${API}/admin/social/posts`, {
    headers: authHeaders(), params: status ? { status } : {},
  }).then((r) => r.data);

export const socialCreatePost = (payload) =>
  axios.post(`${API}/admin/social/posts`, payload, { headers: authHeaders() }).then((r) => r.data);

export const socialGenerateBatch = (payload) =>
  axios.post(`${API}/admin/social/posts/generate`, payload, {
    headers: authHeaders(), timeout: 120000,
  }).then((r) => r.data);

export const socialRunNow = (id) =>
  axios.post(`${API}/admin/social/posts/${id}/run-now`, {}, { headers: authHeaders() }).then((r) => r.data);

export const socialCancelPost = (id) =>
  axios.delete(`${API}/admin/social/posts/${id}`, { headers: authHeaders() }).then((r) => r.data);

export const socialPreviewPost = (id) =>
  axios.get(`${API}/admin/social/posts/${id}/preview`, { headers: authHeaders() }).then((r) => r.data);

export const socialJobs = () =>
  axios.get(`${API}/admin/social/jobs`, { headers: authHeaders() }).then((r) => r.data);

// ---- Phase 1: safety + factory ----
export const socialSafetySummary = () =>
  axios.get(`${API}/admin/social/safety-summary`, { headers: authHeaders() }).then((r) => r.data);

export const socialPauseAgent = (agent_id, platform, reason = "manual") =>
  axios.post(`${API}/admin/social/policies/pause`,
    { agent_id, platform, reason }, { headers: authHeaders() }).then((r) => r.data);

export const socialUnpauseAgent = (agent_id, platform) =>
  axios.post(`${API}/admin/social/policies/unpause`,
    { agent_id, platform }, { headers: authHeaders() }).then((r) => r.data);

export const socialUpdatePolicy = (payload) =>
  axios.post(`${API}/admin/social/policies/update`, payload, { headers: authHeaders() }).then((r) => r.data);

export const socialListHooks = () =>
  axios.get(`${API}/admin/social/hooks`, { headers: authHeaders() }).then((r) => r.data);

export const socialListWins = () =>
  axios.get(`${API}/admin/social/wins`, { headers: authHeaders() }).then((r) => r.data);

export const socialCreateWin = (payload) =>
  axios.post(`${API}/admin/social/wins`, payload, { headers: authHeaders() }).then((r) => r.data);

export const socialDeleteWin = (id) =>
  axios.delete(`${API}/admin/social/wins/${id}`, { headers: authHeaders() }).then((r) => r.data);

export const socialRecycleNow = () =>
  axios.post(`${API}/admin/social/wins/recycle-now`, {}, { headers: authHeaders() }).then((r) => r.data);

export const socialCrossPost = (payload) =>
  axios.post(`${API}/admin/social/posts/multi`, payload, {
    headers: authHeaders(), timeout: 120000,
  }).then((r) => r.data);

// ---------- Autonomous Client Acquisition Engine ----------
export const leadsPipeline = () =>
  axios.get(`${API}/admin/leads/pipeline`, { headers: authHeaders() }).then((r) => r.data);

export const leadsList = (stage) => {
  const q = stage ? `?stage=${encodeURIComponent(stage)}` : "";
  return axios.get(`${API}/admin/leads${q}`, { headers: authHeaders() }).then((r) => r.data);
};

export const leadGet = (id) =>
  axios.get(`${API}/admin/leads/${id}`, { headers: authHeaders() }).then((r) => r.data);

export const leadDiscoverNow = (payload = {}) =>
  axios.post(`${API}/admin/leads/discover-now`, payload, {
    headers: authHeaders(), timeout: 90000,
  }).then((r) => r.data);

export const leadDispatch = (id) =>
  axios.post(`${API}/admin/leads/${id}/dispatch`, {}, {
    headers: authHeaders(), timeout: 90000,
  }).then((r) => r.data);

export const leadReply = (id, message) =>
  axios.post(`${API}/admin/leads/${id}/reply`, { message }, {
    headers: authHeaders(), timeout: 60000,
  }).then((r) => r.data);

export const leadStage = (id, stage) =>
  axios.post(`${API}/admin/leads/${id}/stage`, { stage }, { headers: authHeaders() }).then((r) => r.data);

export const leadImport = (leads) =>
  axios.post(`${API}/admin/leads/import`, { leads }, { headers: authHeaders() }).then((r) => r.data);

export const outreachJobs = () =>
  axios.get(`${API}/admin/outreach/jobs`, { headers: authHeaders() }).then((r) => r.data);

export const leadAnalytics = () =>
  axios.get(`${API}/admin/leads/analytics`, { headers: authHeaders() }).then((r) => r.data);

export const leadAutoQualify = (limit = 20, min_score = 60) =>
  axios.post(`${API}/admin/leads/auto-qualify`, { limit, min_score }, {
    headers: authHeaders(), timeout: 90000,
  }).then((r) => r.data);

export const leadQualify = (id) =>
  axios.post(`${API}/admin/leads/${id}/qualify`, {}, {
    headers: authHeaders(), timeout: 60000,
  }).then((r) => r.data);

// ---------- Direct Instagram Poster (instagrapi + proxy) ----------
export const directIgAccounts = () =>
  axios.get(`${API}/admin/social/direct/accounts`, { headers: authHeaders() })
    .then((r) => r.data);

export const directIgConnect = (payload) =>
  axios.post(`${API}/admin/social/direct/connect`, payload, {
    headers: authHeaders(), timeout: 120000,
  }).then((r) => r.data);

export const directIgPost = (payload) =>
  axios.post(`${API}/admin/social/direct/post`, payload, {
    headers: authHeaders(), timeout: 120000,
  }).then((r) => r.data);

export const directIgDisconnect = (id) =>
  axios.delete(`${API}/admin/social/direct/${id}`, { headers: authHeaders() })
    .then((r) => r.data);



// ---------- Alerts + Instagram autopilot ----------
const aget = (p, params) => axios.get(`${API}${p}`, { headers: authHeaders(), params }).then((r) => r.data);
const apost = (p, body = {}, params) => axios.post(`${API}${p}`, body, { headers: authHeaders(), params, timeout: 120000 }).then((r) => r.data);

export const alertsStatus = () => aget("/admin/alerts/status");
export const alertsList = () => aget("/admin/alerts");
export const alertsMarkRead = () => apost("/admin/alerts/read");
export const alertsTest = () => apost("/admin/alerts/test");

export const apOverview = () => aget("/admin/social/autopilot");
export const apUpdate = (body) => axios.put(`${API}/admin/social/autopilot`, body, { headers: authHeaders() }).then((r) => r.data);
export const apPosts = () => aget("/admin/social/autopilot/posts");
export const apRunNow = (body) => apost("/admin/social/autopilot/run-now", body);
export const apApprove = (id, publish_now = true) => apost(`/admin/social/autopilot/posts/${id}/approve`, {}, { publish_now });
export const apSkip = (id) => apost(`/admin/social/autopilot/posts/${id}/skip`);
export const apEdit = (id, body) => axios.patch(`${API}/admin/social/autopilot/posts/${id}`, body, { headers: authHeaders() }).then((r) => r.data);
export const apShots = () => aget("/admin/social/autopilot/shots");
