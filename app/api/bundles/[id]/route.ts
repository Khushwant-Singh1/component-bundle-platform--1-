import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { updateBundleSchema } from "@/lib/validation"
// import { requireAdmin } from "@/lib/auth"
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
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, generalRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { message: "Rate limit exceeded", statusCode: 429 } },
        { status: 429 },
      )
    }

    // Track page view
    await trackPageView(request, `/api/bundles/${params.id}`, params.id)

    // Find bundle
    const bundle = await prisma.bundle.findUnique({
      where: { id: params.id },
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

    if (!bundle) {
      throw new NotFoundError("Bundle not found")
    }

    // Update view count
    await prisma.bundle.update({
      where: { id: params.id },
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
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validatedData = updateBundleSchema.parse(body)

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id: params.id },
    })

    if (!existingBundle) {
      throw new NotFoundError("Bundle not found")
    }

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug && validatedData.slug !== existingBundle.slug) {
      const slugConflict = await prisma.bundle.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: params.id },
        },
      })

      if (slugConflict) {
        throw new ValidationError("Bundle with this slug already exists")
      }
    }

    // Update bundle in transaction
    const bundle = await prisma.$transaction(async (tx) => {
      // Update the main bundle data
      const updatedBundle = await tx.bundle.update({
        where: { id: params.id },
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

      // Update images if provided
      if (validatedData.images !== undefined) {
        // Delete existing images
        await tx.bundleImage.deleteMany({
          where: { bundleId: params.id },
        })

        // Add new images
        if (validatedData.images.length > 0) {
          await tx.bundleImage.createMany({
            data: validatedData.images.map((url, index) => ({
              bundleId: params.id,
              url,
              order: index,
            })),
          })
        }
      }

      // Update tags if provided
      if (validatedData.tags !== undefined) {
        // Delete existing tag relations
        await tx.bundleTag.deleteMany({
          where: { bundleId: params.id },
        })

        // Add new tags
        if (validatedData.tags.length > 0) {
          for (const tagName of validatedData.tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            })

            await tx.bundleTag.create({
              data: {
                bundleId: params.id,
                tagId: tag.id,
              },
            })
          }
        }
      }

      // Update tech stack if provided
      if (validatedData.techStack !== undefined) {
        // Delete existing tech relations
        await tx.bundleTech.deleteMany({
          where: { bundleId: params.id },
        })

        // Add new tech stack
        if (validatedData.techStack.length > 0) {
          for (const techName of validatedData.techStack) {
            const tech = await tx.technology.upsert({
              where: { name: techName },
              update: {},
              create: { name: techName, category: "tool" },
            })

            await tx.bundleTech.create({
              data: {
                bundleId: params.id,
                techId: tech.id,
              },
            })
          }
        }
      }

      // Update features if provided
      if (validatedData.features !== undefined) {
        // Delete existing features
        await tx.bundleFeature.deleteMany({
          where: { bundleId: params.id },
        })

        // Add new features
        if (validatedData.features.length > 0) {
          await tx.bundleFeature.createMany({
            data: validatedData.features.map((description, index) => ({
              bundleId: params.id,
              description,
              order: index,
            })),
          })
        }
      }

      // Update includes if provided
      if (validatedData.includes !== undefined) {
        // Delete existing includes
        await tx.bundleInclude.deleteMany({
          where: { bundleId: params.id },
        })

        // Add new includes
        if (validatedData.includes.length > 0) {
          await tx.bundleInclude.createMany({
            data: validatedData.includes.map((description, index) => ({
              bundleId: params.id,
              description,
              order: index,
            })),
          })
        }
      }

      return updatedBundle
    })

    // Fetch the complete updated bundle data
    const completeBundle = await prisma.bundle.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        techStack: { include: { tech: true } },
        features: { orderBy: { order: "asc" } },
        includes: { orderBy: { order: "asc" } },
      },
    })

    return NextResponse.json({
      success: true,
      data: completeBundle,
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id: params.id },
    })

    if (!existingBundle) {
      throw new NotFoundError("Bundle not found")
    }

    // Delete bundle (cascade will handle related records)
    await prisma.bundle.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Bundle deleted successfully",
    })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
