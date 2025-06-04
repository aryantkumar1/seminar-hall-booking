import { NextRequest, NextResponse } from 'next/server';
import { HallModel } from '@/models/Hall';
import { verifyAuth, hasRole } from '@/lib/auth';
import { z } from 'zod';

const createHallSchema = z.object({
  name: z.string().min(3, 'Hall name must be at least 3 characters'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  equipment: z.array(z.string()).min(1, 'At least one equipment item is required'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  imageHint: z.string().min(2, 'Image hint must be at least 2 characters').max(50, 'Image hint must be 50 characters or less').optional().or(z.literal('')),
});

// GET /api/halls - Get all halls
export async function GET(request: NextRequest) {
  try {
    // Authentication is optional for viewing halls
    const user = verifyAuth(request);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const minCapacity = searchParams.get('minCapacity');
    const maxCapacity = searchParams.get('maxCapacity');
    const equipment = searchParams.get('equipment');

    let halls;

    if (search) {
      halls = await HallModel.search(search);
    } else if (minCapacity) {
      const min = parseInt(minCapacity);
      const max = maxCapacity ? parseInt(maxCapacity) : undefined;
      halls = await HallModel.findByCapacityRange(min, max);
    } else if (equipment) {
      const equipmentArray = equipment.split(',');
      halls = await HallModel.findByEquipment(equipmentArray);
    } else {
      halls = await HallModel.findAll();
    }

    return NextResponse.json({ halls });
  } catch (error) {
    console.error('Get halls error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/halls - Create a new hall (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate request body
    const validationResult = createHallSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const hallData = validationResult.data;

    // Ensure required fields are present
    const createData = {
      ...hallData,
      imageUrl: hallData.imageUrl || '',
      imageHint: hallData.imageHint || ''
    };

    // Create hall
    const hall = await HallModel.create(createData);

    return NextResponse.json({
      message: 'Hall created successfully',
      hall,
    }, { status: 201 });
  } catch (error) {
    console.error('Create hall error:', error);
    
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
