"use client"

import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginButton() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const supabaseClient = useSupabaseClient();

  // More robust anonymous user detection
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Redirect to homepage for reliable logout on mobile
  };

  // 회원 탈퇴(계정 및 데이터 삭제)
  const handleDeleteAccount = async () => {
    if (!user) {
      alert('No user found. Please sign in first.');
      return;
    }
    if (!window.confirm("Are you sure you want to delete your account and all your data? This action cannot be undone.")) return;
    try {
      // 1. countdown 데이터 삭제
      if (user.id) {
        await supabase.from('countdowns').delete().eq('user_id', user.id);
      }
      // 2. 계정 삭제 (API Route 호출)
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert('An error occurred while deleting your account: ' + (data.error || res.statusText));
        return;
      }
      // 3. 로그아웃 및 메인 이동
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      alert('An error occurred while deleting your account.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isAnonymous ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs border border-gray-200 hover:bg-gray-50 font-merriweather"
            onClick={() => setOpen(true)}
          >
            <LogIn className="h-4 w-4 mr-1" />
            Sign in
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
                <h2 className="text-xl font-semibold text-center mb-4 text-gray-900 font-merriweather">Sign in</h2>
                <Auth
                  supabaseClient={supabaseClient}
                  appearance={{
                    theme: ThemeSupa,
                    style: {
                      button: { fontFamily: 'Merriweather, serif' },
                      label: { fontFamily: 'Merriweather, serif' },
                      input: { fontFamily: 'Merriweather, serif' },
                      anchor: { fontFamily: 'Merriweather, serif' },
                      message: { fontFamily: 'Merriweather, serif' },
                      container: { fontFamily: 'Merriweather, serif' },
                      loader: { fontFamily: 'Merriweather, serif' },
                    },
                  }}
                  providers={["google"]}
                  theme="light"
                  showLinks={false}
                  onlyThirdPartyProviders={true}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          {user.email && (
            <span className="text-gray-700 text-xs font-medium">{user.email}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs border border-gray-200 hover:bg-gray-50 font-merriweather"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign out
          </Button>
         <Button
           variant="destructive"
           size="sm"
           className="h-8 px-3 text-xs border border-red-200 hover:bg-red-50 font-merriweather"
           onClick={handleDeleteAccount}
         >
           <Trash2 className="h-4 w-4 mr-1" />
           Delete Account
         </Button>
        </div>
      )}
    </div>
  );
} 