import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const submitInquiry = (payload) =>
  axios.post(`${API}/inquiries`, payload).then((r) => r.data);

export const sendChat = (sessionId, message) =>
  axios
    .post(`${API}/chat`, { session_id: sessionId, message })
    .then((r) => r.data);
