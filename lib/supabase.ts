import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// 타입 정의
export type Database = {
  public: {
    Tables: {
      countdowns: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          is_count_up: boolean;
          hidden: boolean;
          pinned: boolean;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          is_count_up?: boolean;
          hidden?: boolean;
          pinned?: boolean;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date?: string;
          is_count_up?: boolean;
          hidden?: boolean;
          pinned?: boolean;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 