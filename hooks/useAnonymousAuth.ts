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
          // Development environment: Use a consistent fake user to avoid recreating sessions
          // Check for dev mode via URL parameter or NODE_ENV
          const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
          const devParam = urlParams?.get('dev');
          
          // 로컬 개발환경: 항상 개발 모드
          // 배포된 사이트: ?dev=1이 있을 때만 개발 모드 (로그인된 사용자만)
          let isDev = false;
          
          if (process.env.NODE_ENV === 'development') {
            isDev = true;
          } else if (process.env.NODE_ENV === 'production' && (devParam === '1' || devParam === 'true')) {
            // 배포 후 테스트 모드는 로그인된 사용자만 접근 가능
            // 여기서는 아직 로그인되지 않았으므로 false
            isDev = false;
          }
            
          if (isDev) {
            console.log('🔧 Development mode active - using mock user to avoid creating Supabase users');
            const devUserId = 'dev-user-local';
            const existingDevUser = localStorage.getItem('dev_user_data');
            
            if (existingDevUser) {
              // Use existing dev user data
              const userData = JSON.parse(existingDevUser);
              process.env.NODE_ENV === 'development' && console.log('Using existing dev user:', devUserId);
              setUser(userData);
              setLoading(false);
              return;
            } else {
              // Create a mock user object for development
              const mockUser = {
                id: devUserId,
                email: null,
                user_metadata: { provider: 'anonymous' },
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as User;
              
              localStorage.setItem('dev_user_data', JSON.stringify(mockUser));
              localStorage.setItem('guest_id', devUserId);
              process.env.NODE_ENV === 'development' && console.log('Created dev user:', devUserId);
              setUser(mockUser);
              setLoading(false);
              return;
            }
          }
          
          // Production: Try to restore previous guest_id from localStorage
          const previousGuestId = localStorage.getItem('guest_id');
          process.env.NODE_ENV === 'development' && console.log('No session found, signing in anonymously...');
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            console.error('Error signing in anonymously:', error);
            setLoading(false);
            return;
          }
          
          if (data.user) {
            process.env.NODE_ENV === 'development' && console.log('Anonymous user created:', data.user.id);
            // Store guest_id in localStorage for first creation or restoration
            if (!previousGuestId) {
              localStorage.setItem('guest_id', data.user.id);
            }
            setUser(data.user);
          }
        } else {
          // process.env.NODE_ENV === 'development' && console.log('Existing session found:', session.user.id);
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
        // process.env.NODE_ENV === 'development' && console.log('Auth state changed:', event, session?.user?.id);
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