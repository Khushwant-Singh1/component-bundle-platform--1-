import { prisma } from "@/lib/db"
import type { NextRequest } from "next/server"

/**
 * Track page view
 * @param request - Next.js request object
 * @param page - Page path
 * @param bundleId - Bundle ID if applicable
 */
export async function trackPageView(request: NextRequest, page: string, bundleId?: string) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const referer = request.headers.get("referer") || undefined

    await prisma.pageView.create({
      data: {
        page,
        bundleId,
        ipAddress,
        userAgent,
        referer,
      },
    })
  } catch (error) {
    console.error("Error tracking page view:", error)
  }
}

/**
 * Track bundle download
 * @param userId - User ID
 * @param bundleId - Bundle ID
 * @param request - Next.js request object
 */
export async function trackDownload(userId: string, bundleId: string, request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await prisma.download.create({
      data: {
        userId,
        bundleId,
        ipAddress,
        userAgent,
      },
    })

    // Update bundle download count
    await prisma.bundle.update({
      where: { id: bundleId },
      data: { downloadCount: { increment: 1 } },
    })
  } catch (error) {
    console.error("Error tracking download:", error)
  }
}

/**
 * Get analytics data
 * @param startDate - Start date for analytics
 * @param endDate - End date for analytics
 * @returns Analytics data
 */
export async function getAnalytics(startDate: Date, endDate: Date) {
  try {
    const [totalPageViews, totalDownloads, totalOrders, totalRevenue, topBundles, trafficSources] = await Promise.all([
      // Total page views
      prisma.pageView.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Total downloads
      prisma.download.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Total orders
      prisma.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "COMPLETED",
        },
      }),

      // Total revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "COMPLETED",
        },
        _sum: { totalAmount: true },
      }),

      // Top bundles by downloads
      prisma.bundle.findMany({
        select: {
          id: true,
          name: true,
          downloadCount: true,
          _count: { select: { orders: true } },
        },
        orderBy: { downloadCount: "desc" },
        take: 10,
      }),

      // Traffic sources
      prisma.pageView.groupBy({
        by: ["referer"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: { referer: true },
        orderBy: { _count: { referer: "desc" } },
        take: 10,
      }),
    ])

    return {
      overview: {
        totalPageViews,
        totalDownloads,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      topBundles,
      trafficSources,
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    throw error
  }
}
