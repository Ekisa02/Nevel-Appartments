import { Router } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { db, rtdb } from '../config/firebase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const r = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const list = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const err = (status, message) => Object.assign(new Error(message), { status });
const adminOnly = [requireAuth, requireAdmin];

// ---------- Images in Realtime Database (base64; the frontend compresses before upload) ----------
const IMG = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
async function saveImage(req, dataUrl, maxKB = 900) {
  const m = IMG.exec(dataUrl || '');
  if (!m) throw err(400, 'Please upload a JPG, PNG or WebP image.');
  if (m[2].length > maxKB * 1366) throw err(413, `Image is too large (max ${maxKB} KB after compression).`);
  const ref = rtdb.ref('images').push();
  await ref.set({ mime: m[1], data: m[2], createdAt: Date.now() });
  const base = process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}/api`;
  return { id: ref.key, url: `${base}/images/${ref.key}` };
}
const deleteImageByUrl = async (url = '') => {
  const id = url.includes('/images/') ? url.split('/').pop() : null;
  if (id && /^[-\w]+$/.test(id)) await rtdb.ref(`images/${id}`).remove().catch(() => {});
};
r.get('/images/:id', wrap(async (req, res) => {
  if (!/^[-\w]+$/.test(req.params.id)) throw err(404, 'Image not found.');
  const s = await rtdb.ref(`images/${req.params.id}`).get();
  if (!s.exists()) throw err(404, 'Image not found.');
  const v = s.val();
  res.set({ 'Content-Type': v.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin' });
  res.send(Buffer.from(v.data, 'base64'));
}));
r.post('/admin/images', ...adminOnly, wrap(async (req, res) => res.status(201).json(await saveImage(req, req.body.data))));

// ---------- Profile & favorites ----------
r.patch('/users/me', requireAuth, wrap(async (req, res) => {
  const b = z.object({ fullName: z.string().min(2), phone: z.string().optional() }).parse(req.body);
  await db.collection('users').doc(req.user.uid).set(b, { merge: true });
  res.json((await db.collection('users').doc(req.user.uid).get()).data());
}));
r.post('/users/photo', requireAuth, wrap(async (req, res) => {
  const ref = db.collection('users').doc(req.user.uid);
  const old = (await ref.get()).data()?.photoURL;
  const img = await saveImage(req, req.body.data, 300);
  await ref.set({ photoURL: img.url }, { merge: true });
  await deleteImageByUrl(old);
  res.json({ photoURL: img.url });
}));
r.get('/users/favorites', requireAuth, wrap(async (req, res) => {
  const favs = (await db.collection('users').doc(req.user.uid).get()).data()?.favorites || [];
  if (!favs.length) return res.json([]);
  const docs = await db.getAll(...favs.map((id) => db.collection('apartments').doc(id)));
  res.json(docs.filter((d) => d.exists).map((d) => ({ id: d.id, ...d.data() })));
}));
r.post('/users/favorites/:id', requireAuth, wrap(async (req, res) => {
  const ref = db.collection('users').doc(req.user.uid);
  const favs = (await ref.get()).data()?.favorites || [];
  const has = favs.includes(req.params.id);
  await ref.set({ favorites: has ? FieldValue.arrayRemove(req.params.id) : FieldValue.arrayUnion(req.params.id) }, { merge: true });
  res.json({ favorites: has ? favs.filter((f) => f !== req.params.id) : [...favs, req.params.id] });
}));

// ---------- Reviews ----------
async function refreshRating(apartmentId) {
  const s = await db.collection('reviews').where('apartmentId', '==', apartmentId).get();
  const avg = s.size ? s.docs.reduce((t, d) => t + d.data().rating, 0) / s.size : 0;
  await db.collection('apartments').doc(apartmentId).update({ rating: Math.round(avg * 10) / 10, reviewCount: s.size }).catch(() => {});
}
r.get('/reviews/:apartmentId', wrap(async (req, res) => {
  const items = list(await db.collection('reviews').where('apartmentId', '==', req.params.apartmentId).get());
  res.json(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}));
r.post('/reviews', requireAuth, wrap(async (req, res) => {
  const b = z.object({ apartmentId: z.string(), rating: z.number().int().min(1).max(5), comment: z.string().min(3).max(1000) }).parse(req.body);
  const [done, mine] = await Promise.all([
    db.collection('bookings').where('userId', '==', req.user.uid).where('apartmentId', '==', b.apartmentId).where('status', '==', 'completed').get(),
    db.collection('reviews').where('userId', '==', req.user.uid).where('apartmentId', '==', b.apartmentId).get(),
  ]);
  const reviewed = new Set(mine.docs.map((d) => d.data().bookingId));
  const booking = done.docs.find((d) => !reviewed.has(d.id));
  if (!booking) throw err(403, done.empty ? 'You can review an apartment after completing a stay.' : 'You have already reviewed this stay.');
  const name = ((await db.collection('users').doc(req.user.uid).get()).data()?.fullName || 'Guest').split(' ');
  const userName = name.length > 1 ? `${name[0]} ${name[name.length - 1][0]}.` : name[0];
  await db.collection('reviews').add({ ...b, userId: req.user.uid, userName, bookingId: booking.id, createdAt: new Date().toISOString() });
  await refreshRating(b.apartmentId);
  res.status(201).json({ ok: true });
}));

// ---------- Gallery ----------
r.get('/gallery', wrap(async (_q, res) => res.json(list(await db.collection('gallery').get()).sort((a, b) => a.order - b.order))));
r.post('/admin/gallery', ...adminOnly, wrap(async (req, res) => {
  const img = await saveImage(req, req.body.data);
  const ref = await db.collection('gallery').add({ url: img.url, featured: false, order: Date.now(), createdAt: new Date().toISOString() });
  res.status(201).json({ id: ref.id, url: img.url });
}));
r.patch('/admin/gallery/:id', ...adminOnly, wrap(async (req, res) => {
  const b = z.object({ featured: z.boolean().optional(), order: z.number().optional() }).parse(req.body);
  if (b.featured) {
    const batch = db.batch();
    (await db.collection('gallery').where('featured', '==', true).get()).docs.forEach((d) => batch.update(d.ref, { featured: false }));
    batch.update(db.collection('gallery').doc(req.params.id), b);
    await batch.commit();
  } else await db.collection('gallery').doc(req.params.id).update(b);
  res.json({ ok: true });
}));
r.delete('/admin/gallery/:id', ...adminOnly, wrap(async (req, res) => {
  const ref = db.collection('gallery').doc(req.params.id);
  await deleteImageByUrl((await ref.get()).data()?.url);
  await ref.delete();
  res.json({ ok: true });
}));

// ---------- Admin extras ----------
r.get('/admin/apartments', ...adminOnly, wrap(async (_q, res) => res.json(list(await db.collection('apartments').get()))));
r.get('/admin/reviews', ...adminOnly, wrap(async (_q, res) => res.json(list(await db.collection('reviews').limit(200).get()))));
r.delete('/admin/reviews/:id', ...adminOnly, wrap(async (req, res) => {
  const ref = db.collection('reviews').doc(req.params.id);
  const apt = (await ref.get()).data()?.apartmentId;
  await ref.delete();
  if (apt) await refreshRating(apt);
  res.json({ ok: true });
}));
r.get('/admin/stats', ...adminOnly, wrap(async (_q, res) => {
  const [apts, bks] = await Promise.all([db.collection('apartments').get(), db.collection('bookings').get()]);
  const b = bks.docs.map((d) => d.data());
  const today = new Date().toISOString().slice(0, 10);
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return { key: d.toISOString().slice(0, 7), count: 0, revenue: 0 }; });
  b.forEach((x) => { const m = months.find((k) => k.key === x.createdAt.slice(0, 7)); if (m && x.status !== 'cancelled') { m.count++; m.revenue += x.total; } });
  res.json({
    totalApartments: apts.size, availableApartments: apts.docs.filter((d) => d.data().status === 'available').length,
    totalBookings: b.length, upcomingBookings: b.filter((x) => x.checkIn >= today && ['pending', 'confirmed'].includes(x.status)).length,
    pendingReservations: b.filter((x) => x.status === 'pending').length,
    revenue: b.filter((x) => ['confirmed', 'completed'].includes(x.status)).reduce((t, x) => t + x.total, 0), months,
  });
}));

export default r;
