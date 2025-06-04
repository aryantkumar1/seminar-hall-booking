import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';

export interface Hall {
  _id?: ObjectId;
  name: string;
  capacity: number;
  equipment: string[];
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHallData {
  name: string;
  capacity: number;
  equipment: string[];
  imageUrl: string;
  imageHint: string;
}

export interface HallResponse {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HallModel {
  private static collectionName = 'halls';

  // Convert MongoDB document to response format
  private static toResponse(hall: Hall): HallResponse {
    return {
      id: hall._id!.toString(),
      name: hall.name,
      capacity: hall.capacity,
      equipment: hall.equipment,
      imageUrl: hall.imageUrl,
      imageHint: hall.imageHint,
      createdAt: hall.createdAt,
      updatedAt: hall.updatedAt,
    };
  }

  // Create a new hall
  static async create(hallData: CreateHallData): Promise<HallResponse> {
    const collection = await getCollection(this.collectionName);
    
    // Check if hall with same name already exists
    const existingHall = await collection.findOne({ name: hallData.name });
    if (existingHall) {
      throw new Error('Hall with this name already exists');
    }

    const hall: Omit<Hall, '_id'> = {
      ...hallData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(hall);
    const createdHall = await collection.findOne({ _id: result.insertedId });
    
    if (!createdHall) {
      throw new Error('Failed to create hall');
    }

    return this.toResponse(createdHall as Hall);
  }

  // Find hall by ID
  static async findById(id: string): Promise<HallResponse | null> {
    const collection = await getCollection(this.collectionName);
    const hall = await collection.findOne({ _id: new ObjectId(id) }) as Hall | null;
    
    if (!hall) {
      return null;
    }

    return this.toResponse(hall);
  }

  // Get all halls
  static async findAll(): Promise<HallResponse[]> {
    const collection = await getCollection(this.collectionName);
    const halls = await collection.find({}).sort({ name: 1 }).toArray() as Hall[];
    
    return halls.map(hall => this.toResponse(hall));
  }

  // Update hall
  static async update(id: string, updateData: Partial<CreateHallData>): Promise<HallResponse | null> {
    const collection = await getCollection(this.collectionName);
    
    // Check if another hall with the same name exists (if name is being updated)
    if (updateData.name) {
      const existingHall = await collection.findOne({ 
        name: updateData.name, 
        _id: { $ne: new ObjectId(id) } 
      });
      if (existingHall) {
        throw new Error('Hall with this name already exists');
      }
    }

    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return this.toResponse(result as Hall);
  }

  // Delete hall
  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount === 1;
  }

  // Search halls by name or equipment
  static async search(query: string): Promise<HallResponse[]> {
    const collection = await getCollection(this.collectionName);
    const halls = await collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { equipment: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ name: 1 }).toArray() as Hall[];
    
    return halls.map(hall => this.toResponse(hall));
  }

  // Get halls by capacity range
  static async findByCapacityRange(minCapacity: number, maxCapacity?: number): Promise<HallResponse[]> {
    const collection = await getCollection(this.collectionName);
    
    const query: any = { capacity: { $gte: minCapacity } };
    if (maxCapacity) {
      query.capacity.$lte = maxCapacity;
    }

    const halls = await collection.find(query).sort({ capacity: 1 }).toArray() as Hall[];
    
    return halls.map(hall => this.toResponse(hall));
  }

  // Get halls with specific equipment
  static async findByEquipment(equipment: string[]): Promise<HallResponse[]> {
    const collection = await getCollection(this.collectionName);
    const halls = await collection.find({
      equipment: { $all: equipment }
    }).sort({ name: 1 }).toArray() as Hall[];
    
    return halls.map(hall => this.toResponse(hall));
  }
}
