const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['bus', 'train', 'private', 'trek'],
      required: true
    },
    description: String,
    duration: String,
    distance: String
  },
  { _id: false }
);

const facilitySchema = new mongoose.Schema(
  {
    name: String,
    available: { type: Boolean, default: true },
    details: String
  },
  { _id: false }
);

const stayOptionSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    pricePerNight: Number,
    maxGuests: Number,
    availability: Boolean,
    images: [String]
  },
  { _id: false }
);

const guideSchema = new mongoose.Schema(
  {
    name: String,
    language: [String],
    pricing: Number,
    rating: Number,
    experienceYears: Number,
    contactInfo: String,
    available: { type: Boolean, default: true }
  },
  { _id: false }
);

const vehicleRentalSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['cab', 'car', 'bike'] },
    model: String,
    driverName: String,
    contactInfo: String,
    pricePerDay: Number,
    available: { type: Boolean, default: true }
  },
  { _id: false }
);

const fortSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    location: { type: String, required: true },
    district: { type: String, trim: true, default: '' },
    history: String,
    description: String,
    images: [String],
    videos: [String],
    routes: [routeSchema],
    facilities: [facilitySchema],
    stayOptions: [stayOptionSchema],
    guides: [guideSchema],
    vehicleRentals: [vehicleRentalSchema],
    mapCoordinates: {
      lat: Number,
      lng: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fort', fortSchema);

