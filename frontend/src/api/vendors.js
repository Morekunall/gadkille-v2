import api from '../lib/axiosAuth';

export async function getVendors(params, config) {
  const res = await api.get('/vendors', { params, ...config });
  return res.data;
}

export async function createVendor(payload) {
  const res = await api.post('/vendors', payload);
  return res.data;
}

export async function updateVendor(id, payload) {
  const res = await api.put(`/vendors/${id}`, payload);
  return res.data;
}

export async function deleteVendor(id) {
  const res = await api.delete(`/vendors/${id}`);
  return res.data;
}
