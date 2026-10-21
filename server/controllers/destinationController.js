const Destination = require('../models/Destination');

exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.status(200).json({ success: true, count: destinations.length, data: destinations });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, data: destination });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, data: destination });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!destination) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, data: destination });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
