import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { hashPassword, verifyPassword } from '@/lib/auth';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty';
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty';
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  private static collectionName = 'users';

  // Convert MongoDB document to response format
  private static toResponse(user: User): UserResponse {
    return {
      id: user._id!.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Create a new user
  static async create(userData: CreateUserData): Promise<UserResponse> {
    const collection = await getCollection(this.collectionName);
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    const user: Omit<User, '_id'> = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(user);
    const createdUser = await collection.findOne({ _id: result.insertedId });
    
    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    return this.toResponse(createdUser as User);
  }

  // Find user by email and verify password
  static async authenticate(email: string, password: string): Promise<UserResponse | null> {
    const collection = await getCollection(this.collectionName);
    const user = await collection.findOne({ email }) as User | null;
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return this.toResponse(user);
  }

  // Find user by ID
  static async findById(id: string): Promise<UserResponse | null> {
    const collection = await getCollection(this.collectionName);
    const user = await collection.findOne({ _id: new ObjectId(id) }) as User | null;
    
    if (!user) {
      return null;
    }

    return this.toResponse(user);
  }

  // Find user by email
  static async findByEmail(email: string): Promise<UserResponse | null> {
    const collection = await getCollection(this.collectionName);
    const user = await collection.findOne({ email }) as User | null;
    
    if (!user) {
      return null;
    }

    return this.toResponse(user);
  }

  // Get all users (admin only)
  static async findAll(): Promise<UserResponse[]> {
    const collection = await getCollection(this.collectionName);
    const users = await collection.find({}).toArray() as User[];
    
    return users.map(user => this.toResponse(user));
  }

  // Update user
  static async update(id: string, updateData: Partial<CreateUserData>): Promise<UserResponse | null> {
    const collection = await getCollection(this.collectionName);
    
    const updateDoc: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Hash password if it's being updated
    if (updateData.password) {
      updateDoc.password = await hashPassword(updateData.password);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return this.toResponse(result as User);
  }

  // Delete user
  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount === 1;
  }
}
