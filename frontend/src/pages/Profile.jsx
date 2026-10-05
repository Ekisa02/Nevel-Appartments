import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMe, uploadPhoto, errMsg } from '../services/api';
import { compress } from '../utils/image';

export default function Profile() {
  const { user, profile, setProfile, loading, requireAuth, logout, notify } = useAuth();
  const [f, setF] = useState({ fullName: '', phone: '' });
  const file = useRef();
  useEffect(() => { if (profile) setF({ fullName: profile.fullName || '', phone: profile.phone || '' }); }, [profile]);
  useEffect(() => { if (!user && !loading) requireAuth(() => {}); }, [user, loading]);
  if (!user) return <p className="p-10 text-center">Please sign in to manage your profile.</p>;

  const save = async (e) => {
    e.preventDefault();
    try { setProfile(await updateMe(f)); notify('Your profile has been updated.'); } catch (er) { notify(errMsg(er), 'err'); }
  };
  const photo = async (e) => {
    try { const { photoURL } = await uploadPhoto(await compress(e.target.files[0], 256, 0.8)); setProfile({ ...profile, photoURL }); notify('Profile photo updated.'); }
    catch (er) { notify(errMsg(er), 'err'); }
  };
  const i = 'w-full border border-slate-300 rounded-xl px-4 py-3';
  return (
    <main className="max-w-xl mx-auto px-4 py-10"><h1 className="font-display text-3xl font-bold">Profile</h1>
      <div className="flex items-center gap-4 mt-6">
        <img src={profile?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.fullName || 'N')}&background=0F2238&color=E39A2D`} alt="Your profile" className="w-20 h-20 rounded-full object-cover" />
        <input ref={file} type="file" accept="image/*" hidden onChange={photo} />
        <button onClick={() => file.current.click()} className="border-2 border-navy px-4 py-2 rounded-xl font-semibold">Change photo</button>
      </div>
      <form onSubmit={save} className="space-y-4 mt-6">
        <label className="block text-sm font-medium">Full name<input required minLength={2} className={i} value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></label>
        <label className="block text-sm font-medium">Email<input disabled className={`${i} bg-mist`} value={user.email || ''} /></label>
        <label className="block text-sm font-medium">Phone<input type="tel" className={i} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <button className="bg-amber text-navy-900 font-bold px-8 py-3 rounded-xl">Save changes</button>
      </form>
      <div className="flex flex-wrap gap-4 mt-8 text-sm"><Link className="underline" to="/my-bookings">My bookings</Link><Link className="underline" to="/favorites">Favorites</Link><button className="underline" onClick={logout}>Logout</button></div>
    </main>
  );
}
