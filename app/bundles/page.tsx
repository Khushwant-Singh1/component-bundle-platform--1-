// app/bundles/page.tsx

import Link from "next/link"
import Image from "next/image"
import { Search, Star, CheckCircle, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { prisma } from "@/lib/db" // Import your Prisma client
import { Prisma } from "@prisma/client"

// This is a Server Component, so we can make it async
export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 1. Get search, filter, and sort parameters from the URL (await searchParams in Next.js 15+)
  const params = await searchParams
  const searchQuery = typeof params.q === "string" ? params.q : undefined
  const categoryFilter = typeof params.category === "string" ? params.category : "all"
  const sortBy = typeof params.sort === "string" ? params.sort : "newest"

  // 2. Build the dynamic WHERE clause for Prisma
  const where: Prisma.BundleWhereInput = {}
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { shortDescription: { contains: searchQuery, mode: "insensitive" } },
      { 
        tags: { 
          some: {
            tag: {
              name: { contains: searchQuery, mode: "insensitive" }
            }
          }
        }
      },
    ]
  }
  if (categoryFilter && categoryFilter !== "all") {
    if (categoryFilter === "bestseller") {
      where.isBestseller = true
    } else {
      where.category = categoryFilter
    }
  }

  // 3. Build the dynamic ORDER BY clause for Prisma
  const orderBy: Prisma.BundleOrderByWithRelationInput = {}
  switch (sortBy) {
    case "popular":
      orderBy.downloadCount = "desc"
      break
    case "price-low":
      orderBy.price = "asc"
      break
    case "price-high":
      orderBy.price = "desc"
      break
    case "rating":
      orderBy.viewCount = "desc" // Using viewCount as a proxy for rating since rating doesn't exist
      break
    default: // "newest"
      orderBy.createdAt = "desc"
      break
  }

  // 4. Fetch data and counts in parallel for performance
  const [bundles, counts] = await Promise.all([
    prisma.bundle.findMany({ 
      where, 
      orderBy,
      include: {
        images: true,
        tags: {
          include: {
            tag: true
          }
        },
        features: true,
        reviews: true,
      }
    }),
    prisma.$transaction([
      prisma.bundle.count(),
      prisma.bundle.count({ where: { category: "frontend" } }),
      prisma.bundle.count({ where: { category: "fullstack" } }),
      prisma.bundle.count({ where: { isBestseller: true } }),
    ]),
  ])

  const filterCategories = [
    { value: "all", label: "All Bundles", count: counts[0] },
    { value: "frontend", label: "Frontend", count: counts[1] },
    { value: "fullstack", label: "Full-Stack", count: counts[2] },
    { value: "bestseller", label: "Bestsellers", count: counts[3] },
  ]

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
            <Link href="/bundles" className="text-foreground font-semibold">
              Bundles
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Contact
            </Link>
            <Button size="sm" asChild>
              <Link href="/bundles">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold">
              All Bundles
              <span className="block text-2xl lg:text-3xl text-muted-foreground font-normal mt-2">
                {counts[0]}+ Production-Ready Components
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Browse our complete collection of battle-tested, enterprise-grade components and templates. Each bundle
              saves you weeks of development time.
            </p>
          </div>

          {/* Search and Filter */}
          {/* NOTE: For a full interactive experience, search/sort would be in a client component that updates the URL. */}
          {/* This example uses simple Links for categories to demonstrate the server-side filtering. */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search bundles, technologies, or features..."
                  className="pl-12 h-14 text-lg border-2 focus:border-primary"
                />
              </div>
              {/* This would ideally be a client component to handle form submission and update URL params */}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {filterCategories.map((category) => (
                <Button key={category.value} variant={categoryFilter === category.value ? "default" : "outline"} size="lg" asChild>
                  <Link href={`/bundles?category=${category.value}`} className="h-12 px-6">
                    {category.label}
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Map over the fetched bundles */}
            {bundles.map((bundle) => (
              <Card
                key={bundle.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
              >
                {/* All the card content is the same, just using dynamic data */}
                <CardHeader className="p-0 relative">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={bundle.images[0]?.url || "/placeholder.jpg"}
                      alt={bundle.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {bundle.isBestseller && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        BESTSELLER
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      4.8
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {bundle.setupTime} setup
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">
                          {bundle.name}
                        </h3>
                        <div className="text-right">
                          <div className="font-bold text-xl">₹{bundle.price.toString()}</div>
                          <div className="text-xs text-muted-foreground line-through">
                            {bundle.originalPrice ? `₹${bundle.originalPrice.toString()}` : ''}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bundle.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {bundle.tags.slice(0, 3).map((tagRelation) => (
                          <Badge key={tagRelation.tag.id} variant="secondary" className="text-xs">
                            {tagRelation.tag.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Key Features:</div>
                        <div className="space-y-1">
                          {bundle.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              <span className="truncate">{feature.description}</span>
                            </div>
                          ))}
                          {bundle.features.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{bundle.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{bundle.reviews.length} reviews</span>
                        </div>
                        <span>Updated {new Date(bundle.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 space-y-2">
                  <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link href={`/bundles/${bundle.slug}`}>View Details & Buy</Link>
                  </Button>
                  <div className="text-center">
                    {bundle.originalPrice && (
                      <span className="text-xs text-green-600 font-medium">
                        Save ₹{(Number(bundle.originalPrice) - Number(bundle.price)).toFixed(0)} (
                        {Math.round(((Number(bundle.originalPrice) - Number(bundle.price)) / Number(bundle.originalPrice)) * 100)}% off)
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* You can add dynamic pagination here */}
        </div>
      </section>
    </div>
  )
}