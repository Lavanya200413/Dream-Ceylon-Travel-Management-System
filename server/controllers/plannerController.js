const TourPlan = require('../models/TourPlan');
const TouristProfile = require('../models/TouristProfile');
const { recommendDestinations } = require('../services/recommendationEngine');

// @desc    Get recommendations
// @route   GET /api/planner/recommendations
// @access  Private (Tourist)
exports.getRecommendations = async (req, res) => {
  try {
    // Assuming req.user is set by authMiddleware
    const profile = await TouristProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Tourist profile not found' });
    }
    
    const recommendations = await recommendDestinations(profile);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a tour plan
// @route   POST /api/planner/plan
// @access  Private (Tourist)
exports.createPlan = async (req, res) => {
  try {
    req.body.touristId = req.user.id;
    const plan = await TourPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};