const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['plan_trip', 'group_tour', 'contact'],
      required: true
    },
    tripType: { type: String, enum: ['solo', 'group', 'family'] },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    location: { type: String, trim: true },
    preferredDate: Date,
    groupSize: Number,
    organization: String,
    purpose: String,
    subject: String,
    message: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
