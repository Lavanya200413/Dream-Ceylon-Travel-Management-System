const mongoose = require('mongoose');

const TourPlanSchema = new mongoose.Schema({
  touristId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Sri Lankan Journey' },
  days: { type: Number, required: true },
  travelers: { type: Number, default: 2 },
  packageName: { type: String, default: 'Standard' },
  estimatedCost: { type: Number, default: 0 },
  startLocation: { type: Object },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  itinerary: [{ type: Object }],
  dates: {
    start: { type: Date },
    end: { type: Date }
  },
  times: { type: String },
  transportType: {
    type: String,
    enum: ['Car', 'Van', 'Motorcycle', 'Bus', 'Train', 'Public'],
    default: 'Car'
  },
  routeData: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TourPlan', TourPlanSchema);
