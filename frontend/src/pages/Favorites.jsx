import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';
import { CardSkeletons } from '../components/Skeleton';

export default function Favorites() {
  const { user, loading, profile, requireAuth } = useAuth();
  const [items, setItems] = useState(null);
  useEffect(() => { if (user) getFavorites().then(setItems).catch(() => setItems([])); else if (!loading) requireAuth(() => {}); }, [user, loading]);
  const shown = (items || []).filter((a) => profile?.favorites?.includes(a.id));
  return (
    <main className="max-w-7xl mx-auto px-4 py-10"><h1 className="font-display text-3xl font-bold mb-6">Favorites</h1>
      {!user ? <p>Please sign in to see your saved apartments.</p> : !items ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><CardSkeletons n={3} /></div> :
        shown.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((a) => <ApartmentCard key={a.id} a={a} />)}</div> :
          <p className="text-slate-600">Nothing saved yet. Tap the heart on any apartment, or <Link className="underline" to="/apartments">browse apartments</Link>.</p>}
    </main>
  );
}
