const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceAreas: [{ type: String }],
  languages: [{ type: String }],
  dailyRate: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  rating: { type: Number, min: 1, max: 5 }
});

module.exports = mongoose.model('Guide', GuideSchema);