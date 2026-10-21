const express = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, authorize('tourist'), createReview);

router.route('/:id')
  .get(getReviews);

module.exports = router;
