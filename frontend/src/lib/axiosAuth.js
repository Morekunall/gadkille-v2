import axios from 'axios';
import { getApiBaseUrl } from './api';

export const TOKEN_KEY = 'gadkille_token';

const api = axios.create({
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || '');
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthRoute && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new CustomEvent('gadkille:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
