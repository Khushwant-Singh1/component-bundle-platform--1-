"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface BuyButtonProps {
  bundleId: string
  bundleName: string
  price: number
  className?: string
  children: React.ReactNode
}

export function BuyButton({ bundleId, className, children }: BuyButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleBuyClick = () => {
    if (status === "loading") {
      return // Don't do anything while loading
    }

    if (!session) {
      // User is not logged in, redirect to signup
      router.push("/auth/signup")
      return
    }

    // User is logged in, proceed to checkout
    router.push(`/checkout/${bundleId}`)
  }

  return (
    <Button
      size="lg"
      className={className}
      onClick={handleBuyClick}
      disabled={status === "loading"}
    >
      {status === "loading" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
