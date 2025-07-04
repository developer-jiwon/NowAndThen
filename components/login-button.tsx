"use client"

import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginButton() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const supabaseClient = useSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs border border-gray-200 hover:bg-gray-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            로그아웃
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs border border-gray-200 hover:bg-gray-50"
            onClick={() => setOpen(true)}
          >
            <LogIn className="h-4 w-4 mr-1" />
            Sign in to sync
          </Button>
          {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
                <Auth
                  supabaseClient={supabaseClient}
                  appearance={{ theme: ThemeSupa }}
                  providers={["google", "github"]}
                  theme="light"
                  showLinks={false}
                  onlyThirdPartyProviders={false}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 