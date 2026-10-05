import { useEffect, useState } from 'react';
import { adm, errMsg } from '../../services/api';
import { kes } from '../../utils/format';
import { StatsCard, Loading } from './ui';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { adm.get('/stats').then(setS).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <p className="text-red-600">{err}</p>;
  if (!s) return <Loading />;
  const max = Math.max(1, ...s.months.map((m) => m.revenue));
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Total apartments" value={s.totalApartments} /><StatsCard label="Available apartments" value={s.availableApartments} />
        <StatsCard label="Total bookings" value={s.totalBookings} /><StatsCard label="Upcoming bookings" value={s.upcomingBookings} />
        <StatsCard label="Pending reservations" value={s.pendingReservations} /><StatsCard label="Revenue" value={kes(s.revenue)} />
      </div>
      <h2 className="font-display font-bold text-lg mt-8 mb-2">Revenue, last 6 months</h2>
      <svg viewBox="0 0 600 220" className="w-full border rounded-2xl bg-white" role="img" aria-label="Monthly revenue bar chart">
        {s.months.map((m, i) => { const h = (m.revenue / max) * 150; return (
          <g key={m.key}><rect x={30 + i * 95} y={170 - h} width="60" height={h} rx="6" fill="#E39A2D" />
            <text x={60 + i * 95} y="192" textAnchor="middle" fontSize="12" fill="#0F2238">{m.key.slice(5)}/{m.key.slice(2, 4)}</text>
            <text x={60 + i * 95} y="210" textAnchor="middle" fontSize="11" fill="#64748b">{m.count} bookings</text></g>); })}
      </svg>
    </>
  );
}
