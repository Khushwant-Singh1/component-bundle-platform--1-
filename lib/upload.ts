import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

interface UploadOptions {
  maxSize: number
  allowedTypes: string[]
  destination: string
}

const defaultOptions: UploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  destination: "public/uploads",
}

/**
 * Upload file to server
 * @param file - File to upload
 * @param options - Upload options
 * @returns Object with file path and URL
 */
export async function uploadFile(file: File, options: Partial<UploadOptions> = {}) {
  const config = { ...defaultOptions, ...options }

  // Validate file size
  if (file.size > config.maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${config.maxSize / 1024 / 1024}MB`)
  }

  // Validate file type
  if (!config.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(", ")}`)
  }

  // Generate unique filename
  const extension = file.name.split(".").pop()
  const filename = `${uuidv4()}.${extension}`
  const filepath = join(config.destination, filename)

  // Ensure directory exists
  await mkdir(config.destination, { recursive: true })

  // Convert file to buffer and write to disk
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  return {
    path: filepath,
    url: filepath.replace("public", ""),
    filename,
    size: file.size,
    type: file.type,
  }
}

/**
 * Upload multiple files
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Array of upload results
 */
export async function uploadFiles(files: File[], options: Partial<UploadOptions> = {}) {
  const results = []

  for (const file of files) {
    try {
      const result = await uploadFile(file, options)
      results.push({ success: true, ...result })
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
        filename: file.name,
      })
    }
  }

  return results
}
