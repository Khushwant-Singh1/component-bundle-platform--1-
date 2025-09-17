import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, Download, ExternalLink, Star, Shield, Clock, Users, Code2, Zap, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


// Mock data - in real app this would come from API/database
/* ------------------------------------------------------------------ */
/* Server-side data fetch (App Router)                                */
/* If you use Pages Router, move this to getServerSideProps           */
/* ------------------------------------------------------------------ */
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  // Optional: generate /bundles/[id] at build time
  const bundles = await prisma.bundle.findMany({ select: { id: true, slug: true } })
  // Return both slug and id as possible routes
  return bundles.flatMap((b) => [
    { id: b.slug },
    { id: b.id }
  ])
}


interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BundleDetailPage({ params }: PageProps) {
  const { id } = await params
  // console.log('Looking for bundle with slug:', id)
  
  // Let's also check what bundles exist in the database
  const allBundles = await prisma.bundle.findMany({ select: { id: true, slug: true, name: true } })
  // console.log('All bundles in database:', allBundles)
  
  // Try to find by slug first, then by ID if not found
  let bundle = await prisma.bundle.findUnique({
    where: { slug: id },
    include: {
      images:   { orderBy: { order: 'asc' } },
      tags:     { include: { tag: true } },
      features: { orderBy: { order: 'asc' } },
      techStack:{ include: { tech: true } },
      includes: { orderBy: { order: 'asc' } },
      _count:   { select: { reviews: true } },
    },
  })
  
  // If not found by slug, try by ID
  if (!bundle) {
    bundle = await prisma.bundle.findUnique({
      where: { id: id },
      include: {
        images:   { orderBy: { order: 'asc' } },
        tags:     { include: { tag: true } },
        features: { orderBy: { order: 'asc' } },
        techStack:{ include: { tech: true } },
        includes: { orderBy: { order: 'asc' } },
        _count:   { select: { reviews: true } },
      },
    })
  }
  
  // console.log('bundle', bundle)
  if (!bundle) notFound()


    const mapped = {
    id: bundle.id,
    name: bundle.name,
    price: Number(bundle.price),
    originalPrice: Number(bundle.originalPrice ?? bundle.price),
    images: bundle.images.map((i) => i.url),
    tags: bundle.tags.map((t) => t.tag.name),
    shortDescription: bundle.shortDescription,
    description: bundle.description,
    features: bundle.features.map((f) => f.description),
    techStack: bundle.techStack.map((t) => t.tech.name),
    setupTime: bundle.setupTime,
    demoUrl: bundle.demoUrl ?? '#',
    includes: bundle.includes.map((i) => i.description),
    rating: 4.9, // or compute from reviews
    reviews: bundle._count.reviews,
    lastUpdated: '2 days ago', // derive from updatedAt if you wish
    downloads: `${bundle.downloadCount}+`,
    category: bundle.category,
    difficulty: bundle.difficulty,
    estimatedValue: bundle.estimatedValue ?? '₹2,00,000+',
  }
  
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            BundleHub
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/bundles" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Bundles
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Contact
            </Link>
            <Button size="sm" asChild>
              <Link href="/bundles">Browse More</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8 hover:bg-muted">
          <Link href="/bundles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bundles
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Images and Preview */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <div className="aspect-video relative overflow-hidden rounded-xl border-2 shadow-lg">
                <Image src={mapped.images[0] || "/placeholder.svg"} alt={mapped.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button size="lg" className="bg-white/90 text-black hover:bg-white">
                    <Play className="mr-2 h-5 w-5" />
                    View Live Demo
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {mapped.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video relative overflow-hidden rounded-lg border cursor-pointer hover:border-primary transition-colors"
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${mapped.name} preview ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs for detailed information */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                <TabsTrigger value="setup">Setup</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <h3 className="text-2xl font-bold mb-4">About This Bundle</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{mapped.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Perfect For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• SaaS applications and startups</li>
                        <li>• Internal business tools</li>
                        <li>• Client dashboard projects</li>
                        <li>• Data visualization platforms</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Key Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Save 40+ hours of development</li>
                        <li>• Production-ready from day one</li>
                        <li>• Fully customizable and extensible</li>
                        <li>• Regular updates and improvements</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Feature List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {mapped.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tech" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Technology Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Frontend Technologies</h4>
                        <div className="space-y-2">
                          {mapped.techStack.slice(0, 4).map((tech, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{tech}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Backend & Tools</h4>
                        <div className="space-y-2">
                          {mapped.techStack.slice(4).map((tech, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm">{tech}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="setup" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold">Download & Extract</h4>
                          <p className="text-sm text-muted-foreground">
                            Download the bundle and extract to your project directory
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold">Install Dependencies</h4>
                          <p className="text-sm text-muted-foreground">
                            Run npm install to install all required packages
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          3
                        </div>
                        <div>
                          <h4 className="font-semibold">Configure Environment</h4>
                          <p className="text-sm text-muted-foreground">
                            Set up your environment variables and database connection
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          4
                        </div>
                        <div>
                          <h4 className="font-semibold">Start Development</h4>
                          <p className="text-sm text-muted-foreground">
                            Run npm run dev and start customizing your dashboard
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Pricing and Purchase */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Pricing Card */}
            <Card className="lg:sticky lg:top-0 border-2 shadow-xl overflow-hidden">
              {/* Discount badge - responsive positioning */}
              <div className="absolute -right-8 sm:-right-12 top-3 sm:top-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 sm:px-12 py-1 transform rotate-45 text-xs sm:text-sm font-bold shadow-lg">
                {Math.round(((mapped.originalPrice - mapped.price) / mapped.originalPrice) * 100)}% OFF
              </div>

              <CardHeader className="text-center space-y-3 sm:space-y-4 pb-2 px-4 sm:px-6">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold leading-tight break-words">{mapped.name}</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-snug px-2 sm:px-0">
                    {mapped.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">({mapped.reviews} reviews)</span>
                </div>
              </CardHeader>

                            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Price section with enhanced visual - responsive */}
                <div className="bg-muted/50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 border-y">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${mapped.price}
                    </span>
                    <div className="text-center sm:text-right">
                      <div className="text-base sm:text-lg text-muted-foreground line-through">
                        ${mapped.originalPrice}
                      </div>
                      <div className="text-xs sm:text-sm text-green-600 font-semibold">
                        Save ${mapped.originalPrice - mapped.price}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-center text-muted-foreground mt-1 px-2">
                    One-time purchase • Commercial license included
                  </div>
                </div>

                {/* Key features highlight - responsive */}
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm font-medium">Bundle highlights:</div>
                  <ul className="space-y-1 sm:space-y-1.5">
                    {mapped.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-tight break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buttons - responsive layout */}
                <div className="space-y-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full text-base sm:text-lg h-12 sm:h-14 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                    asChild
                  >
                    <Link href="/checkout">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative">Buy Now - ${mapped.price}</span>
                    </Link>
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-10 sm:h-12 hover:bg-muted/50 transition-colors text-sm sm:text-base"
                      asChild
                    >
                      <Link href={mapped.demoUrl} target="_blank">
                        <ExternalLink className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Live Demo</span>
                        <span className="sm:hidden">Demo</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-10 sm:h-12 hover:bg-muted/50 transition-colors text-sm sm:text-base"
                    >
                      <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Tags - responsive wrapping */}
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                  {mapped.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Trust signals - responsive layout */}
                <div className="text-center space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="font-medium">30-day money-back guarantee</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>Instant download</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bundle Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Setup Time</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {mapped.setupTime}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Downloads</div>
                    <div className="font-semibold">{mapped.downloads}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-semibold">{mapped.category}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Difficulty</div>
                    <div className="font-semibold">{mapped.difficulty}</div>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                  <div className="text-lg font-bold text-green-600">{mapped.estimatedValue}</div>
                  <div className="text-xs text-muted-foreground">If built from scratch</div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mapped.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">How do I get the bundle after purchase?</AccordionTrigger>
                <AccordionContent>
                  After completing your purchase, you'll receive an email with download links and access instructions
                  within 2 hours. The email will include the complete source code, comprehensive documentation, video
                  tutorials, and setup guide.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">What's your refund policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day money-back guarantee. If you're not satisfied with the bundle for any reason,
                  contact us within 30 days of purchase for a full refund. No questions asked.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">Do you provide support and updates?</AccordionTrigger>
                <AccordionContent>
                  Yes! We provide 6 months of free updates and email support for setup questions and bug fixes. Premium
                  support includes code customization help and priority responses within 24 hours.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">Can I use this for commercial projects?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! All our bundles come with a commercial license. You can use them in unlimited personal and
                  commercial projects, including client work and SaaS applications. The only restriction is that you
                  cannot resell the bundle itself.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">What if I need help with customization?</AccordionTrigger>
                <AccordionContent>
                  Our bundles are designed to be easily customizable. We provide detailed documentation and examples for
                  common customizations. If you need additional help, our premium support team can assist with specific
                  customization requests.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 py-12 bg-muted/30 rounded-2xl">
          <div className="text-center space-y-8">
            <h3 className="text-2xl font-bold">Why Developers Trust BundleHub</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold">Secure & Reliable</h4>
                <p className="text-sm text-muted-foreground">All code is security-audited and follows best practices</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold">10,000+ Developers</h4>
                <p className="text-sm text-muted-foreground">Trusted by developers at top companies worldwide</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                  <Code2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold">Production Ready</h4>
                <p className="text-sm text-muted-foreground">Battle-tested code used in real applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
