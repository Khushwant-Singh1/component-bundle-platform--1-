/**
 * Cloudinary upload utility
 */

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  // Development fallback - use placeholder images
  if (!cloudName || !uploadPreset || cloudName === 'your-cloud-name') {
    console.warn('Cloudinary not configured, using placeholder image')
    // Return a placeholder image URL for development
    return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(file.name)}`
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'bundles') // Organize uploads in a folder

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.error?.message || `Upload failed with status ${response.status}`
      
      // Provide helpful error messages for common issues
      if (errorMessage.includes('Upload preset must be whitelisted')) {
        throw new Error(`Upload preset "${uploadPreset}" must be configured for unsigned uploads. Please check your Cloudinary dashboard settings.`)
      }
      
      throw new Error(errorMessage)
    }

    const data: CloudinaryUploadResult = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToCloudinary(file))
  return Promise.all(uploadPromises)
}