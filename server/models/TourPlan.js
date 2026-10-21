const mongoose = require('mongoose');

const TourPlanSchema = new mongoose.Schema({
  touristId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  days: { type: Number, required: true },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  dates: {
    start: { type: Date },
    end: { type: Date }
  },
  times: { type: String },
  transportType: { type: String, enum: ['Car', 'Van', 'Bus', 'Train', 'Public'], default: 'Car' },
  routeData: { type: Object }
});

module.exports = mongoose.model('TourPlan', TourPlanSchema);