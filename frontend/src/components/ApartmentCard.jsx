import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { kes } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function ApartmentCard({ a, query = '' }) {
  const { profile, requireAuth, toggleFavorite } = useAuth();
  const fav = profile?.favorites?.includes(a.id);
  return (
    <Link to={`/apartments/${a.id}${query}`} className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow border border-slate-100">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img src={a.featuredImage} alt={a.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <button aria-label={fav ? 'Remove from favorites' : 'Save to favorites'} onClick={(e) => { e.preventDefault(); requireAuth(() => toggleFavorite(a.id)); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-navy/50 backdrop-blur"><Heart size={20} className={fav ? 'fill-amber text-amber' : 'text-white'} /></button>
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-2"><h3 className="font-display font-bold text-lg">{a.name}</h3>
          <span className="flex items-center gap-1 text-sm font-semibold shrink-0"><Star size={14} className="fill-amber text-amber" />{Number(a.rating).toFixed(1)}</span></div>
        <p className="text-sm text-slate-500">{a.location}</p>
        <p className="text-sm text-slate-600 mt-2">{a.maxGuests} guests · {a.bedrooms || 'Studio'}{a.bedrooms ? ' bedroom' : ''} · {a.beds} bed · {a.bathrooms} bath</p>
        <p className="mt-3"><span className="font-bold text-lg">{kes(a.pricePerNight)}</span> <span className="text-slate-500">/ night</span></p>
      </div>
    </Link>
  );
}
