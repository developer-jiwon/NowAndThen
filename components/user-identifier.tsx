"use client"

import { useState, useEffect } from "react"
import { getUserId, createShareableUrl, processUrlParameters } from "@/lib/user-utils"
import { Button } from "@/components/ui/button"
import { Check, Share2 } from "lucide-react"

export default function UserIdentifier() {
  const [userId, setUserId] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [shareableUrl, setShareableUrl] = useState<string>("")
  
  useEffect(() => {
    // Process URL parameters first
    processUrlParameters();
    
    // Get the user ID
    const id = getUserId();
    
    // Set the user ID directly (no need to truncate since it's already short)
    if (id && id.length > 0) {
      setUserId(id);
    } else {
      setUserId("No ID found");
    }
  }, []);
  
  const copyToClipboard = () => {
    // Generate a shareable URL with the latest data
    const url = createShareableUrl();
    
    // Store the URL for debugging
    setShareableUrl(url);
    
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url)
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
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-[10px] border border-gray-200 hover:bg-gray-50"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <Share2 className="h-3 w-3 mr-1" />
          )}
          <span>{copied ? "Copied!" : "Share"}</span>
        </Button>
      </div>
      <p className="text-[10px] mt-1">Share this link to access your countdowns on any device or browser</p>
    </div>
  )
} 