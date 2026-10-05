import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [['/', 'Home'], ['/apartments', 'Apartments'], ['/amenities', 'Amenities'], ['/gallery', 'Gallery'], ['/about', 'About'], ['/contact', 'Contact']];

export default function Navbar() {
  const { user, isAdmin, logout, requireAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const account = [['/profile', 'Profile'], ['/my-bookings', 'My Bookings'], ['/favorites', 'Favorites'], ...(isAdmin ? [['/admin', 'Admin']] : [])];
  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between" aria-label="Main">
        <Link to="/" className="font-display font-extrabold tracking-wide text-lg">NEVEL <span className="text-amber">APARTMENTS</span></Link>
        <div className="hidden lg:flex items-center gap-6">
          {links.map(([to, l]) => <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'text-amber' : 'hover:text-amber'}>{l}</NavLink>)}
          {user ? (
            <details className="relative">
              <summary className="cursor-pointer list-none hover:text-amber">Account</summary>
              <div className="absolute right-0 mt-3 w-48 bg-white text-navy rounded-xl shadow-xl p-2 flex flex-col">
                {account.map(([to, l]) => <Link key={to} to={to} className="px-3 py-2 rounded-lg hover:bg-mist">{l}</Link>)}
                <button onClick={logout} className="px-3 py-2 rounded-lg hover:bg-mist text-left">Logout</button>
              </div>
            </details>
          ) : <button onClick={() => requireAuth(() => {})} className="hover:text-amber">Sign In</button>}
          <Link to="/apartments" className="bg-amber text-navy-900 font-bold px-5 py-2 rounded-full">Book Now</Link>
        </div>
        <button className="lg:hidden p-2" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && (
        <div className="lg:hidden bg-navy-700 px-4 py-4 flex flex-col gap-4 text-lg max-h-[80vh] overflow-y-auto" onClick={() => setOpen(false)}>
          {links.map(([to, l]) => <Link key={to} to={to}>{l}</Link>)}
          {user ? <>{account.map(([to, l]) => <Link key={to} to={to}>{l}</Link>)}<button className="text-left" onClick={logout}>Logout</button></>
            : <button className="text-left" onClick={() => requireAuth(() => {})}>Sign In</button>}
          <Link to="/apartments" className="bg-amber text-navy-900 font-bold text-center py-3 rounded-xl">Book Now</Link>
        </div>
      )}
    </header>
  );
}
