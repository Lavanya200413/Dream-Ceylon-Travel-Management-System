const express = require('express');
const { getHotels, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getHotels)
  .post(protect, authorize('hotel_owner', 'admin'), createHotel);

router.route('/:id')
  .put(protect, authorize('hotel_owner', 'admin'), updateHotel)
  .delete(protect, authorize('hotel_owner', 'admin'), deleteHotel);

module.exports = router;
