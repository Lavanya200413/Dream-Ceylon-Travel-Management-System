const Booking = require('../models/Booking');
const Guide = require('../models/Guide');
const Hotel = require('../models/Hotel');
require('../models/TourPlan');

// @desc    Get bookings for current user role
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'tourist' || req.user.role === 'user') {
      query = { touristId: req.user.id };
    } else if (req.user.role === 'guide') {
      const guideProfile = await Guide.findOne({ userId: req.user.id });
      query = guideProfile ? { guideId: guideProfile._id } : { _id: null };
    } else if (req.user.role === 'hotel_owner') {
      const myHotels = await Hotel.find({ ownerId: req.user.id }).select('_id');
      query = { hotelId: { $in: myHotels.map((h) => h._id) } };
    }

    const bookings = await Booking.find(query)
      .populate('touristId', 'name email')
      .populate('tourPlanId')
      .populate('hotelId', 'name location pricePerNight image')
      .populate('guideId', 'name dailyRate serviceAreas languages')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a booking for a tour plan, hotel, or guide
// @route   POST /api/bookings
// @access  Private (tourist / user / admin)
exports.createBooking = async (req, res) => {
  try {
    req.body.touristId = req.user.id;
    if (!req.body.status) {
      req.body.status = 'Confirmed';
    }
    const booking = await Booking.create(req.body);
    await booking.populate('hotelId', 'name location pricePerNight');
    await booking.populate('guideId', 'name dailyRate');
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update booking status (e.g. Mark Completed, Confirmed, or Cancelled)
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid booking status.' });
    }

    booking.status = status;
    await booking.save();
    await booking.populate('touristId', 'name email');
    await booking.populate('hotelId', 'name location pricePerNight');
    await booking.populate('guideId', 'name dailyRate');

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
