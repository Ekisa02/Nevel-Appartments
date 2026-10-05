import { AMENITIES } from '../utils/amenities';
export default function Amenities() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10"><h1 className="font-display text-3xl font-bold">Amenities</h1>
      <p className="text-slate-600 mt-2 max-w-xl">Everything you need for a comfortable stay. Each apartment lists exactly what it includes.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">{Object.values(AMENITIES).map(([I, label, text]) => (
        <div key={label} className="rounded-2xl border p-6 hover:border-amber transition-colors"><I className="text-amber" size={28} /><h2 className="font-display font-bold text-lg mt-3">{label}</h2><p className="text-slate-600 mt-1">{text}</p></div>))}</div>
    </main>
  );
}
