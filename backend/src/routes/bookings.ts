import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking
} from '@/controllers/bookingController';
import {
  validateBookingCreation,
  validateBookingUpdate,
  validateBookingStatusUpdate
} from '@/middleware/validation';
import { authenticateToken, requireAdmin, requireFaculty } from '@/middleware/auth';

const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

// Routes accessible by both admin and faculty
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', requireFaculty, validateBookingCreation, createBooking);
router.put('/:id', validateBookingUpdate, updateBooking);
router.delete('/:id', deleteBooking);

// Admin only routes
router.patch('/:id/status', requireAdmin, validateBookingStatusUpdate, updateBookingStatus);

export default router;
