"use client"

import { useState, useEffect } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { Button } from "@/components/ui/button"
import { Check, Share2, Loader2 } from "lucide-react"

export default function SupabaseUserIdentifier() {
  const { user, loading } = useAnonymousAuth();
  const [copied, setCopied] = useState(false);
  
  // Debug: Log user object structure
  useEffect(() => {
    console.log("SupabaseUserIdentifier - user:", user);
    console.log("SupabaseUserIdentifier - user_metadata:", user?.user_metadata);
    console.log("SupabaseUserIdentifier - provider:", user?.user_metadata?.provider);
    console.log("SupabaseUserIdentifier - email:", user?.email);
    console.log("SupabaseUserIdentifier - app_metadata:", user?.app_metadata);
  }, [user]);
  
  // Simplified check: authenticated users have an email, anonymous users don't
  const isAuthenticated = user && user.email && user.email.length > 0;

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
          <span>Please wait...</span>
        </div>
      </div>
    );
  }
  
  // Anonymous or no user: show sign in button and sync prompt
  if (!isAuthenticated) {
    return (
      <div className="text-xs text-gray-400 text-center mt-2 mb-4">
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-[10px] border border-gray-200 hover:bg-gray-50"
            onClick={() => window.dispatchEvent(new CustomEvent('openSignInModal'))}
          >
            Sign in
          </Button>
        </div>
        <p className="text-[10px] mt-1">Sign in to sync your data across devices.</p>
      </div>
    );
  }
  
  // Authenticated user: only show sync message
  return (
    <div className="text-xs text-gray-400 text-center mt-2 mb-4">
      <p className="text-[10px] mt-1">Your data is automatically synced across devices.</p>
    </div>
  )
} 