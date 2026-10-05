import { auth, db } from '../config/firebase.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  try {
    const decoded = await auth.verifyIdToken(token);
    const snap = await db.collection('users').doc(decoded.uid).get();
    req.user = { uid: decoded.uid, email: decoded.email, role: snap.data()?.role || 'guest' };
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

// Role is read from Firestore server-side, never trusted from the client.
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}
