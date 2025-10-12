import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { generatePaymentQR } from "@/lib/payment"

const verifyEmailSchema = z.object({
  orderId: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, otp } = verifyEmailSchema.parse(body)

    // Find order with OTP
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        emailOtp: true,
        emailOtpExpires: true,
        status: true,
        totalAmount: true,
        customerName: true,
        email: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      )
    }

    // Check if OTP is valid
    if (
      !order.emailOtp ||
      order.emailOtp !== otp ||
      !order.emailOtpExpires ||
      order.emailOtpExpires < new Date()
    ) {
      return NextResponse.json(
        { error: { message: "Invalid or expired OTP" } },
        { status: 400 }
      )
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        emailVerified: true,
        status: "EMAIL_VERIFIED",
        emailOtp: null,
        emailOtpExpires: null,
      },
    })

    // Generate payment QR code
    const paymentQr = await generatePaymentQR()

    return NextResponse.json({
      success: true,
      paymentQr,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verify email error:", error)
    
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