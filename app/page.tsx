// app/page.tsx

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Code2,
  Zap,
  Shield,
  HeartHandshake,
  Star,
  CheckCircle,
  Users,
  Award,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainNavigation } from "@/components/main-navigation"

// Helper to map string names from DB to actual icon components
const iconMap = {
  Code2,
  Zap,
  Shield,
  HeartHandshake,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
}

// Mock data for features, testimonials, and stats since these models don't exist in the schema
const mockFeatures = [
  {
    icon: "Code2",
    title: "Production-Ready Code",
    highlight: "Enterprise Quality",
    description: "Every bundle is built with industry best practices, comprehensive error handling, and optimal performance in mind."
  },
  {
    icon: "Zap",
    title: "Lightning Fast Setup",
    highlight: "< 15 Minutes",
    description: "Get your project running in minutes with our detailed documentation, video tutorials, and one-click deployment guides."
  },
  {
    icon: "Shield",
    title: "Enterprise Security",
    highlight: "Bank-Level",
    description: "Built-in authentication, authorization, data validation, and security best practices to keep your application safe."
  },
  {
    icon: "HeartHandshake",
    title: "Lifetime Support",
    highlight: "Always Here",
    description: "Get help when you need it with our dedicated support team, community forum, and comprehensive documentation."
  }
]

const mockTestimonials = [
  {
    rating: 5,
    content: "BundleHub saved me weeks of development time. The code quality is exceptional and the documentation is crystal clear.",
    name: "Sarah Chen",
    role: "Senior Developer",
    company: "TechCorp",
    avatar: "/placeholder-user.jpg",
    projectSaved: "3 weeks"
  },
  {
    rating: 5,
    content: "The best investment I've made for my development workflow. These bundles are production-ready and well-documented.",
    name: "Marcus Rodriguez",
    role: "Tech Lead",
    company: "StartupXYZ",
    avatar: "/placeholder-user.jpg",
    projectSaved: "2 months"
  },
  {
    rating: 5,
    content: "Outstanding quality and support. I've built three client projects using these bundles and saved countless hours.",
    name: "Emily Johnson",
    role: "Freelance Developer",
    company: "Independent",
    avatar: "/placeholder-user.jpg",
    projectSaved: "4 weeks"
  }
]

const mockStats = [
  {
    icon: "Users",
    value: "2,500+",
    label: "Happy Developers"
  },
  {
    icon: "Award",
    value: "50+",
    label: "Premium Bundles"
  },
  {
    icon: "TrendingUp",
    value: "99.8%",
    label: "Satisfaction Rate"
  },
  {
    icon: "CheckCircle",
    value: "₹20Cr+",
    label: "Time Saved"
  }
]

// Mock data for featured bundles since we'll fetch them client-side later
const mockFeaturedBundles = [
  {
    id: "1",
    name: "E-commerce Dashboard",
    shortDescription: "Complete admin dashboard with analytics, orders, and inventory management",
    price: "2999",
    originalPrice: "4999",
    downloadCount: 1250,
    isBestseller: true,
    images: [{ url: "/placeholder.svg" }],
    tags: [
      { tag: { id: "1", name: "React" } },
      { tag: { id: "2", name: "TypeScript" } },
      { tag: { id: "3", name: "Tailwind" } }
    ]
  },
  {
    id: "2", 
    name: "SaaS Landing Page",
    shortDescription: "Modern landing page with pricing, testimonials, and conversion optimization",
    price: "1999",
    originalPrice: "3499",
    downloadCount: 890,
    isBestseller: false,
    images: [{ url: "/placeholder.svg" }],
    tags: [
      { tag: { id: "1", name: "Next.js" } },
      { tag: { id: "2", name: "Framer Motion" } },
      { tag: { id: "3", name: "SEO" } }
    ]
  },
  {
    id: "3",
    name: "Authentication System", 
    shortDescription: "Complete auth system with login, signup, password reset, and social auth",
    price: "2499",
    originalPrice: "4199",
    downloadCount: 2100,
    isBestseller: true,
    images: [{ url: "/placeholder.svg" }],
    tags: [
      { tag: { id: "1", name: "NextAuth" } },
      { tag: { id: "2", name: "Prisma" } },
      { tag: { id: "3", name: "Security" } }
    ]
  },
  {
    id: "4",
    name: "Blog Platform",
    shortDescription: "Full-featured blog with CMS, comments, and SEO optimization",
    price: "1799",
    originalPrice: "2999",
    downloadCount: 650,
    isBestseller: false,
    images: [{ url: "/placeholder.svg" }],
    tags: [
      { tag: { id: "1", name: "MDX" } },
      { tag: { id: "2", name: "CMS" } },
      { tag: { id: "3", name: "SEO" } }
    ]
  }
]

