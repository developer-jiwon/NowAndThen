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
          // localStorage에 이전 guest_id가 있으면 복원 시도
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
            // 최초 생성 또는 복원 시 guest_id를 localStorage에 저장
            if (!previousGuestId) {
              localStorage.setItem('guest_id', data.user.id);
            }
            setUser(data.user);
          }
        } else {
          console.log('Existing session found:', session.user.id);
          // 익명 유저라면 guest_id를 localStorage에 저장
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

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        // 로그아웃 후, 이전 guest_id가 있으면 복원 시도
        if (event === 'SIGNED_OUT') {
          const previousGuestId = localStorage.getItem('guest_id');
          if (previousGuestId) {
            // 익명 로그인 재시도 (Supabase는 이전 guest_id를 직접 복원하는 기능은 없으나,
            // 새 익명 세션이 생성되면 localStorage에 계속 guest_id를 유지)
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