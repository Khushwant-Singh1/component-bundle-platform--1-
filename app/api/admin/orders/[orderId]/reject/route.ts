import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { sendRejectionEmail } from "@/lib/email"
import { z } from "zod"

const rejectOrderSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    
    // Check admin authentication
    const session = await requireAuth()
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { reason } = rejectOrderSchema.parse(body)

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        customerName: true,
        email: true,
        status: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      )
    }

    if (order.status !== "PAYMENT_UPLOADED") {
      return NextResponse.json(
        { error: { message: "Order cannot be rejected in current status" } },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REJECTED",
        adminNotes: reason,
      },
    })

    // Send rejection email to customer
    await sendRejectionEmail(
      order.email,
      order.customerName,
      reason,
      order.id
    )

    return NextResponse.json({
      success: true,
      message: "Order rejected and customer notified",
    })
  } catch (error) {
    console.error("Reject order error:", error)
    
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