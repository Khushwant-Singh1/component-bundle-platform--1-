/**
 * Performance monitoring utilities for tracking approval process
 */

interface PerformanceMetric {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map()

  start(operationId: string, operation: string, metadata?: Record<string, any>) {
    this.metrics.set(operationId, {
      operation,
      startTime: Date.now(),
      metadata
    })
  }

  end(operationId: string) {
    const metric = this.metrics.get(operationId)
    if (metric) {
      const endTime = Date.now()
      const duration = endTime - metric.startTime
      
      metric.endTime = endTime
      metric.duration = duration
      
      // Log performance metrics
      console.log(`[PERF] ${metric.operation}: ${duration}ms`, metric.metadata)
      
      // For approval operations, log detailed breakdown
      if (metric.operation.includes('approval')) {
        if (duration > 10000) {
          console.warn(`[PERF WARNING] Slow approval operation: ${duration}ms`)
        }
      }
      
      return duration
    }
    return 0
  }

  getMetric(operationId: string): PerformanceMetric | undefined {
    return this.metrics.get(operationId)
  }

  clear(operationId: string) {
    this.metrics.delete(operationId)
  }

  // Get average duration for an operation type
  getAverageDuration(operation: string): number {
    const relevantMetrics = Array.from(this.metrics.values())
      .filter(m => m.operation === operation && m.duration)
    
    if (relevantMetrics.length === 0) return 0
    
    const total = relevantMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    return total / relevantMetrics.length
  }
}

// Singleton instance
export const performanceTracker = new PerformanceTracker()

// Helper function for measuring async operations
export async function measureAsync<T>(
  operationId: string,
  operation: string,
  asyncFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceTracker.start(operationId, operation, metadata)
  try {
    const result = await asyncFn()
    return result
  } finally {
    performanceTracker.end(operationId)
    performanceTracker.clear(operationId)
  }
}

// Helper function for measuring sync operations
export function measureSync<T>(
  operationId: string,
  operation: string,
  syncFn: () => T,
  metadata?: Record<string, any>
): T {
  performanceTracker.start(operationId, operation, metadata)
  try {
    const result = syncFn()
    return result
  } finally {
    performanceTracker.end(operationId)
    performanceTracker.clear(operationId)
  }
}

// Express/Next.js middleware for automatic performance tracking
export function createPerformanceMiddleware(operation: string) {
  return (req: any, res: any, next: any) => {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const metadata = {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent']
    }
    
    performanceTracker.start(operationId, operation, metadata)
    
    // Override res.end to capture completion time
    const originalEnd = res.end
    res.end = function(...args: any[]) {
      performanceTracker.end(operationId)
      performanceTracker.clear(operationId)
      originalEnd.apply(this, args)
    }
    
    next()
  }
}

// Email performance metrics
export interface EmailMetrics {
  preparationTime: number
  sendTime: number
  totalTime: number
  attachmentCount: number
  attachmentSize?: number
  success: boolean
  error?: string
}

export function logEmailPerformance(orderId: string, metrics: EmailMetrics) {
  console.log(`[EMAIL PERF] Order ${orderId}:`, {
    preparation: `${metrics.preparationTime}ms`,
    send: `${metrics.sendTime}ms`,
    total: `${metrics.totalTime}ms`,
    attachments: metrics.attachmentCount,
    size: metrics.attachmentSize ? `${(metrics.attachmentSize / 1024 / 1024).toFixed(1)}MB` : 'N/A',
    success: metrics.success,
    error: metrics.error
  })
}

// Database operation performance tracking
export async function measureDatabaseOperation<T>(
  operation: string,
  dbFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const operationId = `db-${operation}-${Date.now()}`
  return measureAsync(operationId, `database.${operation}`, dbFn, metadata)
}

// S3 operation performance tracking
export async function measureS3Operation<T>(
  operation: string,
  s3Fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const operationId = `s3-${operation}-${Date.now()}`
  return measureAsync(operationId, `s3.${operation}`, s3Fn, metadata)
}
