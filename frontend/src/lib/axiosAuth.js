import axios from 'axios';
import { getApiBaseUrl } from './api';

axios.defaults.baseURL = getApiBaseUrl();

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('gadkille_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
