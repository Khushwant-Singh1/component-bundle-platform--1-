import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Get all orders in the system
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            bundle: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to last 20 orders
    })
    
    // Get bundle counts
    const bundleTargetId = "cmftey6gd0000jpphbd94bbr9"
    const targetBundleOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            bundleId: bundleTargetId
          }
        }
      },
      include: {
        items: {
          where: {
            bundleId: bundleTargetId
          }
        }
      }
    })

    // Check if the bundle exists
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleTargetId },
      select: {
        id: true,
        name: true,
        slug: true,
        downloadUrl: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: allOrders.length,
        targetBundleOrders: targetBundleOrders.length,
        targetBundle: bundle
      },
      recentOrders: allOrders.map(order => ({
        id: order.id,
        email: order.email,
        customerName: order.customerName,
        status: order.status,
        createdAt: order.createdAt,
        bundles: order.items.map(item => ({
          bundleId: item.bundleId,
          bundleName: item.bundle.name,
          bundleSlug: item.bundle.slug
        }))
      })),
      targetBundleOrders: targetBundleOrders.map(order => ({
        id: order.id,
        email: order.email,
        customerName: order.customerName,
        status: order.status,
        createdAt: order.createdAt
      }))
    })

  } catch (error) {
    console.error("Check all orders error:", error)
    return NextResponse.json(
      { 
        error: "Failed to check orders",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
