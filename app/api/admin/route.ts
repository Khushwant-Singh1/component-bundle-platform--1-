import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { handleError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"

/**
 * GET /api/admin
 * Get admin dashboard statistics and data
 * 
 * Returns:
 * - Stats: revenue, bundles, customers, downloads
 * - Recent orders
 * - Top performing bundles
 * - Recent reviews
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
      )
    }

    // Authentication and authorization
    await requireAdmin()

    // Fetch all data in parallel for better performance
    const [
      ordersData,
      bundlesCount,
      customersCount,
      downloadsCount,
      recentOrders,
      topBundles,
      recentReviews
    ] = await Promise.all([
      // Calculate revenue and order stats
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { status: "COMPLETED" }
      }),
      
      // Count active bundles
      prisma.bundle.count({
        where: { isActive: true }
      }),
      
      // Count registered customers
      prisma.user.count({
        where: { role: "CUSTOMER" }
      }),
      
      // Count total downloads
      prisma.download.count(),
      
      // Get recent orders with customer and bundle info
      prisma.order.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            include: {
              bundle: {
                select: { name: true }
              }
            }
          }
        }
      }),
      
      // Get top performing bundles by revenue
      prisma.bundle.findMany({
        take: 4,
        include: {
          orders: {
            where: { 
              order: { status: "COMPLETED" }
            },
            select: {
              quantity: true,
              price: true
            }
          }
        },
        where: { isActive: true }
      }),
      
      // Get recent reviews
      prisma.review.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true }
          },
          bundle: {
            select: { name: true }
          }
        }
      })
    ])

    // Calculate revenue and growth (mock growth for now - you can implement proper time-based calculations)
    const totalRevenue = ordersData._sum?.totalAmount || 0
    const revenueFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(totalRevenue))

    // Process top bundles with sales and revenue data
    const processedTopBundles = topBundles.map(bundle => {
      const sales = bundle.orders.reduce((sum, order) => sum + order.quantity, 0)
      const revenue = bundle.orders.reduce((sum, order) => sum + (Number(order.price) * order.quantity), 0)
      
      return {
        name: bundle.name,
        sales,
        revenue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(revenue),
        trend: "up", // You can implement proper trend calculation
        change: "+12%" // Mock change - implement based on time periods
      }
    }).sort((a, b) => b.sales - a.sales)

    // Process recent orders
    const processedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customer: order.user?.name || order.customerName || "Guest",
      email: order.user?.email || order.email,
      bundle: order.items[0]?.bundle?.name || "Unknown Bundle",
      amount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(order.totalAmount)),
      status: order.status.toLowerCase(),
      date: getRelativeTime(order.createdAt)
    }))

    // Process recent reviews
    const processedRecentReviews = recentReviews.map(review => ({
      customer: review.user?.name || "Anonymous",
      bundle: review.bundle?.name || "Unknown Bundle",
      rating: review.rating,
      comment: review.content,
      date: getRelativeTime(review.createdAt)
    }))

    // Compile stats
    const stats = [
      {
        title: "Total Revenue",
        value: revenueFormatted,
        change: "+12.5%", // Mock - implement proper calculation
        trend: "up",
        description: "vs last month",
      },
      {
        title: "Total Bundles",
        value: bundlesCount.toString(),
        change: "+2", // Mock - implement proper calculation
        trend: "up",
        description: "active bundles",
      },
      {
        title: "Total Customers",
        value: customersCount.toLocaleString(),
        change: "+18.2%", // Mock - implement proper calculation
        trend: "up",
        description: "registered users",
      },
      {
        title: "Total Downloads",
        value: downloadsCount.toLocaleString(),
        change: "+7.3%", // Mock - implement proper calculation
        trend: "up",
        description: "this month",
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentOrders: processedRecentOrders,
        topBundles: processedTopBundles,
        recentReviews: processedRecentReviews
      }
    })

  } catch (error) {
    return handleError(error)
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}