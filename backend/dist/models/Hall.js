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
const HallSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Hall name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Hall name must be at least 3 characters long'],
        maxlength: [100, 'Hall name cannot exceed 100 characters']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [1000, 'Capacity cannot exceed 1000']
    },
    equipment: {
        type: [String],
        required: [true, 'Equipment list is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one equipment item is required'
        }
    },
    imageUrl: {
        type: String,
        required: false,
        default: 'https://placehold.co/600x400.png',
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return v.startsWith('data:image/') || /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid image URL or upload an image'
        }
    },
    imageHint: {
        type: String,
        required: false,
        trim: true,
        minlength: [2, 'Image hint must be at least 2 characters long'],
        maxlength: [50, 'Image hint cannot exceed 50 characters']
    }
}, {
    timestamps: true
});
HallSchema.index({ name: 'text', equipment: 'text' });
exports.default = mongoose_1.default.model('Hall', HallSchema);
//# sourceMappingURL=Hall.js.map