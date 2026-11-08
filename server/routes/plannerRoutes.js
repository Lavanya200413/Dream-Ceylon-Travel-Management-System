const express = require('express');
const {
  getRecommendations,
  getHolidays,
  getMyPlans,
  createPlan,
  deletePlan
} = require('../controllers/plannerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public holidays lookup for calendar schedule
router.get('/holidays', getHolidays);

router.use(protect);
router.get('/recommendations', authorize('tourist', 'user', 'admin'), getRecommendations);
router.get('/my-plans', getMyPlans);
router.post('/plan', authorize('tourist', 'user', 'admin'), createPlan);
router.delete('/plan/:id', deletePlan);

module.exports = router;
