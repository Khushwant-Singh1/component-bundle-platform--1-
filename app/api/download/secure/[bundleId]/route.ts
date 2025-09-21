import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateSignedDownloadUrl } from "@/lib/s3"
import { verifyDownloadToken, markTokenAsUsed, getDownloadTokenInfo } from "@/lib/download-tokens"
import { z } from "zod"

const downloadSchema = z.object({
  orderId: z.string(),
  email: z.string().email(),
})

/**
 * GET /api/download/secure/[bundleId]
 * Secure download with token-based authentication OR order verification
 * 
 * Two modes:
 * 1. Token-based (authenticated): ?token=xxx (expires in 24 hours)
 * 2. Order-based (legacy): ?orderId=xxx&email=xxx (no expiry)
 * 
 * @param bundleId - The bundle ID to download
 * @param token - Secure download token (query parameter)
 * @param orderId - The order ID (query parameter, legacy)
 * @param email - Customer email (query parameter, legacy)
 * @returns Signed download URL or direct download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bundleId: string }> }
) {
  try {
    const { bundleId } = await params
    const url = new URL(request.url)
    
    // Check for token-based download (new secure method)
    const token = url.searchParams.get("token")
    
    if (token) {
      return await handleTokenBasedDownload(request, bundleId, token)
    }
    
    // Fallback to order-based download (legacy method)
    return await handleOrderBasedDownload(request, bundleId, url)
  } catch (error) {
    console.error("Secure download error:", error)
    return NextResponse.json(
      { error: { message: "Internal server error", statusCode: 500 } },
      { status: 500 }
    )
  }
}

/**
 * Handle token-based secure download (authenticated users)
 */
async function handleTokenBasedDownload(
  request: NextRequest,
  bundleId: string,
  token: string
) {
  console.log(`Token-based download requested for bundle ${bundleId}`)

  // Verify the download token
  const tokenPayload = await verifyDownloadToken(token)
  if (!tokenPayload) {
    return NextResponse.json(
      { 
        error: { 
          message: "Invalid or expired download token. Please request a new download link.",
          statusCode: 401 
        } 
      },
      { status: 401 }
    )
  }

  // Check if the token is for the correct bundle
  if (tokenPayload.bundleId !== bundleId) {
    return NextResponse.json(
      { 
        error: { 
          message: "Token is not valid for this bundle.",
          statusCode: 403 
        } 
      },
      { status: 403 }
    )
  }

  // Get token details and bundle info
  const tokenInfo = await getDownloadTokenInfo(token)
  if (!tokenInfo || !tokenInfo.bundle) {
    return NextResponse.json(
      { 
        error: { 
          message: "Bundle not found or token invalid.",
          statusCode: 404 
        } 
      },
      { status: 404 }
    )
  }

  const bundle = tokenInfo.bundle
  if (!bundle.downloadUrl) {
    return NextResponse.json(
      { 
        error: { 
          message: "Bundle has no downloadable file.",
          statusCode: 400 
        } 
      },
      { status: 400 }
    )
  }

  console.log(`Access granted via token for user ${tokenInfo.user?.email} to download bundle ${bundle.name}`)

  // Mark token as used (optional - you can remove this if you want tokens to be reusable)
  await markTokenAsUsed(token)

  // Generate download
  return await generateDownloadResponse(request, {
    id: bundle.id,
    name: bundle.name,
    downloadUrl: bundle.downloadUrl
  }, tokenInfo.user?.id)
}

/**
 * Handle order-based download (legacy method)
 */
