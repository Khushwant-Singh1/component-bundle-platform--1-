"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Loader2, QrCode, Upload, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface CheckoutFormProps {
  bundleId: string
  bundleName: string
  bundlePrice: number
  userEmail?: string
  userName?: string
}

type CheckoutStep = "contact" | "verify" | "payment" | "upload" | "complete"

export function CheckoutForm({ bundleId, bundlePrice, userEmail = "", userName = "" }: CheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("contact")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState("")
  const [customerData, setCustomerData] = useState({ 
    name: userName, 
    email: userEmail 
  })
  const [otp, setOtp] = useState("")
  const [paymentQr, setPaymentQr] = useState("")
  const router = useRouter()

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const name = formData.get("name") as string
      const email = formData.get("email") as string

      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId, name, email }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to create order")
      }

      setCustomerData({ name, email })
      setOrderId(data.orderId)
      setCurrentStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/checkout/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, otp }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Invalid OTP")
      }

      setPaymentQr(data.paymentQr)
      setCurrentStep("payment")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      formData.append("orderId", orderId)

      const response = await fetch("/api/checkout/upload-payment", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to upload payment proof")
      }

      setCurrentStep("complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload payment proof")
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/checkout/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        throw new Error("Failed to resend OTP")
      }

      setError("")
    } catch {
      setError("Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStep === "contact") {
    return (
      <form onSubmit={handleContactSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                type="text" 
                placeholder="John Doe" 
                defaultValue={userName}
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                defaultValue={userEmail}
                required 
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">We&apos;ll send an OTP to verify your email</p>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            "Continue to Verification"
          )}
        </Button>
      </form>
    )
  }

  if (currentStep === "verify") {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Verify Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a 6-digit OTP to <strong>{customerData.email}</strong>
            </p>
            
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input 
                  id="otp" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  maxLength={6}
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>

            <Button 
              variant="outline" 
              onClick={resendOtp}
              disabled={isLoading}
              className="w-full"
            >
              Resend OTP
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "payment") {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan the QR code below to pay ₹{bundlePrice}
              </p>
              
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  {paymentQr ? (
                    <Image 
                      src={paymentQr} 
                      alt="Payment QR Code" 
                      width={200} 
                      height={200}
                      className="mx-auto"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium">Payment Instructions:</p>
                <p>1. Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                <p>2. Enter the amount: ₹{bundlePrice}</p>
                <p>3. Complete the payment</p>
                <p>4. Take a screenshot of the payment confirmation</p>
                <p>5. Upload the screenshot below</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setCurrentStep("upload")}
              size="lg" 
              className="w-full"
            >
              I&apos;ve Made the Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "upload") {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Payment Proof
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please upload a screenshot of your payment confirmation
            </p>
            
            <form onSubmit={handlePaymentUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="screenshot">Payment Screenshot</Label>
                <Input 
                  id="screenshot" 
                  name="screenshot"
                  type="file" 
                  accept="image/*"
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit Payment Proof"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "complete") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Order Submitted!</h3>
            <p className="text-muted-foreground">
              Thank you for your purchase! Your payment proof has been submitted and is being reviewed by our team.
            </p>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive an email with your bundle download link once the payment is approved (usually within 2-4 hours).
            </p>
            <Button 
              onClick={() => router.push("/")}
              className="mt-4"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}