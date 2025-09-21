import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateSignedDownloadUrl } from "@/lib/s3"
import { requireAuth } from "@/lib/auth"
import { handleError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"

/**
 * GET /api/download/[bundleId]
 * Generate a signed download URL for a bundle
 * 
 * This endpoint:
 * 1. Verifies user has purchased the bundle (order is approved)
 * 2. Generates a time-limited signed URL for S3 download
 * 3. Tracks the download for analytics
 * 
 * @param bundleId - The bundle ID to download
 * @returns Signed download URL
 */
export async function GET(
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

    // Find the bundle
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      select: {
        id: true,
        name: true,
        downloadUrl: true,
      },
    })

    if (!bundle) {
      return NextResponse.json(
        { error: { message: "Bundle not found", statusCode: 404 } },
        { status: 404 }
      )
    }

    if (!bundle.downloadUrl) {
      return NextResponse.json(
        { error: { message: "Bundle has no downloadable file", statusCode: 400 } },
        { status: 400 }
      )
    }

    // Check if user has purchased this bundle (approved order)
    console.log(`Checking access for user ${session.user.id} (${session.user.email}) to bundle ${bundleId}`)
    console.log(`User role: ${session.user.role}`)
    
    // Allow admin users to access any bundle
    if (session.user.role === "ADMIN") {
      console.log(`Admin user ${session.user.email} granted access to bundle ${bundleId}`)
    } else {
      // First, let's check all orders for this user/email
      const allUserOrders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            ...(session.user.email ? [{ email: session.user.email }] : []),
          ],
        },
        include: {
          items: {
            include: {
              bundle: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })
      
      console.log(`User has ${allUserOrders.length} total orders`)
      allUserOrders.forEach(order => {
        console.log(`Order ${order.id}: status=${order.status}, email=${order.email}, items=${order.items.length}`)
        order.items.forEach(item => {
          console.log(`  - Bundle: ${item.bundle.name} (${item.bundleId})`)
        })
      })
      
      const approvedOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            ...(session.user.email ? [{ email: session.user.email }] : []),
          ],
          status: "APPROVED",
          items: {
            some: {
              bundleId: bundleId,
            },
          },
        },
        include: {
          items: {
            where: { bundleId: bundleId },
          },
        },
      })

      console.log(`Found approved order:`, approvedOrder ? `Order ${approvedOrder.id}` : 'None')

      if (!approvedOrder) {
        console.log(`Access denied for user ${session.user.id} to bundle ${bundleId} - no approved order found`)
        
        // Show helpful message about the real issue
        const anyOrderForBundle = await prisma.order.findFirst({
          where: {
            status: "APPROVED",
            items: {
              some: {
                bundleId: bundleId,
              },
            },
          },
          select: {
            email: true,
            customerName: true,
          },
        })
        
        if (anyOrderForBundle) {
          return NextResponse.json(
            { 
              error: { 
                message: `This bundle was purchased by ${anyOrderForBundle.email}. Please log in with that account to access the bundle.`, 
                statusCode: 403,
                purchasedBy: anyOrderForBundle.email
              } 
            },
            { status: 403 }
          )
        } else {
          return NextResponse.json(
            { error: { message: "You don't have access to this bundle. Please purchase it first.", statusCode: 403 } },
            { status: 403 }
          )
        }
      }
    }

    // Extract S3 object key from downloadUrl
    // downloadUrl format: "s3://object-key"
    let s3ObjectKey: string
    console.log(`Bundle downloadUrl: ${bundle.downloadUrl}`)
    
    if (bundle.downloadUrl.startsWith('s3://')) {
      s3ObjectKey = bundle.downloadUrl.replace('s3://', '')
      console.log(`Extracted S3 object key: ${s3ObjectKey}`)
    } else {
      // Fallback for direct URLs (legacy)
      console.log(`Using direct URL fallback for bundle ${bundleId}`)
      return NextResponse.json({
        success: true, 
        data: { 
          downloadUrl: bundle.downloadUrl,
          expiresIn: 3600,
          bundleName: bundle.name
        } 
      })
    }

    // Generate signed URL (valid for 1 hour)
    console.log(`Generating signed URL for S3 object: ${s3ObjectKey}`)
    const signedUrl = await generateSignedDownloadUrl(s3ObjectKey, 3600)

    // Track download for analytics
    await prisma.download.create({
      data: {
        userId: session.user.id,
        bundleId: bundleId,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Increment download count
    await prisma.bundle.update({
      where: { id: bundleId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresIn: 3600, // 1 hour in seconds
        bundleName: bundle.name,
        message: "Download link generated successfully. Link expires in 1 hour.",
      },
    })

  } catch (error) {
    return handleError(error)
  }
}