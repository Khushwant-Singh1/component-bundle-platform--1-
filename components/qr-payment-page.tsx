"use client"

import { useState } from "react"
import Image from "next/image"
import { QrCode, Upload, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QRPaymentPageProps {
  paymentQr: string
  amount: number
  orderId: string
  onPaymentComplete: () => void
  onBack?: () => void
}

export function QRPaymentPage({ 
  paymentQr, 
  amount, 
  orderId, 
  onPaymentComplete, 
  onBack 
}: QRPaymentPageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadComplete, setUploadComplete] = useState(false)

  const handlePaymentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
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

      setUploadComplete(true)
      onPaymentComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload payment proof")
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadComplete) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Payment Submitted!</h3>
            <p className="text-muted-foreground">
              Your payment proof has been submitted and is being reviewed by our team.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive an email with your bundle download link once the payment is approved (usually within 2-4 hours).
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* QR Payment Section */}
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
              Scan the QR code below to pay ₹{amount}
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
              <p>2. Enter the amount: ₹{amount}</p>
              <p>3. Complete the payment</p>
              <p>4. Take a screenshot of the payment confirmation</p>
              <p>5. Upload the screenshot below</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Payment Proof Section */}
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
                disabled={isUploading}
              />
            </div>
            
            <div className="flex gap-3">
              {onBack && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit Payment Proof"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
