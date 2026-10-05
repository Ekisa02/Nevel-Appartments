import { useEffect, useState } from 'react';
import { adm, errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { kes, prettyDate } from '../../utils/format';
import { Badge, Table, Loading } from './ui';

export default function Bookings() {
  const { notify } = useAuth();
  const [items, setItems] = useState(null);
  const [guests, setGuests] = useState({});
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const load = () => adm.get('/bookings').then(setItems).catch((e) => notify(errMsg(e), 'err'));
  useEffect(() => { load(); adm.get('/users').then((u) => setGuests(Object.fromEntries(u.map((x) => [x.id, x])))).catch(() => {}); }, []);
  const set = async (id, s) => { try { await adm.patch(`/bookings/${id}`, { status: s }); notify(`Booking ${s}.`); load(); } catch (e) { notify(errMsg(e), 'err'); } };
  if (!items) return <Loading />;
  const g = (b) => guests[b.userId];
  const shown = items.filter((b) => (!status || b.status === status) && `${b.ref} ${b.apartmentName} ${g(b)?.fullName || ''} ${g(b)?.email || ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <input aria-label="Search bookings" placeholder="Search ref, guest, apartment" className="border border-slate-300 rounded-xl px-3 py-2 flex-1 min-w-[200px]" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Filter status" className="border border-slate-300 rounded-xl px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{['pending', 'confirmed', 'cancelled', 'completed'].map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <Table head={['Ref', 'Guest', 'Apartment', 'Dates', 'Total', 'Status', 'Actions']}>
        {shown.map((b) => (
          <tr key={b.id}><td className="px-4 py-3 font-medium">{b.ref}</td>
            <td className="px-4 py-3">{g(b)?.fullName || '—'}<br /><span className="text-slate-500">{g(b)?.phone || g(b)?.email}</span></td>
            <td className="px-4 py-3">{b.apartmentName}<br /><span className="text-slate-500">{b.guests} guests</span></td>
            <td className="px-4 py-3">{prettyDate(b.checkIn)}<br />→ {prettyDate(b.checkOut)}</td><td className="px-4 py-3">{kes(b.total)}</td><td className="px-4 py-3"><Badge s={b.status} /></td>
            <td className="px-4 py-3 space-x-2 whitespace-nowrap">
              {b.status === 'pending' && <button className="underline" onClick={() => set(b.id, 'confirmed')}>Confirm</button>}
              {b.status === 'confirmed' && <button className="underline" onClick={() => set(b.id, 'completed')}>Complete</button>}
              {['pending', 'confirmed'].includes(b.status) && <button className="underline text-red-600" onClick={() => window.confirm('Cancel this booking?') && set(b.id, 'cancelled')}>Cancel</button>}</td></tr>))}
      </Table>
      {!shown.length && <p className="mt-4 text-slate-600">No bookings match.</p>}
    </>
  );
}
