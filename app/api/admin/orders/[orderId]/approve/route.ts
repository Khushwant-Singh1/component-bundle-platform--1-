import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { measureAsync, measureDatabaseOperation } from "@/lib/performance"
import { z } from "zod"

const approveOrderSchema = z.object({
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const approvalStartTime = Date.now()
  
  try {
    const { orderId } = await params
    
    console.log(`[APPROVAL START] Order ${orderId} approval process initiated`)
    
    // Check admin authentication
    const session = await measureAsync(
      `auth-${orderId}`,
      'authentication',
      () => requireAuth(),
      { orderId }
    )
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { notes } = approveOrderSchema.parse(body)

    // Find order with bundle details
    const order = await measureDatabaseOperation(
      'find-order-with-bundles',
      () => prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              bundle: {
                select: {
                  id: true,
                  name: true,
                  downloadUrl: true,
                },
              },
            },
          },
        },
      }),
      { orderId }
    )

    if (!order) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      )
    }

    if (order.status !== "PAYMENT_UPLOADED") {
      return NextResponse.json(
        { error: { message: "Order cannot be approved in current status" } },
        { status: 400 }
      )
    }

    // Update order status
    await measureDatabaseOperation(
      'update-order-status',
      () => prisma.order.update({
        where: { id: orderId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: session.user.id,
          adminNotes: notes,
        },
      }),
      { orderId, approvedBy: session.user.id }
    )

    // Send bundle email to customer asynchronously
    const bundles = order.items.map(item => ({
      id: item.bundle.id,
      name: item.bundle.name,
      downloadUrl: item.bundle.downloadUrl || "",
    }))

    const approvalDuration = Date.now() - approvalStartTime
    console.log(`[APPROVAL COMPLETE] Order ${order.id} approved in ${approvalDuration}ms. Sending email asynchronously to ${order.email}`)

    // Send email asynchronously without blocking the response
    setImmediate(async () => {
      const emailStartTime = Date.now()
      try {
        const { sendBundleEmailWithSecureTokens } = await import('@/lib/email')
        await sendBundleEmailWithSecureTokens(
          order.email,
          order.customerName,
          bundles,
          order.id
        )
        const emailDuration = Date.now() - emailStartTime
        console.log(`[EMAIL SUCCESS] Secure bundle email sent successfully for order ${order.id} in ${emailDuration}ms`)
        
        // Optionally update order status to indicate email was sent
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED" }
        })
      } catch (emailError) {
        const emailDuration = Date.now() - emailStartTime
        console.error(`[EMAIL FAILED] Failed to send secure bundle email for order ${order.id} after ${emailDuration}ms:`, emailError)
        // Could implement email retry queue here
        // For now, just log the error - order is still approved
      }
    })

    return NextResponse.json({
      success: true,
      message: "Order approved successfully. Bundle download links will be sent via email shortly.",
      metadata: {
        approvalTime: approvalDuration,
        orderId: order.id,
        bundleCount: bundles.length
      }
    })
  } catch (error) {
    console.error("Approve order error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: error.errors[0].message } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    )
  }
}