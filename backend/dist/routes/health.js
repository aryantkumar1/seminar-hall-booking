"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    try {
        let databaseStatus = 'disconnected';
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                databaseStatus = 'connected';
            }
            else {
                databaseStatus = 'disconnected';
            }
        }
        catch (error) {
            databaseStatus = 'error';
        }
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;
        const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);
        const healthStatus = {
            status: databaseStatus === 'connected' ? 'OK' : 'ERROR',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            database: databaseStatus,
            memory: {
                used: Math.round(usedMemory / 1024 / 1024),
                total: Math.round(totalMemory / 1024 / 1024),
                percentage: memoryPercentage
            },
            version: process.env.npm_package_version || '1.0.0'
        };
        const statusCode = healthStatus.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
router.get('/ready', async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503).json({
                status: 'NOT_READY',
                message: 'Database not connected'
            });
            return;
        }
        res.status(200).json({
            status: 'READY',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'NOT_READY',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/live', (req, res) => {
    res.status(200).json({
        status: 'ALIVE',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
    });
});
exports.default = router;
//# sourceMappingURL=health.js.map