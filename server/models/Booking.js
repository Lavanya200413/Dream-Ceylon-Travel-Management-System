const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  touristId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tourPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPlan' },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);