const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { protect, authorize } = require('./middlewares/authMiddleware');
const {
  getReportedReviews,
  moderateReview,
  deleteReview,
  getAllReports,
  updateReportStatus
} = require('./controllers/reviewController');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route files
const authRoutes = require('./routes/authRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const guideRoutes = require('./routes/guideRoutes');
const packageRoutes = require('./routes/packageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const mapRoutes = require('./routes/mapRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

// Mount routers
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maps', mapRoutes);

// Top-level aliases for Module 5 Moderation & Reports API contracts
app.get('/api/admin/reviews', protect, authorize('admin'), getReportedReviews);
app.put('/api/admin/reviews/:id/moderate', protect, authorize('admin'), moderateReview);
app.patch('/api/admin/reviews/:id/moderate', protect, authorize('admin'), moderateReview);
app.delete('/api/admin/reviews/:id', protect, authorize('admin'), deleteReview);

app.get('/api/reports', protect, authorize('admin'), getAllReports);
app.put('/api/reports/:id/status', protect, authorize('admin'), updateReportStatus);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
}

module.exports = app;
