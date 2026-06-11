import api from '../lib/axiosAuth';

export async function getMe(config) {
  const res = await api.get('/auth/me', config);
  return res.data;
}

export async function checkEmail(email) {
  const res = await api.post('/auth/check-email', { email: email.trim() });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(payload) {
  const res = await api.post('/auth/register', payload);
  return res.data;
}

export async function verifyEmail(email, otp) {
  const res = await api.post('/auth/verify-email', { email, otp });
  return res.data;
}

export async function verifyEmailByToken(token) {
  const res = await api.get('/auth/verify-email', { params: { token } });
  return res.data;
}

export async function resendVerification(email) {
  const res = await api.post('/auth/resend-verification', { email });
  return res.data;
}

export async function forgotPassword(email) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(token, password) {
  const res = await api.post('/auth/reset-password', { token, password });
  return res.data;
}

export async function updateProfile(payload) {
  const res = await api.put('/auth/me', payload);
  return res.data;
}

export async function completeProfile(phone) {
  const res = await api.post('/auth/complete-profile', { phone });
  return res.data;
}
