import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Claims
export const verifyClaim = async (claim: string, accountId?: string) => {
  const { data } = await api.post('/api/claims/verify', { claim, accountId });
  return data.claim || data; // Handle both response formats
};

export const getAllClaims = async (params?: { limit?: number; offset?: number; verdict?: string }) => {
  const { data } = await api.get('/api/claims', { params });
  return data.claims || data || [];
};

export const getRecentClaims = async (limit: number = 10) => {
  const { data } = await api.get('/api/claims/recent', { params: { limit } });
  return data;
};

export const getClaimById = async (id: string) => {
  const { data } = await api.get(`/api/claims/${id}`);
  return data;
};

// Marketplace
export const buyClaim = async (claim: string, buyerAccountId: string, transactionId: string) => {
  const { data } = await api.post('/api/marketplace/buy', { claim, buyerAccountId, transactionId });
  return data;
};

export const getAllSales = async (params?: { limit?: number; buyer?: string }) => {
  const { data } = await api.get('/api/marketplace/sales', { params });
  return data;
};

export const getMarketplaceStats = async () => {
  const { data } = await api.get('/api/marketplace/stats');
  return data;
};

// Badges
export const getUserBadges = async (accountId: string) => {
  const { data } = await api.get(`/api/badges/${accountId}`);
  return data;
};

export const getAllBadges = async (limit: number = 50) => {
  const { data } = await api.get('/api/badges', { params: { limit } });
  return data.badges || data || [];
};

export const getBadgeStats = async () => {
  const { data } = await api.get('/api/badges/stats');
  return data;
};

// Users
export const getUserByAccountId = async (accountId: string) => {
  const { data } = await api.get(`/api/users/${accountId}`);
  return data;
};

export const getAllUsers = async (limit: number = 50) => {
  const { data } = await api.get('/api/users', { params: { limit } });
  return data;
};

export const getUserDashboard = async (accountId: string) => {
  const { data } = await api.get(`/api/users/${accountId}/dashboard`);
  return data;
};

// Stats
export const getSystemStats = async () => {
  const { data } = await api.get('/api/stats');
  return data.stats || data;
};

export const getLeaderboard = async (limit: number = 10) => {
  const { data } = await api.get('/api/stats/leaderboard', { params: { limit } });
  return data.leaderboard || data || [];
};

export const getActivity = async (limit: number = 20) => {
  const { data } = await api.get('/api/stats/activity', { params: { limit } });
  return data.activities || data || [];
};

export const getAnalytics = async () => {
  const { data } = await api.get('/api/stats/analytics');
  return data;
};

// Health check
export const checkHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export default api;
