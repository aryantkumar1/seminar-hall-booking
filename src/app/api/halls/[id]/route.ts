import { NextRequest, NextResponse } from 'next/server';
import { HallModel } from '@/models/Hall';
import { verifyAuth, hasRole } from '@/lib/auth';
import { z } from 'zod';

const updateHallSchema = z.object({
  name: z.string().min(3, 'Hall name must be at least 3 characters').optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  equipment: z.array(z.string()).min(1, 'At least one equipment item is required').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  imageHint: z.string().min(2, 'Image hint must be at least 2 characters').max(50, 'Image hint must be 50 characters or less').optional().or(z.literal('')),
});

// GET /api/halls/[id] - Get a specific hall
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const hall = await HallModel.findById(id);
    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ hall });
  } catch (error) {
    console.error('Get hall error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/halls/[id] - Update a hall (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate request body
    const validationResult = updateHallSchema.safeParse(body);
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

    // Update hall
    const hall = await HallModel.update(id, updateData);
    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Hall updated successfully',
      hall,
    });
  } catch (error) {
    console.error('Update hall error:', error);
    
    if (error instanceof Error && error.message === 'Hall with this name already exists') {
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

// DELETE /api/halls/[id] - Delete a hall (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasRole(user, 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    const success = await HallModel.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Hall deleted successfully',
    });
  } catch (error) {
    console.error('Delete hall error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
