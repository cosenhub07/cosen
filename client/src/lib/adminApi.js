import useAuthStore from '../store/authStore';
import api from '../lib/api';

// ── Admin API helper
const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getVerifications: (status = 'pending') => api.get(`/admin/verifications?status=${status}`),
  resolveVerification: (userId, verdict, reason) => api.put(`/admin/verifications/${userId}/resolve`, { verdict, reason }),
  getDisputes: () => api.get('/admin/disputes'),
  getDisputeMessages: (orderId) => api.get(`/admin/disputes/${orderId}/messages`),
  resolveDispute: (orderId, verdict, winnerId) => api.put(`/admin/disputes/${orderId}/resolve`, { verdict, winnerId }),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  suspendUser: (userId) => api.put(`/admin/users/${userId}/suspend`),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getServices: (params = {}) => api.get('/admin/services', { params }),
  toggleServiceStatus: (serviceId) => api.put(`/admin/services/${serviceId}/status`),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  getOrderDetail: (orderId) => api.get(`/admin/orders/${orderId}`),
};

export default adminApi;
