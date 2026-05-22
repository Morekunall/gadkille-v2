const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    fort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fort',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    thumbnail: String,
    duration: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
