"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share2 } from "lucide-react"
import { updateUrlWithUserId, getUserId } from "@/lib/user-utils"

export default function ShareLinkButton() {
  const [copied, setCopied] = useState(false)
  
  const handleShareClick = () => {
    // Get the current user ID
    const userId = getUserId()
    
    // Update the URL to include both the user ID and countdown data
    updateUrlWithUserId(userId, true)
    
    // Copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(err => {
        console.error("Failed to copy URL: ", err)
      })
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShareClick}
      className="flex items-center gap-1 text-xs"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3 w-3" />
          <span>Share Link</span>
        </>
      )}
    </Button>
  )
} 