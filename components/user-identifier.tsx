"use client"

import { useState, useEffect } from "react"
import { getUserId } from "@/lib/user-utils"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export default function UserIdentifier() {
  const [userId, setUserId] = useState<string>("")
  const [shareableUrl, setShareableUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    // Get the user ID
    const id = getUserId();
    
    // Set the user ID directly (no need to truncate since it's already short)
    if (id && id.length > 0) {
      setUserId(id);
      
      // Create shareable URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set('uid', id);
        setShareableUrl(url.toString());
      }
    } else {
      setUserId("No ID found");
    }
  }, [])
  
  const copyToClipboard = () => {
    if (navigator.clipboard && shareableUrl) {
      navigator.clipboard.writeText(shareableUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  if (!userId) return null
  
  return (
    <div className="text-xs text-gray-400 text-center mt-2 mb-4">
      <div className="flex items-center justify-center gap-2">
        <span>ID: {userId}</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-[10px]"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>
      <p className="text-[10px] mt-1">Countdowns are stored with this ID and can be shared via URL</p>
    </div>
  )
} 