import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const Home = lazy(() => import('./pages/Home'));
const Apartments = lazy(() => import('./pages/Apartments'));
const ApartmentDetails = lazy(() => import('./pages/ApartmentDetails'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Amenities = lazy(() => import('./pages/Amenities'));
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));
const Contact = lazy(() => import('./pages/Contact'));

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="h-96" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/apartments/:id" element={<ApartmentDetails />} />
          <Route path="/booking/:id" element={<Confirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<p className="p-16 text-center">Page not found. <Link className="underline" to="/">Go home</Link></p>} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
