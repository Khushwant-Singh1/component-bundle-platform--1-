import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import { signIn } from 'next-auth/react'

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['LOGIN', 'SIGNUP'], {
    errorMap: () => ({ message: 'Type must be LOGIN or SIGNUP' })
  }),
  // For signup
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { email, otp, type, name, password } = verifyOTPSchema.parse(body)

    // Validate required fields for signup
    if (type === 'SIGNUP') {
      if (!name) {
        return NextResponse.json(
          { 
            error: 'Name is required for signup',
            code: 'MISSING_NAME'
          },
          { status: 400 }
        )
      }
      if (!password) {
        return NextResponse.json(
          { 
            error: 'Password is required for signup',
            code: 'MISSING_PASSWORD'
          },
          { status: 400 }
        )
      }
    }

    // Find valid OTP
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        otp,
        type,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (!otpRecord) {
      // Check if OTP exists but is expired or used
      const expiredOtp = await prisma.oTPVerification.findFirst({
        where: {
          email,
          otp,
          type
        }
      })

      if (expiredOtp) {
        if (expiredOtp.isUsed) {
          return NextResponse.json(
            { 
              error: 'This OTP has already been used. Please request a new one.',
              code: 'OTP_ALREADY_USED'
            },
            { status: 400 }
          )
        }
        if (expiredOtp.expiresAt < new Date()) {
          return NextResponse.json(
            { 
              error: 'OTP has expired. Please request a new one.',
              code: 'OTP_EXPIRED'
            },
            { status: 400 }
          )
        }
      }

      // Increment attempts
      await prisma.oTPVerification.updateMany({
        where: {
          email,
          type,
          isUsed: false,
          expiresAt: { gt: new Date() }
        },
        data: {
          attempts: { increment: 1 }
        }
      })

      return NextResponse.json(
        { 
          error: 'Invalid OTP. Please check your email and try again.',
          code: 'INVALID_OTP'
        },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    })

    try {
      if (type === 'SIGNUP') {
        // Create new user account
        const hashedPassword = await hash(password!, 12)
        
        const newUser = await prisma.user.create({
          data: {
            email,
            name: name!,
            password: hashedPassword,
            role: 'CUSTOMER',
            emailVerified: new Date(), // Mark email as verified since they used OTP
            isActive: true
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Account created successfully! You can now login.',
          data: {
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
            action: 'ACCOUNT_CREATED'
          }
        })

      } else if (type === 'LOGIN') {
        // Verify user exists and update last login
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true
          }
        })

        if (!user) {
          return NextResponse.json(
            { 
              error: 'User account not found.',
              code: 'USER_NOT_FOUND'
            },
            { status: 404 }
          )
        }

        if (!user.isActive) {
          return NextResponse.json(
            { 
              error: 'Account is deactivated. Please contact support.',
              code: 'ACCOUNT_DEACTIVATED'
            },
            { status: 403 }
          )
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully!',
          data: {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            action: 'LOGIN_VERIFIED'
          }
        })
      }

    } catch (dbError) {
      console.error('Database error during user creation/update:', dbError)
      
      // If user creation fails during signup, we should clean up by allowing OTP reuse
      if (type === 'SIGNUP') {
        await prisma.oTPVerification.update({
          where: { id: otpRecord.id },
          data: {
            isUsed: false,
            usedAt: null
          }
        })
      }

      return NextResponse.json(
        { 
          error: 'Database error occurred. Please try again.',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      )
    }

    // Clean up old expired OTPs for this email
    await prisma.oTPVerification.deleteMany({
      where: {
        email,
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true }
        ]
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
