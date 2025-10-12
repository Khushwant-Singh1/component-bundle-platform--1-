import Link from "next/link"
import { CheckCircle, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getBundle(id: string) {
  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        downloadUrl: true,
        description: true,
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

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const bundleId = typeof params.bundle === "string" ? params.bundle : null

  if (!bundleId) {
    notFound()
  }

  const bundle = await getBundle(bundleId)

  if (!bundle) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            BundleHub
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your bundle is ready for download.
            </p>
          </div>

          {/* Bundle Details */}
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Purchase</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Completed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{bundle.name}</h3>
                <p className="text-muted-foreground">{bundle.description}</p>
                <div className="flex flex-wrap gap-1">
                  {bundle.tags.map((tagRelation, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tagRelation.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-semibold text-lg">₹{bundle.price.toString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Download Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Your Bundle
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your bundle download link has been sent to your email. You can also download it directly using the button below.
                </p>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href={bundle.downloadUrl || "#"}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Now
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What&apos;s Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Extract the bundle</p>
                    <p className="text-muted-foreground">Unzip the downloaded file to your desired location</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Follow the setup guide</p>
                    <p className="text-muted-foreground">Check the README.md file for installation instructions</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Start building</p>
                    <p className="text-muted-foreground">Customize the components to fit your project needs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/bundles">
                Browse More Bundles
              </Link>
            </Button>
            <Button asChild>
              <Link href="/contact">
                Need Help? Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>
              Keep your download link safe. You can re-download your bundle anytime from your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}