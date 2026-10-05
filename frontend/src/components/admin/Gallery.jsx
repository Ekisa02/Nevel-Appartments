import { useEffect, useState } from 'react';
import { adm, getGallery, errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { compress } from '../../utils/image';
import { Loading } from './ui';

export default function Gallery() {
  const { notify } = useAuth();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => getGallery().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  const run = async (fn, msg) => { try { await fn(); if (msg) notify(msg); await load(); } catch (e) { notify(errMsg(e), 'err'); } };
  const upload = async (files) => { setBusy(true); await run(async () => { for (const f of files) await adm.post('/gallery', { data: await compress(f, 1600) }); }, 'Photos uploaded.'); setBusy(false); };
  const move = (i, d) => { const a = items[i], b = items[i + d]; if (b) run(async () => { await adm.patch(`/gallery/${a.id}`, { order: b.order }); await adm.patch(`/gallery/${b.id}`, { order: a.order }); }); };
  if (!items) return <Loading />;
  return (
    <>
      <label className="inline-block bg-navy text-white px-5 py-2 rounded-xl font-semibold cursor-pointer mb-4">{busy ? 'Uploading…' : 'Upload photos'}<input type="file" multiple accept="image/*" hidden disabled={busy} onChange={(e) => upload([...e.target.files])} /></label>
      {!items.length && <p className="text-slate-600">No gallery photos yet. Until you upload some, the public gallery shows apartment photos.</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{items.map((g, i) => (
        <div key={g.id} className="border rounded-2xl overflow-hidden"><img src={g.url} alt="" className="w-full h-36 object-cover" />
          <div className="flex justify-between p-2 text-sm"><button onClick={() => run(() => adm.patch(`/gallery/${g.id}`, { featured: true }), 'Featured photo set.')}>{g.featured ? '★ Featured' : '☆ Feature'}</button>
            <span><button aria-label="Move earlier" onClick={() => move(i, -1)}>◀</button> <button aria-label="Move later" onClick={() => move(i, 1)}>▶</button> <button className="text-red-600" onClick={() => window.confirm('Delete photo?') && run(() => adm.del(`/gallery/${g.id}`), 'Photo deleted.')}>Delete</button></span></div></div>))}</div>
    </>
  );
}
