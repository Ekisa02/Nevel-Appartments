import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBooking, errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { kes, prettyDate } from '../utils/format';

export default function Confirmation() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { if (user) getBooking(id).then(setB).catch((e) => setError(errMsg(e))); }, [id, user]);
  if (loading) return null;
  if (error) return <p className="p-10 text-center">{error}</p>;
  if (!b) return <p className="p-10 text-center">Loading your reservation…</p>;
  const rows = [['Booking ID', b.ref], ['Apartment', b.apartmentName], ['Check-in', prettyDate(b.checkIn)], ['Check-out', prettyDate(b.checkOut)], ['Guests', b.guests], ['Total', kes(b.total)]];
  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold">Reservation received 🎉</h1>
      <p className="text-slate-600 mt-2">Thank you for choosing Nevel Apartments. Status: <b>{b.status}</b> — we'll confirm shortly.</p>
      <dl className="mt-6 divide-y border rounded-2xl">{rows.map(([k, v]) => <div key={k} className="flex justify-between p-4"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>)}</dl>
      <div className="flex gap-3 mt-6"><Link to="/my-bookings" className="bg-navy text-white px-5 py-3 rounded-xl font-semibold">View My Booking</Link><Link to="/" className="border-2 border-navy px-5 py-3 rounded-xl font-semibold">Return Home</Link></div>
    </main>
  );
}
