const express = require('express');
const {
  getGuides,
  getMyGuideProfile,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide
} = require('../controllers/guideController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router
  .route('/')
  .get(getGuides)
  .post(protect, authorize('guide', 'admin'), createGuide);

router.get('/my-profile', protect, authorize('guide', 'admin'), getMyGuideProfile);

router
  .route('/:id')
  .get(getGuideById)
  .put(protect, authorize('guide', 'admin'), updateGuide)
  .delete(protect, authorize('guide', 'admin'), deleteGuide);

module.exports = router;
