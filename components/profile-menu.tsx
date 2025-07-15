"use client";

import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { LogIn, LogOut, Trash2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfileMenu() {
  const user = useUser();
  const [open, setOpen] = useState<'none' | 'main' | 'signin'>('none');
  const supabaseClient = useSupabaseClient();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      alert('No user found. Please sign in first.');
      return;
    }
    if (!window.confirm("Are you sure you want to delete your account and all your data? This action cannot be undone.")) return;
    try {
      if (user.id) {
        await supabase.from('countdowns').delete().eq('user_id', user.id);
      }
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
      await supabase.auth.signOut();
      window.location.reload();
    } catch (err) {
      alert('An error occurred while deleting your account.');
      console.error(err);
    }
  };

  return (
    <>
      <span
        className="w-7 h-7 rounded-full border border-gray-200 bg-black flex items-center justify-center cursor-pointer ml-2"
        onClick={() => setOpen('main')}
      >
        <User className="w-4 h-4 text-white" />
      </span>
      {open === 'main' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg p-4 max-w-[270px] w-full relative flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setOpen('none')}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            {isAnonymous ? (
              <>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 mt-2 mb-1 w-full justify-center rounded bg-black text-white text-xs hover:bg-gray-900"
                  onClick={() => setOpen('signin')}
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </button>
                {/* Sign in modal handled below */}
              </>
            ) : (
              <>
                <div className="px-2 py-1 text-xs text-gray-700 break-all max-w-[180px] truncate mb-2 text-center">{user.email}</div>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 mb-2 w-full justify-center rounded bg-black text-white text-xs hover:bg-gray-900"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 w-full justify-center rounded bg-red-500 text-white text-xs hover:bg-red-600"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4" /> Delete Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {open === 'signin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg p-4 max-w-[270px] w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setOpen('main')}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <h2 className="text-lg font-semibold text-center mb-3 text-gray-900 font-merriweather">Sign in</h2>
            <Auth
              supabaseClient={supabaseClient}
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: { fontFamily: 'Merriweather, serif', fontSize: '13px', padding: '6px 12px' },
                  label: { fontFamily: 'Merriweather, serif', fontSize: '13px' },
                  input: { fontFamily: 'Merriweather, serif', fontSize: '13px' },
                  anchor: { fontFamily: 'Merriweather, serif', fontSize: '13px' },
                  message: { fontFamily: 'Merriweather, serif', fontSize: '12px' },
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
  );
} 