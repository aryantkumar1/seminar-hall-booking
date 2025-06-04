import { Request, Response } from 'express';
import Hall from '@/models/Hall';
import { AuthRequest } from '@/middleware/auth';

// Transform MongoDB document to frontend format
const transformHall = (hall: any) => {
  return {
    id: hall._id.toString(),
    name: hall.name,
    capacity: hall.capacity,
    equipment: hall.equipment,
    imageUrl: hall.imageUrl,
    imageHint: hall.imageHint,
    createdAt: hall.createdAt,
    updatedAt: hall.updatedAt
  };
};

// Get all halls
export const getAllHalls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, minCapacity, maxCapacity, equipment } = req.query;
    
    let query: any = {};

    // Search by name or equipment
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { equipment: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Filter by capacity range
    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) query.capacity.$gte = parseInt(minCapacity as string);
      if (maxCapacity) query.capacity.$lte = parseInt(maxCapacity as string);
    }

    // Filter by equipment
    if (equipment) {
      const equipmentArray = (equipment as string).split(',');
      query.equipment = { $all: equipmentArray };
    }

    const halls = await Hall.find(query).sort({ name: 1 });
    const transformedHalls = halls.map(transformHall);

    res.json({ halls: transformedHalls });
  } catch (error: any) {
    console.error('Get halls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get hall by ID
export const getHallById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hall = await Hall.findById(id);
    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    res.json({ hall: transformHall(hall) });
  } catch (error: any) {
    console.error('Get hall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new hall (admin only)
export const createHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, capacity, equipment, imageUrl, imageHint } = req.body;

    // Check if hall with same name already exists
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      res.status(409).json({ error: 'Hall with this name already exists' });
      return;
    }

    const hallData: any = {
      name,
      capacity,
      equipment,
      imageUrl: imageUrl || 'https://placehold.co/600x400.png'
    };

    // Only add imageHint if it's provided
    if (imageHint) {
      hallData.imageHint = imageHint;
    }

    const hall = new Hall(hallData);

    await hall.save();

    res.status(201).json({
      message: 'Hall created successfully',
      hall: transformHall(hall)
    });
  } catch (error: any) {
    console.error('Create hall error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Update hall (admin only)
export const updateHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, capacity, equipment, imageUrl, imageHint } = req.body;

    // Check if another hall with the same name exists (if name is being updated)
    if (name) {
      const existingHall = await Hall.findOne({ name, _id: { $ne: id } });
      if (existingHall) {
        res.status(409).json({ error: 'Hall with this name already exists' });
        return;
      }
    }

    // Build update object, only including provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (equipment !== undefined) updateData.equipment = equipment;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imageHint !== undefined) updateData.imageHint = imageHint;

    const hall = await Hall.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    res.json({
      message: 'Hall updated successfully',
      hall: transformHall(hall)
    });
  } catch (error: any) {
    console.error('Update hall error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Delete hall (admin only)
export const deleteHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hall = await Hall.findByIdAndDelete(id);
    if (!hall) {
      res.status(404).json({ error: 'Hall not found' });
      return;
    }

    res.json({ message: 'Hall deleted successfully' });
  } catch (error: any) {
    console.error('Delete hall error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search halls
export const searchHalls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const halls = await Hall.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { equipment: { $in: [new RegExp(q as string, 'i')] } }
      ]
    }).sort({ name: 1 });

    res.json({ halls: halls.map(transformHall) });
  } catch (error: any) {
    console.error('Search halls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get halls by capacity range
export const getHallsByCapacity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { min, max } = req.query;
    
    if (!min) {
      res.status(400).json({ error: 'Minimum capacity is required' });
      return;
    }

    const query: any = { capacity: { $gte: parseInt(min as string) } };
    if (max) {
      query.capacity.$lte = parseInt(max as string);
    }

    const halls = await Hall.find(query).sort({ capacity: 1 });

    res.json({ halls: halls.map(transformHall) });
  } catch (error: any) {
    console.error('Get halls by capacity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get halls by equipment
export const getHallsByEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { equipment } = req.query;

    if (!equipment) {
      res.status(400).json({ error: 'Equipment list is required' });
      return;
    }

    const equipmentArray = (equipment as string).split(',');
    const halls = await Hall.find({
      equipment: { $all: equipmentArray }
    }).sort({ name: 1 });

    res.json({ halls: halls.map(transformHall) });
  } catch (error: any) {
    console.error('Get halls by equipment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
