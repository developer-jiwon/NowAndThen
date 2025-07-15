"use client"

import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginButton() {
  // More robust anonymous user detection
  const user = useUser();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;

  // Only show the sign-in message if not logged in
  if (isAnonymous) {
    return (
      <div className="text-xs text-gray-500 text-center mb-2 mt-3 max-w-xs mx-auto">
        Sign in to save and sync your timers.<br />
        <span className="text-gray-400">Without sign in, data may be lost.</span>
      </div>
    );
  }
  // Otherwise, render nothing
  return null;
} 