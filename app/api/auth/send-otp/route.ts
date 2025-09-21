import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { generateOTP } from '@/lib/email'
import { authRateLimit, rateLimit } from '@/lib/rate-limit'

const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['LOGIN', 'SIGNUP'], {
    errorMap: () => ({ message: 'Type must be LOGIN or SIGNUP' })
  }),
  name: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { email, type, name } = sendOTPSchema.parse(body)

    // Check rate limit
    const rateLimitResult = rateLimit(request, authRateLimit)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many OTP requests. Please wait 15 minutes before trying again.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
    }

    // Check if user exists for LOGIN type
    if (type === 'LOGIN') {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, isActive: true }
      })

      if (!existingUser) {
        return NextResponse.json(
          { 
            error: 'No account found with this email address. Please sign up first.',
            code: 'USER_NOT_FOUND'
          },
          { status: 404 }
        )
      }

      if (!existingUser.isActive) {
        return NextResponse.json(
          { 
            error: 'Account is deactivated. Please contact support.',
            code: 'ACCOUNT_DEACTIVATED'
          },
          { status: 403 }
        )
      }
    }

    // Check if user already exists for SIGNUP type
    if (type === 'SIGNUP') {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })

      if (existingUser) {
        return NextResponse.json(
          { 
            error: 'An account with this email already exists. Please login instead.',
            code: 'USER_EXISTS'
          },
          { status: 409 }
        )
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Clean up old OTPs for this email and type
    await prisma.oTPVerification.deleteMany({
      where: {
        email,
        type,
        OR: [
          { expiresAt: { lt: new Date() } }, // Expired
          { isUsed: true } // Already used
        ]
      }
    })

    // Store OTP in database
    await prisma.oTPVerification.create({
      data: {
        email,
        otp,
        type,
        expiresAt,
      }
    })

    // Send OTP email
    try {
      const { sendUserOTPEmail } = await import('@/lib/email')
      await sendUserOTPEmail({
        to: email,
        otp,
        type: type.toLowerCase() as 'login' | 'signup',
        customerName: name,
        expiresInMinutes: 10
      })
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      
      // Clean up the OTP from database if email failed
      await prisma.oTPVerification.deleteMany({
        where: { email, otp, type }
      })

      return NextResponse.json(
        { 
          error: 'Failed to send OTP email. Please try again.',
          code: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${email}. Please check your email and enter the 6-digit code.`,
      data: {
        email,
        type,
        expiresIn: 10 // minutes
      }
    })

  } catch (error) {
    console.error('Send OTP error:', error)

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
