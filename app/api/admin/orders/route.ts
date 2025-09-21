import { NextRequest, NextResponse } from "next/server"
import { prisma, withRetry } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await requireAuth()
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status && status !== "all") {
      where.status = status
    }

    try {
      // Get orders with pagination using retry mechanism
      const result = await withRetry(async () => {
        const [orders, total] = await Promise.all([
          prisma.order.findMany({
            where,
            include: {
              items: {
                include: {
                  bundle: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.order.count({ where }),
        ])

        return { orders, total }
      })

      return NextResponse.json({
        success: true,
        data: {
          orders: result.orders,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
      })
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      
      // Check if this is a database connectivity issue
      if (dbError.code === 'P1001' || dbError.message?.includes("Can't reach database server")) {
        return NextResponse.json({
          success: false,
          error: { 
            message: "Database connection failed. Please check your database configuration.",
            code: "DATABASE_CONNECTION_ERROR",
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          },
        }, { status: 503 })
      }
      
      throw dbError // Re-throw if it's not a connection error
    }
  } catch (error) {
    console.error("Get orders error:", error)
    
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    )
  }
}