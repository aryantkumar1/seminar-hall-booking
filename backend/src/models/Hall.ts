import mongoose, { Document, Schema } from 'mongoose';

export interface IHall extends Document {
  name: string;
  capacity: number;
  equipment: string[];
  imageUrl: string;
  imageHint?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HallSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Hall name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Hall name must be at least 3 characters long'],
    maxlength: [100, 'Hall name cannot exceed 100 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [1000, 'Capacity cannot exceed 1000']
  },
  equipment: {
    type: [String],
    required: [true, 'Equipment list is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one equipment item is required'
    }
  },
  imageUrl: {
    type: String,
    required: false,
    default: 'https://placehold.co/600x400.png',
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty
        // Allow both URLs and base64 data URLs
        return v.startsWith('data:image/') || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL or upload an image'
    }
  },
  imageHint: {
    type: String,
    required: false,
    trim: true,
    minlength: [2, 'Image hint must be at least 2 characters long'],
    maxlength: [50, 'Image hint cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Index for searching
HallSchema.index({ name: 'text', equipment: 'text' });

export default mongoose.model<IHall>('Hall', HallSchema);
