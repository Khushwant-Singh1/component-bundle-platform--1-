import { prisma } from "@/lib/db"
import jwt from "jsonwebtoken"
import { randomBytes } from "crypto"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret"

export interface DownloadTokenPayload {
  userId: string
  bundleId: string
  orderId: string
  iat: number
  exp: number
}

/**
 * Generate a secure download token that expires in 24 hours
 * Only authenticated users who have purchased the bundle can get tokens
 */
export async function generateSecureDownloadToken(
  userId: string,
  bundleId: string,
  orderId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  // Check if user has access to this bundle through the order
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [
        { userId: userId },
        { user: { id: userId } }
      ],
      status: "APPROVED",
      items: {
        some: {
          bundleId: bundleId
        }
      }
    }
  })

  if (!order) {
    throw new Error("User does not have access to this bundle")
  }

  // Clean up expired tokens for this user/bundle combination
  await cleanupExpiredTokens(userId, bundleId)

  // Check if user already has a valid token for this bundle
  const existingToken = await prisma.downloadToken.findFirst({
    where: {
      userId,
      bundleId,
      expiresAt: {
        gt: new Date()
      },
      isUsed: false
    }
  })

  if (existingToken) {
    return existingToken.token
  }

  // Create JWT payload
  const now = Math.floor(Date.now() / 1000)
  const expiresIn24Hours = now + (24 * 60 * 60) // 24 hours in seconds
  
  const payload: DownloadTokenPayload = {
    userId,
    bundleId,
    orderId,
    iat: now,
    exp: expiresIn24Hours
  }

  // Generate JWT token
  const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' })

  // Store token in database
  await prisma.downloadToken.create({
    data: {
      token,
      userId,
      bundleId,
      orderId,
      expiresAt: new Date(expiresIn24Hours * 1000),
      ipAddress,
      userAgent
    }
  })

  return token
}

/**
 * Verify and decode a download token
 */
export async function verifyDownloadToken(token: string): Promise<DownloadTokenPayload | null> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as DownloadTokenPayload
    
    // Check token in database
    const dbToken = await prisma.downloadToken.findUnique({
      where: { token },
      include: {
        user: true,
        bundle: true,
        order: true
      }
    })

    if (!dbToken || dbToken.isUsed || dbToken.expiresAt < new Date()) {
      return null
    }

    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

/**
 * Mark a token as used
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.downloadToken.update({
    where: { token },
    data: {
      isUsed: true,
      usedAt: new Date()
    }
  })
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens(userId?: string, bundleId?: string): Promise<number> {
  const where: any = {
    expiresAt: {
      lt: new Date()
    }
  }

  if (userId) where.userId = userId
  if (bundleId) where.bundleId = bundleId

  const result = await prisma.downloadToken.deleteMany({ where })
  return result.count
}

/**
 * Get download token information
 */
export async function getDownloadTokenInfo(token: string) {
  return await prisma.downloadToken.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      bundle: {
        select: {
          id: true,
          name: true,
          downloadUrl: true
        }
      },
      order: {
        select: {
          id: true,
          customerName: true,
          approvedAt: true
        }
      }
    }
  })
}

/**
 * Generate a simple random token (non-JWT alternative)
 */
export function generateRandomToken(): string {
  return randomBytes(32).toString('hex')
}
