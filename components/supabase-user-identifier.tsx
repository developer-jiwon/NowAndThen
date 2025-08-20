"use client"

import { useState, useEffect } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { Loader2 } from "lucide-react"

export default function SupabaseUserIdentifier() {
  const { user, loading } = useAnonymousAuth();
  
  // Debug: Log user object structure
  useEffect(() => {
    process.env.NODE_ENV === 'development' && console.log("SupabaseUserIdentifier - user:", user);
    process.env.NODE_ENV === 'development' && console.log("SupabaseUserIdentifier - user_metadata:", user?.user_metadata);
    process.env.NODE_ENV === 'development' && console.log("SupabaseUserIdentifier - provider:", user?.user_metadata?.provider);
    process.env.NODE_ENV === 'development' && console.log("SupabaseUserIdentifier - email:", user?.email);
    process.env.NODE_ENV === 'development' && console.log("SupabaseUserIdentifier - app_metadata:", user?.app_metadata);
  }, [user]);
  
  // Simplified check: authenticated users have an email, anonymous users don't
  const isAuthenticated = user && user.email && user.email.length > 0;

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
  
  // Only show for authenticated users
  if (!isAuthenticated) {
    return (
      <div className="text-xs text-gray-400 text-center mt-2 mb-4">
        <p className="text-[10px] mt-1">Sign in to sync your timers across all devices.</p>
      </div>
    );
  }
  
  // Authenticated user: only show sync message
  return (
    <div className="text-xs text-gray-400 text-center mt-2 mb-4">
      <p className="text-[10px] mt-1">Your timers are synced and backed up securely.</p>
    </div>
  )
} 