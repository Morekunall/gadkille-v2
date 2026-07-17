import api from '../lib/axiosAuth';

export async function getForts(config) {
  const res = await api.get('/forts', config);
  return res.data;
}

export async function searchForts({ q, district, page = 1, limit = 12 } = {}, config) {
  const params = { page, limit };
  if (q?.trim()) params.q = q.trim();
  if (district && district !== 'all') params.district = district;
  const res = await api.get('/forts', { params, ...config });
  return res.data;
}

export async function getFortDistricts(config) {
  const res = await api.get('/forts/meta/districts', config);
  return res.data;
}

export async function getFortBySlug(slug, config) {
  const res = await api.get(`/forts/${slug}`, config);
  return res.data;
}

export async function createFort(payload) {
  const res = await api.post('/forts', payload);
  return res.data;
}

export async function updateFort(id, payload) {
  const res = await api.put(`/forts/${id}`, payload);
  return res.data;
}

export async function deleteFort(id) {
  const res = await api.delete(`/forts/${id}`);
  return res.data;
}
