"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  Package,
  Users,
  Download,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  Star,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Stat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
}

interface RecentOrder {
  id: string
  customer: string
  email: string
  bundle: string
  amount: string
  status: string
  date: string
}

interface TopBundle {
  name: string
  sales: number
  revenue: string
  trend: "up" | "down"
  change: string
}

interface RecentReview {
  customer: string
  bundle: string
  rating: number
  comment: string
  date: string
}

interface AdminData {
  stats: Stat[]
  recentOrders: RecentOrder[]
  topBundles: TopBundle[]
  recentReviews: RecentReview[]
}

const iconMap = {
  "Total Revenue": DollarSign,
  "Total Bundles": Package,
  "Total Customers": Users,
  "Total Downloads": Download,
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/admin")
        
        if (!response.ok) {
          throw new Error("Failed to fetch admin data")
        }
        
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error?.message || "Failed to fetch data")
        }
      } catch (err) {
        console.error("Error fetching admin data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading dashboard</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat) => {
          const IconComponent = iconMap[stat.title as keyof typeof iconMap] || DollarSign
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{order.customer}</span>
                      <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.bundle}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{order.amount}</div>
                    <div className="text-xs text-muted-foreground">{order.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Bundles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performing Bundles</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bundles">
                Manage
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topBundles.map((bundle, index) => (
                <div key={bundle.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{bundle.name}</div>
                      <div className="text-sm text-muted-foreground">{bundle.sales} sales</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{bundle.revenue}</div>
                    <div
                      className={`text-xs flex items-center gap-1 ${
                        bundle.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {bundle.trend === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {bundle.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reviews</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reviews">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentReviews.map((review, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.customer}</span>
                    <Badge variant="outline" className="text-xs">
                      {review.bundle}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{review.date}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-2">Add New Bundle</h3>
            <p className="text-sm text-muted-foreground mb-4">Create and publish a new component bundle</p>
            <Link href="/admin/bundles/new">
            <Button
              className="w-full"
              onClick={() => {
              }}
            >
              Create Bundle
            </Button>
                </Link>

          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold mb-2">View Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Check detailed performance metrics</p>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/admin/analytics">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold mb-2">Process Orders</h3>
            <p className="text-sm text-muted-foreground mb-4">Review and manage customer orders</p>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/admin/orders">Manage Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
