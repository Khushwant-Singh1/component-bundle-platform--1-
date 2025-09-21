#!/usr/bin/env node

// Database connection test script
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  console.log('🔍 Testing database connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'))

  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query test successful:', result)

    // Test if tables exist
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Users table exists with ${userCount} records`)
    } catch (error) {
      console.log('❌ Users table issue:', error.message)
    }

    try {
      const orderCount = await prisma.order.count()
      console.log(`✅ Orders table exists with ${orderCount} records`)
    } catch (error) {
      console.log('❌ Orders table issue:', error.message)
    }

    try {
      const otpCount = await prisma.oTPVerification.count()
      console.log(`✅ OTP Verification table exists with ${otpCount} records`)
    } catch (error) {
      console.log('❌ OTP Verification table issue:', error.message)
    }

  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Troubleshooting steps:')
      console.log('1. Check if your Neon database is active')
      console.log('2. Verify the DATABASE_URL in your .env file')
      console.log('3. Ensure your IP is whitelisted in Neon dashboard')
      console.log('4. Try creating a new database with: npx prisma-postgres-create-database')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
  .catch(console.error)
  .finally(process.exit)
