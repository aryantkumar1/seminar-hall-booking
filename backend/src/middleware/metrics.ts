import { Request, Response, NextFunction } from 'express'
import promClient from 'prom-client'

// Create a Registry to register the metrics
const register = new promClient.Registry()

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: 'seminar_hall_',
})

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
})

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
})

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
})

const bookingRequestsTotal = new promClient.Counter({
  name: 'booking_requests_total',
  help: 'Total number of booking requests',
  labelNames: ['status', 'hall_id'],
  registers: [register],
})

const hallUtilization = new promClient.Gauge({
  name: 'hall_utilization_percentage',
  help: 'Hall utilization percentage',
  labelNames: ['hall_id', 'hall_name'],
  registers: [register],
})

const databaseQueries = new promClient.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'collection'],
  registers: [register],
})

const databaseQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
})

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // Increment active connections
  activeConnections.inc()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const route = req.route?.path || req.path
    
    // Record metrics
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode.toString(),
    })
    
    httpRequestDuration.observe({
      method: req.method,
      route,
      status: res.statusCode.toString(),
    }, duration)
    
    // Decrement active connections
    activeConnections.dec()
  })
  
  next()
}

// Function to record booking metrics
export const recordBookingMetric = (status: 'success' | 'failed' | 'pending', hallId: string) => {
  bookingRequestsTotal.inc({ status, hall_id: hallId })
}

// Function to update hall utilization
export const updateHallUtilization = (hallId: string, hallName: string, utilizationPercentage: number) => {
  hallUtilization.set({ hall_id: hallId, hall_name: hallName }, utilizationPercentage)
}

// Function to record database metrics
export const recordDatabaseMetric = (operation: string, collection: string, duration: number) => {
  databaseQueries.inc({ operation, collection })
  databaseQueryDuration.observe({ operation, collection }, duration)
}

// Metrics endpoint
export const getMetrics = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType)
    const metrics = await register.metrics()
    res.end(metrics)
  } catch (error) {
    console.error('Error generating metrics:', error)
    res.status(500).end('Error generating metrics')
  }
}

export { register }
