const Booking = require('../models/Booking');

exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'tourist') {
      query = { touristId: req.user.id };
    }
    const bookings = await Booking.find(query).populate('tourPlanId hotelId guideId');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    req.body.touristId = req.user.id;
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
