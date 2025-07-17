"use client"

import { useUser } from "@supabase/auth-helpers-react";

export default function LoginButton() {
  // More robust anonymous user detection
  const user = useUser();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;

  // Only show the sign-in message if not logged in
  if (isAnonymous) {
    return null;
  }
  // Otherwise, render nothing
  return null;
} 