import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, MoreHorizontal, Edit, Eye, Trash2, Filter, Download, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeleteBundleDialog } from '@/components/delete-bundle-dialog'

/* ------------------------------------------------------------------ */
/* Data fetch                                                         */
/* ------------------------------------------------------------------ */
async function getBundles() {
  return prisma.bundle.findMany({
    include: {
      _count: { select: { orders: true } }, // sales = #completed orders
      images: true,
      reviews: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/* ------------------------------------------------------------------ */
/* Aggregations                                                       */
/* ------------------------------------------------------------------ */
async function getStats(bundles: Awaited<ReturnType<typeof getBundles>>) {
  const [totalBundles, activeBundles, totalSales, totalRevenue] = await Promise.all([
    prisma.bundle.count(),
    prisma.bundle.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: 'COMPLETED' } }),
  ])

  return {
    totalBundles,
    activeBundles,
    totalSales,
    totalRevenue: totalRevenue._sum.totalAmount?.toNumber() ?? 0,
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default async function BundlesPage() {
  const bundles = await getBundles()
  const stats = await getStats(bundles)

  if (!bundles.length) notFound()

  return (
    <div className="space-y-6">
      {/* Header unchanged */}
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
                <p className="text-2xl font-bold">{stats.totalBundles}</p>
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
                <p className="text-2xl font-bold">{stats.activeBundles}</p>
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
                <p className="text-2xl font-bold">{stats.totalSales}</p>
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
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
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
            {bundles.map((b) => {
              const sales = b._count.orders
              const revenue = sales * Number(b.price)
              const averageRating = b.reviews.length > 0 
                ? (b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length).toFixed(1)
                : '0.0'
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden border">
                    <Image
                      src={b.images[0]?.url ?? '/placeholder.svg'}
                      alt={b.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{b.name}</h3>
                      {b.isFeatured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                      {b.isBestseller && (
                        <Badge className="text-xs bg-orange-500">Bestseller</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{b.category}</span>
                      <span>•</span>
                      <span>{sales} sales</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{averageRating}</span>
                        <span>({b.reviews.length})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">₹{Number(b.price).toFixed(2)}</div>
                    {b.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        ₹{Number(b.originalPrice).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">₹{revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">revenue</div>
                  </div>

                  <div className="text-center">
                    <Badge
                      variant={
                        b.isActive
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
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
                        <Link href={`/bundles/${b.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/bundles/${b.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DeleteBundleDialog bundleId={b.id} bundleName={b.name} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

