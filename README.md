# Nevel Apartments

React + Vite + Tailwind frontend, Express + Firebase Admin (Firestore) backend.

## Setup
1. Create a Firebase project; enable Authentication (Email/Password, Google) and Firestore.
2. Backend: service-account key -> `backend/.env` (copy `.env.example`). `cd backend && npm i && npm run seed && npm run dev`.
3. Frontend: web app config -> `frontend/.env`. `cd frontend && npm i && npm run dev`.
4. Deploy `firestore.rules` (all writes go through the API).
5. First admin: sign up, then set `role: "admin"` on your doc in the `users` collection.

## Images (Spark plan friendly)
Images are stored in **Realtime Database** (not Storage). Create a Realtime Database, set `FIREBASE_DATABASE_URL` in `backend/.env`,
and publish `database.rules.json` (clients are denied; only the backend reads/writes). The browser compresses images before upload and the API serves them at `/api/images/:id`.
Spark limits: 1 GB stored, 10 GB/month download. Phone sign-in on Spark has a small SMS quota; add test numbers in Firebase Auth while developing.

## Built
Home search, apartments filter/sort, details + gallery + booking card (sticky / mobile bar), auth modal that resumes the booking,
transactional double-booking prevention, confirmation, my bookings + cancellation rule, contact form, payment abstraction, admin REST API.

## Remaining
No automated tests; payments are a stub (manual provider). Set `VITE_MAP_LAT/LNG`, contact details and `API_PUBLIC_URL` before deploying.
# Nevel-Appartments