async function handleOrderBasedDownload(
  request: NextRequest,
  bundleId: string,
  url: URL
) {
  // Get order verification parameters
  const orderId = url.searchParams.get("orderId")
  const email = url.searchParams.get("email")
  const format = url.searchParams.get("format") // "json" or "download" (default)
  
  if (!orderId || !email) {
    return NextResponse.json(
      { 
        error: { 
          message: "Order ID and email are required. Use: ?orderId=xxx&email=customer@example.com OR use token-based download: ?token=xxx",
          statusCode: 400 
        } 
      },
      { status: 400 }
    )
  }

  // Validate parameters
  try {
    downloadSchema.parse({ orderId, email })
  } catch (error) {
    return NextResponse.json(
      { error: { message: "Invalid email format", statusCode: 400 } },
      { status: 400 }
    )
  }

  console.log(`Order-based download requested for bundle ${bundleId} by ${email} with order ${orderId}`)

  // Find the bundle
  const bundle = await prisma.bundle.findUnique({
    where: { id: bundleId },
    select: {
      id: true,
      name: true,
      downloadUrl: true,
      isActive: true,
    },
  })

  if (!bundle || !bundle.isActive) {
    return NextResponse.json(
      { error: { message: "Bundle not found or inactive", statusCode: 404 } },
      { status: 404 }
    )
  }

  if (!bundle.downloadUrl) {
    return NextResponse.json(
      { error: { message: "Bundle has no downloadable file", statusCode: 400 } },
      { status: 400 }
    )
  }

  // Verify the order and check if user has access to this bundle
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      email: email,
      status: "APPROVED", // Only approved orders can download
      items: {
        some: {
          bundleId: bundleId,
        },
      },
    },
    include: {
      items: {
        where: { bundleId: bundleId },
        include: {
          bundle: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    // Check if order exists but is not approved
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        email: email,
        items: {
          some: {
            bundleId: bundleId,
          },
        },
      },
      select: {
        status: true,
      },
    })

    if (existingOrder) {
      const statusMessages = {
        PENDING: "Your order is pending email verification.",
        EMAIL_VERIFIED: "Your order is verified but payment is pending.",
        PAYMENT_PENDING: "Please upload your payment screenshot.",
        PAYMENT_UPLOADED: "Your payment is under review by our team.",
        REJECTED: "Your payment was rejected. Please contact support.",
        FAILED: "Your order failed. Please contact support.",
      }

      const message = statusMessages[existingOrder.status as keyof typeof statusMessages] || 
                     `Your order status is ${existingOrder.status}.`

      return NextResponse.json(
        { 
          error: { 
            message: `Download not available. ${message}`,
            statusCode: 403,
            orderStatus: existingOrder.status
          } 
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        error: { 
          message: "Invalid order ID, email, or you don't have access to this bundle.",
          statusCode: 403 
        } 
      },
      { status: 403 }
    )
  }

  console.log(`Access granted for order ${orderId} to download bundle ${bundle.name}`)

  // Generate download response
  return await generateDownloadResponse(request, {
    id: bundle.id,
    name: bundle.name,
    downloadUrl: bundle.downloadUrl
  }, order.userId, {
    format,
    orderInfo: {
      orderId: order.id,
      customerName: order.customerName,
      approvedAt: order.approvedAt,
    }
  })
}

/**
 * Generate the actual download response (S3 signed URL or direct URL)
 */
async function generateDownloadResponse(
  request: NextRequest,
  bundle: { id: string; name: string; downloadUrl: string },
  userId?: string | null,
  options: {
    format?: string | null;
    orderInfo?: {
      orderId: string;
      customerName: string;
      approvedAt: Date | null;
    };
  } = {}
) {
  const { format, orderInfo } = options

  // Extract S3 object key from downloadUrl
  let s3ObjectKey: string
  
  if (bundle.downloadUrl.startsWith('s3://')) {
    s3ObjectKey = bundle.downloadUrl.replace('s3://', '')
    console.log(`Generating signed URL for S3 object: ${s3ObjectKey}`)
    
    // Generate signed URL (valid for 1 hour for actual download)
    const signedUrl = await generateSignedDownloadUrl(s3ObjectKey, 3600) // 1 hour

    // Track download for analytics (only if user exists)
    if (userId) {
      await prisma.download.create({
        data: {
          userId: userId,
          bundleId: bundle.id,
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })
    }

    // Increment download count
    await prisma.bundle.update({
      where: { id: bundle.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    })

    // Check if JSON format is requested (for API usage)
    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: {
          downloadUrl: signedUrl,
          expiresIn: 3600, // 1 hour in seconds
          bundleName: bundle.name,
          orderInfo,
          message: "Download link generated successfully. Link expires in 1 hour.",
        },
      })
    }

    // Default behavior: redirect to file for immediate download
    return NextResponse.redirect(signedUrl)
  } else {
    // Fallback for direct URLs (legacy)
    console.log(`Using direct URL for bundle ${bundle.id}`)
    
    // Track download (only if user exists)
    if (userId) {
      await prisma.download.create({
        data: {
          userId: userId,
          bundleId: bundle.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      })
    }

    await prisma.bundle.update({
      where: { id: bundle.id },
      data: { downloadCount: { increment: 1 } },
    })

    // Check if JSON format is requested
    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: {
          downloadUrl: bundle.downloadUrl,
          expiresIn: null, // Direct URLs don't expire
          bundleName: bundle.name,
          orderInfo,
          message: "Direct download link provided.",
        },
      })
    }

    // Default behavior: redirect to file for immediate download
    return NextResponse.redirect(bundle.downloadUrl)
  }
}
