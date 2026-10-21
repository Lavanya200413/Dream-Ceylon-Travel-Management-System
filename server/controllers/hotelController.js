const Hotel = require('../models/Hotel');

exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('ownerId', 'name');
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createHotel = async (req, res) => {
  try {
    // Assuming hotel_owner
    req.body.ownerId = req.user.id;
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
