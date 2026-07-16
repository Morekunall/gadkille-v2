require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Trip = require('../models/Trip');

const slug = process.argv[2] || 'harishchandragad-fort';
const originalPrice = Number(process.argv[3] || 1500);

const run = async () => {
  if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
    console.error('Usage: node src/scripts/patchTrekOriginalPrice.js [slug] [originalPrice]');
    process.exit(1);
  }

  await connectDB();

  const trip = await Trip.findOneAndUpdate(
    { slug },
    { originalPrice },
    { new: true, runValidators: true }
  );

  if (!trip) {
    console.error(`Trip not found for slug: ${slug}`);
    process.exit(1);
  }

  console.log(`Updated "${trip.title}" (${trip.slug})`);
  console.log(`  pricePerPerson: ${trip.pricePerPerson}`);
  console.log(`  originalPrice: ${trip.originalPrice}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
