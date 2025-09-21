import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { uploadImageToS3, getPublicS3Url, isS3Configured } from "@/lib/s3"
import { uploadFile } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderId = formData.get("orderId") as string
    const screenshot = formData.get("screenshot") as File

    if (!orderId || !screenshot) {
      return NextResponse.json(
        { error: { message: "Order ID and screenshot are required" } },
        { status: 400 }
      )
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
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

    if (!order.emailVerified) {
      return NextResponse.json(
        { error: { message: "Email not verified" } },
        { status: 400 }
      )
    }

    // Validate screenshot file
    if (!screenshot.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { message: "File must be an image" } },
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    if (screenshot.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: { message: "File size must be less than 10MB" } },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await screenshot.arrayBuffer())

    let screenshotUrl: string

    if (isS3Configured()) {
      // Upload screenshot to S3
      const objectKey = await uploadImageToS3(
        buffer,
        screenshot.name,
        'payment-screenshots',
        orderId
      )
      
      // Get the public URL for the uploaded screenshot
      screenshotUrl = getPublicS3Url(objectKey)
    } else {
      // Fallback to local upload if S3 is not configured
      console.warn('S3 not configured, using local file upload for payment screenshot')
      const uploadResult = await uploadFile(screenshot, {
        destination: `public/uploads/payments/${orderId}`,
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maxSize: 10 * 1024 * 1024, // 10MB for payment screenshots
      })
      screenshotUrl = uploadResult.url
    }

    // Update order with payment screenshot
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentScreenshot: screenshotUrl,
        status: "PAYMENT_UPLOADED",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payment proof uploaded successfully",
    })
  } catch (error) {
    console.error("Upload payment error:", error)
    
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    )
  }
}