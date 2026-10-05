import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking, errMsg } from '../services/api';
import { Skeleton } from '../components/Skeleton';
import { kes, prettyDate, today } from '../utils/format';

export default function MyBookings() {
  const { user, loading, requireAuth, notify } = useAuth();
  const [items, setItems] = useState(null);
  const load = () => getMyBookings().then(setItems).catch((e) => { notify(errMsg(e), 'err'); setItems([]); });
  useEffect(() => { if (user) load(); else if (!loading) requireAuth(load); }, [user, loading]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await cancelBooking(id); notify('Booking cancelled.'); load(); } catch (e) { notify(errMsg(e), 'err'); }
  };
  if (!user) return <p className="p-10 text-center">Please sign in to view your bookings.</p>;
  if (!items) return <div className="max-w-3xl mx-auto p-4 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  const badge = { pending: 'bg-amber-soft', confirmed: 'bg-green-100', cancelled: 'bg-red-100', completed: 'bg-slate-200' };
  const group = (title, list) => list.length > 0 && (
    <section className="mt-8"><h2 className="font-display text-xl font-bold mb-3">{title}</h2>
      <div className="space-y-4">{list.map((b) => (
        <article key={b.id} className="flex flex-col sm:flex-row gap-4 border rounded-2xl p-3">
          <img src={b.image} alt={b.apartmentName} className="w-full sm:w-40 h-32 object-cover rounded-xl" />
          <div className="flex-1"><div className="flex justify-between"><h3 className="font-bold">{b.apartmentName}</h3><span className={`text-xs px-3 py-1 rounded-full capitalize ${badge[b.status]}`}>{b.status}</span></div>
            <p className="text-sm text-slate-500">{b.ref} · {b.guests} guests</p>
            <p className="text-sm mt-1">{prettyDate(b.checkIn)} – {prettyDate(b.checkOut)}</p>
            <p className="font-semibold mt-1">{kes(b.total)}</p>
            {['pending', 'confirmed'].includes(b.status) && <button onClick={() => cancel(b.id)} className="text-sm text-red-600 underline mt-2">Cancel booking</button>}</div>
        </article>))}</div></section>);
  return (
    <main className="max-w-3xl mx-auto px-4 py-10"><h1 className="font-display text-3xl font-bold">My Bookings</h1>
      {!items.length && <p className="mt-6 text-slate-600">No bookings yet. Find an apartment and reserve your first stay.</p>}
      {group('Upcoming', items.filter((b) => b.checkOut >= today() && b.status !== 'cancelled'))}
      {group('Past & cancelled', items.filter((b) => b.checkOut < today() || b.status === 'cancelled'))}
    </main>
  );
}
