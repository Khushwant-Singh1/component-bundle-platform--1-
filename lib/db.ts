import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export { prisma }

/**
 * Database connection utility
 */
export async function connectDB() {
  try {
    await prisma.$connect()
    console.log("Database connected successfully")
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

/**
 * Database disconnection utility
 */
export async function disconnectDB() {
  await prisma.$disconnect()
}
