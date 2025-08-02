import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, MoreHorizontal, Edit, Eye, Trash2, Filter, Download, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const bundles = [
  {
    id: 1,
    name: "Dashboard Pro",
    slug: "dashboard-pro",
    category: "Full-Stack",
    price: 49,
    originalPrice: 79,
    sales: 156,
    revenue: 7644,
    rating: 4.9,
    reviews: 127,
    downloads: 2500,
    status: "active",
    featured: true,
    bestseller: true,
    image: "/placeholder.svg?height=80&width=120",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: 2,
    name: "Auth Starter Kit",
    slug: "auth-starter-kit",
    category: "Full-Stack",
    price: 29,
    originalPrice: 49,
    sales: 134,
    revenue: 3886,
    rating: 4.8,
    reviews: 89,
    downloads: 1800,
    status: "active",
    featured: false,
    bestseller: false,
    image: "/placeholder.svg?height=80&width=120",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
  },
  {
    id: 3,
    name: "E-commerce Pro",
    slug: "ecommerce-pro",
    category: "Full-Stack",
    price: 79,
    originalPrice: 129,
    sales: 89,
    revenue: 7031,
    rating: 5.0,
    reviews: 203,
    downloads: 1200,
    status: "active",
    featured: true,
    bestseller: true,
    image: "/placeholder.svg?height=80&width=120",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-19",
  },
  {
    id: 4,
    name: "Landing Page Kit",
    slug: "landing-page-kit",
    category: "Frontend",
    price: 19,
    originalPrice: 39,
    sales: 245,
    revenue: 4655,
    rating: 4.7,
    reviews: 156,
    downloads: 3200,
    status: "active",
    featured: false,
    bestseller: false,
    image: "/placeholder.svg?height=80&width=120",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-17",
  },
  {
    id: 5,
    name: "Blog Template Pro",
    slug: "blog-template-pro",
    category: "Frontend",
    price: 25,
    originalPrice: 45,
    sales: 67,
    revenue: 1675,
    rating: 4.6,
    reviews: 92,
    downloads: 890,
    status: "draft",
    featured: false,
    bestseller: false,
    image: "/placeholder.svg?height=80&width=120",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-16",
  },
]

export default function BundlesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bundles</h1>
          <p className="text-muted-foreground">Manage your component bundles and templates</p>
        </div>
        <Button asChild>
          <Link href="/admin/bundles/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Bundle
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bundles</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bundles</p>
                <p className="text-2xl font-bold">20</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">691</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$24,891</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search bundles..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="fullstack">Full-Stack</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bundles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bundles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative w-20 h-12 rounded-lg overflow-hidden border">
                  <Image src={bundle.image || "/placeholder.svg"} alt={bundle.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{bundle.name}</h3>
                    {bundle.featured && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                    {bundle.bestseller && <Badge className="text-xs bg-orange-500">Bestseller</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{bundle.category}</span>
                    <span>•</span>
                    <span>{bundle.sales} sales</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{bundle.rating}</span>
                      <span>({bundle.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">${bundle.price}</div>
                  {bundle.originalPrice && (
                    <div className="text-sm text-muted-foreground line-through">${bundle.originalPrice}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-semibold">${bundle.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">revenue</div>
                </div>

                <div className="text-center">
                  <Badge
                    variant={
                      bundle.status === "active" ? "default" : bundle.status === "draft" ? "secondary" : "outline"
                    }
                  >
                    {bundle.status}
                  </Badge>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/bundles/${bundle.slug}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/bundles/${bundle.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
