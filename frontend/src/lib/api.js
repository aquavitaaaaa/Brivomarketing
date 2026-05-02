import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// ---------- Public ----------
export const submitInquiry = (payload) =>
  axios.post(`${API}/inquiries`, payload).then((r) => r.data);

export const submitRoiLead = (payload) =>
  axios.post(`${API}/inquiries/roi`, payload).then((r) => r.data);

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

export const socialJobs = () =>
  axios.get(`${API}/admin/social/jobs`, { headers: authHeaders() }).then((r) => r.data);
