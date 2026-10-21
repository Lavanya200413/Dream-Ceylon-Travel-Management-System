const mapService = require('../services/mapService');

exports.geocode = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address is required.' });
    }
    const location = await mapService.geocodeLocation(address);
    res.status(200).json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, vehicleType } = req.query;
    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ success: false, error: 'Origin and destination coordinates are required.' });
    }
    const route = await mapService.calculateRoute(originLat, originLng, destLat, destLng, vehicleType || 'driving');
    res.status(200).json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getNearby = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required.' });
    }
    const results = await mapService.nearbyDestinations(lat, lng);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
