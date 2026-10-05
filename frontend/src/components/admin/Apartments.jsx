import { useEffect, useState } from 'react';
import { adm, errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AMENITIES } from '../../utils/amenities';
import { compress } from '../../utils/image';
import { kes } from '../../utils/format';
import { Loading } from './ui';

const blank = { name: '', description: '', pricePerNight: '', location: '', maxGuests: 2, bedrooms: 1, beds: 1, bathrooms: 1, amenities: [], images: [], featuredImage: '', status: 'available' };

export default function Apartments() {
  const { notify } = useAuth();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null);
  const [up, setUp] = useState(false);
  const load = () => adm.get('/apartments').then(setItems).catch((e) => notify(errMsg(e), 'err'));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const { id, rating, reviewCount, createdAt, updatedAt, ...r } = form;
    const body = { ...r, pricePerNight: +r.pricePerNight, maxGuests: +r.maxGuests, bedrooms: +r.bedrooms, beds: +r.beds, bathrooms: +r.bathrooms, featuredImage: r.featuredImage || r.images[0] || '' };
    try { id ? await adm.patch(`/apartments/${id}`, body) : await adm.post('/apartments', body); notify(id ? 'Apartment updated successfully.' : 'Apartment added successfully.'); setForm(null); load(); }
    catch (er) { notify(errMsg(er), 'err'); }
  };
  const remove = async (a) => {
    if (!window.confirm(`Delete ${a.name}?`)) return;
    try { await adm.del(`/apartments/${a.id}`); notify('Apartment deleted.'); load(); } catch (er) { notify(errMsg(er), 'err'); }
  };
  const addImages = async (files) => {
    setUp(true);
    try { const urls = []; for (const f of files) urls.push((await adm.post('/images', { data: await compress(f) })).url); setForm((p) => ({ ...p, images: [...p.images, ...urls] })); }
    catch (er) { notify(errMsg(er), 'err'); }
    setUp(false);
  };
  const toggleAm = (k) => setForm({ ...form, amenities: form.amenities.includes(k) ? form.amenities.filter((x) => x !== k) : [...form.amenities, k] });
  const i = 'w-full border border-slate-300 rounded-xl px-3 py-2';

  if (form) return (
    <form onSubmit={save} className="space-y-4 max-w-2xl">
      <h2 className="font-display text-xl font-bold">{form.id ? 'Edit apartment' : 'Add apartment'}</h2>
      <label className="block text-sm">Name<input required className={i} value={form.name} onChange={set('name')} /></label>
      <label className="block text-sm">Description<textarea required rows={4} className={i} value={form.description} onChange={set('description')} /></label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[['pricePerNight', 'Price / night (KES)'], ['maxGuests', 'Guests'], ['bedrooms', 'Bedrooms'], ['beds', 'Beds'], ['bathrooms', 'Bathrooms']].map(([k, l]) =>
          <label key={k} className="text-sm">{l}<input required type="number" min="0" className={i} value={form[k]} onChange={set(k)} /></label>)}
        <label className="text-sm">Status<select className={i} value={form.status} onChange={set('status')}><option value="available">Available</option><option value="unavailable">Unavailable</option></select></label>
      </div>
      <label className="block text-sm">Location<input required className={i} value={form.location} onChange={set('location')} /></label>
      <fieldset><legend className="text-sm mb-2">Amenities</legend><div className="flex flex-wrap gap-2">{Object.entries(AMENITIES).map(([k, [, l]]) =>
        <label key={k} className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${form.amenities.includes(k) ? 'bg-navy text-white' : ''}`}><input type="checkbox" className="sr-only" checked={form.amenities.includes(k)} onChange={() => toggleAm(k)} />{l}</label>)}</div></fieldset>
      <div><p className="text-sm mb-2">Images (first / starred is the cover)</p>
        <div className="flex flex-wrap gap-2">{form.images.map((u) => (
          <div key={u} className="relative"><img src={u} alt="" className="w-24 h-20 object-cover rounded-lg" />
            <button type="button" aria-label="Make cover" onClick={() => setForm({ ...form, featuredImage: u })} className="absolute left-1 top-1 bg-white rounded px-1 text-xs">{(form.featuredImage || form.images[0]) === u ? '★' : '☆'}</button>
            <button type="button" aria-label="Remove image" onClick={() => setForm({ ...form, images: form.images.filter((x) => x !== u) })} className="absolute right-1 top-1 bg-white rounded px-1 text-xs">✕</button></div>))}
          <label className="w-24 h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-xs cursor-pointer text-center">{up ? 'Uploading…' : '+ Add photos'}<input type="file" multiple accept="image/*" hidden disabled={up} onChange={(e) => addImages([...e.target.files])} /></label></div></div>
      <div className="flex gap-3"><button disabled={up} className="bg-amber text-navy-900 font-bold px-6 py-3 rounded-xl">Save apartment</button><button type="button" onClick={() => setForm(null)} className="border px-6 py-3 rounded-xl">Cancel</button></div>
    </form>
  );
  return (
    <>
      <button onClick={() => setForm(blank)} className="bg-navy text-white px-5 py-2 rounded-xl font-semibold mb-4">Add apartment</button>
      {!items ? <Loading /> : <div className="space-y-3">{items.map((a) => (
        <div key={a.id} className="flex items-center gap-3 border rounded-2xl p-3"><img src={a.featuredImage} alt="" className="w-20 h-16 object-cover rounded-lg" />
          <div className="flex-1 min-w-0"><p className="font-semibold truncate">{a.name}</p><p className="text-sm text-slate-500">{kes(a.pricePerNight)} · {a.status}</p></div>
          <button className="underline text-sm" onClick={() => setForm(a)}>Edit</button><button className="underline text-sm text-red-600" onClick={() => remove(a)}>Delete</button></div>))}</div>}
    </>
  );
}
