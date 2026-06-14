import api from '../lib/axiosAuth';

export async function getUpcomingTreks({ featured = false, type } = {}, config) {
  const params = {};
  if (featured) params.featured = 'true';
  if (type) params.type = type;
  const res = await api.get('/trips', { params, ...config });
  return res.data;
}

export async function getTrekBySlug(slug, config) {
  const res = await api.get(`/trips/${slug}`, config);
  return res.data;
}

export async function getAllTreksAdmin(config) {
  const res = await api.get('/trips', { params: { all: 'true' }, ...config });
  return res.data;
}

export async function createTrek(payload) {
  const res = await api.post('/trips', payload);
  return res.data;
}

export async function updateTrek(id, payload) {
  const res = await api.put(`/trips/${id}`, payload);
  return res.data;
}

export async function deleteTrek(id) {
  const res = await api.delete(`/trips/${id}`);
  return res.data;
}
