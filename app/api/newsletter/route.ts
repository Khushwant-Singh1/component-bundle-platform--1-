import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { newsletterSchema } from "@/lib/validation"
import { handleError, ConflictError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"

/**
 * POST /api/newsletter
 * Subscribe to newsletter
 *
 * Request Body:
 * {
 *   email: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = newsletterSchema.parse(body)

    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email: validatedData.email },
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        throw new ConflictError("Email is already subscribed to newsletter")
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email: validatedData.email },
          data: { isActive: true },
        })
      }
    } else {
      // Create new subscription
      await prisma.newsletter.create({
        data: {
          email: validatedData.email,
          isActive: true,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to newsletter",
      },
      { status: 201 },
    )
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
