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
  unassignTeacher
} from '../controllers/studentController.js';

const router = express.Router();

// Get all students (non-deleted)
router.get('/', getAllStudents);

// Get deleted students
router.get('/deleted', getDeletedStudents);

// Get single student by ID
router.get('/:id', getStudentById);

// Create new student
router.post('/', createStudent);

// Update student
router.put('/:id', updateStudent);

// Soft delete student
router.delete('/:id', deleteStudent);

// Restore deleted student
router.patch('/:id/restore', restoreStudent);

// Permanent delete student
router.delete('/:id/permanent', permanentDeleteStudent);

// Assign teacher to student
router.patch('/:id/assign-teacher', assignTeacher);

// Unassign teacher from student
router.patch('/:id/unassign-teacher', unassignTeacher);

export default router;
