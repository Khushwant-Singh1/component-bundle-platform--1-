import { NextRequest, NextResponse } from 'next/server'
import { sendBundleEmail } from '@/lib/email'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bundleId, customerEmail, customerName, orderId } = body

    // Validate required fields
    if (!bundleId || !customerEmail) {
      return NextResponse.json(
        { error: 'Bundle ID and customer email are required' },
        { status: 400 }
      )
    }

    // Get bundle information from database
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId }
    })

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      )
    }

    // Use the enhanced sendBundleEmail function that handles both attachments and download links
    await sendBundleEmail(
      customerEmail,
      customerName || 'Customer',
      [{
        id: bundle.id,
        name: bundle.name,
        downloadUrl: bundle.downloadUrl || undefined
      }],
      orderId || `BUNDLE-${Date.now()}`
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Bundle sent successfully' 
    })

  } catch (error) {
    console.error('Error sending bundle:', error)
    return NextResponse.json(
      { error: 'Failed to send bundle' },
      { status: 500 }
    )
  }
}