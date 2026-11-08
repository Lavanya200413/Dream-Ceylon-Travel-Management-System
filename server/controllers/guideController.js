const mongoose = require('mongoose');
const Guide = require('../models/Guide');

const parseStringArray = (val) => {
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// @desc    Get all guides (Public)
// @route   GET /api/guides
// @access  Public
exports.getGuides = async (req, res) => {
  try {
    const filter = {};
    if (req.query.availableOnly === 'true') {
      filter.availability = true;
    }
    const guides = await Guide.find(filter)
      .populate('userId', 'name email profileImage')
      .sort({ rating: -1, reviewCount: -1 });
    res.status(200).json({ success: true, count: guides.length, data: guides });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get logged-in guide's own profile
// @route   GET /api/guides/my-profile
// @access  Private (guide, admin)
exports.getMyGuideProfile = async (req, res) => {
  try {
    const guide = await Guide.findOne({ userId: req.user.id }).populate(
      'userId',
      'name email profileImage'
    );
    if (!guide) {
      return res.status(404).json({
        success: false,
        error: 'No guide profile found for this account.'
      });
    }
    res.status(200).json({ success: true, data: guide });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single guide by ID
// @route   GET /api/guides/:id
// @access  Public
exports.getGuideById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid guide ID.' });
    }
    const guide = await Guide.findById(req.params.id).populate(
      'userId',
      'name email profileImage'
    );
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found.' });
    }
    res.status(200).json({ success: true, data: guide });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create guide profile
// @route   POST /api/guides
// @access  Private (guide, admin)
exports.createGuide = async (req, res) => {
  try {
    const existing = await Guide.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A guide profile already exists for this user account. Use PUT to update it.'
      });
    }

    const dailyRate = Number(req.body.dailyRate);
    if (Number.isNaN(dailyRate) || dailyRate < 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid non-negative dailyRate.'
      });
    }

    const payload = {
      userId: req.user.id,
      name: (req.body.name || req.user.name || 'Certified Tour Guide').trim(),
      phone: req.body.phone ? String(req.body.phone).trim() : '',
      bio: req.body.bio ? String(req.body.bio).trim() : '',
      image: req.body.image ? String(req.body.image).trim() : '',
      serviceAreas: parseStringArray(req.body.serviceAreas),
      languages: parseStringArray(req.body.languages),
      dailyRate,
      availability: req.body.availability !== undefined ? Boolean(req.body.availability) : true
    };

    const guide = await Guide.create(payload);
    res.status(201).json({ success: true, data: guide });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update guide profile
// @route   PUT /api/guides/:id
// @access  Private (owner guide or admin)
exports.updateGuide = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid guide ID.' });
    }

    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide profile not found.' });
    }

    if (guide.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update another guide profile.'
      });
    }

    if (req.body.dailyRate !== undefined) {
      const rateNum = Number(req.body.dailyRate);
      if (Number.isNaN(rateNum) || rateNum < 0) {
        return res.status(400).json({
          success: false,
          error: 'Daily rate must be a non-negative number.'
        });
      }
      guide.dailyRate = rateNum;
    }

    if (req.body.name !== undefined) guide.name = String(req.body.name).trim();
    if (req.body.phone !== undefined) guide.phone = String(req.body.phone).trim();
    if (req.body.bio !== undefined) guide.bio = String(req.body.bio).trim();
    if (req.body.image !== undefined) guide.image = String(req.body.image).trim();
    if (req.body.serviceAreas !== undefined) {
      guide.serviceAreas = parseStringArray(req.body.serviceAreas);
    }
    if (req.body.languages !== undefined) {
      guide.languages = parseStringArray(req.body.languages);
    }
    if (req.body.availability !== undefined) {
      guide.availability = Boolean(req.body.availability);
    }

    await guide.save();
    res.status(200).json({ success: true, data: guide });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete guide profile
// @route   DELETE /api/guides/:id
// @access  Private (owner guide or admin)
exports.deleteGuide = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid guide ID.' });
    }

    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide profile not found.' });
    }

    if (guide.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete another guide profile.'
      });
    }

    await Guide.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
