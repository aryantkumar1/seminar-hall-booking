import { connectDB } from '../config/database';
import User from '../models/User';
import Hall from '../models/Hall';
import Booking from '../models/Booking';

async function cleanupDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');

    // Count existing documents
    const userCount = await User.countDocuments();
    const hallCount = await Hall.countDocuments();
    const bookingCount = await Booking.countDocuments();

    console.log('📊 Current data:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Halls: ${hallCount}`);
    console.log(`   - Bookings: ${bookingCount}`);
    console.log('');

    // Clear all collections
    console.log('🗑️  Clearing all data...');
    
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    const hallResult = await Hall.deleteMany({});
    console.log(`✅ Deleted ${hallResult.deletedCount} halls`);
    
    const bookingResult = await Booking.deleteMany({});
    console.log(`✅ Deleted ${bookingResult.deletedCount} bookings`);

    console.log('');
    console.log('🎉 Database cleanup completed successfully!');
    console.log('🚀 You can now start fresh with new data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
console.log('🧹 Starting database cleanup...');
console.log('⚠️  This will remove ALL users, halls, and bookings!');
console.log('');

cleanupDatabase();
