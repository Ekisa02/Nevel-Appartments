import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { syncUser, getMe, toggleFav } from '../services/api';
import AuthModal from '../components/AuthModal';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Firestore user doc: role, favorites, photoURL…
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'ok') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); }, []);
  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); if (!u) { setProfile(null); setLoading(false); } }), []);
  useEffect(() => { if (user) getMe().then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false)); }, [user]);

  const afterSignIn = async (fullName, phone) => setProfile(await syncUser({ fullName: fullName || 'Guest', phone }));
  const signUp = async ({ fullName, email, phone, password }) => {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(u, { displayName: fullName });
    await afterSignIn(fullName, phone);
  };
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const google = async () => { const { user: u } = await signInWithPopup(auth, googleProvider); await afterSignIn(u.displayName); };
  const phoneVerify = async (confirmation, code) => { const { user: u } = await confirmation.confirm(code); await afterSignIn(u.displayName, u.phoneNumber); };
  const reset = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);
  const toggleFavorite = async (id) => {
    try { const favorites = await toggleFav(id); setProfile((p) => ({ ...p, favorites })); }
    catch { notify('Could not update favorites.', 'err'); }
  };
  const requireAuth = (action) => { if (auth.currentUser) action(); else setModal({ onSuccess: action }); };

  return (
    <Ctx.Provider value={{ user, profile, setProfile, isAdmin: profile?.role === 'admin', loading, signUp, signIn, google, phoneVerify, reset, logout, toggleFavorite, requireAuth, notify }}>
      {children}
      {modal && <AuthModal onClose={() => setModal(null)} onSuccess={() => { const a = modal.onSuccess; setModal(null); setTimeout(a, 0); }} />}
      {toast && <div role="status" className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl text-white shadow-lg ${toast.type === 'err' ? 'bg-red-600' : 'bg-navy'}`}>{toast.message}</div>}
    </Ctx.Provider>
  );
}
