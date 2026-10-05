import { useState } from 'react';
import { sendContact, errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { VITE_CONTACT_PHONE: phone, VITE_CONTACT_EMAIL: email, VITE_WHATSAPP: wa, VITE_MAP_LAT: lat, VITE_MAP_LNG: lng, VITE_ADDRESS: address } = import.meta.env;

export default function Contact() {
  const { notify } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try { await sendContact(f); notify('Message sent. We will reply soon.'); setF({ name: '', email: '', phone: '', message: '' }); }
    catch (er) { notify(errMsg(er), 'err'); }
  };
  const i = 'w-full border border-slate-300 rounded-xl px-4 py-3';
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10"><div><h1 className="font-display text-3xl font-bold mb-6">Contact us</h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">Name<input required className={i} value={f.name} onChange={set('name')} /></label>
        <label className="block text-sm font-medium">Email<input required type="email" className={i} value={f.email} onChange={set('email')} /></label>
        <label className="block text-sm font-medium">Phone<input className={i} value={f.phone} onChange={set('phone')} /></label>
        <label className="block text-sm font-medium">Message<textarea required rows={5} className={i} value={f.message} onChange={set('message')} /></label>
        <button className="bg-amber text-navy-900 font-bold px-8 py-3 rounded-xl">Send Message</button>
      </form></div>
      <div className="space-y-3">
        {phone && <p><a href={`tel:${phone}`} className="underline">{phone}</a></p>}{email && <p><a href={`mailto:${email}`} className="underline">{email}</a></p>}
        {wa && <p><a href={`https://wa.me/${wa}`} className="underline" target="_blank" rel="noreferrer">Chat on WhatsApp</a></p>}{address && <p>{address}</p>}
        {lat && lng ? <iframe title="Nevel Apartments location" loading="lazy" className="w-full h-72 rounded-2xl border-0" src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`} />
          : <p className="p-6 rounded-2xl bg-mist text-slate-600">Map not configured. Set VITE_MAP_LAT and VITE_MAP_LNG in frontend/.env.</p>}
      </div>
    </main>
  );
}
