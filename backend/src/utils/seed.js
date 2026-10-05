// Demo data. Replace names, prices and photos with real details (or edit via /api/admin/apartments).
import { db } from '../config/firebase.js';
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
const photos = ['photo-1522708323590-d24dbb6b0267', 'photo-1502672260266-1c1ef2d93688', 'photo-1560448204-e02f11c3d0e2', 'photo-1493809842364-78817add7ffb', 'photo-1556909114-f6e7ad7d3136'].map(img);
const apts = [
  ['Studio Nest', 4200, 2, 0, 1, 1, ['wifi', 'tv', 'kitchen', 'security']],
  ['Modern Deluxe Apartment', 6500, 2, 1, 1, 1, ['wifi', 'tv', 'kitchen', 'parking', 'ac']],
  ['Garden View One-Bedroom', 7800, 3, 1, 2, 1, ['wifi', 'tv', 'kitchen', 'parking', 'workspace', 'power']],
  ['Executive Suite', 9500, 4, 2, 2, 2, ['wifi', 'tv', 'kitchen', 'parking', 'ac', 'workspace', 'laundry']],
  ['Family Two-Bedroom', 12000, 5, 2, 3, 2, ['wifi', 'tv', 'kitchen', 'parking', 'laundry', 'power', 'security']],
  ['Penthouse Loft', 16500, 6, 3, 4, 3, ['wifi', 'tv', 'kitchen', 'parking', 'ac', 'workspace', 'laundry', 'power', 'security']],
];
for (const [i, [name, price, g, br, beds, ba, am]] of apts.entries()) {
  const images = photos.slice(i % 2, (i % 2) + 4);
  await db.collection('apartments').add({
    name, pricePerNight: price, maxGuests: g, bedrooms: br, beds, bathrooms: ba, amenities: am,
    description: `${name} is a calm, fully furnished space with reliable Wi-Fi, a comfortable bed and everything you need for a short or extended stay.`,
    location: process.env.PROPERTY_AREA || 'Set your area in admin', images, featuredImage: images[0],
    status: 'available', rating: 4.5 + (i % 5) / 10, reviewCount: 8 + i * 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });
}
console.log('Seeded', apts.length, 'apartments');
