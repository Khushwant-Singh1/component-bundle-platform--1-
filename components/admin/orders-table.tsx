"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, Check, X, Loader2, AlertTriangle, Database } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Order {
  id: string
  customerName: string
  email: string
  status: string
  totalAmount: number
  paymentScreenshot?: string
  adminNotes?: string
  createdAt: string
  items: Array<{
    bundle: {
      id: string
      name: string
      slug: string
    }
  }>
}

interface OrdersTableProps {
  status: string
}

export function OrdersTable({ status }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [dbError, setDbError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)    // Rate limiting

      setDbError(null)
      const response = await fetch(`/api/admin/orders?status=${status}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data.orders)
      } else if (data.error?.code === "DATABASE_CONNECTION_ERROR") {
        setDbError(data.error.message)
        setOrders([])
      } else {
        setError(data.error?.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      setError("Network error: Unable to fetch orders")
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchOrders()
  }, [status, fetchOrders])

  const handleApprove = async (orderId: string) => {
    setActionLoading(orderId)
    setError("")

    const approvalStartTime = Date.now()
    console.log(`[ADMIN] Starting approval for order ${orderId}`)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: approvalNotes }),
      })

      const data = await response.json()
      
      if (data.success) {
        const approvalDuration = Date.now() - approvalStartTime
        console.log(`[ADMIN] Order ${orderId} approved in ${approvalDuration}ms`)
        
        // Show success message with timing info
        if (data.metadata?.approvalTime) {
          console.log(`[ADMIN] Server approval time: ${data.metadata.approvalTime}ms`)
          setSuccessMessage(`Order approved successfully in ${approvalDuration}ms! Email with download links is being sent.`)
        } else {
          setSuccessMessage("Order approved successfully! Email with download links is being sent.")
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000)
        
        await fetchOrders()
        setSelectedOrder(null)
        setApprovalNotes("")
        
        // Show success notification
        setError("")
      } else {
        setError(data.error?.message || "Failed to approve order")
      }
    } catch (error) {
      const approvalDuration = Date.now() - approvalStartTime
      console.error(`[ADMIN] Approval failed for order ${orderId} after ${approvalDuration}ms:`, error)
      setError("Failed to approve order")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (orderId: string) => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required")
      return
    }

    setActionLoading(orderId)
    setError("")

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchOrders()
        setSelectedOrder(null)
        setRejectionReason("")
      } else {
        setError(data.error?.message || "Failed to reject order")
      }
    } catch {
      setError("Failed to reject order")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending" },
      EMAIL_VERIFIED: { variant: "default" as const, label: "Email Verified" },
      PAYMENT_PENDING: { variant: "outline" as const, label: "Payment Pending" },
      PAYMENT_UPLOADED: { variant: "destructive" as const, label: "Needs Review" },
      APPROVED: { variant: "default" as const, label: "Approved" },
      COMPLETED: { variant: "default" as const, label: "Completed" },
      REJECTED: { variant: "outline" as const, label: "Rejected" },
      FAILED: { variant: "destructive" as const, label: "Failed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>
  }

  if (dbError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {dbError}
          </AlertDescription>
        </Alert>
        <div className="text-center p-8">
          <Button onClick={fetchOrders} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Bundle</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.bundle.name}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer Name</Label>
                                  <p className="text-sm">{selectedOrder.customerName}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="text-sm">{selectedOrder.email}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(selectedOrder.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label>Amount</Label>
                                  <p className="text-sm">₹{selectedOrder.totalAmount}</p>
                                </div>
                              </div>

                              {selectedOrder.paymentScreenshot && (
                                <div>
                                  <Label>Payment Screenshot</Label>
                                  <div className="mt-2">
                                    <Image
                                      src={selectedOrder.paymentScreenshot}
                                      alt="Payment Screenshot"
                                      width={400}
                                      height={300}
                                      className="rounded-lg border"
                                    />
                                  </div>
                                </div>
                              )}

                              {selectedOrder.adminNotes && (
                                <div>
                                  <Label>Admin Notes</Label>
                                  <p className="text-sm mt-1">{selectedOrder.adminNotes}</p>
                                </div>
                              )}

                              {selectedOrder.status === "PAYMENT_UPLOADED" && (
                                <div className="space-y-4 pt-4 border-t">
                                  <div>
                                    <Label htmlFor="approval-notes">
                                      Approval Notes (Optional)
                                    </Label>
                                    <Textarea
                                      id="approval-notes"
                                      value={approvalNotes}
                                      onChange={(e) => setApprovalNotes(e.target.value)}
                                      placeholder="Add any notes for this approval..."
                                      className="mt-1"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="rejection-reason">
                                      Rejection Reason
                                    </Label>
                                    <Textarea
                                      id="rejection-reason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Reason for rejecting this payment..."
                                      className="mt-1"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleApprove(selectedOrder.id)}
                                      disabled={actionLoading === selectedOrder.id}
                                      className="flex-1"
                                    >
                                      {actionLoading === selectedOrder.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <Check className="h-4 w-4 mr-2" />
                                      )}
                                      Approve & Send Bundle
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(selectedOrder.id)}
                                      disabled={
                                        actionLoading === selectedOrder.id ||
                                        !rejectionReason.trim()
                                      }
                                      className="flex-1"
                                    >
                                      {actionLoading === selectedOrder.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <X className="h-4 w-4 mr-2" />
                                      )}
                                      Reject Payment
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}