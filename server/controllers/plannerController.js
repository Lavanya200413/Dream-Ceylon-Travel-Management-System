const TourPlan = require('../models/TourPlan');
const TouristProfile = require('../models/TouristProfile');
const Holiday = require('../models/Holiday');
const { recommendDestinations } = require('../services/recommendationEngine');

// @desc    Get recommendations
// @route   GET /api/planner/recommendations
// @access  Private (Tourist)
exports.getRecommendations = async (req, res) => {
  try {
    let profile = await TouristProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = {
        interests: req.query.interests ? String(req.query.interests).split(',') : [],
        weatherPreference: req.query.weatherPreference || 'Any'
      };
    }

    const recommendations = await recommendDestinations(profile);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Sri Lankan public & Poya holidays for calendar scheduling
// @route   GET /api/planner/holidays
// @access  Public
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 }).limit(100);
    res.status(200).json({ success: true, count: holidays.length, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get logged-in tourist's saved tour plans
// @route   GET /api/planner/my-plans
// @access  Private
exports.getMyPlans = async (req, res) => {
  try {
    const plans = await TourPlan.find({ touristId: req.user.id })
      .populate('stops', 'name district category image imageUrl rating latitude longitude')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create and save a tour plan
// @route   POST /api/planner/plan
// @access  Private (Tourist / Admin)
exports.createPlan = async (req, res) => {
  try {
    req.body.touristId = req.user.id;
    const plan = await TourPlan.create(req.body);
    await plan.populate('stops', 'name district category image imageUrl rating');
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a saved tour plan
// @route   DELETE /api/planner/plan/:id
// @access  Private (Owner / Admin)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await TourPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Tour plan not found.' });
    }
    if (plan.touristId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this plan.' });
    }
    await TourPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
