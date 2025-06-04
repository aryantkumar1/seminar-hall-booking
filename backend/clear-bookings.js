const mongoose = require('mongoose');
require('dotenv').config();

async function clearBookings() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🗑️ Clearing all bookings...');
    const result = await mongoose.connection.db.collection('bookings').deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} bookings from database`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearBookings();
