import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from '@/config/database';

// Import routes
import authRoutes from '@/routes/auth';
import hallRoutes from '@/routes/halls';
import bookingRoutes from '@/routes/bookings';
import cleanupRoutes from './routes/cleanup';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting (more generous for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - allow multiple origins for flexibility
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:9002',
  'https://seminar-hall-booking-9lqs.vercel.app',
  'https://seminar-hall-booking-9lqs-2q2lmgzk6.vercel.app',
  'http://localhost:9002',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Seminar Hall Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  // Simple Prometheus format metrics
  const metrics = `
# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds ${uptime}

# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}
nodejs_memory_usage_bytes{type="external"} ${memoryUsage.external}

# HELP seminar_hall_api_up API availability
# TYPE seminar_hall_api_up gauge
seminar_hall_api_up 1
`.trim();

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cleanup', cleanupRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(409).json({
      error: 'Duplicate Error',
      message: `${field} already exists`
    });
    return;
  }

  // JWT errors
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

  // Default error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (restarted)`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:9002'}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/health`);
});

export default app;
