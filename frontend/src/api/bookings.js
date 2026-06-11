import api from '../lib/axiosAuth';

export async function getMyBookings(config) {
  const res = await api.get('/bookings/my', config);
  return res.data;
}

export async function createBooking(payload) {
  const res = await api.post('/bookings', payload);
  return res.data;
}

export async function cancelBooking(id) {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
}

export async function getAllBookings(config) {
  const res = await api.get('/bookings', config);
  return res.data;
}

export async function updateBookingStatus(id, requestStatus) {
  const res = await api.put(`/bookings/${id}/status`, { requestStatus });
  return res.data;
}

export async function deleteBookingAdmin(id) {
  const res = await api.delete(`/bookings/${id}/admin`);
  return res.data;
}
