import type { NextRequest } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier for the request (IP, user ID, etc.)
   * @returns Object with allowed status and remaining requests
   */
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = this.requests.get(key)

    if (!record || now > record.resetTime) {
      // New window or expired window
      const resetTime = now + this.config.windowMs
      this.requests.set(key, { count: 1, resetTime })
      return { allowed: true, remaining: this.config.maxRequests - 1, resetTime }
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    // Increment count
    record.count++
    this.requests.set(key, record)
    return { allowed: true, remaining: this.config.maxRequests - record.count, resetTime: record.resetTime }
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier to reset
   */
  reset(key: string): void {
    this.requests.delete(key)
  }
}

// Create rate limiters for different endpoints
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
})

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per window
})

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 uploads per hour
})

/**
 * Rate limiting middleware
 * @param request - Next.js request object
 * @param limiter - Rate limiter instance to use
 * @returns Rate limit result
 */
export function rateLimit(request: NextRequest, limiter: RateLimiter) {
  const key = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  return limiter.check(key)
}
