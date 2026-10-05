import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/admin/Dashboard';
import Apartments from '../components/admin/Apartments';
import Bookings from '../components/admin/Bookings';
import Gallery from '../components/admin/Gallery';
import { Guests, Messages, Reviews } from '../components/admin/Lists';

const TABS = { Dashboard, Apartments, Bookings, Guests, Reviews, Messages, Gallery };

export default function Admin() {
  const { user, isAdmin, loading, requireAuth } = useAuth();
  const [tab, setTab] = useState('Dashboard');
  useEffect(() => { document.title = 'Admin | Nevel Apartments'; if (!user && !loading) requireAuth(() => {}); }, [user, loading]);
  if (loading) return null;
  // UI gate only: every admin API call is re-checked on the server.
  if (!isAdmin) return <p className="p-16 text-center text-lg">Administrator access required.</p>;
  const Panel = TABS[tab];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:grid md:grid-cols-[200px_1fr] gap-8">
      <nav aria-label="Admin" className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0">
        {Object.keys(TABS).map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-left whitespace-nowrap ${tab === t ? 'bg-navy text-white' : 'hover:bg-mist'}`}>{t}</button>)}
      </nav>
      <main className="min-w-0"><h1 className="font-display text-2xl font-bold mb-5">{tab}</h1><Panel /></main>
    </div>
  );
}
