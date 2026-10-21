const Guide = require('../models/Guide');

exports.getGuides = async (req, res) => {
  try {
    const guides = await Guide.find().populate('userId', 'name email');
    res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createGuide = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const guide = await Guide.create(req.body);
    res.status(201).json({ success: true, data: guide });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: guide });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    await Guide.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
