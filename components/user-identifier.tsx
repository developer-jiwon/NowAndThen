"use client"

import { useState, useEffect } from "react"
import { getUserId, exportCountdownsToShareableString, processUrlParameters } from "@/lib/user-utils"
import { Button } from "@/components/ui/button"
import { Check, Share2 } from "lucide-react"

export default function UserIdentifier() {
  const [userId, setUserId] = useState<string>("")
  const [shareableUrl, setShareableUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  
  // Function to update the shareable URL with the latest data
  const updateShareableUrl = () => {
    if (typeof window === "undefined" || !userId) return;
    
    try {
      // Always include the latest data in the URL
      const dataString = exportCountdownsToShareableString();
      const url = new URL(window.location.href);
      url.searchParams.set('uid', userId);
      url.searchParams.set('data', dataString);
      setShareableUrl(url.toString());
    } catch (error) {
      console.error("Error creating shareable URL:", error);
      
      // Fallback to just ID if data export fails
      const url = new URL(window.location.href);
      url.searchParams.set('uid', userId);
      setShareableUrl(url.toString());
    }
  };
  
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
  
  // Update the shareable URL whenever userId changes
  useEffect(() => {
    if (userId && userId !== "No ID found") {
      updateShareableUrl();
    }
  }, [userId]);
  
  const copyToClipboard = () => {
    // Always update the URL with the latest data before copying
    updateShareableUrl();
    
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