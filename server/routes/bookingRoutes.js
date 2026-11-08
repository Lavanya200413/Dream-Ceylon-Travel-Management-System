const express = require('express');
const {
  getBookings,
  createBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router
  .route('/')
  .get(protect, getBookings)
  .post(protect, authorize('tourist', 'user', 'admin'), createBooking);

router.put('/:id', protect, updateBookingStatus);
router.patch('/:id/status', protect, updateBookingStatus);

module.exports = router;
