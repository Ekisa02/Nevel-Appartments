import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/firebase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { createBooking, getUnavailableRanges, cancelBooking } from '../services/bookingService.js';

const r = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

r.get('/apartments', wrap(async (_q, res) => {
  res.json(list(await db.collection('apartments').where('status', '==', 'available').get()));
}));
r.get('/apartments/:id', wrap(async (req, res) => {
  const s = await db.collection('apartments').doc(req.params.id).get();
  if (!s.exists) return res.status(404).json({ message: 'Apartment not found.' });
  res.json({ id: s.id, ...s.data(), unavailable: await getUnavailableRanges(s.id) });
}));

r.post('/users/sync', requireAuth, wrap(async (req, res) => {
  const body = z.object({ fullName: z.string().min(2), phone: z.string().optional() }).parse(req.body);
  const ref = db.collection('users').doc(req.user.uid);
  if (!(await ref.get()).exists)
    await ref.set({ uid: req.user.uid, email: req.user.email, ...body, role: 'guest', favorites: [], createdAt: new Date().toISOString() });
  res.json((await ref.get()).data());
}));
r.get('/users/me', requireAuth, wrap(async (req, res) => res.json((await db.collection('users').doc(req.user.uid).get()).data())));

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const bookingSchema = z.object({ apartmentId: z.string(), guests: z.number().int().min(1), checkIn: date, checkOut: date });
r.post('/bookings', requireAuth, wrap(async (req, res) => {
  res.status(201).json(await createBooking(req.user.uid, bookingSchema.parse(req.body)));
}));
r.get('/bookings/my', requireAuth, wrap(async (req, res) => {
  const items = list(await db.collection('bookings').where('userId', '==', req.user.uid).get());
  res.json(items.sort((a, b) => b.checkIn.localeCompare(a.checkIn)));
}));
r.get('/bookings/:id', requireAuth, wrap(async (req, res) => {
  const s = await db.collection('bookings').doc(req.params.id).get();
  if (!s.exists || (s.data().userId !== req.user.uid && req.user.role !== 'admin'))
    return res.status(404).json({ message: 'Booking not found.' });
  res.json(s.data());
}));
r.delete('/bookings/:id', requireAuth, wrap(async (req, res) => res.json(await cancelBooking(req.user, req.params.id))));

r.post('/contact', wrap(async (req, res) => {
  const m = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), message: z.string().min(5) }).parse(req.body);
  await db.collection('messages').add({ ...m, status: 'new', createdAt: new Date().toISOString() });
  res.status(201).json({ ok: true });
}));

// Admin: authorization enforced here on the server.
const admin = Router();
admin.use(requireAuth, requireAdmin);
const aptSchema = z.object({
  name: z.string().min(2), description: z.string(), pricePerNight: z.number().positive(), location: z.string(),
  maxGuests: z.number().int().min(1), bedrooms: z.number().int().min(0), beds: z.number().int().min(1), bathrooms: z.number().min(1),
  amenities: z.array(z.string()), images: z.array(z.string()), featuredImage: z.string(), status: z.enum(['available', 'unavailable']),
});
admin.post('/apartments', wrap(async (req, res) => {
  const now = new Date().toISOString();
  const ref = await db.collection('apartments').add({ ...aptSchema.parse(req.body), rating: 0, reviewCount: 0, createdAt: now, updatedAt: now });
  res.status(201).json({ id: ref.id });
}));
admin.patch('/apartments/:id', wrap(async (req, res) => {
  await db.collection('apartments').doc(req.params.id).update({ ...aptSchema.partial().parse(req.body), updatedAt: new Date().toISOString() });
  res.json({ ok: true });
}));
admin.delete('/apartments/:id', wrap(async (req, res) => { await db.collection('apartments').doc(req.params.id).delete(); res.json({ ok: true }); }));
admin.get('/bookings', wrap(async (_q, res) => res.json(list(await db.collection('bookings').orderBy('createdAt', 'desc').limit(200).get()))));
admin.patch('/bookings/:id', wrap(async (req, res) => {
  const { status } = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']) }).parse(req.body);
  await db.collection('bookings').doc(req.params.id).update({ status });
  res.json({ ok: true });
}));
admin.get('/users', wrap(async (_q, res) => res.json(list(await db.collection('users').limit(200).get()))));
admin.get('/messages', wrap(async (_q, res) => res.json(list(await db.collection('messages').orderBy('createdAt', 'desc').limit(200).get()))));
r.use('/admin', admin);

export default r;
