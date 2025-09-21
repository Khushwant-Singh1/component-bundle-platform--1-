"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignOutButton } from "@/components/auth/signout-button"
import { User, Settings, ShoppingBag, Menu } from "lucide-react"

export function MainNavigation() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          BundleHub
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/bundles" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Bundles
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Contact
          </Link>
          
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {session.user.role === "ADMIN" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile#orders" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem className="cursor-pointer p-0">
                  <SignOutButton className="w-full justify-start" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/user-login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col space-y-6 mt-8">
                <Link 
                  href="/bundles" 
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bundles
                </Link>
                <Link 
                  href="/contact" 
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                
                {session?.user ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{session.user.name}</p>
                        <p className="text-sm text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                    
                    {session.user.role === "ADMIN" ? (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-2 text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : (
                      <>
                        <Link 
                          href="/profile" 
                          className="flex items-center space-x-2 text-lg font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                        <Link 
                          href="/profile#orders" 
                          className="flex items-center space-x-2 text-lg font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span>My Orders</span>
                        </Link>
                      </>
                    )}
                    
                    <div className="pt-2">
                      <SignOutButton className="w-full" onClick={() => setMobileMenuOpen(false)} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/auth/user-login" onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
