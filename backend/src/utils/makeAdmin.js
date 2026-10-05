import { auth, db } from '../config/firebase.js';

const email = process.argv[2];
if (!email) { console.log('Usage: node src/utils/makeAdmin.js user@example.com'); process.exit(1); }

const user = await auth.getUserByEmail(email);
await db.collection('users').doc(user.uid).set({ role: 'admin' }, { merge: true });
console.log(`${email} is now an admin.`);
process.exit(0);