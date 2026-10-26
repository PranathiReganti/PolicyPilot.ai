import axios from 'axios';

// Connect to backend (using proxy or direct port 8000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('policypilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  if (res.data.access_token) {
    localStorage.setItem('policypilot_token', res.data.access_token);
    localStorage.setItem('policypilot_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  if (res.data.access_token) {
    localStorage.setItem('policypilot_token', res.data.access_token);
    localStorage.setItem('policypilot_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem('policypilot_token');
  localStorage.removeItem('policypilot_user');
};

export const getCurrentUser = () => {
  const u = localStorage.getItem('policypilot_user');
  return u ? JSON.parse(u) : null;
};

// Policy endpoints
export const getPolicies = async (params = {}) => {
  const res = await api.get('/policies', { params });
  return res.data;
};

export const getPolicyById = async (id) => {
  const res = await api.get(`/policies/${id}`);
  return res.data;
};

// Recommendation engine
export const getRecommendations = async (profile) => {
  const res = await api.post('/recommend', profile);
  return res.data;
};

// Comparison
export const comparePolicies = async (policyIds) => {
  const res = await api.post('/compare', { policy_ids: policyIds });
  return res.data;
};

// Premium Estimator
export const getPremiumEstimate = async (params) => {
  const res = await api.post('/premium-estimate', params);
  return res.data;
};

// AI Advisor RAG Chat
export const chatWithAdvisor = async (message, sessionId = null) => {
  const res = await api.post('/chat', { message, session_id: sessionId });
  return res.data;
};

// History & Dashboard
export const getHistory = async () => {
  const res = await api.get('/history');
  return res.data;
};

export default api;
