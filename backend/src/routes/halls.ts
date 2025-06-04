import express from 'express';
import {
  getAllHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
  searchHalls,
  getHallsByCapacity,
  getHallsByEquipment
} from '@/controllers/hallController';
import {
  validateHallCreation,
  validateHallUpdate
} from '@/middleware/validation';
import { authenticateToken, requireAdmin } from '@/middleware/auth';

const router = express.Router();

// Public routes (halls can be viewed by anyone)
router.get('/', getAllHalls);
router.get('/search', searchHalls);
router.get('/capacity', getHallsByCapacity);
router.get('/equipment', getHallsByEquipment);
router.get('/:id', getHallById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, validateHallCreation, createHall);
router.put('/:id', authenticateToken, requireAdmin, validateHallUpdate, updateHall);
router.delete('/:id', authenticateToken, requireAdmin, deleteHall);

export default router;
