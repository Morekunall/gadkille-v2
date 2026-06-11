require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Fort = require('../models/Fort');

const run = async () => {
  await connectDB();

  const lohagad = {
    name: 'Lohagad Fort',
    slug: 'lohgad-fort',
    location: 'Lonavala, Pune district, Maharashtra',
    history:
      'Lohagad Fort is a historic hill fort located near Lonavala in Pune district. It was built in the 18th century and was used as a strategic fortification. The fort is known for its impressive architecture and offers a moderate trek experience.',
    description:
      'A popular weekend trekking destination near Mumbai and Pune with stunning views of the Western Ghats.',
    images: [
      'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg'
    ],
    routes: [
      {
        type: 'bus',
        description: 'State transport buses from Mumbai/Pune to Lonavala, then auto to base.',
        duration: '2–3 hrs from Mumbai'
      },
      {
        type: 'train',
        description: 'Take Mumbai–Pune local train to Lonavala station.',
        duration: '1.5 hrs from Mumbai'
      },
      {
        type: 'private',
        description: 'Drive via Mumbai–Pune expressway to Lonavala, park at Malavli village.',
        duration: '2–3 hrs from Mumbai'
      },
      {
        type: 'trek',
        description: 'Trek from Malavli village to Lohagad top through forest trail.',
        duration: '1.5–2 hrs'
      }
    ],
    facilities: [
      { name: 'Parking', available: true },
      { name: 'Food stalls', available: true },
      { name: 'Restrooms', available: false }
    ],
    stayOptions: [
      {
        name: 'Lonavala resorts',
        description: 'Various resorts and hotels in Lonavala for comfortable stay.',
        pricePerNight: 2500,
        maxGuests: 2,
        availability: true
      }
    ],
    guides: [
      {
        name: 'Local Lohagad Guide',
        language: ['Marathi', 'Hindi', 'English'],
        pricing: 800,
        rating: 4.5,
        experienceYears: 5,
        contactInfo: 'lohgad.guide@example.com',
        available: true
      }
    ],
    vehicleRentals: [
      {
        type: 'cab',
        model: 'Sedan/SUV',
        driverName: 'Raj',
        contactInfo: 'raj.cabs@example.com',
        pricePerDay: 2000,
        available: true
      }
    ],
    mapCoordinates: {
      lat: 18.6758,
      lng: 73.4719
    },
    bestSeason: 'June–February',
    trekDifficulty: 'Moderate',
    altitude: '3400 ft'
  };

  const fort = await Fort.findOneAndUpdate(
    { slug: lohagad.slug },
    lohagad,
    { upsert: true, new: true }
  );

  console.log('Lohagad Fort seeded/updated');
  console.log(`Name: ${fort.name}`);
  console.log(`Slug: ${fort.slug}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});