import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { contactSchema } from "@/lib/validation"
import { handleError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"

/**
 * POST /api/contact
 * Submit a contact form
 *
 * Request Body:
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   company?: string,
 *   subject: 'TECHNICAL' | 'BILLING' | 'PRESALES' | 'PARTNERSHIP' | 'FEEDBACK' | 'OTHER',
 *   message: string
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
    const validatedData = contactSchema.parse(body)

    // Create contact submission
    await prisma.contactSubmission.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        company: validatedData.company,
        subject: validatedData.subject,
        message: validatedData.message,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return handleError(error)
  }
}
