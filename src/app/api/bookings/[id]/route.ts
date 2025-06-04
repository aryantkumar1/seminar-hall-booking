import { NextRequest, NextResponse } from 'next/server';
import { BookingModel } from '@/models/Booking';
import { verifyAuth, hasRole } from '@/lib/auth';
import { z } from 'zod';

const updateBookingSchema = z.object({
  date: z.string().transform((str) => new Date(str)).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters').optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
});

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Faculty can only see their own bookings
    if (user.role === 'faculty' && booking.facultyId !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden - Can only view your own bookings' },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Check if this is a status update (admin only) or booking details update
    if ('status' in body) {
      // Status update - admin only
      if (!hasRole(user, 'admin')) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }

      const validationResult = updateStatusSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationResult.error.errors 
          },
          { status: 400 }
        );
      }

      const { status } = validationResult.data;
      const booking = await BookingModel.updateStatus(id, status);
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Booking status updated successfully',
        booking,
      });
    } else {
      // Booking details update - faculty can only update their own bookings
      const existingBooking = await BookingModel.findById(id);
      if (!existingBooking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      if (user.role === 'faculty' && existingBooking.facultyId !== user.userId) {
        return NextResponse.json(
          { error: 'Forbidden - Can only update your own bookings' },
          { status: 403 }
        );
      }

      // Faculty can only update pending bookings
      if (user.role === 'faculty' && existingBooking.status !== 'Pending') {
        return NextResponse.json(
          { error: 'Can only update pending bookings' },
          { status: 400 }
        );
      }

      const validationResult = updateBookingSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationResult.error.errors 
          },
          { status: 400 }
        );
      }

      const updateData = validationResult.data;

      // Validate time constraints if provided
      if (updateData.startTime && updateData.endTime && updateData.endTime <= updateData.startTime) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }

      // Validate date is not in the past
      if (updateData.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (updateData.date < today) {
          return NextResponse.json(
            { error: 'Cannot book halls for past dates' },
            { status: 400 }
          );
        }
      }

      const booking = await BookingModel.update(id, updateData);
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Booking updated successfully',
        booking,
      });
    }
  } catch (error) {
    console.error('Update booking error:', error);
    
    if (error instanceof Error && error.message.includes('conflicts with an existing booking')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Faculty can only delete their own bookings
    if (user.role === 'faculty' && booking.facultyId !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden - Can only delete your own bookings' },
        { status: 403 }
      );
    }

    const success = await BookingModel.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
