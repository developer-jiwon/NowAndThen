import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 확인 및 익명 로그인
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, signing in anonymously...');
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (error) {
            console.error('Error signing in anonymously:', error);
            setLoading(false);
            return;
          }
          
          if (data.user) {
            console.log('Anonymous user created:', data.user.id);
            setUser(data.user);
          }
        } else {
          console.log('Existing session found:', session.user.id);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
} 