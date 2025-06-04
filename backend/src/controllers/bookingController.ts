import { Request, Response } from 'express';
import Booking from '@/models/Booking';
import Hall from '@/models/Hall';
import { AuthRequest } from '@/middleware/auth';

// Transform MongoDB booking document to frontend format
const transformBooking = (booking: any) => {
  return {
    _id: booking._id,
    hallId: booking.hallId,
    hallName: booking.hallName,
    facultyId: booking.facultyId,
    facultyName: booking.facultyName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    purpose: booking.purpose,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
};

// Helper function to check for booking conflicts
const checkBookingConflict = async (
  hallId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const query: any = {
    hallId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $ne: 'Rejected' },
    $or: [
      {
        startTime: { $lte: startTime },
        endTime: { $gt: startTime }
      },
      {
        startTime: { $lt: endTime },
        endTime: { $gte: endTime }
      },
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !!conflictingBooking;
};

// Get all bookings
export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, hallId, facultyId, startDate, endDate } = req.query;
    
    let query: any = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by hall
    if (hallId) {
      query.hallId = hallId;
    }

    // Filter by faculty (faculty can only see their own bookings)
    if (facultyId) {
      if (req.user?.role === 'faculty' && facultyId !== (req.user._id as any).toString()) {
        res.status(403).json({ error: 'Can only view your own bookings' });
        return;
      }
      query.facultyId = facultyId;
    } else if (req.user?.role === 'faculty') {
      // Faculty can only see their own bookings
      query.facultyId = (req.user._id as any);
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const bookings = await Booking.find(query)
      .populate('hallId', 'name capacity')
      .populate('facultyId', 'name email')
      .sort({ date: -1, startTime: 1 });

    const transformedBookings = bookings.map(transformBooking);
    res.json({ bookings: transformedBookings });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get booking by ID
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('hallId', 'name capacity')
      .populate('facultyId', 'name email');
      
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Faculty can only see their own bookings
    if (req.user?.role === 'faculty' && booking.facultyId.toString() !== (req.user._id as any).toString()) {
      res.status(403).json({ error: 'Can only view your own bookings' });
      return;
    }

    res.json({ booking: transformBooking(booking) });
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hallId, date, startTime, endTime, purpose } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get hall information
    const hall = await Hall.findById(hallId);
    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    // Check for conflicts
    const hasConflict = await checkBookingConflict(hallId, new Date(date), startTime, endTime);
    if (hasConflict) {
      res.status(409).json({ error: 'This time slot is already booked or conflicts with an existing booking' });
      return;
    }

    const booking = new Booking({
      hallId,
      hallName: hall.name,
      facultyId: (req.user._id as any),
      facultyName: req.user.name,
      date: new Date(date),
      startTime,
      endTime,
      purpose
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: transformBooking(booking)
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Update booking
export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, purpose } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Faculty can only update their own bookings
    if (req.user?.role === 'faculty' && booking.facultyId.toString() !== (req.user._id as any).toString()) {
      res.status(403).json({ error: 'Can only update your own bookings' });
      return;
    }

    // Faculty can only update pending bookings
    if (req.user?.role === 'faculty' && booking.status !== 'Pending') {
      res.status(400).json({ error: 'Can only update pending bookings' });
      return;
    }

    // Check for conflicts if time or date is being updated
    if (date || startTime || endTime) {
      const newDate = date ? new Date(date) : booking.date;
      const newStartTime = startTime || booking.startTime;
      const newEndTime = endTime || booking.endTime;

      const hasConflict = await checkBookingConflict(
        booking.hallId.toString(),
        newDate,
        newStartTime,
        newEndTime,
        id
      );

      if (hasConflict) {
        res.status(409).json({ error: 'This time slot is already booked or conflicts with an existing booking' });
        return;
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { date, startTime, endTime, purpose },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Booking updated successfully',
      booking: transformBooking(updatedBooking)
    });
  } catch (error: any) {
    console.error('Update booking error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: transformBooking(booking)
    });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete booking
export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Faculty can only delete their own bookings
    if (req.user?.role === 'faculty' && booking.facultyId.toString() !== (req.user._id as any).toString()) {
      res.status(403).json({ error: 'Can only delete your own bookings' });
      return;
    }

    await Booking.findByIdAndDelete(id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
