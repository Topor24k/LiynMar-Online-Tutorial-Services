import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  restoreStudent,
  permanentDeleteStudent,
  getDeletedStudents,
  assignTeacher,
  unassignTeacher,
  removeDuplicates
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireBookingManager, requireTeacherManager, checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Allow both booking_manager and teacher_manager to view students
const requireBookingOrTeacherManager = checkRole('admin', 'booking_manager', 'teacher_manager');

// Protect all student routes
router.use(protect);

// Get all students (non-deleted) - both managers can view
router.get('/', requireBookingOrTeacherManager, getAllStudents);

// Get deleted students - both managers can view
router.get('/deleted', requireBookingOrTeacherManager, getDeletedStudents);

// Remove duplicate students - only booking_manager
router.post('/remove-duplicates', requireBookingManager, removeDuplicates);

// Get single student by ID - both managers can view
router.get('/:id', requireBookingOrTeacherManager, getStudentById);

// Create new student - only booking_manager
router.post('/', requireBookingManager, createStudent);

// Update student - only booking_manager
router.put('/:id', requireBookingManager, updateStudent);

// Soft delete student - only booking_manager
router.delete('/:id', requireBookingManager, deleteStudent);

// Restore deleted student - only booking_manager
router.patch('/:id/restore', requireBookingManager, restoreStudent);

// Permanent delete student - only booking_manager
router.delete('/:id/permanent', requireBookingManager, permanentDeleteStudent);

// Assign teacher to student - only booking_manager
router.patch('/:id/assign-teacher', requireBookingManager, assignTeacher);

// Unassign teacher from student - only booking_manager
router.patch('/:id/unassign-teacher', requireBookingManager, unassignTeacher);

export default router;
