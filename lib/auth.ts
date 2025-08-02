// import type { NextRequest } from "next/server"
// import { verify } from "jsonwebtoken"
// import { prisma } from "@/lib/db"

// export interface AuthUser {
//   id: string
//   email: string
//   role: "ADMIN" | "CUSTOMER"
// }

// /**
//  * Authenticates a user from the request
//  * @param request - The Next.js request object
//  * @returns The authenticated user or null
//  */
// export async function authenticateUser(request: NextRequest): Promise<AuthUser | null> {
//   try {
//     const token = request.headers.get("authorization")?.replace("Bearer ", "")

//     if (!token) {
//       return null
//     }

//     const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: { id: true, email: true, role: true },
//     })

//     return user
//   } catch (error) {
//     console.error("Authentication error:", error)
//     return null
//   }
// }

// /**
//  * Middleware to require authentication
//  * @param request - The Next.js request object
//  * @returns The authenticated user or throws an error
//  */
// export async function requireAuth(request: NextRequest): Promise<AuthUser> {
//   const user = await authenticateUser(request)

//   if (!user) {
//     throw new Error("Authentication required")
//   }

//   return user
// }

// /**
//  * Middleware to require admin privileges
//  * @param request - The Next.js request object
//  * @returns The authenticated admin user or throws an error
//  */
// export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
//   const user = await requireAuth(request)

//   if (user.role !== "ADMIN") {
//     throw new Error("Admin privileges required")
//   }

//   return user
// }
