import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { generateSecureDownloadToken } from "@/lib/download-tokens"
import { handleError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/db"

/**
 * POST /api/download/token/[bundleId]
 * Generate a secure download token for authenticated users
 * 
 * This endpoint:
 * 1. Verifies user authentication
 * 2. Checks if user has purchased the bundle
 * 3. Generates a secure token that expires in 24 hours
 * 4. Returns the token and download URL
 * 
 * Request Body:
 * {
 *   orderId?: string // Optional: specific order ID to verify
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     token: string,
 *     downloadUrl: string,
 *     expiresAt: string,
 *     expiresIn: number,
 *     bundleName: string
 *   }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bundleId: string }> }
) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429 }
      )
    }

    // Authentication required
    const session = await requireAuth()
    const { bundleId } = await params

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { orderId } = body

    // Find the bundle
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      select: {
        id: true,
        name: true,
        downloadUrl: true,
        isActive: true
      }
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

    // Find user's approved order for this bundle
    let approvedOrder
    
    if (orderId) {
      // Use specific order ID if provided
      approvedOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          OR: [
            { userId: session.user.id },
            ...(session.user.email ? [{ email: session.user.email }] : [])
          ],
          status: "APPROVED",
          items: {
            some: { bundleId }
          }
        }
      })
    } else {
      // Find any approved order for this user and bundle
      approvedOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            ...(session.user.email ? [{ email: session.user.email }] : [])
          ],
          status: "APPROVED",
          items: {
            some: { bundleId }
          }
        },
        orderBy: {
          approvedAt: 'desc' // Get the most recent approved order
        }
      })
    }

    if (!approvedOrder) {
      // Check if user has any order for this bundle (but not approved)
      const anyOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            ...(session.user.email ? [{ email: session.user.email }] : [])
          ],
          items: {
            some: { bundleId }
          }
        },
        select: {
          id: true,
          status: true,
          customerName: true
        }
      })

      if (anyOrder) {
        const statusMessages = {
          PENDING: "Your order is pending email verification.",
          EMAIL_VERIFIED: "Your order is verified but payment is pending.",
          PAYMENT_PENDING: "Please upload your payment screenshot.",
          PAYMENT_UPLOADED: "Your payment is under review by our team.",
          REJECTED: "Your payment was rejected. Please contact support.",
          FAILED: "Your order failed. Please contact support.",
          COMPLETED: "Your order is completed but download access has expired."
        }

        const message = statusMessages[anyOrder.status as keyof typeof statusMessages] || 
                       `Your order status is ${anyOrder.status}.`

        return NextResponse.json(
          { 
            error: { 
              message: `Download not available. ${message}`,
              statusCode: 403,
              orderStatus: anyOrder.status,
              orderId: anyOrder.id
            } 
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { 
          error: { 
            message: "You don't have access to this bundle. Please purchase it first.",
            statusCode: 403 
          } 
        },
        { status: 403 }
      )
    }

    // Generate secure download token
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const token = await generateSecureDownloadToken(
      session.user.id,
      bundleId,
      approvedOrder.id,
      clientIp,
      userAgent
    )

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000))
    const expiresIn = 24 * 60 * 60 // 24 hours in seconds

    // Create download URL with token
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
    const downloadUrl = `${baseUrl}/api/download/secure/${bundleId}?token=${token}`

    return NextResponse.json({
      success: true,
      data: {
        token,
        downloadUrl,
        expiresAt: expiresAt.toISOString(),
        expiresIn,
        bundleName: bundle.name,
        orderId: approvedOrder.id,
        message: "Secure download token generated. Token expires in 24 hours."
      }
    })

  } catch (error) {
    console.error("Generate download token error:", error)
    return handleError(error)
  }
}
