const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fort: { type: mongoose.Schema.Types.ObjectId, ref: 'Fort', required: true },
    tripType: {
      type: String,
      enum: ['weekend', 'one-day', 'school', 'family', 'friends', 'adventure'],
      default: 'weekend'
    },
    duration: { type: String, required: true },
    pricePerPerson: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    seatsAvailable: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
    coverImage: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
