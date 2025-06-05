"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const Hall_1 = __importDefault(require("../models/Hall"));
const Booking_1 = __importDefault(require("../models/Booking"));
const router = express_1.default.Router();
router.delete('/all', async (req, res) => {
    try {
        console.log('🧹 Starting database cleanup...');
        const userCount = await User_1.default.countDocuments();
        const hallCount = await Hall_1.default.countDocuments();
        const bookingCount = await Booking_1.default.countDocuments();
        console.log('📊 Current data:');
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Halls: ${hallCount}`);
        console.log(`   - Bookings: ${bookingCount}`);
        const userResult = await User_1.default.deleteMany({});
        const hallResult = await Hall_1.default.deleteMany({});
        const bookingResult = await Booking_1.default.deleteMany({});
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
    }
    catch (error) {
        console.error('❌ Cleanup error:', error);
        res.status(500).json({ error: 'Failed to cleanup database' });
    }
});
exports.default = router;
//# sourceMappingURL=cleanup.js.map