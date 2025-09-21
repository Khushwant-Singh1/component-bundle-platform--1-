import { NextRequest, NextResponse } from "next/server"
import { sendBundleEmail } from "@/lib/email"
import { requireAdmin } from "@/lib/auth"

/**
 * Test email with attachments - Admin only
 * This is a testing endpoint to verify email attachment functionality
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin()

    const body = await request.json()
    const { 
      customerEmail, 
      customerName = "Test Customer",
      bundles = []
    } = body

    if (!customerEmail) {
      return NextResponse.json(
        { error: { message: "Customer email is required" } },
        { status: 400 }
      )
    }

    if (!bundles || bundles.length === 0) {
      return NextResponse.json(
        { error: { message: "At least one bundle is required for testing" } },
        { status: 400 }
      )
    }

    // Send test email with attachments
    await sendBundleEmail(
      customerEmail,
      customerName,
      bundles,
      "TEST-ORDER-" + Date.now()
    )

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${customerEmail} with ${bundles.length} bundle(s)`,
    })

  } catch (error) {
    console.error("Test email error:", error)
    
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : "Failed to send test email" 
        } 
      },
      { status: 500 }
    )
  }
}
