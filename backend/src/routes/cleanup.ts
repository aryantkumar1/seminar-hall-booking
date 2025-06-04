import express from 'express';
import User from '../models/User';
import Hall from '../models/Hall';
import Booking from '../models/Booking';

const router = express.Router();

// Cleanup endpoint - removes all data
router.delete('/all', async (req, res) => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Count existing documents
    const userCount = await User.countDocuments();
    const hallCount = await Hall.countDocuments();
    const bookingCount = await Booking.countDocuments();

    console.log('📊 Current data:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Halls: ${hallCount}`);
    console.log(`   - Bookings: ${bookingCount}`);

    // Clear all collections
    const userResult = await User.deleteMany({});
    const hallResult = await Hall.deleteMany({});
    const bookingResult = await Booking.deleteMany({});

    console.log('✅ Cleanup completed:');
    console.log(`   - Deleted ${userResult.deletedCount} users`);
    console.log(`   - Deleted ${hallResult.deletedCount} halls`);
    console.log(`   - Deleted ${bookingResult.deletedCount} bookings`);

    res.json({
      message: 'Database cleanup completed successfully',
      deleted: {
        users: userResult.deletedCount,
        halls: hallResult.deletedCount,
        bookings: bookingResult.deletedCount
      }
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup database' });
  }
});

export default router;
