const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    serviceType: {
      type: String,
      enum: ['stay', 'guide', 'vehicle'],
      required: true
    },
    contactInfo: String,
    pricing: String,
    experienceYears: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    fort: { type: mongoose.Schema.Types.ObjectId, ref: 'Fort' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);

