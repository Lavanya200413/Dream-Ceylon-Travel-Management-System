const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  type: { type: String }
});

module.exports = mongoose.model('Holiday', HolidaySchema);