"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("@/config/database"));
const User_1 = __importDefault(require("@/models/User"));
const Hall_1 = __importDefault(require("@/models/Hall"));
const Booking_1 = __importDefault(require("@/models/Booking"));
dotenv_1.default.config();
const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        await (0, database_1.default)();
        console.log('🗑️  Clearing existing data...');
        await User_1.default.deleteMany({});
        await Hall_1.default.deleteMany({});
        await Booking_1.default.deleteMany({});
        console.log('👤 Creating admin user...');
        const admin = new User_1.default({
            name: 'Admin User',
            email: 'admin@hallhub.com',
            password: 'admin123',
            role: 'admin'
        });
        await admin.save();
        console.log('👥 Creating faculty users...');
        const faculty1 = new User_1.default({
            name: 'Dr. John Smith',
            email: 'john.smith@university.edu',
            password: 'faculty123',
            role: 'faculty'
        });
        await faculty1.save();
        const faculty2 = new User_1.default({
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@university.edu',
            password: 'faculty123',
            role: 'faculty'
        });
        await faculty2.save();
        const faculty3 = new User_1.default({
            name: 'Dr. Michael Brown',
            email: 'michael.brown@university.edu',
            password: 'faculty123',
            role: 'faculty'
        });
        await faculty3.save();
        console.log('🏛️  Creating halls...');
        const hall1 = new Hall_1.default({
            name: 'Grand Auditorium',
            capacity: 200,
            equipment: ['Projector', 'Sound System', 'Microphone'],
            imageUrl: 'https://placehold.co/600x400.png',
            imageHint: 'large auditorium stage'
        });
        await hall1.save();
        const hall2 = new Hall_1.default({
            name: 'Innovation Hub',
            capacity: 50,
            equipment: ['Projector', 'Whiteboard', 'Video Conferencing'],
            imageUrl: 'https://placehold.co/600x400.png',
            imageHint: 'modern hub computers'
        });
        await hall2.save();
        const hall3 = new Hall_1.default({
            name: 'Lecture Hall A',
            capacity: 100,
            equipment: ['Projector', 'Whiteboard'],
            imageUrl: 'https://placehold.co/600x400.png',
            imageHint: 'lecture hall seats'
        });
        await hall3.save();
        const hall4 = new Hall_1.default({
            name: 'Conference Room B',
            capacity: 25,
            equipment: ['Projector', 'Video Conferencing', 'Whiteboard'],
            imageUrl: 'https://placehold.co/600x400.png',
            imageHint: 'conference room table'
        });
        await hall4.save();
        const hall5 = new Hall_1.default({
            name: 'Seminar Hall C',
            capacity: 75,
            equipment: ['Projector', 'Sound System'],
            imageUrl: 'https://placehold.co/600x400.png',
            imageHint: 'seminar hall presentation'
        });
        await hall5.save();
        console.log('📅 Creating sample bookings...');
        const booking1 = new Booking_1.default({
            hallId: hall1._id,
            hallName: hall1.name,
            facultyId: faculty1._id,
            facultyName: faculty1.name,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            startTime: '10:00',
            endTime: '12:00',
            purpose: 'Annual Department Conference - Keynote presentations and networking session',
            status: 'Approved'
        });
        await booking1.save();
        const booking2 = new Booking_1.default({
            hallId: hall2._id,
            hallName: hall2.name,
            facultyId: faculty2._id,
            facultyName: faculty2.name,
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            startTime: '14:00',
            endTime: '16:00',
            purpose: 'Research Methodology Workshop - Interactive session for graduate students',
            status: 'Pending'
        });
        await booking2.save();
        const booking3 = new Booking_1.default({
            hallId: hall3._id,
            hallName: hall3.name,
            facultyId: faculty3._id,
            facultyName: faculty3.name,
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            startTime: '09:00',
            endTime: '11:00',
            purpose: 'Guest Lecture Series - Industry Expert Talk on AI and Machine Learning',
            status: 'Pending'
        });
        await booking3.save();
        const booking4 = new Booking_1.default({
            hallId: hall4._id,
            hallName: hall4.name,
            facultyId: faculty1._id,
            facultyName: faculty1.name,
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            startTime: '15:30',
            endTime: '17:00',
            purpose: 'Faculty Meeting - Monthly departmental review and planning session',
            status: 'Approved'
        });
        await booking4.save();
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Seeded data summary:');
        console.log(`👤 Users: ${await User_1.default.countDocuments()}`);
        console.log(`🏛️  Halls: ${await Hall_1.default.countDocuments()}`);
        console.log(`📅 Bookings: ${await Booking_1.default.countDocuments()}`);
        console.log('\n🔐 Login credentials:');
        console.log('Admin: admin@hallhub.com / admin123');
        console.log('Faculty: john.smith@university.edu / faculty123');
        console.log('Faculty: sarah.johnson@university.edu / faculty123');
        console.log('Faculty: michael.brown@university.edu / faculty123');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};
seedData();
//# sourceMappingURL=seed.js.map