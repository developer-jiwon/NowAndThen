"use client";

import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { LogIn, LogOut, Trash2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileMenuProps {
  size?: 'sm';
}

export default function ProfileMenu({ size }: ProfileMenuProps) {
  const user = useUser();
  const [open, setOpen] = useState<'none' | 'main' | 'signin'>('none');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const supabaseClient = useSupabaseClient();
  const isAnonymous = !user || user.user_metadata?.provider === 'anonymous' || !user.email;

  const handleLogout = async () => {
    process.env.NODE_ENV === 'development' && console.log('Logout button clicked');
    try {
      await supabase.auth.signOut();
      process.env.NODE_ENV === 'development' && console.log('Sign out successful');
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setOpen('none');
  };

  const confirmDeleteAccount = async () => {
    if (!user) {
      alert('No user found. Please sign in first.');
      return;
    }
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

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  // Size classes
  const btnSize = size === 'sm' ? 'w-6 h-6 ml-0.5' : 'w-8 h-8 ml-2';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';

  return (
    <>
      <span
        className={`rounded-full border-2 border-[#F5E6B8] bg-[#4E724C] shadow-lg shadow-[#F5E6B8]/30 flex items-center justify-center cursor-pointer ${btnSize} relative`}
        onClick={() => setOpen(isAnonymous ? 'signin' : 'main')}
        data-signin-trigger={isAnonymous ? "true" : undefined}
        style={{
          boxShadow: '0 0 8px rgba(245, 230, 184, 0.6), 0 0 16px rgba(245, 230, 184, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <User className={`${iconSize} text-white`} />
        {isAnonymous && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500/80 rounded-full border border-white/90 animate-pulse shadow-lg">
            <span className="absolute inset-0 w-2 h-2 bg-orange-400/70 rounded-full animate-ping"></span>
          </span>
        )}
      </span>
      {open === 'main' && !isAnonymous && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg p-4 max-w-[270px] w-full relative flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setOpen('none')}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
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
          </div>
        </div>
      )}
      {open === 'signin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/90 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg p-4 max-w-[220px] w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setOpen('none')}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <div className="text-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4E724C] to-[#3A5A38] rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 font-merriweather">Sign in</h2>
            </div>
            <Auth
              supabaseClient={supabaseClient}
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: { 
                    fontFamily: 'Inter, system-ui, sans-serif', 
                    fontSize: '12px', 
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontWeight: '500',
                    minHeight: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  },
                  label: { 
                    fontFamily: 'Inter, system-ui, sans-serif', 
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151'
                  },
                  input: { 
                    fontFamily: 'Inter, system-ui, sans-serif', 
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    minHeight: '32px'
                  },
                  anchor: { 
                    fontFamily: 'Inter, system-ui, sans-serif', 
                    fontSize: '11px',
                    color: '#6b7280'
                  },
                  message: { 
                    fontFamily: 'Inter, system-ui, sans-serif', 
                    fontSize: '11px',
                    color: '#6b7280'
                  },
                  container: { 
                    fontFamily: 'Inter, system-ui, sans-serif',
                    padding: '0',
                    margin: '0'
                  },
                  loader: { 
                    fontFamily: 'Inter, system-ui, sans-serif'
                  },
                  divider: {
                    margin: '12px 0',
                    borderColor: '#e5e7eb'
                  }
                },
                variables: {
                  default: {
                    colors: {
                      brand: '#374151',
                      brandAccent: '#1f2937',
                      inputBackground: '#ffffff',
                      inputBorder: '#d1d5db',
                      inputLabelText: '#374151',
                      inputText: '#374151',
                      inputPlaceholder: '#9ca3af',
                      messageText: '#6b7280',
                      messageTextDanger: '#dc2626',
                      anchorTextColor: '#6b7280',
                      anchorTextHoverColor: '#374151',
                      dividerBackground: '#e5e7eb'
                    }
                  }
                }
              }}
              providers={["google"]}
              theme="light"
              showLinks={false}
              onlyThirdPartyProviders={true}
            />
          </div>
        </div>
      )}
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-lg p-4 max-w-[300px] w-full relative">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete your account and all your data? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={cancelDeleteAccount}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={confirmDeleteAccount}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 