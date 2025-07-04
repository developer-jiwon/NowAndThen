"use client"

import { useState, useEffect } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { Button } from "@/components/ui/button"
import { Check, Share2, Loader2 } from "lucide-react"

export default function SupabaseUserIdentifier() {
  const { user, loading } = useAnonymousAuth();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    if (!user) return;
    
    // 현재 URL을 복사 (사용자 ID는 URL에 포함되지 않음)
    const currentUrl = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          console.log("URL copied to clipboard");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  if (loading) {
    return (
      <div className="text-xs text-gray-400 text-center mt-2 mb-4">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Connecting...</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-xs text-gray-400 text-center mt-2 mb-4">
        <div className="flex items-center justify-center gap-2">
          <span>Connection failed</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-xs text-gray-400 text-center mt-2 mb-4">
      <div className="flex items-center justify-center gap-2">
        <span>Connected: {user.id.substring(0, 8)}...</span>
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
      <p className="text-[10px] mt-1">Your data is automatically synced across devices</p>
    </div>
  )
} 