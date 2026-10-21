const mongoose = require('mongoose');

const TouristProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupSize: { type: Number, default: 1 },
  mealType: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Halal', 'Any'], default: 'Any' },
  interests: [{ type: String }],
  weatherPreference: { type: String, enum: ['Hot', 'Cold', 'Moderate', 'Any'], default: 'Any' },
  preferredCurrency: { type: String, default: 'USD' }
});

module.exports = mongoose.model('TouristProfile', TouristProfileSchema);