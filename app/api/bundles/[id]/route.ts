import { type NextRequest, NextResponse } from "next/server"
import { prisma, withRetry } from "@/lib/db"
import { updateBundleSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/auth"
import { handleError, NotFoundError, ValidationError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"
import { trackPageView } from "@/lib/analytics"

/**
 * GET /api/bundles/[id]
 * Retrieve a specific bundle by ID
 *
 * Response:
 * {
 *   success: true,
 *   data: Bundle
 * }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429 },
      )
    }

    // Await params
    const { id } = await params

    // Track page view
    await trackPageView(request, `/api/bundles/${id}`, id)

    // Find bundle with retry logic
    const bundle = await withRetry(async () => {
      return await prisma.bundle.findUnique({
        where: { id },
        include: {
          images: { orderBy: { order: "asc" } },
          tags: { include: { tag: true } },
          techStack: { include: { tech: true } },
          features: { orderBy: { order: "asc" } },
          includes: { orderBy: { order: "asc" } },
          reviews: {
            where: { isPublic: true },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
              orders: true,
              downloads: true,
            },
          },
        },
      })
    })

    if (!bundle) {
      throw new NotFoundError("Bundle not found")
    }

    // Update view count
    await prisma.bundle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Format response
    const formattedBundle = {
      ...bundle,
      images: bundle.images.map((img) => img.url),
      tags: bundle.tags.map((t) => t.tag.name),
      techStack: bundle.techStack.map((t) => t.tech.name),
      features: bundle.features.map((f) => f.description),
      includes: bundle.includes.map((i) => i.description),
      stats: {
        reviewCount: bundle._count.reviews,
        salesCount: bundle._count.orders,
        downloadCount: bundle._count.downloads,
      },
    }

    return NextResponse.json({
      success: true,
      data: formattedBundle,
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PUT /api/bundles/[id]
 * Update a specific bundle
 *
 * Request Body: Partial Bundle object
 *
 * Response:
 * {
 *   success: true,
 *   data: Bundle
 * }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const user = await requireAdmin()

    // Await params
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    
    let validatedData
    try {
      validatedData = updateBundleSchema.parse(body)
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodErrors = (error as any).errors
        const formattedErrors = zodErrors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              message: "Validation failed", 
              statusCode: 400,
              details: formattedErrors
            } 
          },
          { status: 400 }
        )
      }
      throw new ValidationError("Invalid request data")
    }

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
    })

    if (!existingBundle) {
      throw new NotFoundError("Bundle not found")
    }

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug && validatedData.slug !== existingBundle.slug) {
      const slugConflict = await prisma.bundle.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: id },
        },
      })

      if (slugConflict) {
        throw new ValidationError("Bundle with this slug already exists")
      }
    }

    // Optimize: Do updates in smaller transactions or without transaction for simple updates
    // First, update the main bundle data (this is fast)
    await prisma.bundle.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        shortDescription: validatedData.shortDescription,
        description: validatedData.description,
        price: validatedData.price,
        originalPrice: validatedData.originalPrice,
        setupTime: validatedData.setupTime,
        difficulty: validatedData.difficulty,
        estimatedValue: validatedData.estimatedValue,
        category: validatedData.category,
        demoUrl: validatedData.demoUrl,
        githubUrl: validatedData.githubUrl,
        downloadUrl: validatedData.downloadUrl,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        isBestseller: validatedData.isBestseller,
      },
    })

    // Handle images separately (if provided)
    if (validatedData.images !== undefined) {
      await prisma.$transaction(async (tx) => {
        await tx.bundleImage.deleteMany({ where: { bundleId: id } })
        if (validatedData.images!.length > 0) {
          await tx.bundleImage.createMany({
            data: validatedData.images!.map((url, index) => ({
              bundleId: id,
              url,
              order: index,
            })),
          })
        }
      }, { timeout: 10000 })
    }

    // Handle tags separately (if provided)
    if (validatedData.tags !== undefined) {
      await prisma.$transaction(async (tx) => {
        await tx.bundleTag.deleteMany({ where: { bundleId: id } })
        if (validatedData.tags!.length > 0) {
          // Create tags in batch
          await tx.tag.createMany({
            data: validatedData.tags!.map(name => ({ name })),
            skipDuplicates: true,
          })
          // Get tag IDs and create relationships
          const tags = await tx.tag.findMany({
            where: { name: { in: validatedData.tags! } },
          })
          await tx.bundleTag.createMany({
            data: tags.map(tag => ({ bundleId: id, tagId: tag.id })),
          })
        }
      }, { timeout: 10000 })
    }

    // Handle tech stack separately (if provided)
    if (validatedData.techStack !== undefined) {
      await prisma.$transaction(async (tx) => {
        await tx.bundleTech.deleteMany({ where: { bundleId: id } })
        if (validatedData.techStack!.length > 0) {
          // Create technologies in batch
          await tx.technology.createMany({
            data: validatedData.techStack!.map(name => ({ name, category: "tool" })),
            skipDuplicates: true,
          })
          // Get tech IDs and create relationships
          const technologies = await tx.technology.findMany({
            where: { name: { in: validatedData.techStack! } },
          })
          await tx.bundleTech.createMany({
            data: technologies.map(tech => ({ bundleId: id, techId: tech.id })),
          })
        }
      }, { timeout: 10000 })
    }

    // Handle features separately (if provided)
    if (validatedData.features !== undefined) {
      await prisma.$transaction(async (tx) => {
        await tx.bundleFeature.deleteMany({ where: { bundleId: id } })
        if (validatedData.features!.length > 0) {
          await tx.bundleFeature.createMany({
            data: validatedData.features!.map((description, index) => ({
              bundleId: id,
              description,
              order: index,
            })),
          })
        }
      }, { timeout: 10000 })
    }

    // Handle includes separately (if provided)
    if (validatedData.includes !== undefined) {
      await prisma.$transaction(async (tx) => {
        await tx.bundleInclude.deleteMany({ where: { bundleId: id } })
        if (validatedData.includes!.length > 0) {
          await tx.bundleInclude.createMany({
            data: validatedData.includes!.map((description, index) => ({
              bundleId: id,
              description,
              order: index,
            })),
          })
        }
      }, { timeout: 10000 })
    }

    // Fetch the complete updated bundle data
    const completeBundle = await prisma.bundle.findUnique({
      where: { id: id },
      include: {
        images: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        techStack: { include: { tech: true } },
        features: { orderBy: { order: "asc" } },
        includes: { orderBy: { order: "asc" } },
        _count: {
          select: {
            reviews: true,
            orders: true,
            downloads: true,
          },
        },
      },
    })

    // Format response
    const formattedBundle = {
      ...completeBundle,
      images: completeBundle?.images.map((img) => img.url) || [],
      tags: completeBundle?.tags.map((t) => t.tag.name) || [],
      techStack: completeBundle?.techStack.map((t) => t.tech.name) || [],
      features: completeBundle?.features.map((f) => f.description) || [],
      includes: completeBundle?.includes.map((i) => i.description) || [],
      stats: {
        reviewCount: completeBundle?._count.reviews || 0,
        salesCount: completeBundle?._count.orders || 0,
        downloadCount: completeBundle?._count.downloads || 0,
      },
    }

    return NextResponse.json({
      success: true,
      data: formattedBundle,
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/bundles/[id]
 * Delete a specific bundle
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const user = await requireAdmin()

    // Await params
    const { id } = await params

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
    })

    if (!existingBundle) {
      throw new NotFoundError("Bundle not found")
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete order items that reference this bundle
      await tx.orderItem.deleteMany({
        where: { bundleId: id },
      })

      // Delete bundle tags
      await tx.bundleTag.deleteMany({
        where: { bundleId: id },
      })

      // Delete bundle tech stack
      await tx.bundleTech.deleteMany({
        where: { bundleId: id },
      })

      // Delete bundle features
      await tx.bundleFeature.deleteMany({
        where: { bundleId: id },
      })

      // Delete bundle includes
      await tx.bundleInclude.deleteMany({
        where: { bundleId: id },
      })

      // Delete bundle images
      await tx.bundleImage.deleteMany({
        where: { bundleId: id },
      })

      // Delete reviews
      await tx.review.deleteMany({
        where: { bundleId: id },
      })

      // Finally delete the bundle
      await tx.bundle.delete({
        where: { id },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Bundle deleted successfully",
    })
  } catch (error) {
    return handleError(error)
  }
}
