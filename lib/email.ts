import nodemailer from 'nodemailer'
import { readFile } from 'fs/promises'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface SendZipEmailOptions {
  to: string
  bundleName: string
  zipFilePath: string
  customerName?: string
}

interface SendOTPEmailOptions {
  to: string
  otp: string
  customerName?: string
  expiresInMinutes?: number
}

interface SendUserOTPEmailOptions {
  to: string
  otp: string
  type: 'login' | 'signup'
  customerName?: string
  expiresInMinutes?: number
}

// Create transporter based on environment variables
function createTransporter(): nodemailer.Transporter {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    }
  }

  return nodemailer.createTransport(config)
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email for user authentication (login/signup)
export async function sendUserOTPEmail(options: SendUserOTPEmailOptions): Promise<void> {
  const { to, otp, type, customerName, expiresInMinutes = 10 } = options
  
  try {
    const transporter = createTransporter()
    
    const isSignup = type === 'signup'
    const actionText = isSignup ? 'complete your signup' : 'login to your account'
    const titleText = isSignup ? 'Complete Your Signup' : 'Login Verification Code'
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `${titleText} - OTP Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${titleText}</h2>
          ${customerName ? `<p>Hi ${customerName},</p>` : '<p>Hi there,</p>'}
          <p>To ${actionText}, please use the following verification code:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; 
                        padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                           color: #007cba; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
          </div>
          
          <p style="color: #dc3545; font-weight: bold;">
            This code will expire in ${expiresInMinutes} minutes.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this verification code, please ignore this email.
          </p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Need help? Contact our support team.
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`${type.toUpperCase()} OTP sent successfully to ${to}`)
  } catch (error) {
    console.error(`Error sending ${type} OTP email:`, error)
    throw new Error(`Failed to send ${type} OTP email`)
  }
}

// Send OTP email for order verification
export async function sendOTPEmail(options: SendOTPEmailOptions): Promise<void> {
  const { to, otp, customerName, expiresInMinutes = 10 } = options
  
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Verify Your Purchase - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Purchase</h2>
          ${customerName ? `<p>Hi ${customerName},</p>` : '<p>Hi there,</p>'}
          <p>To complete your purchase, please use the following verification code:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; 
                        padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; 
                           color: #007cba; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>
          </div>
          
          <p style="color: #dc3545; font-weight: bold;">
            This code will expire in ${expiresInMinutes} minutes.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this verification code, please ignore this email.
          </p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Need help? Contact our support team.
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`OTP sent successfully to ${to}`)
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw new Error('Failed to send OTP email')
  }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(options: {
  to: string
  orderNumber: string
  customerName?: string
  bundleNames: string[]
  totalAmount: number
}): Promise<void> {
  const { to, orderNumber, customerName, bundleNames, totalAmount } = options
  
  try {
    const transporter = createTransporter()
    
    const bundleList = bundleNames.map(name => `<li>${name}</li>`).join('')
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Order Confirmation - #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Order Confirmed!</h2>
          ${customerName ? `<p>Hi ${customerName},</p>` : '<p>Hi there,</p>'}
          <p>Thank you for your purchase! Your order has been confirmed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            <p><strong>Items Purchased:</strong></p>
            <ul>${bundleList}</ul>
          </div>
          
          <p>You will receive download links for your bundles once payment is processed.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Questions about your order? Contact our support team.
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Order confirmation sent successfully to ${to}`)
  } catch (error) {
    console.error('Error sending order confirmation:', error)
    throw new Error('Failed to send order confirmation email')
  }
}

