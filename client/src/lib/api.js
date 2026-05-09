import axios from 'axios';

let BASE_URL = import.meta.env.VITE_API_URL || '/api';
if (BASE_URL !== '/api' && !BASE_URL.endsWith('/api')) {
  BASE_URL = BASE_URL.replace(/\/+$/, '') + '/api';
}
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cosen_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cosen_token');
      localStorage.removeItem('cosen_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
