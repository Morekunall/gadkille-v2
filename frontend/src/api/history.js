import api from '../lib/axiosAuth';

export async function getHistories(config) {
  const res = await api.get('/history', config);
  return res.data;
}

export async function createHistory(payload) {
  const res = await api.post('/history', payload);
  return res.data;
}

export async function updateHistory(id, payload) {
  const res = await api.put(`/history/${id}`, payload);
  return res.data;
}

export async function deleteHistory(id) {
  const res = await api.delete(`/history/${id}`);
  return res.data;
}
