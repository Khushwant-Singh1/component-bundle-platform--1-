import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { handleError, ValidationError } from "@/lib/errors"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"
import { uploadFiles } from "@/lib/upload"

/**
 * POST /api/upload
 * Upload files to the server
 *
 * Request: multipart/form-data with files
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     files: Array<{
 *       success: boolean,
 *       url?: string,
 *       filename?: string,
 *       size?: number,
 *       type?: string,
 *       error?: string
 *     }>
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, uploadRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Upload rate limit exceeded", statusCode: 429 } },
        { status: 429 },
      )
    }

    // Authentication and authorization
    const user = await requireAdmin(request)

    // Parse form data
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      throw new ValidationError("No files provided")
    }

    // Validate file count
    if (files.length > 10) {
      throw new ValidationError("Too many files. Maximum 10 files allowed per upload.")
    }

    // Upload files
    const uploadResults = await uploadFiles(files, {
      maxSize: 10 * 1024 * 1024, // 10MB per file
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
      destination: "public/uploads/bundles",
    })

    return NextResponse.json({
      success: true,
      data: {
        files: uploadResults,
      },
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
