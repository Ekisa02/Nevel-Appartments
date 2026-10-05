import axios from 'axios';
import { auth } from './firebase';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(async (cfg) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Network error. Check your connection.' : e.message || 'Something went wrong.');
export const getApartments = () => api.get('/apartments').then((r) => r.data);
export const getApartment = (id) => api.get(`/apartments/${id}`).then((r) => r.data);
export const createBooking = (b) => api.post('/bookings', b).then((r) => r.data);
export const getMyBookings = () => api.get('/bookings/my').then((r) => r.data);
export const getBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`).then((r) => r.data);
export const syncUser = (p) => api.post('/users/sync', p).then((r) => r.data);
export const sendContact = (m) => api.post('/contact', m).then((r) => r.data);
export const getMe = () => api.get('/users/me').then((r) => r.data);
export const updateMe = (p) => api.patch('/users/me', p).then((r) => r.data);
export const uploadPhoto = (data) => api.post('/users/photo', { data }).then((r) => r.data);
export const getFavorites = () => api.get('/users/favorites').then((r) => r.data);
export const toggleFav = (id) => api.post(`/users/favorites/${id}`).then((r) => r.data.favorites);
export const getReviews = (id) => api.get(`/reviews/${id}`).then((r) => r.data);
export const postReview = (b) => api.post('/reviews', b).then((r) => r.data);
export const getGallery = () => api.get('/gallery').then((r) => r.data);
export const adm = {
  get: (p) => api.get('/admin' + p).then((r) => r.data),
  post: (p, b) => api.post('/admin' + p, b).then((r) => r.data),
  patch: (p, b) => api.patch('/admin' + p, b).then((r) => r.data),
  del: (p) => api.delete('/admin' + p).then((r) => r.data),
};
