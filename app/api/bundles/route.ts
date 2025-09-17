import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createBundleSchema, bundleQuerySchema } from "@/lib/validation"
// import { requireAdmin } from "@/lib/auth"
import { handleError, ConflictError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"
import { trackPageView } from "@/lib/analytics"

/**
 * GET /api/bundles
 * Retrieve bundles with filtering, sorting, and pagination
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 100)
 * - search: Search term for name and description
 * - category: Filter by category
 * - difficulty: Filter by difficulty level
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - isActive: Filter by active status
 * - isFeatured: Filter by featured status
 * - isBestseller: Filter by bestseller status
 * - tags: Comma-separated list of tags
 * - sortBy: Sort field (name, price, createdAt, etc.)
 * - sortOrder: Sort order (asc, desc)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     bundles: Bundle[],
 *     pagination: {
 *       page: number,
 *       limit: number,
 *       total: number,
 *       pages: number
 *     }
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
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
      )
    }

    // Track page view
    await trackPageView(request, "/api/bundles")

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    const validatedQuery = bundleQuerySchema.parse(queryParams)

    // Build where clause for filtering
    const where: any = {}

    if (validatedQuery.search) {
      where.OR = [
        { name: { contains: validatedQuery.search, mode: "insensitive" } },
        { description: { contains: validatedQuery.search, mode: "insensitive" } },
        { shortDescription: { contains: validatedQuery.search, mode: "insensitive" } },
      ]
    }

    if (validatedQuery.category) {
      where.category = validatedQuery.category
    }

    if (validatedQuery.difficulty) {
      where.difficulty = validatedQuery.difficulty
    }

    if (validatedQuery.minPrice !== undefined || validatedQuery.maxPrice !== undefined) {
      where.price = {}
      if (validatedQuery.minPrice !== undefined) {
        where.price.gte = validatedQuery.minPrice
      }
      if (validatedQuery.maxPrice !== undefined) {
        where.price.lte = validatedQuery.maxPrice
      }
    }

    if (validatedQuery.isActive !== undefined) {
      where.isActive = validatedQuery.isActive
    }

    if (validatedQuery.isFeatured !== undefined) {
      where.isFeatured = validatedQuery.isFeatured
    }

    if (validatedQuery.isBestseller !== undefined) {
      where.isBestseller = validatedQuery.isBestseller
    }

    if (validatedQuery.tags) {
      where.tags = {
        some: {
          tag: {
            name: { in: validatedQuery.tags },
          },
        },
      }
    }

    // Build order clause for sorting
    const orderBy: any = {}
    if (validatedQuery.sortBy) {
      orderBy[validatedQuery.sortBy] = validatedQuery.sortOrder || "desc"
    } else {
      orderBy.createdAt = "desc"
    }

    // Pagination
    const page = validatedQuery.page || 1
    const limit = validatedQuery.limit || 12
    const skip = (page - 1) * limit

    // Execute queries
    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { order: "asc" },
            select: { url: true, alt: true },
          },
          tags: {
            include: { tag: true },
          },
          techStack: {
            include: { tech: true },
          },
          features: {
            orderBy: { order: "asc" },
            select: { description: true },
          },
          _count: {
            select: {
              reviews: true,
              orders: true,
              downloads: true,
            },
          },
        },
      }),
      prisma.bundle.count({ where }),
    ])

    // Format response
    const formattedBundles = bundles.map((bundle: any) => ({
      ...bundle,
      images: bundle.images.map((img: any) => img.url),
      tags: bundle.tags.map((t: any) => t.tag.name),
      techStack: bundle.techStack.map((t: any) => t.tech.name),
      features: bundle.features.map((f: any) => f.description),
      stats: {
        reviewCount: bundle._count.reviews,
        salesCount: bundle._count.orders,
        downloadCount: bundle._count.downloads,
      },
    }))

    return NextResponse.json(
      {
        success: true,
        data: {
          bundles: formattedBundles,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        },
      },
    )
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}

/**
 * POST /api/bundles
 * Create a new bundle
 *
 * Request Body:
 * {
 *   name: string,
 *   slug: string,
 *   shortDescription: string,
 *   description: string,
 *   price: number,
 *   originalPrice?: number,
 *   category: string,
 *   difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
 *   setupTime?: string,
 *   estimatedValue?: string,
 *   demoUrl?: string,
 *   githubUrl?: string,
 *   downloadUrl?: string,
 *   isActive?: boolean,
 *   isFeatured?: boolean,
 *   isBestseller?: boolean,
 *   tags?: string[],
 *   techStack?: string[],
 *   features?: string[],
 *   includes?: string[],
 *   images?: string[]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: Bundle
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

    // Authentication and authorization
    // const user = await requireAdmin(request)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createBundleSchema.parse(body)

    // Check if slug already exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingBundle) {
      throw new ConflictError("Bundle with this slug already exists")
    }

    // Create bundle in transaction with increased timeout
    const bundle = await prisma.$transaction(async (tx) => {
      // Create the bundle data object
      const bundleData: any = {
        name: validatedData.name,
        slug: validatedData.slug,
        shortDescription: validatedData.shortDescription,
        description: validatedData.description,
        price: validatedData.price,
        originalPrice: validatedData.originalPrice,
        difficulty: validatedData.difficulty,
        category: validatedData.category,
        setupTime: validatedData.setupTime || "Not specified",
        estimatedValue: validatedData.estimatedValue && validatedData.estimatedValue !== "" ? validatedData.estimatedValue : null,
        demoUrl: validatedData.demoUrl && validatedData.demoUrl !== "" ? validatedData.demoUrl : null,
        githubUrl: validatedData.githubUrl && validatedData.githubUrl !== "" ? validatedData.githubUrl : null,
        downloadUrl: validatedData.downloadUrl && validatedData.downloadUrl !== "" ? validatedData.downloadUrl : null,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        isBestseller: validatedData.isBestseller,
      }

      const newBundle = await tx.bundle.create({
        data: bundleData,
      })

      // Add images
      if (validatedData.images && validatedData.images.length > 0) {
        await tx.bundleImage.createMany({
          data: validatedData.images.map((url, index) => ({
            bundleId: newBundle.id,
            url,
            order: index,
          })),
        })
      }

      // Add tags (optimized - batch create tags first)
      if (validatedData.tags && validatedData.tags.length > 0) {
        // Create all tags at once using createMany with skipDuplicates
        await tx.tag.createMany({
          data: validatedData.tags.map(name => ({ name })),
          skipDuplicates: true,
        })

        // Get all tags and create bundle-tag relationships
        const tags = await tx.tag.findMany({
          where: { name: { in: validatedData.tags } },
        })

        await tx.bundleTag.createMany({
          data: tags.map(tag => ({
            bundleId: newBundle.id,
            tagId: tag.id,
          })),
        })
      }

      // Add tech stack (optimized - batch create technologies first)
      if (validatedData.techStack && validatedData.techStack.length > 0) {
        // Create all technologies at once using createMany with skipDuplicates
        await tx.technology.createMany({
          data: validatedData.techStack.map(name => ({ name, category: "tool" })),
          skipDuplicates: true,
        })

        // Get all technologies and create bundle-tech relationships
        const technologies = await tx.technology.findMany({
          where: { name: { in: validatedData.techStack } },
        })

        await tx.bundleTech.createMany({
          data: technologies.map(tech => ({
            bundleId: newBundle.id,
            techId: tech.id,
          })),
        })
      }

      // Add features
      if (validatedData.features && validatedData.features.length > 0) {
        await tx.bundleFeature.createMany({
          data: validatedData.features.map((description, index) => ({
            bundleId: newBundle.id,
            description,
            order: index,
          })),
        })
      }

      // Add includes
      if (validatedData.includes && validatedData.includes.length > 0) {
        await tx.bundleInclude.createMany({
          data: validatedData.includes.map((description, index) => ({
            bundleId: newBundle.id,
            description,
            order: index,
          })),
        })
      }

      return newBundle
    }, {
      timeout: 30000, // 30 seconds timeout
    })

    // Fetch the complete bundle data
    const completeBundle = await prisma.bundle.findUnique({
      where: { id: bundle.id },
      include: {
        images: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        techStack: { include: { tech: true } },
        features: { orderBy: { order: "asc" } },
        includes: { orderBy: { order: "asc" } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: completeBundle,
      },
      { status: 201 },
    )
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
