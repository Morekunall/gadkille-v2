require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Fort = require('../models/Fort');

const run = async () => {
  await connectDB();

  const visapur = {
    name: 'Visapur Fort',
    slug: 'visapur-fort',
    location: 'Malavli, Pune district, Maharashtra',
    history:
      'Visapur Fort is a large fort situated near Lonavala and Lohagad. Built during the early 18th century, it offers panoramic views and is popular among trekkers.',
    description:
      'A scenic hill fort with lush green surroundings, waterfalls during monsoon, and a moderate trek route.',
    images: [
      'https://images.pexels.com/photos/1439222/pexels-photo-1439222.jpeg'
    ],
    routes: [
      {
        type: 'bus',
        description: 'State transport buses from Mumbai/Pune to Lonavala, then auto to Malavli base.',
        duration: '2–3 hrs from Mumbai'
      },
      {
        type: 'train',
        description: 'Take Mumbai–Pune local train to Malavli station.',
        duration: '1.5 hrs from Mumbai'
      },
      {
        type: 'private',
        description: 'Drive via Mumbai–Pune expressway to Malavli village.',
        duration: '2–3 hrs from Mumbai'
      },
      {
        type: 'trek',
        description: 'Trek from Malavli village to Visapur top through forest and waterfalls.',
        duration: '2 hrs'
      }
    ],
    facilities: [
      { name: 'Parking', available: true },
      { name: 'Food stalls', available: true },
      { name: 'Restrooms', available: false }
    ],
    stayOptions: [
      {
        name: 'Malavli homestay',
        description: 'Simple village homestays at Malavli base.',
        pricePerNight: 1200,
        maxGuests: 3,
        availability: true
      }
    ],
    guides: [
      {
        name: 'Local Visapur Guide',
        language: ['Marathi', 'Hindi', 'English'],
        pricing: 1000,
        rating: 4.6,
        experienceYears: 6,
        contactInfo: 'visapur.guide@example.com',
        available: true
      }
    ],
    vehicleRentals: [
      {
        type: 'cab',
        model: 'SUV',
        driverName: 'Amit',
        contactInfo: 'amit.cab@example.com',
        pricePerDay: 2500,
        available: true
      }
    ],
    mapCoordinates: {
      lat: 18.7100,
      lng: 73.4925
    }
  };

  await Fort.findOneAndUpdate({ slug: visapur.slug }, visapur, { upsert: true, new: true });
  console.log('Visapur fort seeded/updated');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
