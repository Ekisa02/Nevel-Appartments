import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { AMENITIES as ICONS } from '../utils/amenities';
import ReviewSection from '../components/ReviewSection';
import { getApartment, errMsg } from '../services/api';
import BookingCard from '../components/BookingCard';
import { Skeleton } from '../components/Skeleton';


export default function ApartmentDetails() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const [apt, setApt] = useState(null);
  const [error, setError] = useState('');
  const [big, setBig] = useState(null);
  useEffect(() => { getApartment(id).then((a) => { setApt(a); document.title = `${a.name} | Nevel Apartments`; }).catch((e) => setError(e.response?.status === 404 ? 'Apartment not found.' : errMsg(e))); }, [id]);

  if (error) return <p className="max-w-3xl mx-auto p-10 text-lg">{error}</p>;
  if (!apt) return <div className="max-w-7xl mx-auto p-4"><Skeleton className="h-96" /></div>;
  const [main, ...rest] = apt.images;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 pb-48 lg:pb-8">
      <h1 className="font-display text-3xl font-bold">{apt.name}</h1>
      <p className="flex items-center gap-2 text-slate-600 mt-1"><Star size={16} className="fill-amber text-amber" />{Number(apt.rating).toFixed(1)} · {apt.reviewCount} reviews · {apt.location}</p>
      <div className="grid md:grid-cols-4 md:grid-rows-2 gap-2 mt-6 rounded-2xl overflow-hidden md:h-[420px]">
        <button className="md:col-span-2 md:row-span-2" onClick={() => setBig(main)}><img src={main} alt={apt.name} className="w-full h-64 md:h-full object-cover" /></button>
        {rest.slice(0, 4).map((src, i) => <button key={i} className="hidden md:block" onClick={() => setBig(src)}><img src={src} alt={`${apt.name} photo ${i + 2}`} loading="lazy" className="w-full h-full object-cover" /></button>)}
      </div>
      {big && <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setBig(null)} role="dialog" aria-label="Photo"><img src={big} alt="" className="max-h-full max-w-full" /></div>}
      <div className="grid lg:grid-cols-[1fr_380px] gap-12 mt-8">
        <div>
          <p className="text-lg font-semibold">{apt.maxGuests} guests · {apt.bedrooms} bedrooms · {apt.beds} beds · {apt.bathrooms} bathrooms</p>
          <p className="mt-6 text-slate-700 leading-relaxed max-w-prose">{apt.description}</p>
          <h2 className="font-display text-2xl font-bold mt-10 mb-4">What this place offers</h2>
          <ul className="grid sm:grid-cols-2 gap-3">{apt.amenities.filter((k) => ICONS[k]).map((k) => { const [I, label] = ICONS[k]; return <li key={k} className="flex items-center gap-3"><I className="text-amber" />{label}</li>; })}</ul>
          <ReviewSection aptId={apt.id} />
        </div>
        <BookingCard apt={apt} init={{ checkIn: sp.get('checkIn'), checkOut: sp.get('checkOut'), guests: +sp.get('guests') || 1 }} />
      </div>
    </main>
  );
}
