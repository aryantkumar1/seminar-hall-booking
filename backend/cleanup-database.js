const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Found collections:', collections.map(c => c.name));

    // Clear all data from each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      
      if (collectionName === 'users' || 
          collectionName === 'halls' || 
          collectionName === 'bookings') {
        
        const count = await db.collection(collectionName).countDocuments();
        console.log(`🗑️  Clearing ${count} documents from ${collectionName}...`);
        
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} documents from ${collectionName}`);
      }
    }

    console.log('🎉 Database cleanup completed successfully!');
    console.log('📝 Summary:');
    console.log('   - All users removed');
    console.log('   - All halls removed');
    console.log('   - All bookings removed');
    console.log('');
    console.log('🚀 You can now start fresh with new data!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
console.log('🧹 Starting database cleanup...');
console.log('⚠️  This will remove ALL users, halls, and bookings!');
console.log('');

cleanupDatabase();
