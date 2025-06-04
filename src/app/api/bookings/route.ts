import { NextRequest, NextResponse } from 'next/server';
import { BookingModel } from '@/models/Booking';
import { HallModel } from '@/models/Hall';
import { verifyAuth, hasRole } from '@/lib/auth';
import { z } from 'zod';

const createBookingSchema = z.object({
  hallId: z.string().min(1, 'Hall ID is required'),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters'),
});

// GET /api/bookings - Get bookings
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'Pending' | 'Approved' | 'Rejected' | null;
    const hallId = searchParams.get('hallId');
    const facultyId = searchParams.get('facultyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let bookings;

    if (status) {
      bookings = await BookingModel.findByStatus(status);
    } else if (hallId) {
      bookings = await BookingModel.findByHallId(hallId);
    } else if (facultyId) {
      // Faculty can only see their own bookings, admin can see any faculty's bookings
      if (user.role === 'faculty' && facultyId !== user.userId) {
        return NextResponse.json(
          { error: 'Forbidden - Can only view your own bookings' },
          { status: 403 }
        );
      }
      bookings = await BookingModel.findByFacultyId(facultyId);
    } else if (startDate && endDate) {
      bookings = await BookingModel.findByDateRange(new Date(startDate), new Date(endDate));
    } else {
      // Admin can see all bookings, faculty can only see their own
      if (user.role === 'admin') {
        bookings = await BookingModel.findAll();
      } else {
        bookings = await BookingModel.findByFacultyId(user.userId);
      }
    }

    // Filter bookings based on user role
    if (user.role === 'faculty') {
      bookings = bookings.filter(booking => booking.facultyId === user.userId);
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { hallId, date, startTime, endTime, purpose } = validationResult.data;

    // Validate that end time is after start time
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Validate that booking is not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'Cannot book halls for past dates' },
        { status: 400 }
      );
    }

    // Get hall information
    const hall = await HallModel.findById(hallId);
    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Create booking
    const booking = await BookingModel.create({
      hallId,
      hallName: hall.name,
      facultyId: user.userId,
      facultyName: user.name,
      date: bookingDate,
      startTime,
      endTime,
      purpose,
    });

    return NextResponse.json({
      message: 'Booking created successfully',
      booking,
    }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    
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
