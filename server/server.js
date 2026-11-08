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

let server;

const startServer = async () => {
  try {
    // 1. Ensure database connects before listening
    await connectDB();

    // 2. Start Express server with verified callback
    server = app.listen(PORT, () => {
      console.log(`\n====================================================`);
      console.log(`🚀 Dream Ceylon Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`====================================================\n`);
    });

    // 3. Catch socket errors like EADDRINUSE explicitly
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [PORT CONFLICT ERROR]`);
        console.error(`Port ${PORT} is already in use by another process.`);
        console.error(`On Windows PowerShell, check or terminate the process using port ${PORT}:`);
        console.error(`  netstat -ano | Select-String ":${PORT} "`);
        console.error(`  Stop-Process -Id <PID> -Force\n`);
      } else {
        console.error('❌ Server startup error:', err);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error(`❌ Failed to initialize database: ${error.message}`);
    process.exit(1);
  }
};

// Graceful termination for nodemon restarts and process signals
const gracefulShutdown = (signal) => {
  if (server) {
    server.close(() => {
      console.log(`\n🛑 [${signal}] HTTP server closed cleanly.`);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

if (require.main === module) {
  startServer();
}

module.exports = app;
