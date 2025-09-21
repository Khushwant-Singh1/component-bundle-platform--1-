import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otpVerified: { label: "OTP Verified", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        try {
          // Handle OTP-verified login (from user-login page)
          if (credentials.otpVerified === "true") {
            const user = await prisma.user.findFirst({
              where: {
                email: credentials.email as string,
                isActive: true,
                role: "CUSTOMER"
              },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            })

            if (!user) {
              return null
            }

            // Update last login time
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          // Handle traditional password-based login (for admin)
          if (!credentials?.password) {
            return null
          }

          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email as string,
              isActive: true,
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
            },
          })

          if (!user?.password) {
            return null
          }

          const isValid = await compare(credentials.password as string, user.password)
          
          if (!isValid) {
            return null
          }

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async signOut() {
      // Clear any cached sessions
    },
  },
  debug: process.env.NODE_ENV === "development",
})

// Helper functions for server-side auth checks
export async function requireAuth() {
  const session = await auth()
  if (!session) {
    throw new Error("Authentication required")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw new Error("Admin privileges required")
  }
  return session
}