import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking, errMsg } from '../services/api';
import { kes, nights as calcNights, today } from '../utils/format';

const FEE = Number(import.meta.env.VITE_SERVICE_FEE || 2500);

export default function BookingCard({ apt, init }) {
  const { requireAuth, notify } = useAuth();
  const nav = useNavigate();
  const [checkIn, setIn] = useState(init.checkIn || '');
  const [checkOut, setOut] = useState(init.checkOut || '');
  const [guests, setGuests] = useState(init.guests || 1);
  const [busy, setBusy] = useState(false);
  const n = calcNights(checkIn, checkOut);
  const clash = n > 0 && apt.unavailable.some((r) => checkIn < r.checkOut && checkOut > r.checkIn);
  const valid = n > 0 && !clash && guests <= apt.maxGuests;

  const reserve = async () => {
    if (!valid) return notify(clash ? 'This apartment is unavailable for the selected dates.' : 'Please choose valid dates.', 'err');
    setBusy(true);
    try { const b = await createBooking({ apartmentId: apt.id, checkIn, checkOut, guests }); notify('Booking created.'); nav(`/booking/${b.id}`); }
    catch (e) { notify(errMsg(e), 'err'); }
    setBusy(false);
  };
  const field = 'border border-slate-300 rounded-xl px-3 py-2 w-full';

  return (
    <>
      <aside className="hidden lg:block sticky top-24 border border-slate-200 rounded-2xl p-6 shadow-lg">
        <p><span className="text-2xl font-bold">{kes(apt.pricePerNight)}</span> / night</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <label className="text-sm">Check-in<input type="date" min={today()} className={field} value={checkIn} onChange={(e) => setIn(e.target.value)} /></label>
          <label className="text-sm">Check-out<input type="date" min={checkIn || today()} className={field} value={checkOut} onChange={(e) => setOut(e.target.value)} /></label>
        </div>
        <label className="text-sm block mt-3">Guests<select className={field} value={guests} onChange={(e) => setGuests(+e.target.value)}>
          {Array.from({ length: apt.maxGuests }, (_, i) => <option key={i} value={i + 1}>{i + 1} guest{i ? 's' : ''}</option>)}</select></label>
        {clash && <p className="text-red-600 text-sm mt-3">This apartment is unavailable for the selected dates.</p>}
        {n > 0 && !clash && <div className="mt-4 pt-4 border-t space-y-1 text-sm">
          <div className="flex justify-between"><span>{n} nights</span><span>{kes(n * apt.pricePerNight)}</span></div>
          <div className="flex justify-between"><span>Service fee</span><span>{kes(FEE)}</span></div>
          <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>{kes(n * apt.pricePerNight + FEE)}</span></div></div>}
        <button disabled={busy} onClick={() => requireAuth(reserve)} className="mt-5 w-full bg-amber text-navy-900 font-bold py-3 rounded-xl hover:brightness-95">{busy ? 'Reserving…' : 'Reserve'}</button>
      </aside>

      {/* Mobile: sticky bottom bar with date sheet inline */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t shadow-2xl p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <input aria-label="Check-in" type="date" min={today()} className={field} value={checkIn} onChange={(e) => setIn(e.target.value)} />
          <input aria-label="Check-out" type="date" min={checkIn || today()} className={field} value={checkOut} onChange={(e) => setOut(e.target.value)} />
          <select aria-label="Guests" className={field} value={guests} onChange={(e) => setGuests(+e.target.value)}>{Array.from({ length: apt.maxGuests }, (_, i) => <option key={i} value={i + 1}>{i + 1} 👤</option>)}</select>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-bold">{kes(apt.pricePerNight)}<span className="font-normal text-slate-500">/night</span></p>{n > 0 && <p className="text-xs text-slate-500">{n} nights · {kes(n * apt.pricePerNight + FEE)}</p>}</div>
          <button disabled={busy} onClick={() => requireAuth(reserve)} className="bg-amber text-navy-900 font-bold px-8 py-3 rounded-xl">Reserve</button>
        </div>
      </div>
    </>
  );
}
