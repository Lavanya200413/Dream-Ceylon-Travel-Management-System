const mongoose = require('mongoose');

const CurrencyRateSchema = new mongoose.Schema({
  baseCurrency: { type: String, default: 'USD' },
  quoteCurrency: { type: String, required: true },
  rate: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CurrencyRate', CurrencyRateSchema);