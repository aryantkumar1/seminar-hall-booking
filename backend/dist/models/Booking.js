"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    hallId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Hall',
        required: [true, 'Hall ID is required']
    },
    hallName: {
        type: String,
        required: [true, 'Hall name is required'],
        trim: true
    },
    facultyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Faculty ID is required']
    },
    facultyName: {
        type: String,
        required: [true, 'Faculty name is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        validate: {
            validator: function (v) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return v >= today;
            },
            message: 'Cannot book halls for past dates'
        }
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    purpose: {
        type: String,
        required: [true, 'Purpose is required'],
        trim: true,
        minlength: [5, 'Purpose must be at least 5 characters long'],
        maxlength: [500, 'Purpose cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});
BookingSchema.index({ hallId: 1, date: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ facultyId: 1, date: -1 });
BookingSchema.index({ status: 1, date: -1 });
BookingSchema.pre('save', function (next) {
    if (this.endTime <= this.startTime) {
        next(new Error('End time must be after start time'));
    }
    else {
        next();
    }
});
exports.default = mongoose_1.default.model('Booking', BookingSchema);
//# sourceMappingURL=Booking.js.map