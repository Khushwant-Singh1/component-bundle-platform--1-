"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Clock, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SecureDownloadButtonProps {
  bundleId: string
  bundleName: string
  orderId: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  className?: string
}

export function SecureDownloadButton({ 
  bundleId, 
  bundleName, 
  orderId, 
  size = "sm", 
  variant = "outline",
  className 
}: SecureDownloadButtonProps) {
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    setIsGeneratingToken(true)

    try {
      // Generate secure download token
      const response = await fetch(`/api/download/token/${bundleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate download link')
      }

      // Show success message with expiry info
      toast({
        title: "Download Ready!",
        description: `Secure download link generated for ${bundleName}. Link expires in 24 hours.`,
        duration: 5000,
      })

      // Open download in new tab
      window.open(data.data.downloadUrl, '_blank')

    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to generate download link",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingToken(false)
    }
  }

  return (
    <Button 
      size={size} 
      variant={variant}
      onClick={handleDownload}
      disabled={isGeneratingToken}
      className={className}
    >
      {isGeneratingToken ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Download
        </>
      )}
    </Button>
  )
}

interface DownloadTokenDisplayProps {
  bundleId: string
  bundleName: string
  orderId: string
}

export function DownloadTokenDisplay({ bundleId, bundleName, orderId }: DownloadTokenDisplayProps) {
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateToken = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/download/token/${bundleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate download token')
      }

      setToken(data.data.token)
      setExpiresAt(data.data.expiresAt)

      toast({
        title: "Token Generated!",
        description: `Secure download token created for ${bundleName}. Valid for 24 hours.`,
      })

    } catch (error) {
      console.error('Token generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate token",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadWithToken = () => {
    if (!token) return
    const downloadUrl = `/api/download/secure/${bundleId}?token=${token}`
    window.open(downloadUrl, '_blank')
  }

  if (token) {
    const expiryDate = expiresAt ? new Date(expiresAt) : null
    const isExpired = expiryDate ? expiryDate < new Date() : false

    return (
      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Secure Download Token</span>
          </div>
          {expiryDate && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {isExpired 
                  ? "Expired" 
                  : `Expires ${expiryDate.toLocaleString()}`
                }
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <code className="flex-1 p-2 bg-background rounded text-xs font-mono truncate">
            {token}
          </code>
          <Button
            size="sm"
            onClick={downloadWithToken}
            disabled={isExpired}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        {isExpired && (
          <Button
            size="sm"
            variant="outline"
            onClick={generateToken}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate New Token"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={generateToken}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Token...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Generate Secure Download
        </>
      )}
    </Button>
  )
}
