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
import { requireBookingManager, requireTeacherManager, checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Allow both booking_manager and teacher_manager to view bookings
const requireBookingOrTeacherManager = checkRole('admin', 'booking_manager', 'teacher_manager');

// Protect all booking routes
router.use(protect);

// Get all bookings - both managers can view
router.get('/', requireBookingOrTeacherManager, getAllBookings);

// Get booking statistics - both managers can view
router.get('/stats', requireBookingOrTeacherManager, getBookingStats);

// Manual status check endpoint - both managers can trigger
router.post('/check-status', requireBookingOrTeacherManager, checkAllStatuses);

// Get bookings by teacher - both managers can view
router.get('/teacher/:teacherId', requireBookingOrTeacherManager, getBookingsByTeacher);

// Get single booking by ID - both managers can view
router.get('/:id', requireBookingOrTeacherManager, getBookingById);

// Create new booking - only booking_manager
router.post('/', requireBookingManager, createBooking);

// Update booking - only booking_manager
router.put('/:id', requireBookingManager, updateBooking);

// Delete booking - only booking_manager
router.delete('/:id', requireBookingManager, deleteBooking);

export default router;
