import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createOrderSchema } from "@/lib/validation"
import { requireAuth } from "@/lib/auth"
import { handleError, ValidationError } from "@/lib/errors"
import { rateLimit, generalRateLimit } from "@/lib/rate-limit"

/**
 * POST /api/orders
 * Create a new order
 *
 * Request Body:
 * {
 *   items: Array<{
 *     bundleId: string,
 *     quantity: number
 *   }>,
 *   email: string,
 *   paymentMethod: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     order: Order,
 *     totalAmount: number
 *   }
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

    // Authentication (optional for orders)
    const session = await requireAuth()

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Validate bundles exist and are active
    const bundles = await prisma.bundle.findMany({
      where: {
        id: { in: validatedData.items.map((item) => item.bundleId) },
        isActive: true,
      },
    })

    if (bundles.length !== validatedData.items.length) {
      throw new ValidationError("One or more bundles are not available")
    }

    // Calculate total amount
    let totalAmount = 0
    const orderItems = validatedData.items.map((item) => {
      const bundle = bundles.find((b) => b.id === item.bundleId)!
      const itemTotal = Number(bundle.price) * item.quantity
      totalAmount += itemTotal

      return {
        bundleId: item.bundleId,
        quantity: item.quantity,
        price: bundle.price,
      }
    })

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          email: validatedData.email,
          totalAmount,
          paymentMethod: validatedData.paymentMethod,
          status: "PENDING",
        },
      })

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: newOrder.id,
          bundleId: item.bundleId,
          quantity: item.quantity,
          price: item.price,
        })),
      })

      return newOrder
    })

    // Fetch complete order data
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            bundle: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          order: completeOrder,
          totalAmount,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode })
  }
}
