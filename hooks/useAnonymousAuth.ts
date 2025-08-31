import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 개발환경에서는 실제 데이터 로드 시도
    if (process.env.NODE_ENV === 'development') {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const useMock = urlParams?.get('mock') === '1';
      
      if (useMock) {
        const devUserId = 'dev-user-local';
        const mockUser = {
          id: devUserId,
          email: undefined,
          user_metadata: { provider: 'anonymous' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;
        
        localStorage.setItem('dev_user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        return;
      }
    }

    // Supabase 연결 시도 (로컬 + 배포 환경 모두)
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Check if Supabase environment variables are missing
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            // Create emergency mock user for missing env vars
            const emergencyUser = {
              id: 'emergency-user-' + Date.now(),
              email: undefined,
              user_metadata: { provider: 'anonymous' },
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as User;
            
            setUser(emergencyUser);
            setLoading(false);
            return;
          }
          
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            setLoading(false);
            return;
          }
          
          if (data.user) {
            setUser(data.user);
          }
        } else {
          if (session.user.user_metadata?.provider === 'anonymous') {
            localStorage.setItem('guest_id', session.user.id);
          }
          setUser(session.user);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          const previousGuestId = localStorage.getItem('guest_id');
          if (previousGuestId) {
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