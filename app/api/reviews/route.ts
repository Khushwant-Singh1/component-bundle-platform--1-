import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createReviewSchema } from "@/lib/validation"
import { requireAuth } from "@/lib/auth"
import { handleError, ValidationError, ConflictError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"

/**
 * POST /api/reviews
 * Create a new review
 *
 * Request Body:
 * {
 *   bundleId: string,
 *   rating: number,
 *   title?: string,
 *   content: string,
 *   isPublic?: boolean
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: Review
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429 },
      )
    }

    // Authentication
    const session = await requireAuth()

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Check if bundle exists
    const bundle = await prisma.bundle.findUnique({
      where: { id: validatedData.bundleId },
    })

    if (!bundle) {
      throw new ValidationError("Bundle not found")
    }

    // Check if user already reviewed this bundle
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_bundleId: {
          userId: session.user.id,
          bundleId: validatedData.bundleId,
        },
      },
    })

    if (existingReview) {
      throw new ConflictError("You have already reviewed this bundle")
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        bundleId: validatedData.bundleId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        isPublic: validatedData.isPublic,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      { status: 201 },
    )
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
