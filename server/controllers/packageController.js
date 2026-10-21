const Package = require('../models/Package');

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
