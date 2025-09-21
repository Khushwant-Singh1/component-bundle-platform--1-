import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { uploadFileToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await requireAdmin()

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bundleSlug = formData.get('bundleSlug') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!bundleSlug) {
      return NextResponse.json(
        { error: 'Bundle slug is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only ZIP files are allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const s3ObjectKey = await uploadFileToS3(buffer, file.name, bundleSlug)

    return NextResponse.json({
      success: true,
      objectKey: s3ObjectKey,
      downloadUrl: `s3://${s3ObjectKey}`
    })

  } catch (error) {
    console.error('Error uploading bundle file:', error)
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
