import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, Eye, DollarSign, ShoppingCart, Globe, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const analyticsData = {
  overview: [
    {
      title: "Total Revenue",
      value: "$47,892",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      description: "vs last month",
    },
    {
      title: "Total Orders",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      icon: ShoppingCart,
      description: "vs last month",
    },
    {
      title: "Page Views",
      value: "24,891",
      change: "+8.2%",
      trend: "up",
      icon: Eye,
      description: "vs last month",
    },
    {
      title: "Unique Visitors",
      value: "18,429",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      description: "vs last month",
    },
  ],
  topBundles: [
    {
      name: "Dashboard Pro",
      views: 4521,
      sales: 156,
      revenue: 7644,
      conversionRate: 3.45,
    },
    {
      name: "E-commerce Pro",
      views: 3892,
      sales: 89,
      revenue: 7031,
      conversionRate: 2.29,
    },
    {
      name: "Auth Starter Kit",
      views: 5234,
      sales: 134,
      revenue: 3886,
      conversionRate: 2.56,
    },
    {
      name: "Landing Page Kit",
      views: 6789,
      sales: 245,
      revenue: 4655,
      conversionRate: 3.61,
    },
  ],
  trafficSources: [
    { source: "Direct", visitors: 8429, percentage: 45.8 },
    { source: "Google Search", visitors: 5234, percentage: 28.4 },
    { source: "Social Media", visitors: 2891, percentage: 15.7 },
    { source: "Referrals", visitors: 1234, percentage: 6.7 },
    { source: "Email", visitors: 641, percentage: 3.4 },
  ],
  recentActivity: [
    {
      type: "sale",
      description: "Dashboard Pro purchased by John Doe",
      amount: "$49",
      time: "2 minutes ago",
    },
    {
      type: "view",
      description: "E-commerce Pro viewed 15 times",
      amount: null,
      time: "5 minutes ago",
    },
    {
      type: "sale",
      description: "Auth Starter Kit purchased by Sarah Chen",
      amount: "$29",
      time: "12 minutes ago",
    },
    {
      type: "review",
      description: "New 5-star review for Dashboard Pro",
      amount: null,
      time: "1 hour ago",
    },
  ],
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your marketplace performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.overview.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Bundles */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topBundles.map((bundle, index) => (
                <div key={bundle.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{bundle.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bundle.views.toLocaleString()} views • {bundle.sales} sales
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${bundle.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{bundle.conversionRate}% conversion</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">{source.visitors.toLocaleString()} visitors</div>
                    <Badge variant="outline" className="text-xs">
                      {source.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "sale"
                        ? "bg-green-500"
                        : activity.type === "view"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm">{activity.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  {activity.amount && (
                    <Badge variant="outline" className="text-green-600">
                      {activity.amount}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Revenue chart would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Category breakdown chart would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
