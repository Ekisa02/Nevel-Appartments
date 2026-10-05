export const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`;
export const nights = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0);
export const prettyDate = (d) => new Date(d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
export const today = () => new Date().toISOString().slice(0, 10);
