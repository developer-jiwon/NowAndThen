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
    return null;
  }
  // Otherwise, render nothing
  return null;
} 