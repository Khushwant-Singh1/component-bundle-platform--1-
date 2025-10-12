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
  } catch (error: unknown) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: (error as Error).message,
      code: (error as { code?: string }).code,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
