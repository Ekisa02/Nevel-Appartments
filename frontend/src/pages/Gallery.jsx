import { useEffect, useState } from 'react';
import { getGallery, getApartments } from '../services/api';

export default function Gallery() {
  const [imgs, setImgs] = useState(null);
  const [big, setBig] = useState(null);
  useEffect(() => {
    document.title = 'Gallery | Nevel Apartments';
    getGallery().then(async (g) => setImgs(g.length ? g.map((x) => x.url) : (await getApartments()).flatMap((a) => a.images))).catch(() => setImgs([]));
  }, []);
  return (
    <main className="max-w-7xl mx-auto px-4 py-10"><h1 className="font-display text-3xl font-bold mb-6">Gallery</h1>
      {!imgs ? <div className="h-64 bg-slate-100 animate-pulse rounded-2xl" /> : !imgs.length ? <p className="text-slate-600">Photos are coming soon.</p> :
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>button]:mb-4">{imgs.map((u, i) => <button key={i} className="block w-full" onClick={() => setBig(u)}><img src={u} alt={`Nevel Apartments photo ${i + 1}`} loading="lazy" className="w-full rounded-2xl" /></button>)}</div>}
      {big && <div role="dialog" aria-label="Photo" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setBig(null)}><img src={big} alt="" className="max-h-full max-w-full" /></div>}
    </main>
  );
}
