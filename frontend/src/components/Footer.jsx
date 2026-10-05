import { Link } from 'react-router-dom';
const { VITE_CONTACT_PHONE: phone, VITE_CONTACT_EMAIL: email } = import.meta.env;
export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div><p className="font-display text-white font-bold text-lg">NEVEL APARTMENTS</p><p className="mt-2">Comfortable stays. Memorable experiences.</p></div>
        <div className="flex flex-col gap-2"><Link to="/">Home</Link><Link to="/apartments">Apartments</Link><Link to="/my-bookings">My Bookings</Link><Link to="/contact">Contact</Link></div>
        <div className="space-y-2">{phone && <p>{phone}</p>}{email && <p>{email}</p>}{!phone && !email && <p>Set contact details in frontend/.env</p>}</div>
      </div>
      <p className="text-center text-sm py-4 border-t border-white/10">© 2026 Nevel Apartments. All rights reserved.</p>
    </footer>
  );
}
