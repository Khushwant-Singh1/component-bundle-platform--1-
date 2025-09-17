# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your bundle marketplace.

## Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Credentials

1. Log in to your Cloudinary dashboard
2. You'll see your **Cloud Name** on the dashboard - copy this value
3. Note down your **API Key** and **API Secret** (you won't need these for unsigned uploads)

## Step 3: Create an Upload Preset

1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `bundle-images` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `bundles` (optional, helps organize uploads)
   - **Allowed formats**: `jpg,jpeg,png,webp`
   - **Max file size**: `10000000` (10MB)
   - **Max image width**: `2000`
   - **Max image height**: `2000`
   - **Quality**: `auto`
   - **Format**: `auto`
5. Click **Save**

## Step 4: Update Environment Variables

Update your `.env` file with your actual Cloudinary credentials:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="bundle-images"
```

Replace:
- `your-actual-cloud-name` with your Cloud Name from step 2
- `bundle-images` with the preset name you created in step 3

## Step 5: Test the Upload

1. Restart your development server: `pnpm dev`
2. Go to `/admin/bundles/new`
3. Try uploading an image
4. The upload should now work without errors

## Troubleshooting

### Error: "Upload preset must be whitelisted for unsigned uploads"
- Make sure your upload preset has **Signing Mode** set to **Unsigned**
- Double-check the preset name in your `.env` file matches exactly

### Error: "Invalid cloud name"
- Verify your `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Cloud names are case-sensitive

### Error: "Upload preset not found"
- Make sure the upload preset exists in your Cloudinary account
- Check that the preset name in `.env` matches exactly (case-sensitive)

### Images not uploading
- Check browser console for detailed error messages
- Verify file size is under the limit you set
- Ensure file format is allowed (jpg, jpeg, png, webp)

## Security Notes

- Upload presets with unsigned mode are safe for client-side uploads
- Consider setting up transformation parameters in the preset to optimize images
- You can add more restrictions in the upload preset settings for security

## Optional: Advanced Configuration

You can enhance the upload preset with:
- **Auto-tagging**: Automatically tag uploads
- **Transformations**: Resize/optimize images on upload
- **Webhooks**: Get notified when uploads complete
- **Access control**: Restrict uploads by domain/IP

For production, consider:
- Setting up signed uploads for more security
- Using Cloudinary's transformation features for image optimization
- Implementing upload progress indicators