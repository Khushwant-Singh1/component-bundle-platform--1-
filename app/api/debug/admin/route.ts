import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { message: "Admin access required" } },
        { status: 403 }
      )
    }

    // Get all bundles
    const bundles = await prisma.bundle.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        downloadUrl: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get all orders
    const orders = await prisma.order.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        bundles: bundles,
        orders: orders,
      },
    })
  } catch (error) {
    console.error("Debug admin error:", error)
    return NextResponse.json(
      { error: { message: "Failed to fetch debug info" } },
      { status: 500 }
    )
  }
}
