"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("@/controllers/bookingController");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', bookingController_1.getAllBookings);
router.get('/:id', bookingController_1.getBookingById);
router.post('/', auth_1.requireFaculty, validation_1.validateBookingCreation, bookingController_1.createBooking);
router.put('/:id', validation_1.validateBookingUpdate, bookingController_1.updateBooking);
router.delete('/:id', bookingController_1.deleteBooking);
router.patch('/:id/status', auth_1.requireAdmin, validation_1.validateBookingStatusUpdate, bookingController_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=bookings.js.map