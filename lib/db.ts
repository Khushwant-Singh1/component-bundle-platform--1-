import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export { prisma }

/**
 * Database connection utility with retry logic
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

/**
 * Wrapper for database operations with automatic reconnection
 */
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)
      
      // Check if it's a connection error
      if (error instanceof Error && error.message.includes('Server has closed the connection')) {
        console.log('Attempting to reconnect to database...')
        try {
          await prisma.$disconnect()
          await prisma.$connect()
        } catch (reconnectError) {
          console.error('Failed to reconnect:', reconnectError)
        }
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  
  throw lastError
}
