export default function About() {
  const items = [['Comfort', 'Clean, well-furnished apartments with comfortable beds and hot showers.'], ['Privacy', 'Your own space, whether you stay for a weekend or a few months.'], ['Security', 'Guarded premises and controlled access around the clock.'], ['Convenience', 'Fast Wi-Fi, parking and a kitchen so you can settle in immediately.']];
  return (
    <main className="max-w-4xl mx-auto px-4 py-10"><h1 className="font-display text-3xl font-bold">About Nevel Apartments</h1>
      <p className="mt-4 text-lg text-slate-700 max-w-prose">Nevel Apartments offers modern, self-contained accommodation for short stays, business trips and extended visits. We keep things simple: a clean space, honest prices and a team that responds quickly.</p>
      <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70" alt="Nevel Apartments living area" className="rounded-2xl mt-8 w-full max-h-96 object-cover" />
      <div className="grid sm:grid-cols-2 gap-6 mt-8">{items.map(([t, d]) => <div key={t}><h2 className="font-display font-bold text-xl">{t}</h2><p className="text-slate-600 mt-1">{d}</p></div>)}</div>
    </main>
  );
}
