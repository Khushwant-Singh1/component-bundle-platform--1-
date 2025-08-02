import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { handleError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
})

/**
 * GET /api/bundles/search
 * Search bundles with full-text search
 *
 * Query Parameters:
 * - q: Search query (required)
 * - limit: Number of results to return (default: 10, max: 50)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     bundles: Bundle[],
 *     count: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429 },
      )
    }

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const { q, limit = 10 } = searchSchema.parse(queryParams)

    // Perform search
    const bundles = await prisma.bundle.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          {
            tags: {
              some: {
                tag: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
            },
          },
          {
            techStack: {
              some: {
                tech: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
            },
          },
        ],
      },
      include: {
        images: {
          orderBy: { order: "asc" },
          select: { url: true },
          take: 1,
        },
        tags: {
          include: { tag: true },
          take: 5,
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { downloadCount: "desc" }, { name: "asc" }],
      take: limit,
    })

    // Format response
    const formattedBundles = bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      shortDescription: bundle.shortDescription,
      price: bundle.price,
      originalPrice: bundle.originalPrice,
      category: bundle.category,
      difficulty: bundle.difficulty,
      image: bundle.images[0]?.url || null,
      tags: bundle.tags.map((t) => t.tag.name),
      reviewCount: bundle._count.reviews,
      isFeatured: bundle.isFeatured,
      isBestseller: bundle.isBestseller,
    }))

    return NextResponse.json({
      success: true,
      data: {
        bundles: formattedBundles,
        count: bundles.length,
      },
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
