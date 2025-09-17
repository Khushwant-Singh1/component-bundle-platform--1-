"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SignOutButton({ 
  variant = "ghost", 
  size = "sm", 
  className 
}: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ 
      callbackUrl: "/auth/login",
      redirect: true 
    })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}