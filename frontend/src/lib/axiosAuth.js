import axios from 'axios';

// Ensure every request sends latest token (even after refresh)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('gadkille_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;

