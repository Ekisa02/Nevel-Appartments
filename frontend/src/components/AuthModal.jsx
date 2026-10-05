import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, onSuccess }) {
  const { signIn, signUp, google, phoneVerify, reset, notify } = useAuth();
  const [step, setStep] = useState('enter');
  const [code, setCode] = useState('');
  const confirmation = useRef(null);
  const [mode, setMode] = useState('intro');
  const [f, setF] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); notify('Welcome to Nevel Apartments!'); onSuccess(); }
    catch (e) { notify(e.code === 'auth/invalid-credential' ? 'Email or password is incorrect.' : e.message?.replace('Firebase: ', '') || 'Authentication failed.', 'err'); }
    setBusy(false);
  };
  const submit = (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (f.password !== f.confirm) return notify('Passwords do not match.', 'err');
      return run(() => signUp(f));
    }
    run(() => signIn(f.email, f.password));
  };
  const sendCode = async () => {
    setBusy(true);
    try {
      window.nevelRecaptcha ||= new RecaptchaVerifier(auth, 'recaptcha-box', { size: 'invisible' });
      confirmation.current = await signInWithPhoneNumber(auth, f.phone.trim(), window.nevelRecaptcha);
      setStep('code'); notify('Verification code sent.');
    } catch (e) { window.nevelRecaptcha?.clear(); window.nevelRecaptcha = null; notify('Could not send the code. Use the format +2547XXXXXXXX.', 'err'); }
    setBusy(false);
  };
  const input = 'w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-amber';

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
        <div id="recaptcha-box" />
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 p-2"><X /></button>
        {mode === 'intro' ? (
          <>
            <h2 className="font-display text-2xl font-bold">Sign in to continue</h2>
            <p className="text-slate-600 mt-2">Create an account or sign in to complete your reservation.</p>
            <button onClick={() => setMode('signin')} className="mt-6 w-full bg-navy text-white py-3 rounded-xl font-semibold">Sign In</button>
            <button onClick={() => setMode('signup')} className="mt-3 w-full border-2 border-navy py-3 rounded-xl font-semibold">Create Account</button>
          </>
        ) : mode === 'phone' ? (
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold">Continue with phone</h2>
            {step === 'enter' ? <>
              <label className="block text-sm font-medium">Phone number<input type="tel" placeholder="+2547XXXXXXXX" className={input} value={f.phone} onChange={set('phone')} /></label>
              <button disabled={busy} onClick={sendCode} className="w-full bg-amber text-navy-900 py-3 rounded-xl font-bold">{busy ? 'Sending…' : 'Send code'}</button></> : <>
              <label className="block text-sm font-medium">6-digit code<input inputMode="numeric" maxLength={6} className={input} value={code} onChange={(e) => setCode(e.target.value)} /></label>
              <button disabled={busy} onClick={() => run(() => phoneVerify(confirmation.current, code))} className="w-full bg-amber text-navy-900 py-3 rounded-xl font-bold">Verify and continue</button></>}
            <button className="text-sm underline" onClick={() => setMode('signin')}>Use email instead</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <h2 className="font-display text-2xl font-bold">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="text-slate-600 pb-2">{mode === 'signup' ? 'Join Nevel Apartments and manage your reservations easily.' : 'Sign in to continue your Nevel Apartments experience.'}</p>
            <button type="button" disabled={busy} onClick={() => run(google)} className="w-full border border-slate-300 py-3 rounded-xl font-semibold">Continue with Google</button>
            <button type="button" onClick={() => setMode('phone')} className="w-full border border-slate-300 py-3 rounded-xl font-semibold">Continue with phone number</button>
            <div className="text-center text-sm text-slate-500">or use email</div>
            {mode === 'signup' && <><label className="block text-sm font-medium">Full name<input required className={input} value={f.fullName} onChange={set('fullName')} /></label>
              <label className="block text-sm font-medium">Phone<input required type="tel" className={input} value={f.phone} onChange={set('phone')} /></label></>}
            <label className="block text-sm font-medium">Email<input required type="email" className={input} value={f.email} onChange={set('email')} /></label>
            <label className="block text-sm font-medium">Password<input required minLength={6} type="password" className={input} value={f.password} onChange={set('password')} /></label>
            {mode === 'signup' && <label className="block text-sm font-medium">Confirm password<input required type="password" className={input} value={f.confirm} onChange={set('confirm')} /></label>}
            <button disabled={busy} className="w-full bg-amber text-navy-900 py-3 rounded-xl font-bold">{busy ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}</button>
            {mode === 'signin' && <button type="button" className="text-sm underline" onClick={() => f.email ? reset(f.email).then(() => notify('Password reset email sent.')) : notify('Enter your email first.', 'err')}>Forgot password?</button>}
            <p className="text-sm">{mode === 'signup' ? 'Already have an account?' : "Don't have an account?"} <button type="button" className="font-semibold underline" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Sign in' : 'Create one'}</button></p>
          </form>
        )}
      </div>
    </div>
  );
}
