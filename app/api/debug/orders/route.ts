import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Debug endpoint to check orders
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            bundle: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error("Debug orders error:", error)
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    )
  }
}