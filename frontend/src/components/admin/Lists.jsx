import { useEffect, useState } from 'react';
import { adm, errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { prettyDate } from '../../utils/format';
import { Badge, Table, Loading } from './ui';

function useList(path) {
  const { notify } = useAuth();
  const [items, setItems] = useState(null);
  const load = () => adm.get(path).then(setItems).catch((e) => { notify(errMsg(e), 'err'); setItems([]); });
  useEffect(() => { load(); }, []);
  return [items, load];
}
const day = (d) => (d ? prettyDate(d.slice(0, 10)) : '—');

export function Guests() {
  const [items] = useList('/users');
  if (!items) return <Loading />;
  return <Table head={['Name', 'Email', 'Phone', 'Role', 'Joined']}>{items.map((u) => <tr key={u.id}><td className="px-4 py-3">{u.fullName}</td><td className="px-4 py-3">{u.email}</td><td className="px-4 py-3">{u.phone || '—'}</td><td className="px-4 py-3"><Badge s={u.role} /></td><td className="px-4 py-3">{day(u.createdAt)}</td></tr>)}</Table>;
}
export function Messages() {
  const [items] = useList('/messages');
  if (!items) return <Loading />;
  if (!items.length) return <p className="text-slate-600">No messages yet.</p>;
  return <div className="space-y-3">{items.map((m) => <div key={m.id} className="border rounded-2xl p-4"><p className="font-semibold">{m.name} <span className="font-normal text-slate-500">· {m.email}{m.phone ? ` · ${m.phone}` : ''} · {day(m.createdAt)}</span></p><p className="mt-2">{m.message}</p></div>)}</div>;
}
export function Reviews() {
  const { notify } = useAuth();
  const [items, load] = useList('/reviews');
  if (!items) return <Loading />;
  const del = async (id) => { if (!window.confirm('Delete this review?')) return; try { await adm.del(`/reviews/${id}`); notify('Review deleted.'); load(); } catch (e) { notify(errMsg(e), 'err'); } };
  return <>{!items.length && <p className="text-slate-600">No reviews yet.</p>}<div className="space-y-3">{items.map((r) => <div key={r.id} className="border rounded-2xl p-4 flex justify-between gap-4"><div><p className="font-semibold">{'★'.repeat(r.rating)} <span className="font-normal text-slate-500">{r.userName} · {day(r.createdAt)}</span></p><p>{r.comment}</p></div><button className="underline text-red-600 text-sm" onClick={() => del(r.id)}>Delete</button></div>)}</div></>;
}
