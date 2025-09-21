import { NextResponse } from 'next/server'
import { prisma, withRetry } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection with retry
    const result = await withRetry(async () => {
      await prisma.$queryRaw`SELECT 1 as test`
      return { connected: true }
    }, 2) // Only try twice for health check

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      ...result
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
