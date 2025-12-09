import express from 'express';
import { register, login, getProfile, getAllUsers, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

// Admin only routes
router.get('/users', protect, requireAdmin, getAllUsers);
router.delete('/users/:id', protect, requireAdmin, deleteUser);

export default router;
