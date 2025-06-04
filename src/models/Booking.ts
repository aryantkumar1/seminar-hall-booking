import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';

export interface Booking {
  _id?: ObjectId;
  hallId: string;
  hallName: string;
  facultyId: string;
  facultyName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingData {
  hallId: string;
  hallName: string;
  facultyId: string;
  facultyName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
}

export interface BookingResponse {
  id: string;
  hallId: string;
  hallName: string;
  facultyId: string;
  facultyName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

export class BookingModel {
  private static collectionName = 'bookings';

  // Convert MongoDB document to response format
  private static toResponse(booking: Booking): BookingResponse {
    return {
      id: booking._id!.toString(),
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
      updatedAt: booking.updatedAt,
    };
  }

  // Create a new booking
  static async create(bookingData: CreateBookingData): Promise<BookingResponse> {
    const collection = await getCollection(this.collectionName);
    
    // Check for conflicting bookings
    const conflictingBooking = await this.checkConflict(
      bookingData.hallId,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime
    );

    if (conflictingBooking) {
      throw new Error('This time slot is already booked or conflicts with an existing booking');
    }

    const booking: Omit<Booking, '_id'> = {
      ...bookingData,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(booking);
    const createdBooking = await collection.findOne({ _id: result.insertedId });
    
    if (!createdBooking) {
      throw new Error('Failed to create booking');
    }

    return this.toResponse(createdBooking as Booking);
  }

  // Check for booking conflicts
  static async checkConflict(
    hallId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    
    // Create date range for the same day
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
      status: { $ne: 'Rejected' }, // Don't consider rejected bookings
      $or: [
        // New booking starts during existing booking
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New booking ends during existing booking
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New booking completely contains existing booking
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    };

    // Exclude specific booking if provided (for updates)
    if (excludeBookingId) {
      query._id = { $ne: new ObjectId(excludeBookingId) };
    }

    const conflictingBooking = await collection.findOne(query);
    return !!conflictingBooking;
  }

  // Find booking by ID
  static async findById(id: string): Promise<BookingResponse | null> {
    const collection = await getCollection(this.collectionName);
    const booking = await collection.findOne({ _id: new ObjectId(id) }) as Booking | null;
    
    if (!booking) {
      return null;
    }

    return this.toResponse(booking);
  }

  // Get all bookings
  static async findAll(): Promise<BookingResponse[]> {
    const collection = await getCollection(this.collectionName);
    const bookings = await collection.find({}).sort({ date: -1, startTime: 1 }).toArray() as Booking[];
    
    return bookings.map(booking => this.toResponse(booking));
  }

  // Get bookings by faculty ID
  static async findByFacultyId(facultyId: string): Promise<BookingResponse[]> {
    const collection = await getCollection(this.collectionName);
    const bookings = await collection.find({ facultyId }).sort({ date: -1, startTime: 1 }).toArray() as Booking[];
    
    return bookings.map(booking => this.toResponse(booking));
  }

  // Get bookings by hall ID
  static async findByHallId(hallId: string): Promise<BookingResponse[]> {
    const collection = await getCollection(this.collectionName);
    const bookings = await collection.find({ hallId }).sort({ date: -1, startTime: 1 }).toArray() as Booking[];
    
    return bookings.map(booking => this.toResponse(booking));
  }

  // Get bookings by status
  static async findByStatus(status: 'Pending' | 'Approved' | 'Rejected'): Promise<BookingResponse[]> {
    const collection = await getCollection(this.collectionName);
    const bookings = await collection.find({ status }).sort({ date: -1, startTime: 1 }).toArray() as Booking[];
    
    return bookings.map(booking => this.toResponse(booking));
  }

  // Update booking status
  static async updateStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected'): Promise<BookingResponse | null> {
    const collection = await getCollection(this.collectionName);
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    return this.toResponse(result as Booking);
  }

  // Update booking
  static async update(id: string, updateData: Partial<CreateBookingData>): Promise<BookingResponse | null> {
    const collection = await getCollection(this.collectionName);
    
    // If time or date is being updated, check for conflicts
    if (updateData.date || updateData.startTime || updateData.endTime) {
      const existingBooking = await this.findById(id);
      if (!existingBooking) {
        return null;
      }

      const date = updateData.date || existingBooking.date;
      const startTime = updateData.startTime || existingBooking.startTime;
      const endTime = updateData.endTime || existingBooking.endTime;
      const hallId = updateData.hallId || existingBooking.hallId;

      const hasConflict = await this.checkConflict(hallId, date, startTime, endTime, id);
      if (hasConflict) {
        throw new Error('This time slot is already booked or conflicts with an existing booking');
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

    return this.toResponse(result as Booking);
  }

  // Delete booking
  static async delete(id: string): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount === 1;
  }

  // Get bookings for a specific date range
  static async findByDateRange(startDate: Date, endDate: Date): Promise<BookingResponse[]> {
    const collection = await getCollection(this.collectionName);
    const bookings = await collection.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1, startTime: 1 }).toArray() as Booking[];
    
    return bookings.map(booking => this.toResponse(booking));
  }
}
