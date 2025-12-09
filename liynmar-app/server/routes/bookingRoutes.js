import express from 'express';
import {
  getAllBookings,
  getBookingById,
  getBookingsByTeacher,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingStats,
  checkAllStatuses
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireBookingManager } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protect all booking routes - only admin and booking_manager can access
router.use(protect, requireBookingManager);

// Get all bookings
router.get('/', getAllBookings);

// Get booking statistics
router.get('/stats', getBookingStats);

// Manual status check endpoint
router.post('/check-status', checkAllStatuses);

// Get bookings by teacher
router.get('/teacher/:teacherId', getBookingsByTeacher);

// Get single booking by ID
router.get('/:id', getBookingById);

// Create new booking
router.post('/', createBooking);

// Update booking
router.put('/:id', updateBooking);

// Delete booking
router.delete('/:id', deleteBooking);

export default router;
