import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('🔍 useAnonymousAuth hook initialized - user:', user, 'loading:', loading);
  console.log('🔍 Current environment variables check:');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('🔍 NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    // 로컬 개발환경에서는 무조건 테스트 유저 생성
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 LOCAL DEVELOPMENT - Creating test user immediately');
      
      const devUserId = 'dev-user-local';
      const existingDevUser = localStorage.getItem('dev_user_data');
      
      if (existingDevUser) {
        try {
          const userData = JSON.parse(existingDevUser);
          console.log('✅ Using existing local dev user:', devUserId);
          setUser(userData);
          setLoading(false);
          return;
        } catch (e) {
          console.log('🔧 Invalid dev user data, creating new one');
          localStorage.removeItem('dev_user_data');
        }
      }
      
      // Create a mock user object for development
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
      localStorage.setItem('guest_id', devUserId);
      console.log('✅ Created new local dev user:', devUserId);
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // 배포 환경에서만 Supabase 연결 시도
    const checkSession = async () => {
      console.log('🔍 PRODUCTION - checkSession started');
      
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const devParam = urlParams?.get('dev');
      
      // 개발 모드가 아니면 Supabase 세션 체크
      try {
        console.log('🔍 Getting Supabase session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Supabase session result:', session);
        
        if (!session) {
          // Check if Supabase environment variables are missing
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('❌ Missing Supabase environment variables!');
            console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
            
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
            
            console.log('🚨 Using emergency mock user due to missing environment variables');
            setUser(emergencyUser);
            setLoading(false);
            return;
          }
          
          // Production: Try to restore previous guest_id from localStorage
          const previousGuestId = localStorage.getItem('guest_id');
          console.log('🔍 No session found, attempting anonymous sign in...');
          console.log('🔍 Previous guest ID:', previousGuestId);
          
          const { data, error } = await supabase.auth.signInAnonymously();
          console.log('🔍 Anonymous sign in result - data:', data, 'error:', error);
          
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
        console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.error('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
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