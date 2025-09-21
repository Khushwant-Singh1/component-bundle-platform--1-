import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { generateOTP, sendOTPEmail } from "@/lib/email"

const resendOtpSchema = z.object({
  orderId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = resendOtpSchema.parse(body)

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        customerName: true,
        email: true,
        status: true,
        emailVerified: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      )
    }

    if (order.emailVerified) {
      return NextResponse.json(
        { error: { message: "Email already verified" } },
        { status: 400 }
      )
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update order with new OTP
    await prisma.order.update({
      where: { id: orderId },
      data: {
        emailOtp: otp,
        emailOtpExpires: otpExpires,
      },
    })

    // Send OTP email
    await sendOTPEmail({
      to: order.email,
      otp: otp,
      customerName: order.customerName,
      expiresInMinutes: 10
    })

    return NextResponse.json({
      success: true,
      message: "New OTP sent to your email",
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    
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