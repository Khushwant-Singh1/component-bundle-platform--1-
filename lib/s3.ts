import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Lazy initialization of S3 client
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    // Check if we're on the server side
    if (typeof window !== 'undefined') {
      throw new Error('S3 operations can only be performed on the server side')
    }

    // Validate required environment variables
    const region = process.env.AWS_REGION
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(`Missing required AWS environment variables:
        AWS_REGION: ${region ? '✓' : '✗'}
        AWS_ACCESS_KEY_ID: ${accessKeyId ? '✓' : '✗'}
        AWS_SECRET_ACCESS_KEY: ${secretAccessKey ? '✓' : '✗'}`)
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }
  
  return s3Client
}

function getBucketName(): string {
  const bucketName = process.env.AWS_S3_BUCKET_NAME
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is required')
  }
  return bucketName
}

/**
 * Upload a file to S3 and return the object key
 * @param file - File to upload (Buffer or Uint8Array)
 * @param fileName - Name of the file
 * @param bundleSlug - Bundle slug for organizing files
 * @returns Promise<string> - S3 object key
 */
export async function uploadFileToS3(
  file: Buffer | Uint8Array,
  fileName: string,
  bundleSlug: string
): Promise<string> {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const objectKey = `bundles/${bundleSlug}/${timestamp}-${sanitizedFileName}`

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: objectKey,
    Body: file,
    ContentType: getContentType(fileName),
    Metadata: {
      originalName: fileName,
      bundleSlug: bundleSlug,
      uploadedAt: new Date().toISOString(),
    },
  })

  try {
    const client = getS3Client()
    await client.send(command)
    return objectKey
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download a file from S3 as a Buffer
 * @param objectKey - S3 object key
 * @returns Promise<Buffer> - File content as Buffer
 */
export async function downloadFileFromS3(objectKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: objectKey,
  })

  try {
    const client = getS3Client()
    const response = await client.send(command)
    
    if (!response.Body) {
      throw new Error('No file content received from S3')
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    return Buffer.from(buffer)
  } catch (error) {
    console.error('Error downloading file from S3:', error)
    throw new Error(`Failed to download file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a signed URL for downloading a file from S3
 * @param objectKey - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Promise<string> - Signed download URL
 */
export async function generateSignedDownloadUrl(
  objectKey: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: objectKey,
  })

  try {
    const client = getS3Client()
    const signedUrl = await getSignedUrl(client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload an image file to S3 and return the object key
 * @param file - File to upload (Buffer or Uint8Array)
 * @param fileName - Name of the file
 * @param folder - Folder to organize files (e.g., 'payment-screenshots', 'bundles')
 * @param orderId - Optional order ID for payment screenshots
 * @returns Promise<string> - S3 object key
 */
export async function uploadImageToS3(
  file: Buffer | Uint8Array,
  fileName: string,
  folder: string = 'images',
  orderId?: string
): Promise<string> {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const subFolder = orderId ? `${folder}/${orderId}` : folder
  const objectKey = `${subFolder}/${timestamp}-${sanitizedFileName}`

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: objectKey,
    Body: file,
    ContentType: getImageContentType(fileName),
    Metadata: {
      originalName: fileName,
      folder: folder,
      ...(orderId && { orderId }),
      uploadedAt: new Date().toISOString(),
    },
  })

  try {
    const client = getS3Client()
    await client.send(command)
    return objectKey
  } catch (error) {
    console.error('Error uploading image to S3:', error)
    throw new Error(`Failed to upload image to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get content type for image files
 * @param fileName - Name of the file
 * @returns string - MIME type
 */
function getImageContentType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    case 'bmp':
      return 'image/bmp'
    case 'tiff':
    case 'tif':
      return 'image/tiff'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Get content type based on file extension
 * @param fileName - Name of the file
 * @returns string - MIME type
 */
function getContentType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'zip':
      return 'application/zip'
    case 'rar':
      return 'application/vnd.rar'
    case '7z':
      return 'application/x-7z-compressed'
    case 'tar':
      return 'application/x-tar'
    case 'gz':
      return 'application/gzip'
    default:
      return 'application/octet-stream'
  }
}

/**
 * Check if S3 credentials are configured
 * @returns boolean
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  )
}

/**
 * Get the public URL for an S3 object (for non-signed access if bucket is public)
 * @param objectKey - S3 object key
 * @returns string - Public S3 URL
 */
export function getPublicS3Url(objectKey: string): string {
  const bucketName = getBucketName()
  const region = process.env.AWS_REGION
  if (!region) {
    throw new Error('AWS_REGION environment variable is required')
  }
  return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`
}
