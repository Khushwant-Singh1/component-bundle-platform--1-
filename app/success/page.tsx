import Link from "next/link"
import { CheckCircle, Download, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            BundleHub
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold">Payment Successful!</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your bundle is being prepared for delivery.
            </p>
          </div>

          {/* Order Details */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-mono">#BH-2024-001234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bundle:</span>
                <span className="font-medium">Dashboard Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">$49.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">john@example.com</span>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                What happens next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Check your email</p>
                    <p className="text-sm text-muted-foreground">We've sent a confirmation to your email address</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Download link coming soon</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive your bundle download link within 2 hours
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Start building</p>
                    <p className="text-sm text-muted-foreground">Follow the included setup guide to get started</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/bundles">
                  Browse More Bundles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Need help? Check our{" "}
              <Link href="/faq" className="underline">
                FAQ
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="underline">
                contact support
              </Link>
            </p>
          </div>

          {/* Additional Info */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-blue-900 dark:text-blue-100">30-Day Money-Back Guarantee</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Not satisfied? Contact us within 30 days for a full refund.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
