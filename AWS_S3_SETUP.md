# AWS S3 Setup Guide

This guide will help you set up AWS S3 for payment screenshot uploads in your component bundle platform.

## Prerequisites

- AWS Account
- Basic understanding of AWS S3 and IAM

## Step 1: Create an S3 Bucket

1. **Log in to AWS Console**
   - Go to [AWS Console](https://aws.amazon.com/console/)
   - Navigate to **S3** service

2. **Create a new bucket**
   - Click **Create bucket**
   - Choose a unique bucket name (e.g., `your-app-name-storage`)
   - Select your preferred AWS region
   - **Important**: For payment screenshots to be publicly accessible, you'll need to configure public access

3. **Configure bucket settings**
   - **Object Ownership**: Choose "ACLs enabled" if you need fine-grained control
   - **Block Public Access**: Uncheck "Block all public access" if you want direct URL access to payment screenshots
   - **Bucket Versioning**: Enable if you want version control
   - **Default encryption**: Enable for security

4. **Set up bucket policy (if making objects publicly readable)**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

## Step 2: Create IAM User for S3 Access

1. **Go to IAM service**
   - Navigate to **IAM** → **Users**
   - Click **Create user**

2. **Create user**
   - Username: `s3-upload-user` (or any name you prefer)
   - Access type: **Programmatic access**

3. **Attach permissions**
   - Create or attach a policy with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": [
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

4. **Save credentials**
   - Copy the **Access Key ID** and **Secret Access Key**
   - Store them securely - you'll need them for environment variables

## Step 3: Update Environment Variables

Add the following to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_REGION="us-east-1"  # Replace with your bucket's region
AWS_ACCESS_KEY_ID="your-access-key-id"  # From Step 2
AWS_SECRET_ACCESS_KEY="your-secret-access-key"  # From Step 2
AWS_S3_BUCKET_NAME="your-bucket-name"  # From Step 1
```

## Step 4: Test the Configuration

1. **Restart your development server**
   ```bash
   pnpm dev
   ```

2. **Test payment screenshot upload**
   - Create a test order
   - Try uploading a payment screenshot
   - Verify it appears in your S3 bucket
   - Check that the admin panel can display the screenshot

## Security Considerations

### Production Setup

1. **Use IAM Roles**: For production deployments (especially on AWS), use IAM roles instead of access keys
2. **Bucket Security**: Consider making the bucket private and using signed URLs for accessing payment screenshots
3. **CORS Configuration**: Set up CORS if uploading directly from browser
4. **Lifecycle Policies**: Set up lifecycle policies to manage storage costs
5. **Encryption**: Enable server-side encryption for sensitive data

### Private Bucket Setup (Recommended for Production)

If you prefer to keep payment screenshots private:

1. **Keep bucket private** (block public access)
2. **Use signed URLs** - modify the code to generate signed URLs instead of public URLs:

```typescript
// In your admin panel, use signed URLs for viewing screenshots
import { generateSignedDownloadUrl } from '@/lib/s3'

// When displaying screenshots
const signedUrl = await generateSignedDownloadUrl(objectKey, 3600) // 1 hour expiry
```

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Check IAM permissions
   - Verify bucket policy
   - Ensure region matches

2. **"Bucket not found"**
   - Verify bucket name in environment variables
   - Check if bucket exists in the correct region

3. **Images not loading in admin panel**
   - For public buckets: Check bucket policy allows public read
   - For private buckets: Implement signed URL generation

4. **Upload timeouts**
   - Check file size limits
   - Verify network connectivity
   - Consider using multipart uploads for large files

### Testing S3 Configuration

You can test your S3 configuration with this simple script:

```javascript
// Run this in your Next.js API route or server environment
import { isS3Configured, uploadImageToS3 } from '@/lib/s3'

if (isS3Configured()) {
  console.log('✅ S3 is properly configured')
} else {
  console.log('❌ S3 configuration is missing')
}
```

## Fallback Behavior

The payment upload system includes a fallback mechanism:

- **If S3 is configured**: Screenshots are uploaded to S3
- **If S3 is not configured**: Screenshots are stored locally in `public/uploads/payments/`

This ensures your application works even if S3 setup is incomplete.

## Cost Optimization

1. **Set up lifecycle policies** to automatically delete old screenshots
2. **Use appropriate storage classes** (Standard, IA, Glacier)
3. **Monitor usage** with AWS CloudWatch
4. **Set up billing alerts** to avoid unexpected charges

## Next Steps

After setting up S3:

1. Test the upload functionality thoroughly
2. Set up monitoring for S3 operations
3. Consider implementing image optimization
4. Plan for backup and disaster recovery
5. Review and audit access permissions regularly
