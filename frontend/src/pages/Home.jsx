import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApartments } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';
import { CardSkeletons } from '../components/Skeleton';
import { today } from '../utils/format';

export default function Home() {
  const nav = useNavigate();
  const [apts, setApts] = useState(null);
  const [q, setQ] = useState({ checkIn: '', checkOut: '', guests: 2 });
  useEffect(() => { getApartments().then((a) => setApts(a.slice(0, 3))).catch(() => setApts([])); }, []);
  const search = (e) => { e.preventDefault(); nav('/apartments?' + new URLSearchParams(q)); };
  const f = 'bg-transparent w-full outline-none';

  return (
    <>
      <section className="relative bg-navy-900 text-white">
        <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1800&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <h1 className="font-display font-extrabold text-4xl md:text-6xl max-w-3xl leading-tight">Welcome to Nevel Apartments</h1>
          <p className="mt-3 text-xl text-amber font-semibold">Comfort. Privacy. Convenience.</p>
          <p className="mt-4 max-w-xl text-slate-200">Comfortable, modern accommodation designed for short stays, business trips and extended visits.</p>
          <form onSubmit={search} className="mt-10 bg-white text-navy rounded-3xl md:rounded-full p-3 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-2 shadow-2xl max-w-4xl">
            <label className="px-4 py-2 text-xs font-semibold">Check-in<input type="date" min={today()} className={f} value={q.checkIn} onChange={(e) => setQ({ ...q, checkIn: e.target.value })} /></label>
            <label className="px-4 py-2 text-xs font-semibold">Check-out<input type="date" min={q.checkIn || today()} className={f} value={q.checkOut} onChange={(e) => setQ({ ...q, checkOut: e.target.value })} /></label>
            <label className="px-4 py-2 text-xs font-semibold">Guests<input type="number" min="1" max="10" className={f} value={q.guests} onChange={(e) => setQ({ ...q, guests: e.target.value })} /></label>
            <button className="bg-amber font-bold px-8 py-3 rounded-full">Search Availability</button>
          </form>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="font-display text-3xl font-bold mb-6">Featured apartments</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!apts ? <CardSkeletons n={3} /> : apts.length ? apts.map((a) => <ApartmentCard key={a.id} a={a} />) : <p>No apartments yet. Run the seed script or add one in admin.</p>}
        </div>
      </section>
    </>
  );
}
