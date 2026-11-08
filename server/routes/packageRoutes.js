const express = require('express');
const {
  getPackages,
  getPackageById,
  createPackage,
  getCurrencyRates
} = require('../controllers/packageController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/currencies/rates', getCurrencyRates);

router
  .route('/')
  .get(getPackages)
  .post(protect, authorize('admin'), createPackage);

router.route('/:id').get(getPackageById);

module.exports = router;
