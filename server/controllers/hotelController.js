const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

const parseStringArray = (val) => {
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// @desc    Get all hotels (Public)
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res) => {
  try {
    const filter = {};
    if (req.query.availableOnly === 'true') {
      filter.availability = true;
    }
    const hotels = await Hotel.find(filter)
      .populate('ownerId', 'name email')
      .sort({ rating: -1, reviewCount: -1 });
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get logged-in hotel owner's properties
// @route   GET /api/hotels/my-hotels
// @access  Private (hotel_owner, admin)
exports.getMyHotels = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { ownerId: req.user.id };
    const hotels = await Hotel.find(query).populate('ownerId', 'name email');
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid hotel ID.' });
    }
    const hotel = await Hotel.findById(req.params.id).populate('ownerId', 'name email');
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found.' });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new hotel property
// @route   POST /api/hotels
// @access  Private (hotel_owner, admin)
exports.createHotel = async (req, res) => {
  try {
    const { name, location, pricePerNight } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Hotel name is required.'
      });
    }
    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Hotel location is required.'
      });
    }

    const priceNum = Number(pricePerNight);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid non-negative pricePerNight.'
      });
    }

    const imageStr = req.body.image || req.body.imageUrl || '';
    const hotel = await Hotel.create({
      ownerId: req.user.id,
      name: name.trim(),
      location: location.trim(),
      phone: req.body.phone ? String(req.body.phone).trim() : '',
      description: req.body.description ? String(req.body.description).trim() : '',
      image: imageStr,
      imageUrl: imageStr,
      pricePerNight: priceNum,
      facilities: parseStringArray(req.body.facilities),
      rooms: Array.isArray(req.body.rooms) ? req.body.rooms : [],
      availability: req.body.availability !== undefined ? Boolean(req.body.availability) : true
    });

    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update hotel property
// @route   PUT /api/hotels/:id
// @access  Private (owner hotel_owner or admin)
exports.updateHotel = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid hotel ID.' });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel property not found.' });
    }

    if (hotel.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update another owner’s hotel property.'
      });
    }

    if (req.body.pricePerNight !== undefined) {
      const priceNum = Number(req.body.pricePerNight);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({
          success: false,
          error: 'Price per night must be a non-negative number.'
        });
      }
      hotel.pricePerNight = priceNum;
    }

    if (req.body.name !== undefined) {
      if (!String(req.body.name).trim()) {
        return res.status(400).json({ success: false, error: 'Hotel name cannot be empty.' });
      }
      hotel.name = String(req.body.name).trim();
    }
    if (req.body.location !== undefined) hotel.location = String(req.body.location).trim();
    if (req.body.phone !== undefined) hotel.phone = String(req.body.phone).trim();
    if (req.body.description !== undefined) hotel.description = String(req.body.description).trim();
    if (req.body.image !== undefined || req.body.imageUrl !== undefined) {
      const img = req.body.image !== undefined ? req.body.image : req.body.imageUrl;
      hotel.image = String(img).trim();
      hotel.imageUrl = String(img).trim();
    }
    if (req.body.facilities !== undefined) {
      hotel.facilities = parseStringArray(req.body.facilities);
    }
    if (Array.isArray(req.body.rooms)) {
      hotel.rooms = req.body.rooms;
    }
    if (req.body.availability !== undefined) {
      hotel.availability = Boolean(req.body.availability);
    }

    await hotel.save();
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete hotel property
// @route   DELETE /api/hotels/:id
// @access  Private (owner hotel_owner or admin)
exports.deleteHotel = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid hotel ID.' });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel property not found.' });
    }

    if (hotel.ownerId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete another owner’s hotel property.'
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
