import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session and perform anonymous login
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Try to restore previous guest_id from localStorage
          const previousGuestId = localStorage.getItem('guest_id');
          console.log('No session found, signing in anonymously...');
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            console.error('Error signing in anonymously:', error);
            setLoading(false);
            return;
          }
          
          if (data.user) {
            console.log('Anonymous user created:', data.user.id);
            // Store guest_id in localStorage for first creation or restoration
            if (!previousGuestId) {
              localStorage.setItem('guest_id', data.user.id);
            }
            setUser(data.user);
          }
        } else {
          console.log('Existing session found:', session.user.id);
          // If anonymous user, store guest_id in localStorage
          if (session.user.user_metadata?.provider === 'anonymous') {
            localStorage.setItem('guest_id', session.user.id);
          }
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        // After logout, try to restore previous guest_id
        if (event === 'SIGNED_OUT') {
          const previousGuestId = localStorage.getItem('guest_id');
          if (previousGuestId) {
            // Retry anonymous login (Supabase doesn't have direct guest_id restoration,
            // but when new anonymous session is created, continue to maintain guest_id in localStorage)
            supabase.auth.signInAnonymously().then(({ data, error }) => {
              if (!error && data.user) {
                localStorage.setItem('guest_id', data.user.id);
                setUser(data.user);
              }
            });
          }
        } else {
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
} 