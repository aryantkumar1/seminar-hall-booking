"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("@/config/database"));
const auth_1 = __importDefault(require("@/routes/auth"));
const halls_1 = __importDefault(require("@/routes/halls"));
const bookings_1 = __importDefault(require("@/routes/bookings"));
const cleanup_1 = __importDefault(require("./routes/cleanup"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
(0, database_1.default)();
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:9002',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Seminar Hall Booking API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/halls', halls_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/cleanup', cleanup_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist on this server`
    });
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        res.status(400).json({
            error: 'Validation Error',
            details: errors
        });
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        res.status(409).json({
            error: 'Duplicate Error',
            message: `${field} already exists`
        });
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Invalid token'
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: 'Token expired'
        });
        return;
    }
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} (restarted)`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:9002'}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map