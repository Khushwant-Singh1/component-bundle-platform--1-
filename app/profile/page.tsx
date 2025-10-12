import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/auth/signout-button"
import { SecureDownloadButton } from "@/components/secure-download-button"
import { User, Calendar, Download, ShoppingCart, Star } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/user-login")
  }

  // Fetch user data with orders
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        where: { status: "APPROVED" },
        include: {
          items: {
            include: {
              bundle: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      reviews: {
        include: {
          bundle: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      downloads: {
        include: {
          bundle: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!user) {
    redirect("/auth/user-login")
  }

  const totalPurchases = user.orders.length
  const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const totalDownloads = user.downloads.length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {user.role}
                  </Badge>
                  <span className="text-sm text-blue-100">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases}</div>
              <p className="text-xs text-muted-foreground">
                Approved orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                On component bundles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads}</div>
              <p className="text-xs text-muted-foreground">
                Bundle downloads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>
                Your approved orders and purchased bundles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No purchases yet</p>
                  <Link href="/bundles">
                    <Button className="mt-4">Browse Bundles</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">₹{Number(order.totalAmount).toLocaleString()}</Badge>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <Link 
                              href={`/bundles/${item.bundle.slug}`}
                              className="text-blue-600 hover:underline flex-1"
                            >
                              {item.bundle.name}
                            </Link>
                            <SecureDownloadButton
                              bundleId={item.bundle.id}
                              bundleName={item.bundle.name}
                              orderId={order.id}
                              size="sm"
                              variant="outline"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>
                Reviews you&apos;ve written for purchased bundles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Purchase bundles to leave reviews
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link 
                          href={`/bundles/${review.bundle.slug}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {review.bundle.name}
                        </Link>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <p className="font-medium text-sm mb-1">{review.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Downloads */}
        {user.downloads.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Downloads</CardTitle>
              <CardDescription>
                Your recent bundle downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.downloads.map((download) => (
                  <div key={download.id} className="flex justify-between items-center py-2">
                    <div>
                      <Link 
                        href={`/bundles/${download.bundle.slug}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {download.bundle.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Downloaded on {new Date(download.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
