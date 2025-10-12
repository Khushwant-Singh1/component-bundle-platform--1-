import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout-form"
import { auth } from "@/lib/auth"

interface CheckoutPageProps {
  params: Promise<{
    bundleId: string
  }>
}

async function getBundle(id: string) {
  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
    return bundle
  } catch (error) {
    console.error("Error fetching bundle:", error)
    return null
  }
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { bundleId } = await params
  const bundle = await getBundle(bundleId)
  
  if (!bundle) {
    return {
      title: "Bundle Not Found - BundleHub",
      description: "The bundle you're looking for doesn't exist.",
    }
  }

  return {
    title: `Checkout - ${bundle.name} - BundleHub`,
    description: `Complete your purchase of ${bundle.name} for ₹${bundle.price.toString()}. Secure checkout with instant delivery.`,
    openGraph: {
      title: `Checkout - ${bundle.name}`,
      description: `Complete your purchase of ${bundle.name} for ₹${bundle.price.toString()}`,
      images: bundle.images[0]?.url ? [bundle.images[0].url] : [],
    },
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { bundleId } = await params
  const bundle = await getBundle(bundleId)
  const session = await auth()

  if (!bundle) {
    notFound()
  }

  // If user is not authenticated, redirect to signup
  if (!session) {
    // This would be handled client-side, but we can also handle server-side
    return (
      <div className="min-h-screen bg-muted/30">
        <nav className="border-b bg-background">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              BundleHub
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Authentication Required
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Login Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Please login or create an account to purchase this bundle.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/auth/user-login">Login</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/signup">Create Account</Link>
                  </Button>
                </div>
                <Button variant="ghost" asChild className="w-full">
                  <Link href={`/bundles/${bundle.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Bundle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            BundleHub
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Secure Checkout
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/bundles/${bundle.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bundle
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <CheckoutForm 
              bundleId={bundle.id}
              bundleName={bundle.name}
              bundlePrice={Number(bundle.price)}
              userEmail={session.user?.email || ""}
              userName={session.user?.name || ""}
            />
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden border">
                    <Image
                      src={bundle.images[0]?.url || "/placeholder.svg"}
                      alt={bundle.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{bundle.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bundle.tags.map((tagRelation, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tagRelation.tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">₹{bundle.price.toString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{bundle.price.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{bundle.price.toString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure 256-bit SSL encryption</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    By completing this purchase, you agree to our{" "}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Email verification</p>
                    <p className="text-muted-foreground">We&apos;ll send an OTP to verify your email address</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">QR code payment</p>
                    <p className="text-muted-foreground">Scan QR code to make payment via UPI</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Upload payment proof</p>
                    <p className="text-muted-foreground">Upload screenshot of payment confirmation</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Admin approval & delivery</p>
                    <p className="text-muted-foreground">Bundle sent to your email after payment approval (2-4 hours)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}