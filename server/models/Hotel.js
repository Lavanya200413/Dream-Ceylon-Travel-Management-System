const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  rooms: [{
    type: { type: String },
    capacity: { type: Number },
    count: { type: Number }
  }],
  facilities: [{ type: String }],
  pricePerNight: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  rating: { type: Number, min: 1, max: 5 }
});

module.exports = mongoose.model('Hotel', HotelSchema);