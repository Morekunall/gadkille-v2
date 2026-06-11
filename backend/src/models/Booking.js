const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fortId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fort', required: true },
    bookingType: {
      type: String,
      enum: ['stay', 'guide', 'vehicle', 'trip'],
      required: true
    },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    date: { type: Date, required: true },
    requestStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending'
    },
    details: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

