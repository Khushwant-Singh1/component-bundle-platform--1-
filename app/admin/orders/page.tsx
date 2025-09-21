import { Suspense } from "react"
import { OrdersTable } from "@/components/admin/orders-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { prisma, withRetry } from "@/lib/db"
import { AlertTriangle, Database } from "lucide-react"

async function getOrderStats() {
  try {
    const result = await withRetry(async () => {
      const [
        totalOrders,
        pendingOrders,
        paymentUploadedOrders,
        approvedOrders,
        rejectedOrders,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "PAYMENT_UPLOADED" } }),
        prisma.order.count({ where: { status: "APPROVED" } }),
        prisma.order.count({ where: { status: "REJECTED" } }),
      ])

      return {
        totalOrders,
        pendingOrders,
        paymentUploadedOrders,
        approvedOrders,
        rejectedOrders,
      }
    })

    return {
      ...result,
      error: null,
    }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      totalOrders: 0,
      pendingOrders: 0,
      paymentUploadedOrders: 0,
      approvedOrders: 0,
      rejectedOrders: 0,
      error: "Unable to connect to database. Please check your connection.",
    }
  }
}

export default async function AdminOrdersPage() {
  const stats = await getOrderStats()

  if (stats.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage customer orders and payment approvals
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Connection Error: {stats.error}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Connection Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The application cannot connect to the database. Here are some steps to resolve this:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check if your Neon database is active and running</li>
              <li>Verify the DATABASE_URL in your .env file</li>
              <li>Ensure your database server allows connections from your IP</li>
              <li>Try running: <code className="bg-muted px-2 py-1 rounded">npx prisma db push</code></li>
              <li>If the issue persists, create a new database or contact support</li>
            </ol>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Current DATABASE_URL: <code className="bg-muted px-2 py-1 rounded text-xs">
                  {process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@') || 'Not configured'}
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">
          Manage customer orders and payment approvals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <Badge variant="secondary" className="mt-1">
              Email Verification
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paymentUploadedOrders}</div>
            <Badge variant="destructive" className="mt-1">
              Action Required
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedOrders}</div>
            <Badge variant="default" className="mt-1">
              Completed
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedOrders}</div>
            <Badge variant="outline" className="mt-1">
              Declined
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table with Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="PAYMENT_UPLOADED">
            Needs Review ({stats.paymentUploadedOrders})
          </TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable status="all" />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="PAYMENT_UPLOADED">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable status="PAYMENT_UPLOADED" />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="PENDING">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable status="PENDING" />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="APPROVED">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable status="APPROVED" />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="REJECTED">
          <Suspense fallback={<div>Loading orders...</div>}>
            <OrdersTable status="REJECTED" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}