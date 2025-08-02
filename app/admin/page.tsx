"use client"

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
} from "lucide-react"
import Link from "next/link"

const stats = [
  {
    title: "Total Revenue",
    value: "$12,847",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Total Bundles",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Package,
    description: "active bundles",
  },
  {
    title: "Total Customers",
    value: "1,247",
    change: "+18.2%",
    trend: "up",
    icon: Users,
    description: "registered users",
  },
  {
    title: "Total Downloads",
    value: "8,429",
    change: "+7.3%",
    trend: "up",
    icon: Download,
    description: "this month",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    bundle: "Dashboard Pro",
    amount: "$49",
    status: "completed",
    date: "2 hours ago",
  },
  {
    id: "ORD-002",
    customer: "Sarah Chen",
    email: "sarah@example.com",
    bundle: "Auth Starter Kit",
    amount: "$29",
    status: "completed",
    date: "4 hours ago",
  },
  {
    id: "ORD-003",
    customer: "Mike Rodriguez",
    email: "mike@example.com",
    bundle: "E-commerce Pro",
    amount: "$79",
    status: "pending",
    date: "6 hours ago",
  },
  {
    id: "ORD-004",
    customer: "Emily Johnson",
    email: "emily@example.com",
    bundle: "Landing Page Kit",
    amount: "$19",
    status: "completed",
    date: "8 hours ago",
  },
]

const topBundles = [
  {
    name: "Dashboard Pro",
    sales: 156,
    revenue: "$7,644",
    trend: "up",
    change: "+23%",
  },
  {
    name: "E-commerce Pro",
    sales: 89,
    revenue: "$7,031",
    trend: "up",
    change: "+18%",
  },
  {
    name: "Auth Starter Kit",
    sales: 134,
    revenue: "$3,886",
    trend: "up",
    change: "+12%",
  },
  {
    name: "SaaS Starter Pro",
    sales: 67,
    revenue: "$6,633",
    trend: "down",
    change: "-5%",
  },
]

const recentReviews = [
  {
    customer: "Alex Thompson",
    bundle: "Dashboard Pro",
    rating: 5,
    comment: "Excellent quality code and documentation. Saved me weeks of work!",
    date: "1 day ago",
  },
  {
    customer: "Lisa Wang",
    bundle: "Auth Starter Kit",
    rating: 5,
    comment: "Perfect authentication solution. Easy to integrate and customize.",
    date: "2 days ago",
  },
  {
    customer: "David Brown",
    bundle: "E-commerce Pro",
    rating: 4,
    comment: "Great bundle with comprehensive features. Minor setup issues but support was helpful.",
    date: "3 days ago",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
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
        ))}
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
              {recentOrders.map((order) => (
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
              {topBundles.map((bundle, index) => (
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
            {recentReviews.map((review, index) => (
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
