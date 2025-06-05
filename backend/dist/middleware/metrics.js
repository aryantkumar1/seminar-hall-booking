"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.getMetrics = exports.recordDatabaseMetric = exports.updateHallUtilization = exports.recordBookingMetric = exports.metricsMiddleware = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
const register = new prom_client_1.default.Registry();
exports.register = register;
prom_client_1.default.collectDefaultMetrics({
    register,
    prefix: 'seminar_hall_',
});
const httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});
const httpRequestDuration = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
});
const activeConnections = new prom_client_1.default.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
});
const bookingRequestsTotal = new prom_client_1.default.Counter({
    name: 'booking_requests_total',
    help: 'Total number of booking requests',
    labelNames: ['status', 'hall_id'],
    registers: [register],
});
const hallUtilization = new prom_client_1.default.Gauge({
    name: 'hall_utilization_percentage',
    help: 'Hall utilization percentage',
    labelNames: ['hall_id', 'hall_name'],
    registers: [register],
});
const databaseQueries = new prom_client_1.default.Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['operation', 'collection'],
    registers: [register],
});
const databaseQueryDuration = new prom_client_1.default.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'collection'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
    registers: [register],
});
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    activeConnections.inc();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        httpRequestsTotal.inc({
            method: req.method,
            route,
            status: res.statusCode.toString(),
        });
        httpRequestDuration.observe({
            method: req.method,
            route,
            status: res.statusCode.toString(),
        }, duration);
        activeConnections.dec();
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
const recordBookingMetric = (status, hallId) => {
    bookingRequestsTotal.inc({ status, hall_id: hallId });
};
exports.recordBookingMetric = recordBookingMetric;
const updateHallUtilization = (hallId, hallName, utilizationPercentage) => {
    hallUtilization.set({ hall_id: hallId, hall_name: hallName }, utilizationPercentage);
};
exports.updateHallUtilization = updateHallUtilization;
const recordDatabaseMetric = (operation, collection, duration) => {
    databaseQueries.inc({ operation, collection });
    databaseQueryDuration.observe({ operation, collection }, duration);
};
exports.recordDatabaseMetric = recordDatabaseMetric;
const getMetrics = async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    }
    catch (error) {
        console.error('Error generating metrics:', error);
        res.status(500).end('Error generating metrics');
    }
};
exports.getMetrics = getMetrics;
//# sourceMappingURL=metrics.js.map