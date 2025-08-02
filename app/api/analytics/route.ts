import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { handleError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"
import { getAnalytics } from "@/lib/analytics"
import { z } from "zod"

const analyticsQuerySchema = z.object({
  startDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
})

/**
 * GET /api/analytics
 * Get analytics data for the admin dashboard
 *
 * Query Parameters:
 * - startDate: Start date for analytics (default: 30 days ago)
 * - endDate: End date for analytics (default: now)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     overview: {
 *       totalPageViews: number,
 *       totalDownloads: number,
 *       totalOrders: number,
 *       totalRevenue: number
 *     },
 *     topBundles: Array<{
 *       id: string,
 *       name: string,
 *       downloadCount: number,
 *       salesCount: number
 *     }>,
 *     trafficSources: Array<{
 *       referer: string,
 *       count: number
 *     }>
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429 },
      )
    }

    // Authentication and authorization
    const user = await requireAdmin(request)

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedQuery = analyticsQuerySchema.parse(queryParams)

    // Default date range: last 30 days
    const endDate = validatedQuery.endDate || new Date()
    const startDate = validatedQuery.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get analytics data
    const analytics = await getAnalytics(startDate, endDate)

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
