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

const router = express.Router();

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
