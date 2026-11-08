const express = require('express');
const {
  createReview,
  getReviews,
  getTargetRatingStats,
  getRatingsSummary,
  getPopularByTargetType,
  getMyReviews,
  checkReviewEligibility,
  completeServiceExperience,
  updateReview,
  deleteReview,
  reportReview,
  getAllReports,
  updateReportStatus,
  getReportedReviews,
  moderateReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Authenticated user routes
router.get('/my-reviews', protect, getMyReviews);
router.get('/eligibility/:targetType/:targetId', protect, checkReviewEligibility);
router.post('/complete-experience', protect, authorize('tourist', 'admin'), completeServiceExperience);

// Admin moderation & report management endpoints (restricted strictly to admin role)
router.get('/admin/all', protect, authorize('admin'), getReportedReviews);
router.get('/admin/reported', protect, authorize('admin'), getReportedReviews);
router.get('/admin/reports', protect, authorize('admin'), getAllReports);
router.put('/admin/reports/:id/status', protect, authorize('admin'), updateReportStatus);
router.patch('/admin/:id/moderate', protect, authorize('admin'), moderateReview);
router.put('/admin/:id/moderate', protect, authorize('admin'), moderateReview);
router.delete('/admin/:id', protect, authorize('admin'), deleteReview);

// Rating aggregation and popularity statistics
router.get('/ratings/summary', getRatingsSummary);
router.get('/ratings/:targetType/:targetId', getTargetRatingStats);
router.get('/popular/:targetType', getPopularByTargetType);

// Target-specific review retrieval (supports both /target/:targetType/:targetId and /:targetType/:targetId)
router.get('/target/:targetType/:targetId', getReviews);
router.get('/:targetType/:targetId', getReviews);

// Report an inappropriate review (any authenticated user)
router.post('/:id/report', protect, reportReview);

// Base collection routes
router.route('/')
  .get(getReviews)
  .post(protect, authorize('tourist', 'admin'), createReview);

// Single review operations by ID
router.route('/:id')
  .get(getReviews)
  .put(protect, authorize('tourist', 'admin'), updateReview)
  .delete(protect, authorize('tourist', 'admin'), deleteReview);

module.exports = router;
