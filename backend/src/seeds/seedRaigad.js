require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Fort = require('../models/Fort');

const run = async () => {
  await connectDB();

  const raigad = {
    name: 'Raigad Fort',
    slug: 'raigad-fort',
    location: 'Raigad district, Maharashtra',
    history:
      'Raigad Fort was the capital of the Maratha Empire under Chhatrapati Shivaji Maharaj and is known for its strategic location and breathtaking views.',
    description:
      'A must-visit hill fort with ropeway access, scenic treks, and deep historical significance.',
    images: [
      'https://images.pexels.com/photos/17562491/pexels-photo-17562491/free-photo-of-raigad-fort-maharashtra-india.jpeg'
    ],
    routes: [
      {
        type: 'bus',
        description: 'State transport buses from Mahad to Pachad base village.',
        duration: '1–1.5 hrs'
      },
      {
        type: 'train',
        description: 'Nearest major railway station is Mangaon; connect via bus or cab.',
        duration: '1 hr from station to base'
      },
      {
        type: 'private',
        description: 'Drive via Mumbai–Goa highway to Mahad, then towards Pachad.',
        duration: '4–5 hrs from Mumbai'
      },
      {
        type: 'trek',
        description: 'Classic stone steps trek from Pachad to Raigad top.',
        duration: '1.5–2 hrs'
      }
    ],
    facilities: [
      { name: 'Parking', available: true },
      { name: 'Food stalls', available: true },
      { name: 'Restrooms', available: true }
    ],
    stayOptions: [
      {
        name: 'Local homestay',
        description: 'Comfortable village homestays near Pachad.',
        pricePerNight: 1500,
        maxGuests: 4,
        availability: true
      }
    ],
    guides: [
      {
        name: 'Local Raigad Guide',
        language: ['Marathi', 'Hindi'],
        pricing: 1200,
        rating: 4.8,
        experienceYears: 8,
        contactInfo: 'raigad.guide@example.com',
        available: true
      }
    ],
    vehicleRentals: [
      {
        type: 'cab',
        model: 'SUV',
        driverName: 'Mahesh',
        contactInfo: 'mahesh.cab@example.com',
        pricePerDay: 3000,
        available: true
      }
    ],
    mapCoordinates: {
      lat: 18.2469,
      lng: 73.4408
    }
  };

  await Fort.findOneAndUpdate({ slug: raigad.slug }, raigad, { upsert: true, new: true });
  console.log('Raigad fort seeded/updated');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

