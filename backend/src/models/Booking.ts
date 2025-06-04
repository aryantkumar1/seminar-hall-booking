import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  hallId: mongoose.Types.ObjectId;
  hallName: string;
  facultyId: mongoose.Types.ObjectId;
  facultyName: string;
  date: Date;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  hallId: {
    type: Schema.Types.ObjectId,
    ref: 'Hall',
    required: [true, 'Hall ID is required']
  },
  hallName: {
    type: String,
    required: [true, 'Hall name is required'],
    trim: true
  },
  facultyId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty ID is required']
  },
  facultyName: {
    type: String,
    required: [true, 'Faculty name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v: Date) {
        // Don't allow booking for past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return v >= today;
      },
      message: 'Cannot book halls for past dates'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    minlength: [5, 'Purpose must be at least 5 characters long'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Compound index for checking conflicts
BookingSchema.index({ hallId: 1, date: 1, startTime: 1, endTime: 1 });

// Index for queries
BookingSchema.index({ facultyId: 1, date: -1 });
BookingSchema.index({ status: 1, date: -1 });

// Validate that end time is after start time
BookingSchema.pre<IBooking>('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
