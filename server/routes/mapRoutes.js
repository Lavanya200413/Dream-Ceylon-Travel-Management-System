const express = require('express');
const { geocode, getRoute, getNearby } = require('../controllers/mapController');

const router = express.Router();

router.get('/geocode', geocode);
router.get('/route', getRoute);
router.get('/nearby', getNearby);

module.exports = router;
