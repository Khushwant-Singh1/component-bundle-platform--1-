import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const orders = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    bundles: ["Dashboard Pro"],
    amount: 49,
    status: "completed",
    paymentMethod: "stripe",
    paymentId: "pi_1234567890",
    createdAt: "2024-01-20T10:30:00Z",
    completedAt: "2024-01-20T10:31:00Z",
  },
  {
    id: "ORD-002",
    customer: {
      name: "Sarah Chen",
      email: "sarah@example.com",
    },
    bundles: ["Auth Starter Kit", "Landing Page Kit"],
    amount: 48,
    status: "completed",
    paymentMethod: "stripe",
    paymentId: "pi_0987654321",
    createdAt: "2024-01-20T08:15:00Z",
    completedAt: "2024-01-20T08:16:00Z",
  },
  {
    id: "ORD-003",
    customer: {
      name: "Mike Rodriguez",
      email: "mike@example.com",
    },
    bundles: ["E-commerce Pro"],
    amount: 79,
    status: "pending",
    paymentMethod: "stripe",
    paymentId: "pi_1122334455",
    createdAt: "2024-01-20T06:45:00Z",
    completedAt: null,
  },
  {
    id: "ORD-004",
    customer: {
      name: "Emily Johnson",
      email: "emily@example.com",
    },
    bundles: ["Dashboard Pro", "Auth Starter Kit"],
    amount: 78,
    status: "completed",
    paymentMethod: "stripe",
    paymentId: "pi_5566778899",
    createdAt: "2024-01-19T16:20:00Z",
    completedAt: "2024-01-19T16:21:00Z",
  },
  {
    id: "ORD-005",
    customer: {
      name: "David Brown",
      email: "david@example.com",
    },
    bundles: ["SaaS Starter Pro"],
    amount: 99,
    status: "failed",
    paymentMethod: "stripe",
    paymentId: "pi_9988776655",
    createdAt: "2024-01-19T14:10:00Z",
    completedAt: null,
  },
]

const orderStats = [
  {
    title: "Total Orders",
    value: "1,247",
    change: "+12.5%",
    icon: ShoppingCart,
    color: "blue",
  },
  {
    title: "Completed Orders",
    value: "1,189",
    change: "+8.2%",
    icon: CheckCircle,
    color: "green",
  },
  {
    title: "Pending Orders",
    value: "23",
    change: "+45%",
    icon: Clock,
    color: "orange",
  },
  {
    title: "Total Revenue",
    value: "$47,892",
    change: "+15.3%",
    icon: DollarSign,
    color: "purple",
  },
]

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and payments</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {orderStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change} vs last month</p>
                </div>
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search orders, customers..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{order.id}</span>
                    <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{order.customer.name}</div>
                    <div>{order.customer.email}</div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <div className="font-medium mb-1">Bundles:</div>
                    <div className="text-muted-foreground">{order.bundles.join(", ")}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-lg">${order.amount}</div>
                  <div className="text-sm text-muted-foreground capitalize">{order.paymentMethod}</div>
                </div>

                <div className="text-right text-sm text-muted-foreground">
                  <div>{formatDate(order.createdAt)}</div>
                  {order.completedAt && <div className="text-green-600">Completed {formatDate(order.completedAt)}</div>}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </DropdownMenuItem>
                    {order.status === "completed" && (
                      <DropdownMenuItem className="text-destructive">Process Refund</DropdownMenuItem>
                    )}
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