export async function sendZipFile(options: SendZipEmailOptions): Promise<void> {
  const { to, bundleName, zipFilePath, customerName } = options
  
  try {
    const transporter = createTransporter()
    
    // Read the zip file as attachment
    const zipBuffer = await readFile(zipFilePath)
    const zipFileName = zipFilePath.split('/').pop() || 'bundle.zip'
    
    // Check file size (most email providers have ~25MB limit)
    const fileSizeMB = zipBuffer.length / (1024 * 1024)
    if (fileSizeMB > 20) {
      console.warn(`ZIP file ${zipFileName} is ${fileSizeMB.toFixed(1)}MB, which may be too large for email`)
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Your ${bundleName} Bundle is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your purchase!</h2>
          ${customerName ? `<p>Hi ${customerName},</p>` : '<p>Hi there,</p>'}
          <p>Your <strong>${bundleName}</strong> bundle is attached to this email.</p>
          <p>Download and extract the zip file to access all your files.</p>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0056b3;">📥 Instructions:</h4>
            <ol style="margin: 10px 0;">
              <li>Download the ZIP file attachment</li>
              <li>Extract it to a folder on your computer</li>
              <li>Follow the README instructions inside</li>
              <li>Start building!</li>
            </ol>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            If you have any questions or issues, please don't hesitate to contact us.
          </p>
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Your Team
          </p>
        </div>
      `,
      attachments: [
        {
          filename: zipFileName,
          content: zipBuffer,
          contentType: 'application/zip'
        }
      ]
    }

    await transporter.sendMail(mailOptions)
    console.log(`Zip file sent successfully to ${to}`)
  } catch (error) {
    console.error('Error sending zip file:', error)
    throw new Error('Failed to send zip file via email')
  }
}

// Send bundle download links to customer after order approval (SECURE TOKEN VERSION)
export async function sendBundleEmailWithSecureTokens(
  customerEmail: string,
  customerName: string,
  bundles: Array<{ id: string; name: string; downloadUrl?: string }>,
  orderId: string
): Promise<void> {
  try {
    console.log(`Starting sendBundleEmailWithSecureTokens for order ${orderId}`)
    console.log(`Customer: ${customerEmail}, Bundles count: ${bundles.length}`)
    
    const transporter = createTransporter()
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Generate bundle list with secure login instructions
    const bundleList = bundles.map(bundle => {
      const loginUrl = `${baseUrl}/auth/user-login`
      const profileUrl = `${baseUrl}/profile`
      
      return `<li style="margin: 15px 0; padding: 20px; background-color: #e8f5e8; border: 1px solid #c3e6cb; border-radius: 8px; border-left: 5px solid #28a745;">
        <div>
          <div style="margin-bottom: 15px;">
            <strong style="color: #155724; font-size: 18px; display: block; margin-bottom: 5px;">📦 ${bundle.name}</strong>
            <span style="color: #28a745; font-size: 14px;">✅ Ready for secure download</span>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #007bff;">
            <div style="color: #0056b3; font-size: 14px; font-weight: bold; margin-bottom: 8px;">🔐 Secure Download Process:</div>
            <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 13px; line-height: 1.4;">
              <li>Login to your account using this email address</li>
              <li>Go to your profile/dashboard</li>
              <li>Click "Generate Secure Download" for this bundle</li>
              <li>Your download link will be valid for 24 hours</li>
            </ol>
          </div>
          
          <div style="margin-top: 15px;">
            <a href="${loginUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block; margin-right: 10px; font-size: 14px;">
              🔑 Login to Download
            </a>
            <a href="${profileUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block; font-size: 14px;">
              📊 Go to Profile
            </a>
          </div>
        </div>
      </li>`
    }).join('')
    
    const totalBundles = bundles.length
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: '🎉 Your Bundle Purchase has been Approved! (Secure Download)',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #007bff, #0056b3); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Approved! 🎉</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your bundles are ready for secure download</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${customerName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Excellent news! Your payment has been approved and your ${totalBundles} bundle${totalBundles > 1 ? 's are' : ' is'} ready for download.
            </p>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #e3f2fd, #f0f8ff); padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #007bff;">
              <h4 style="margin-top: 0; color: #0056b3; font-size: 18px;">🔐 Enhanced Security</h4>
              <p style="margin: 0; color: #333; line-height: 1.5;">
                For your security, we now use secure download tokens that expire within 24 hours. 
                You'll need to <strong>login to your account</strong> to generate these secure download links.
              </p>
            </div>
            
            <!-- Bundle Downloads -->
            <div style="margin: 30px 0;">
              <h3 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                📦 Your Bundles
              </h3>
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                ${bundleList}
              </ul>
            </div>
            
            <!-- Quick Access -->
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
              <h4 style="margin-top: 0; color: #333;">🚀 Quick Access</h4>
              <p style="color: #666; margin-bottom: 20px;">Login with this email address to access your bundles instantly</p>
              <div>
                <a href="${baseUrl}/auth/user-login" 
                   style="background-color: #007bff; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold;
                          display: inline-block; margin: 5px; font-size: 16px;">
                  🔑 Login Now
                </a>
                <a href="${baseUrl}/profile" 
                   style="background-color: #28a745; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold;
                          display: inline-block; margin: 5px; font-size: 16px;">
                  📊 My Profile
                </a>
              </div>
            </div>
            
            <!-- Download Process -->
            <div style="background: linear-gradient(135deg, #fff3cd, #fff8e1); padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404; font-size: 18px;">📥 How to Download</h4>
              <ol style="margin: 15px 0; padding-left: 20px; color: #856404;">
                <li style="margin: 10px 0; line-height: 1.6;"><strong>Login:</strong> Use the email address: <code style="background-color: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">${customerEmail}</code></li>
                <li style="margin: 10px 0; line-height: 1.6;"><strong>Navigate:</strong> Go to your profile or dashboard</li>
                <li style="margin: 10px 0; line-height: 1.6;"><strong>Generate:</strong> Click "Generate Secure Download" for each bundle</li>
                <li style="margin: 10px 0; line-height: 1.6;"><strong>Download:</strong> Use the secure 24-hour link to download your ZIP files</li>
                <li style="margin: 10px 0; line-height: 1.6;"><strong>Build:</strong> Extract and start building amazing projects! 🚀</li>
              </ol>
            </div>
            
            <!-- Order Details -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #333;">📋 Order Details</h4>
              <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Customer:</strong> ${customerName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Approved:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <!-- Security Benefits -->
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 5px solid #28a745;">
              <h4 style="margin-top: 0; color: #155724;">🔒 Security Benefits</h4>
              <ul style="margin: 10px 0; padding-left: 20px; color: #155724;">
                <li style="margin: 5px 0;">Download links expire in 24 hours for security</li>
                <li style="margin: 5px 0;">Only you can access your purchased bundles</li>
                <li style="margin: 5px 0;">Generate new download links anytime from your profile</li>
                <li style="margin: 5px 0;">Full download history and tracking</li>
              </ul>
            </div>
            
            <!-- Support Information -->
            <div style="border-top: 2px solid #e9ecef; padding-top: 25px; margin-top: 40px;">
              <h4 style="color: #333; margin-bottom: 15px;">🛟 Need Help?</h4>
              <p style="color: #666; line-height: 1.6;">
                If you encounter any issues with login or downloads, please contact our team 
                and include your order ID: <strong style="color: #333;">${orderId}</strong>
              </p>
              <p style="color: #666; line-height: 1.6;">
                We're here to help you succeed with your projects!
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Thank you for choosing our platform! 🙏<br>
              <strong>The BundleHub Team</strong>
            </p>
            <div style="margin-top: 15px;">
              <a href="#" style="color: #007cba; text-decoration: none; margin: 0 10px; font-size: 12px;">Support</a>
              <a href="#" style="color: #007cba; text-decoration: none; margin: 0 10px; font-size: 12px;">Community</a>
              <a href="#" style="color: #007cba; text-decoration: none; margin: 0 10px; font-size: 12px;">Documentation</a>
            </div>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    
    console.log(`Secure bundle email sent successfully to ${customerEmail} for ${totalBundles} bundles`)
  } catch (error) {
    console.error('Error sending secure bundle email:', error)
    throw new Error('Failed to send secure bundle email')
  }
}
export async function sendBundleEmailOptimized(
  customerEmail: string,
  customerName: string,
  bundles: Array<{ id: string; name: string; downloadUrl?: string }>,
  orderId: string
): Promise<void> {
  try {
    console.log(`Starting optimized sendBundleEmail for order ${orderId}`)
    console.log(`Customer: ${customerEmail}, Bundles count: ${bundles.length}`)
    
    const transporter = createTransporter()
    
    // Generate secure download links instead of downloading files
    const bundleDownloads = await Promise.all(
      bundles.map(async (bundle) => {
        console.log(`Processing bundle: ${bundle.name}, downloadUrl: ${bundle.downloadUrl}`)
        
        if (bundle.downloadUrl && bundle.downloadUrl.startsWith('s3://')) {
          try {
            // Extract S3 object key
            const s3ObjectKey = bundle.downloadUrl.replace('s3://', '')
            console.log(`Generating signed URL for S3: ${s3ObjectKey}`)
            
            // Generate signed URL with 24-hour expiration
            const { generateSignedDownloadUrl } = await import('@/lib/s3')
            const signedUrl = await generateSignedDownloadUrl(s3ObjectKey, 86400) // 24 hours
            
            console.log(`Generated signed URL for ${bundle.name}`)
            
            return {
              name: bundle.name,
              downloadUrl: signedUrl,
              isAvailable: true
            }
          } catch (error) {
            console.error(`Failed to generate download URL for bundle ${bundle.name}:`, error)
            return {
              name: bundle.name,
              downloadUrl: null,
              isAvailable: false,
              error: 'Download link generation failed'
            }
          }
        } else {
          console.log(`Bundle ${bundle.name} has no S3 downloadUrl or invalid format: ${bundle.downloadUrl}`)
          return {
            name: bundle.name,
            downloadUrl: null,
            isAvailable: false,
            error: 'No download URL configured'
          }
        }
      })
    )
    
    // Generate bundle list for email content
    const bundleList = bundleDownloads.map(bundle => {
      if (bundle.isAvailable && bundle.downloadUrl) {
        return `<li style="margin: 15px 0; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; border-left: 5px solid #28a745;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #155724; font-size: 16px;">${bundle.name}</strong>
              <div style="color: #28a745; font-size: 12px; margin-top: 5px;">✅ Ready for download</div>
            </div>
            <a href="${bundle.downloadUrl}" 
               style="background-color: #28a745; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;
                      display: inline-block; margin-left: 15px;">
              Download ZIP
            </a>
          </div>
        </li>`
      } else {
        return `<li style="margin: 15px 0; padding: 15px; background-color: #f8d7da; border: 1px solid #f1aeb5; border-radius: 8px; border-left: 5px solid #dc3545;">
          <div>
            <strong style="color: #721c24; font-size: 16px;">${bundle.name}</strong>
            <div style="color: #721c24; font-size: 12px; margin-top: 5px;">❌ ${bundle.error || 'Download not available'}</div>
          </div>
        </li>`
      }
    }).join('')
    
    const availableBundles = bundleDownloads.filter(b => b.isAvailable).length
    const totalBundles = bundleDownloads.length
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: '🎉 Your Bundle Purchase has been Approved!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Approved! 🎉</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your bundles are ready for download</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${customerName}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Excellent news! Your payment has been approved and your ${totalBundles} bundle${totalBundles > 1 ? 's are' : ' is'} ready for instant download.
            </p>
            
            ${availableBundles < totalBundles ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                ⚠️ Note: ${availableBundles} of ${totalBundles} bundles are available for download. 
                Please contact support if you need assistance with the unavailable items.
              </p>
            </div>
            ` : ''}
            
            <!-- Bundle Downloads -->
            <div style="margin: 30px 0;">
              <h3 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                📦 Your Bundles
              </h3>
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                ${bundleList}
              </ul>
            </div>
            
            <!-- Download Instructions -->
            <div style="background: linear-gradient(135deg, #e3f2fd, #f0f8ff); padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #2196f3;">
              <h4 style="margin-top: 0; color: #1976d2; font-size: 18px;">📥 Download Instructions</h4>
              <ol style="margin: 15px 0; padding-left: 20px; color: #333;">
                <li style="margin: 8px 0; line-height: 1.5;">Click the <strong>"Download ZIP"</strong> button for each bundle</li>
                <li style="margin: 8px 0; line-height: 1.5;">Save the ZIP files to a secure location on your computer</li>
                <li style="margin: 8px 0; line-height: 1.5;">Extract each ZIP file to access the source code and documentation</li>
                <li style="margin: 8px 0; line-height: 1.5;">Follow the README instructions inside each bundle</li>
                <li style="margin: 8px 0; line-height: 1.5;">Start building amazing projects! 🚀</li>
              </ol>
              
              <div style="background-color: rgba(25, 118, 210, 0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #1976d2; font-size: 14px;">
                  <strong>⏰ Important:</strong> Download links are valid for 24 hours for security reasons. 
                  If links expire, contact support with your order ID for new links.
                </p>
              </div>
            </div>
            
            <!-- Order Details -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #333;">📋 Order Details</h4>
              <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Customer:</strong> ${customerName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Approved:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <!-- Pro Tips -->
            <div style="background: linear-gradient(135deg, #fff3cd, #fff8e1); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 5px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">💡 Pro Tips</h4>
              <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                <li style="margin: 5px 0;">Backup your downloaded bundles to cloud storage</li>
                <li style="margin: 5px 0;">Check for any additional setup requirements in the README files</li>
                <li style="margin: 5px 0;">Join our community for tips and updates</li>
                <li style="margin: 5px 0;">Rate your purchase to help other developers</li>
              </ul>
            </div>
            
            <!-- Support Information -->
            <div style="border-top: 2px solid #e9ecef; padding-top: 25px; margin-top: 40px;">
              <h4 style="color: #333; margin-bottom: 15px;">🛟 Need Help?</h4>
              <p style="color: #666; line-height: 1.6;">
                If you encounter any issues with downloads or need technical support, 
                please contact our team and include your order ID: <strong style="color: #333;">${orderId}</strong>
              </p>
              <p style="color: #666; line-height: 1.6;">
                We're here to help you succeed with your projects!
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Thank you for choosing our platform! 🙏<br>
              <strong>The BundleHub Team</strong>
            </p>
            <div style="margin-top: 15px;">
              <a href="#" style="color: #007cba; text-decoration: none; margin: 0 10px; font-size: 12px;">Support</a>
              <a href="#" style="color: #007cba; text-decoration: none; margin: 0 10px; font-size: 12px;">Community</a>
              <a href="#" style="color: #007cba; text-decoration: none; margin: 0 10px; font-size: 12px;">Documentation</a>
            </div>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    
    console.log(`Optimized bundle email sent successfully to ${customerEmail} (${availableBundles}/${totalBundles} bundles available)`)
  } catch (error) {
    console.error('Error sending optimized bundle email:', error)
    throw new Error('Failed to send bundle email')
  }
}

// Send order rejection email
export async function sendRejectionEmail(
  customerEmail: string,
  customerName: string,
  rejectionReason: string,
  orderId: string
): Promise<void> {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: 'Order Payment Rejected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Payment Rejected</h2>
          <p>Hi ${customerName},</p>
          <p>We regret to inform you that your payment for order <strong>#${orderId}</strong> has been rejected.</p>
          
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Reason for Rejection:</h4>
            <p style="margin-bottom: 0;">${rejectionReason}</p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0056b3;">What's Next?</h4>
            <ol style="margin: 10px 0;">
              <li>Please review the rejection reason above</li>
              <li>If you believe this is an error, contact our support team</li>
              <li>You can submit a new payment with correct details</li>
              <li>Make sure to follow our payment guidelines</li>
            </ol>
          </div>
          
          <p><strong>Order ID:</strong> ${orderId}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <h4>Need Help?</h4>
          <p style="color: #666;">
            If you have questions about this rejection or need assistance with payment, 
            please contact our support team and include your order ID: <strong>${orderId}</strong>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            We apologize for any inconvenience caused.<br>
            The BundleHub Team
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Rejection email sent successfully to ${customerEmail}`)
  } catch (error) {
    console.error('Error sending rejection email:', error)
    throw new Error('Failed to send rejection email')
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('Email connection test successful')
    return true
  } catch (error) {
    console.error('Email connection test failed:', error)
    return false
  }
}

// Export alias for backward compatibility
export const sendBundleEmail = sendBundleEmailWithSecureTokens