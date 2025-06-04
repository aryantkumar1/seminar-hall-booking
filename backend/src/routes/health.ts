import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'

const router = Router()

interface HealthStatus {
  status: 'OK' | 'ERROR'
  timestamp: string
  uptime: number
  database: 'connected' | 'disconnected' | 'error'
  memory: {
    used: number
    total: number
    percentage: number
  }
  version: string
}

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    let databaseStatus: 'connected' | 'disconnected' | 'error' = 'disconnected'
    
    try {
      if (mongoose.connection.readyState === 1) {
        databaseStatus = 'connected'
      } else {
        databaseStatus = 'disconnected'
      }
    } catch (error) {
      databaseStatus = 'error'
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100)

    const healthStatus: HealthStatus = {
      status: databaseStatus === 'connected' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: databaseStatus,
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: memoryPercentage
      },
      version: process.env.npm_package_version || '1.0.0'
    }

    const statusCode = healthStatus.status === 'OK' ? 200 : 503
    res.status(statusCode).json(healthStatus)

  } catch (error) {
    console.error('Health check error:', error)
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    })
  }
})

// Readiness probe - checks if app is ready to serve traffic
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'NOT_READY',
        message: 'Database not connected'
      })
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Liveness probe - checks if app is alive
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  })
})

export default router
