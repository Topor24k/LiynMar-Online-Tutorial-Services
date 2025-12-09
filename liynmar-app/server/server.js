import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/database.js';
import { runStatusCheck } from './utils/statusManager.js';

// Import routes
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB (non-blocking - server continues even if DB fails)
connectDB().catch(err => {
  console.error('⚠️  MongoDB connection failed, but server will continue running');
  console.error('💡 Server is running without database - API calls will fail');
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
});

// Schedule automatic status checks
// Run every Monday at 12:01 AM (start of the week)
cron.schedule('1 0 * * 1', async () => {
  console.log('🔄 Running weekly status check...');
  try {
    await runStatusCheck();
  } catch (error) {
    console.error('❌ Weekly status check failed:', error.message);
  }
}, {
  timezone: 'Asia/Manila' // Adjust timezone as needed
});

// Also run status check daily at midnight to catch any edge cases
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Running daily status check...');
  try {
    await runStatusCheck();
  } catch (error) {
    console.error('❌ Daily status check failed:', error.message);
  }
}, {
  timezone: 'Asia/Manila' // Adjust timezone as needed
});

console.log('⏰ Status check scheduler initialized');
console.log('   - Weekly check: Every Monday at 12:01 AM');
console.log('   - Daily check: Every day at midnight');

export default app;
