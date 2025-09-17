import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@bundlehub.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Admin User'

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists`)
      return
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      }
    })

    console.log('Admin user created successfully:')
    console.log(`Email: ${admin.email}`)
    console.log(`Name: ${admin.name}`)
    console.log(`Role: ${admin.role}`)
    console.log(`ID: ${admin.id}`)
    console.log('\nYou can now login to /admin/login with these credentials')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()