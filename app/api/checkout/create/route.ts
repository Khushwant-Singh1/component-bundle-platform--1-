import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { generateOTP, sendOTPEmail } from "@/lib/email"

const createOrderSchema = z.object({
  bundleId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bundleId, name, email } = createOrderSchema.parse(body)

    // Check if bundle exists and is active
    const bundle = await prisma.bundle.findFirst({
      where: { id: bundleId, isActive: true },
      select: { id: true, name: true, price: true },
    })

    if (!bundle) {
      return NextResponse.json(
        { error: { message: "Bundle not found or inactive" } },
        { status: 404 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName: name,
        email,
        emailOtp: otp,
        emailOtpExpires: otpExpires,
        totalAmount: bundle.price,
        status: "PENDING",
        items: {
          create: {
            bundleId: bundle.id,
            price: bundle.price,
            quantity: 1,
          },
        },
      },
    })

    // Send OTP email
    await sendOTPEmail({
      to: email,
      otp: otp,
      customerName: name,
      expiresInMinutes: 10
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "OTP sent to your email",
    })
  } catch (error) {
    console.error("Create order error:", error)
    
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