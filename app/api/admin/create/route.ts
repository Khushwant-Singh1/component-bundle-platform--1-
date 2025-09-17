import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name: name || 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: "Admin user created successfully",
      user: admin
    })
    
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    )
  }
}