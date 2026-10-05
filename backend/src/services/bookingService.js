import { db } from '../config/firebase.js';
import { getProvider } from './payment.js';

const FEE = Number(process.env.SERVICE_FEE_PER_STAY || 0);
const nightsBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const err = (status, message) => Object.assign(new Error(message), { status });

export async function createBooking(userId, { apartmentId, checkIn, checkOut, guests }) {
  const nights = nightsBetween(checkIn, checkOut);
  const today = new Date().toISOString().slice(0, 10);
  if (nights < 1 || checkIn < today) throw err(400, 'Please choose valid dates.');

  const aptRef = db.collection('apartments').doc(apartmentId);
  const bookingRef = db.collection('bookings').doc();

  // Transaction makes the overlap check + write atomic (prevents double booking).
  const booking = await db.runTransaction(async (tx) => {
    const apt = await tx.get(aptRef);
    if (!apt.exists) throw err(404, 'Apartment not found.');
    const a = apt.data();
    if (a.status !== 'available') throw err(409, 'This apartment is not currently available.');
    if (guests > a.maxGuests) throw err(400, `This apartment sleeps up to ${a.maxGuests} guests.`);

    const active = await tx.get(db.collection('bookings').where('apartmentId', '==', apartmentId).where('status', 'in', ['pending', 'confirmed']));
    const clash = active.docs.some((d) => checkIn < d.data().checkOut && checkOut > d.data().checkIn);
    if (clash) throw err(409, 'This apartment is unavailable for the selected dates.');

    const subtotal = nights * a.pricePerNight;
    const data = {
      id: bookingRef.id, ref: 'NEV-' + bookingRef.id.slice(0, 6).toUpperCase(), userId, apartmentId,
      apartmentName: a.name, image: a.featuredImage, checkIn, checkOut, guests, nights,
      pricePerNight: a.pricePerNight, subtotal, serviceFee: FEE, total: subtotal + FEE,
      status: 'pending', payment: null, createdAt: new Date().toISOString(),
    };
    tx.set(bookingRef, data);
    return data;
  });
  booking.payment = await getProvider('manual').createPayment(booking);
  await bookingRef.update({ payment: booking.payment });
  return booking;
}

export async function getUnavailableRanges(apartmentId) {
  const snap = await db.collection('bookings').where('apartmentId', '==', apartmentId).where('status', 'in', ['pending', 'confirmed']).get();
  return snap.docs.map((d) => ({ checkIn: d.data().checkIn, checkOut: d.data().checkOut }));
}

export async function cancelBooking(user, id) {
  const ref = db.collection('bookings').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw err(404, 'Booking not found.');
  const b = snap.data();
  if (b.userId !== user.uid && user.role !== 'admin') throw err(403, 'You can only manage your own bookings.');
  if (!['pending', 'confirmed'].includes(b.status)) throw err(400, 'This booking can no longer be cancelled.');
  const hours = (new Date(b.checkIn) - new Date()) / 3600000;
  if (user.role !== 'admin' && hours < Number(process.env.CANCEL_HOURS_BEFORE_CHECKIN || 48))
    throw err(400, 'Free cancellation has ended for this booking. Please contact us.');
  await ref.update({ status: 'cancelled' });
  return { ...b, status: 'cancelled' };
}
