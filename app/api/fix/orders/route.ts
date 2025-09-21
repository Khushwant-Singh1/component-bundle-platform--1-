import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")
    
    if (!email) {
      return NextResponse.json({
        error: "Please provide email parameter: ?email=support@webdrave.com"
      })
    }
    
    // Get all orders for this email
    const orders = await prisma.order.findMany({
      where: {
        email: email
      },
      include: {
        items: {
          include: {
            bundle: {
              select: {
                id: true,
                name: true,
                slug: true,
                downloadUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      email,
      orderCount: orders.length,
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        email: order.email,
        customerName: order.customerName,
        totalAmount: order.totalAmount.toString(),
        createdAt: order.createdAt,
        approvedAt: order.approvedAt,
        paymentScreenshot: order.paymentScreenshot,
        adminNotes: order.adminNotes,
        bundles: order.items.map(item => ({
          bundleId: item.bundle.id,
          bundleName: item.bundle.name,
          bundleSlug: item.bundle.slug,
          hasDownloadUrl: !!item.bundle.downloadUrl,
          downloadUrl: item.bundle.downloadUrl
        }))
      }))
    })

  } catch (error) {
    console.error("Check orders error:", error)
    return NextResponse.json(
      { 
        error: "Failed to check orders",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, action } = body
    
    if (action === "approve" && orderId) {
      // Update order to APPROVED status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          adminNotes: "Manually approved via fix endpoint"
        },
        include: {
          items: {
            include: {
              bundle: {
                select: {
                  id: true,
                  name: true,
                  downloadUrl: true
                }
              }
            }
          }
        }
      })
      
      return NextResponse.json({
        success: true,
        message: `Order ${orderId} has been approved`,
        order: updatedOrder
      })
    }
    
    return NextResponse.json({
      error: "Invalid action. Use { orderId: 'xxx', action: 'approve' }"
    })

  } catch (error) {
    console.error("Fix order error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fix order",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
