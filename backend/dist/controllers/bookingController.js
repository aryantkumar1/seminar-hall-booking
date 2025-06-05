"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBookingStatus = exports.updateBooking = exports.createBooking = exports.getBookingById = exports.getAllBookings = void 0;
const Booking_1 = __importDefault(require("@/models/Booking"));
const Hall_1 = __importDefault(require("@/models/Hall"));
const transformBooking = (booking) => {
    return {
        _id: booking._id,
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
        updatedAt: booking.updatedAt
    };
};
const checkBookingConflict = async (hallId, date, startTime, endTime, excludeBookingId) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const query = {
        hallId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: { $ne: 'Rejected' },
        $or: [
            {
                startTime: { $lte: startTime },
                endTime: { $gt: startTime }
            },
            {
                startTime: { $lt: endTime },
                endTime: { $gte: endTime }
            },
            {
                startTime: { $gte: startTime },
                endTime: { $lte: endTime }
            }
        ]
    };
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    const conflictingBooking = await Booking_1.default.findOne(query);
    return !!conflictingBooking;
};
const getAllBookings = async (req, res) => {
    try {
        const { status, hallId, facultyId, startDate, endDate } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        }
        if (hallId) {
            query.hallId = hallId;
        }
        if (facultyId) {
            if (req.user?.role === 'faculty' && facultyId !== req.user._id.toString()) {
                res.status(403).json({ error: 'Can only view your own bookings' });
                return;
            }
            query.facultyId = facultyId;
        }
        else if (req.user?.role === 'faculty') {
            query.facultyId = req.user._id;
        }
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const bookings = await Booking_1.default.find(query)
            .populate('hallId', 'name capacity')
            .populate('facultyId', 'name email')
            .sort({ date: -1, startTime: 1 });
        const transformedBookings = bookings.map(transformBooking);
        res.json({ bookings: transformedBookings });
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAllBookings = getAllBookings;
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking_1.default.findById(id)
            .populate('hallId', 'name capacity')
            .populate('facultyId', 'name email');
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        if (req.user?.role === 'faculty' && booking.facultyId.toString() !== req.user._id.toString()) {
            res.status(403).json({ error: 'Can only view your own bookings' });
            return;
        }
        res.json({ booking: transformBooking(booking) });
    }
    catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getBookingById = getBookingById;
const createBooking = async (req, res) => {
    try {
        const { hallId, date, startTime, endTime, purpose } = req.body;
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const hall = await Hall_1.default.findById(hallId);
        if (!hall) {
            res.status(404).json({ error: 'Hall not found' });
            return;
        }
        const hasConflict = await checkBookingConflict(hallId, new Date(date), startTime, endTime);
        if (hasConflict) {
            res.status(409).json({ error: 'This time slot is already booked or conflicts with an existing booking' });
            return;
        }
        const booking = new Booking_1.default({
            hallId,
            hallName: hall.name,
            facultyId: req.user._id,
            facultyName: req.user.name,
            date: new Date(date),
            startTime,
            endTime,
            purpose
        });
        await booking.save();
        res.status(201).json({
            message: 'Booking created successfully',
            booking: transformBooking(booking)
        });
    }
    catch (error) {
        console.error('Create booking error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.createBooking = createBooking;
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startTime, endTime, purpose } = req.body;
        const booking = await Booking_1.default.findById(id);
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        if (req.user?.role === 'faculty' && booking.facultyId.toString() !== req.user._id.toString()) {
            res.status(403).json({ error: 'Can only update your own bookings' });
            return;
        }
        if (req.user?.role === 'faculty' && booking.status !== 'Pending') {
            res.status(400).json({ error: 'Can only update pending bookings' });
            return;
        }
        if (date || startTime || endTime) {
            const newDate = date ? new Date(date) : booking.date;
            const newStartTime = startTime || booking.startTime;
            const newEndTime = endTime || booking.endTime;
            const hasConflict = await checkBookingConflict(booking.hallId.toString(), newDate, newStartTime, newEndTime, id);
            if (hasConflict) {
                res.status(409).json({ error: 'This time slot is already booked or conflicts with an existing booking' });
                return;
            }
        }
        const updatedBooking = await Booking_1.default.findByIdAndUpdate(id, { date, startTime, endTime, purpose }, { new: true, runValidators: true });
        res.json({
            message: 'Booking updated successfully',
            booking: transformBooking(updatedBooking)
        });
    }
    catch (error) {
        console.error('Update booking error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.updateBooking = updateBooking;
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await Booking_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        res.json({
            message: 'Booking status updated successfully',
            booking: transformBooking(booking)
        });
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateBookingStatus = updateBookingStatus;
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking_1.default.findById(id);
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        if (req.user?.role === 'faculty' && booking.facultyId.toString() !== req.user._id.toString()) {
            res.status(403).json({ error: 'Can only delete your own bookings' });
            return;
        }
        await Booking_1.default.findByIdAndDelete(id);
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteBooking = deleteBooking;
//# sourceMappingURL=bookingController.js.map