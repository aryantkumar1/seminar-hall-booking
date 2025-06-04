import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser
} from '@/controllers/authController';
import {
  validateUserRegistration,
  validateUserLogin
} from '@/middleware/validation';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
