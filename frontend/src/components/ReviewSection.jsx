import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getReviews, postReview, errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewSection({ aptId }) {
  const { user, requireAuth, notify } = useAuth();
  const [items, setItems] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const load = () => getReviews(aptId).then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, [aptId]);

  const submit = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      try { await postReview({ apartmentId: aptId, rating, comment }); notify('Thanks for your review.'); setComment(''); load(); }
      catch (er) { notify(errMsg(er), 'err'); }
    });
  };
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold mb-4">Guest reviews</h2>
      {!items ? <div className="h-20 bg-slate-100 animate-pulse rounded-xl" /> : !items.length ? <p className="text-slate-600">No reviews yet. Guests can review after a completed stay.</p> :
        <div className="grid sm:grid-cols-2 gap-4">{items.map((r) => (
          <figure key={r.id} className="border rounded-2xl p-4">
            <div className="flex" aria-label={`${r.rating} out of 5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= r.rating ? 'fill-amber text-amber' : 'text-slate-300'} />)}</div>
            <blockquote className="mt-2">“{r.comment}”</blockquote><figcaption className="text-sm text-slate-500 mt-2">— {r.userName}</figcaption>
          </figure>))}</div>}
      <form onSubmit={submit} className="mt-8 border rounded-2xl p-4 space-y-3 max-w-xl">
        <p className="font-semibold">Stayed here? Leave a review</p>
        <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} aria-label={`${n} stars`} onClick={() => setRating(n)}><Star className={n <= rating ? 'fill-amber text-amber' : 'text-slate-300'} /></button>)}</div>
        <textarea required minLength={3} rows={3} className="w-full border border-slate-300 rounded-xl px-4 py-3" placeholder="How was your stay?" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="bg-navy text-white px-6 py-2 rounded-xl font-semibold">{user ? 'Post review' : 'Sign in to review'}</button>
      </form>
    </section>
  );
}
