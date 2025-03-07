"use client"

import { useState, useEffect } from "react"
import { getUserId, exportCountdownsToShareableString, processUrlParameters } from "@/lib/user-utils"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share2, Info } from "lucide-react"

export default function UserIdentifier() {
  const [userId, setUserId] = useState<string>("")
  const [shareableUrl, setShareableUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  
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
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span>ID: {userId}</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-3 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3 w-3 mr-1" />
              <span>Share with Data</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-3 w-3" />
        </Button>
      </div>
      {showInfo && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-[10px] text-left max-w-xs mx-auto">
          <p className="mb-1"><strong>How to use across devices:</strong></p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Click "Share with Data" to copy a link with your current data</li>
            <li>Open this link on any device or browser</li>
            <li>Your countdowns will be automatically imported</li>
          </ol>
        </div>
      )}
      <p className="text-[10px] mt-1">Share this link to access your countdowns on any device</p>
    </div>
  )
} 