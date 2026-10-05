export const StatsCard = ({ label, value }) => (
  <div className="rounded-2xl border p-5 bg-white"><p className="text-sm text-slate-500">{label}</p><p className="font-display text-2xl font-bold mt-1">{value}</p></div>
);
const colors = { pending: 'bg-amber-soft', confirmed: 'bg-green-100', cancelled: 'bg-red-100', completed: 'bg-slate-200', new: 'bg-amber-soft' };
export const Badge = ({ s }) => <span className={`text-xs px-3 py-1 rounded-full capitalize ${colors[s] || 'bg-slate-100'}`}>{s}</span>;
export const Table = ({ head, children }) => (
  <div className="overflow-x-auto border rounded-2xl"><table className="w-full text-sm text-left min-w-[640px]">
    <thead className="bg-mist"><tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y">{children}</tbody></table></div>
);
export const Loading = () => <div className="h-40 bg-slate-100 animate-pulse rounded-2xl" />;
