import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/signout-button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Tag,
  Star,
  Mail,
  HelpCircle,
  Bell,
} from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error: unknown) {
    console.error("Auth error:", error);
    // If it's a JWT error, redirect to login to clear cookies
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("JWTSessionError") ||
      errorMessage.includes("no matching decryption secret")
    ) {
      redirect("/auth/login?error=session_expired");
    }
    redirect("/auth/login");
  }

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }

  // Redirect to unauthorized if not admin
  if (session.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const data = await prisma.$transaction([
    prisma.bundle.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.contactSubmission.count(),
  ]);

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Bundles",
      href: "/admin/bundles",
      icon: Package,
      badge: data?.[0].toString(),
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      badge: data?.[1].toString(),
    },

    {
      title: "Customers",
      href: "/admin/customers",
      icon: Users,
      badge: data?.[2].toString(),
    },
    {
      title: "Reviews",
      href: "/admin/reviews",
      icon: Star,
      badge: data?.[3].toString(),
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Tags & Tech",
      href: "/admin/tags",
      icon: Tag,
    },
    {
      title: "Contact",
      href: "/admin/contact",
      icon: MessageSquare,
      badge: data?.[4].toString(),
    },
    {
      title: "Newsletter",
      href: "/admin/newsletter",
      icon: Mail,
    },
    {
      title: "FAQ",
      href: "/admin/faq",
      icon: HelpCircle,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <div>
              <h1 className="font-bold text-lg">BundleHub</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors group"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {session?.user.name || "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user.email}
                </p>
              </div>
            </div>
            <SignOutButton className="w-full justify-start" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your bundle marketplace
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2 text-xs">
                  3
                </Badge>
              </Button>
              <Button asChild>
                <Link href="/">View Site</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
