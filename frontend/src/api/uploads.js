import api from '../lib/axiosAuth';

export async function uploadStayImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const res = await api.post('/uploads/stay-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadFortVideos(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('videos', file));
  const res = await api.post('/uploads/fort-videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
