import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  restoreTeacher,
  permanentDeleteTeacher,
  getDeletedTeachers
} from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTeacherManager, requireBookingManager, checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Allow both teacher_manager and booking_manager to view teachers
const requireTeacherOrBookingManager = checkRole('admin', 'teacher_manager', 'booking_manager');

// Protect all teacher routes
router.use(protect);

// Get all teachers (non-deleted) - both managers can view
router.get('/', requireTeacherOrBookingManager, getAllTeachers);

// Get deleted teachers - both managers can view
router.get('/deleted', requireTeacherOrBookingManager, getDeletedTeachers);

// Get single teacher by ID - both managers can view
router.get('/:id', requireTeacherOrBookingManager, getTeacherById);

// Create new teacher - only teacher_manager
router.post('/', requireTeacherManager, createTeacher);

// Update teacher - only teacher_manager
router.put('/:id', requireTeacherManager, updateTeacher);

// Soft delete teacher - only teacher_manager
router.delete('/:id', requireTeacherManager, deleteTeacher);

// Restore deleted teacher - only teacher_manager
router.patch('/:id/restore', requireTeacherManager, restoreTeacher);

// Permanent delete teacher - only teacher_manager
router.delete('/:id/permanent', requireTeacherManager, permanentDeleteTeacher);

export default router;
