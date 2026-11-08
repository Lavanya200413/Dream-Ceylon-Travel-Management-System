const Package = require('../models/Package');
const CurrencyRate = require('../models/CurrencyRate');

const DEFAULT_RATES = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar ($)' },
  LKR: { code: 'LKR', symbol: 'Rs.', rate: 300, label: 'Sri Lankan Rupee (Rs.)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'British Pound (£)' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, label: 'Australian Dollar (A$)' }
};

exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ success: true, count: packages.length, data: packages });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.status(200).json({ success: true, data: pkg });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const newPackage = await Package.create(req.body);
    res.status(201).json({ success: true, data: newPackage });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get multi-currency conversion rates (Module 8)
// @route   GET /api/packages/currencies/rates
// @access  Public
exports.getCurrencyRates = async (req, res) => {
  try {
    const dbRates = await CurrencyRate.find({ baseCurrency: 'USD' });
    const merged = { ...DEFAULT_RATES };
    dbRates.forEach((r) => {
      if (merged[r.quoteCurrency]) {
        merged[r.quoteCurrency] = {
          ...merged[r.quoteCurrency],
          rate: r.rate
        };
      }
    });
    res.status(200).json({
      success: true,
      baseCurrency: 'USD',
      data: merged
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      baseCurrency: 'USD',
      data: DEFAULT_RATES
    });
  }
};
