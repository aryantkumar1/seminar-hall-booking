"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("../models/User"));
const Hall_1 = __importDefault(require("../models/Hall"));
const Booking_1 = __importDefault(require("../models/Booking"));
async function cleanupDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await (0, database_1.default)();
        console.log('✅ Connected to database');
        const userCount = await User_1.default.countDocuments();
        const hallCount = await Hall_1.default.countDocuments();
        const bookingCount = await Booking_1.default.countDocuments();
        console.log('📊 Current data:');
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Halls: ${hallCount}`);
        console.log(`   - Bookings: ${bookingCount}`);
        console.log('');
        console.log('🗑️  Clearing all data...');
        const userResult = await User_1.default.deleteMany({});
        console.log(`✅ Deleted ${userResult.deletedCount} users`);
        const hallResult = await Hall_1.default.deleteMany({});
        console.log(`✅ Deleted ${hallResult.deletedCount} halls`);
        const bookingResult = await Booking_1.default.deleteMany({});
        console.log(`✅ Deleted ${bookingResult.deletedCount} bookings`);
        console.log('');
        console.log('🎉 Database cleanup completed successfully!');
        console.log('🚀 You can now start fresh with new data!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}
console.log('🧹 Starting database cleanup...');
console.log('⚠️  This will remove ALL users, halls, and bookings!');
console.log('');
cleanupDatabase();
//# sourceMappingURL=cleanup.js.map