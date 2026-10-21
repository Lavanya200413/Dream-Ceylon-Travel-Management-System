const express = require('express');
const { getBookings, createBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('tourist'), createBooking);

module.exports = router;
