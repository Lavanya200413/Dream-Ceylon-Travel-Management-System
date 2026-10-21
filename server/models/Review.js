const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['hotel', 'guide'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  score: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);