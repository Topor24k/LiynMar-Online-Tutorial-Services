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
import { requireTeacherManager } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protect all teacher routes - only admin and teacher_manager can access
router.use(protect, requireTeacherManager);

// Get all teachers (non-deleted)
router.get('/', getAllTeachers);

// Get deleted teachers
router.get('/deleted', getDeletedTeachers);

// Get single teacher by ID
router.get('/:id', getTeacherById);

// Create new teacher
router.post('/', createTeacher);

// Update teacher
router.put('/:id', updateTeacher);

// Soft delete teacher
router.delete('/:id', deleteTeacher);

// Restore deleted teacher
router.patch('/:id/restore', restoreTeacher);

// Permanent delete teacher
router.delete('/:id/permanent', permanentDeleteTeacher);

export default router;