export default function HomePage() {
  const featuredBundles = mockFeaturedBundles

  // Use mock data for features, testimonials, and stats
  const features = mockFeatures
  const testimonials = mockTestimonials
  const stats = mockStats

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Professional
                </span>
                <br />
                React Components
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Skip months of development with our production-ready component bundles. Built by senior developers,
                tested in real projects, and trusted by 2,500+ developers worldwide.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
                <Link href="/bundles">
                  Browse All Bundles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 h-auto border-2">
                <Link href="#featured">View Featured</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Production Ready
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                TypeScript Support
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Lifetime Updates
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section (updated to use dynamic icons) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              // Get the icon component from the map
              const IconComponent = iconMap[stat.icon as keyof typeof iconMap]
              return (
                <div key={index} className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section (updated to use dynamic icons) */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold">Why Choose BundleHub?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every bundle is crafted by senior developers, tested in production environments, and designed to
              accelerate your development workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              // Get the icon component from the map
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {IconComponent && <IconComponent className="h-7 w-7 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium mb-3">
                          <CheckCircle className="h-3 w-3" />
                          {feature.highlight}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Bundles (now uses fetched data) */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold">Featured Premium Bundles</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Hand-picked collection of our most popular and highest-rated component bundles, trusted by thousands of developers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBundles.length > 0 ? featuredBundles.map((bundle) => (
              <Card
                key={bundle.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
              >
                {/* ... The rest of the card JSX remains identical, it now just maps over the fetched data ... */}
                <CardHeader className="p-0 relative">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={bundle.images[0]?.url || "/placeholder.svg"}
                      alt={bundle.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {bundle.isBestseller && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        BESTSELLER
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      4.8
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{bundle.name}</h3>
                        <div className="text-right">
                          <div className="font-bold text-lg">₹{bundle.price.toString()}</div>
                          <div className="text-xs text-muted-foreground line-through">₹{bundle.originalPrice?.toString()}</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bundle.shortDescription}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {bundle.tags.slice(0, 3).map((tagRelation) => (
                          <Badge key={tagRelation.tag.id} variant="secondary" className="text-xs">
                            {tagRelation.tag.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Key Features:</div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {["Modern UI", "TypeScript", "Responsive", "Dark Mode"].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{bundle.downloadCount} downloads</span>
                        <span>40% off</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                    <Link href={`/bundles/${bundle.id}`}>View Details & Buy</Link>
                  </Button>
                </CardFooter>
              </Card>
            )) : (
              // Show placeholder cards when no bundles are available
              [...Array(4)].map((_, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                  <CardHeader className="p-0 relative">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No bundles available
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">Sample Bundle {index + 1}</h3>
                          <div className="text-right">
                            <div className="font-bold text-lg">₹999</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Sample bundle description</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button asChild className="w-full" disabled>
                      <span>Coming Soon</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/bundles">
                View All 50+ Bundles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials (now uses fetched data) */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold">What Developers Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers who have accelerated their projects with our premium component bundles.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* ... The rest of the card JSX remains identical ... */}
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={60}
                        height={60}
                        className="rounded-full border-2 border-muted"
                      />
                      <div className="flex-1">
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">Saved</div>
                        <div className="text-xs text-muted-foreground">{testimonial.projectSaved}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">Ready to Build Something Amazing?</h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join 2,500+ developers who are building faster with our premium component bundles. 
              Start your next project with production-ready components.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6 h-auto">
                <Link href="/bundles">
                  Browse All Bundles
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 h-auto border-2 border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link
                href="/"
                className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                BundleHub
              </Link>
              <p className="text-sm text-muted-foreground">
                Professional React component bundles for modern developers. Build faster, launch sooner.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Products</h3>
              <div className="space-y-2 text-sm">
                <Link href="/bundles" className="block text-muted-foreground hover:text-foreground transition-colors">
                  All Bundles
                </Link>
                <Link href="/bundles?featured=true" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Featured
                </Link>
                <Link href="/bundles?bestseller=true" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Bestsellers
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Connect</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Twitter
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Discord
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BundleHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}