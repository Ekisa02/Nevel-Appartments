import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getApartments, errMsg } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';
import { CardSkeletons } from '../components/Skeleton';

export default function Apartments() {
  const [sp] = useSearchParams();
  const [apts, setApts] = useState(null);
  const [error, setError] = useState('');
  const [guests, setGuests] = useState(+sp.get('guests') || 1);
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('price-asc');
  useEffect(() => { document.title = 'Apartments | Nevel Apartments'; getApartments().then(setApts).catch((e) => setError(errMsg(e))); }, []);

  const shown = useMemo(() => (apts || []).filter((a) => a.maxGuests >= guests && (!maxPrice || a.pricePerNight <= +maxPrice))
    .sort((a, b) => sort === 'price-asc' ? a.pricePerNight - b.pricePerNight : sort === 'price-desc' ? b.pricePerNight - a.pricePerNight : b.rating - a.rating), [apts, guests, maxPrice, sort]);
  const query = sp.toString() ? `?${sp}` : '';
  const f = 'border border-slate-300 rounded-xl px-3 py-2';

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Apartments</h1>
      <div className="flex flex-wrap gap-3 my-6">
        <label className="text-sm">Guests<input type="number" min="1" className={`${f} block w-24`} value={guests} onChange={(e) => setGuests(+e.target.value || 1)} /></label>
        <label className="text-sm">Max price / night<input type="number" className={`${f} block w-36`} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /></label>
        <label className="text-sm">Sort<select className={`${f} block`} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Highest Rated</option></select></label>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!apts && !error ? <CardSkeletons /> : shown.map((a) => <ApartmentCard key={a.id} a={a} query={query} />)}
      </div>
      {apts && !shown.length && <p className="text-slate-600">No apartments match those filters. Try a higher price or fewer guests.</p>}
    </main>
  );
}
