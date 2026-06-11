import api from '../lib/axiosAuth';

export async function submitInquiry(payload) {
  const res = await api.post('/inquiries', payload);
  return res.data;
}

export async function getInquiries(config) {
  const res = await api.get('/inquiries', config);
  return res.data;
}
