import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Countdown } from '@/lib/types';
import type { Database } from '@/lib/supabase';
import { getDefaultCountdowns } from '@/lib/countdown-utils';
import { getUserStorageKey } from '@/lib/user-utils';

type CountdownRow = Database['public']['Tables']['countdowns']['Row'];

export function useCountdowns(category: string) {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in development mode
  const isDevelopmentMode = useCallback(() => {
    if (typeof window === "undefined") return process.env.NODE_ENV === 'development';
    
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev');
    
    // 로컬 개발환경: 항상 개발 모드
    // 배포된 사이트: ?dev=1이 있을 때만 개발 모드 (로그인된 사용자만)
    let isDevMode = false;
    
    if (process.env.NODE_ENV === 'development') {
      isDevMode = true;
    } else if (process.env.NODE_ENV === 'production' && (devParam === '1' || devParam === 'true')) {
      // 배포 후 테스트 모드는 로그인된 사용자만 접근 가능
      // 여기서는 사용자 인증 상태를 확인할 수 없으므로 false
      isDevMode = false;
    }
    
    return isDevMode;
  }, []);

  // Transform Supabase data to app types
  const transformCountdown = useCallback((row: CountdownRow): Countdown => ({
    id: row.id,
    title: row.title,
    date: row.date,
    isCountUp: row.is_count_up,
    hidden: row.hidden,
    pinned: row.pinned,
    memo: row.memo,
    originalCategory: row.category as "custom" | "general" | "personal",
  }), []);

  // Transform app types to Supabase types
  const transformToSupabase = useCallback((countdown: Countdown, userId: string) => ({
    id: countdown.id,
    user_id: userId,
    title: countdown.title,
    date: countdown.date,
    is_count_up: countdown.isCountUp,
    hidden: countdown.hidden,
    pinned: countdown.pinned,
    memo: countdown.memo,
    category: countdown.originalCategory,
  }), []);

  // Load countdowns from localStorage (for dev mode)
  const loadCountdownsFromLocalStorage = useCallback((userId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (category === "pinned") {
        // For pinned tab: collect pinned:true items from all categories
        const categories = ["general", "personal", "custom"];
        let allPinned: Countdown[] = [];
        
        for (const cat of categories) {
          const storageKey = getUserStorageKey(`countdowns_${cat}`, userId);
          const storedData = localStorage.getItem(storageKey);
          
          if (storedData) {
            try {
              const categoryCountdowns = JSON.parse(storedData) as Countdown[];
              const pinnedCountdowns = categoryCountdowns.filter(c => c.pinned);
              allPinned = [...allPinned, ...pinnedCountdowns];
            } catch (error) {
              console.error(`Error parsing ${cat} countdowns from localStorage:`, error);
            }
          }
        }
        
        setCountdowns(allPinned);
      } else if (category === "hidden") {
        // For hidden tab: collect hidden:true items from all categories
        const categories = ["general", "personal", "custom"];
        let allHidden: Countdown[] = [];
        
        for (const cat of categories) {
          const storageKey = getUserStorageKey(`countdowns_${cat}`, userId);
          const storedData = localStorage.getItem(storageKey);
          
          if (storedData) {
            try {
              const categoryCountdowns = JSON.parse(storedData) as Countdown[];
              const hiddenCountdowns = categoryCountdowns.filter(c => c.hidden);
              allHidden = [...allHidden, ...hiddenCountdowns];
            } catch (error) {
              console.error(`Error parsing ${cat} countdowns from localStorage:`, error);
            }
          }
        }
        
        setCountdowns(allHidden);
      } else {
        // Load by existing category
        const storageKey = getUserStorageKey(`countdowns_${category}`, userId);
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          try {
            const categoryCountdowns = JSON.parse(storedData) as Countdown[];
            setCountdowns(categoryCountdowns);
          } catch (error) {
            console.error(`Error parsing ${category} countdowns from localStorage:`, error);
            setCountdowns([]);
          }
        } else {
          // If no countdowns found and this is a regular category, show sample data
          if (category !== "pinned" && category !== "hidden" && category !== "custom") {
            const deletedSamplesKey = `deleted_samples_${category}`;
            const deletedSamples = JSON.parse(localStorage.getItem(deletedSamplesKey) || '[]');
            
            const sampleCountdowns = getDefaultCountdowns(category).filter(
              sample => !deletedSamples.includes(sample.id)
            );
            
            setCountdowns(sampleCountdowns);
          } else {
            setCountdowns([]);
          }
        }
      }
    } catch (err) {
      console.error('Error in loadCountdownsFromLocalStorage:', err);
      setError('Failed to load countdowns from local storage');
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Load countdowns from Supabase (for production mode)
  const loadCountdownsFromSupabase = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (category === "pinned") {
        // For pinned tab: collect pinned:true items from all categories
        const categories = ["general", "personal", "custom"];
        let allPinned: Countdown[] = [];
        for (const cat of categories) {
          const { data, error: fetchError } = await supabase
            .from('countdowns')
            .select('*')
            .eq('user_id', userId)
            .eq('category', cat)
            .eq('pinned', true)
            .order('created_at', { ascending: false });
          if (fetchError) {
            console.error(`Error fetching pinned countdowns for ${cat}:`, fetchError);
            continue;
          }
          const transformed = data?.map(transformCountdown) || [];
          allPinned = [...allPinned, ...transformed];
        }
        setCountdowns(allPinned);
      } else if (category === "hidden") {
        // For hidden tab: collect hidden:true items from all categories
        const categories = ["general", "personal", "custom"];
        let allHidden: Countdown[] = [];
        for (const cat of categories) {
          const { data, error: fetchError } = await supabase
            .from('countdowns')
            .select('*')
            .eq('user_id', userId)
            .eq('category', cat)
            .eq('hidden', true)
            .order('created_at', { ascending: false });
          if (fetchError) {
            console.error(`Error fetching hidden countdowns for ${cat}:`, fetchError);
            continue;
          }
          const transformed = data?.map(transformCountdown) || [];
          allHidden = [...allHidden, ...transformed];
        }
        setCountdowns(allHidden);
      } else {
        // Load by existing category
        const { data, error: fetchError } = await supabase
          .from('countdowns')
          .select('*')
          .eq('user_id', userId)
          .eq('category', category)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching countdowns:', fetchError);
          setError(fetchError.message);
          return;
        }

        const transformedCountdowns = data?.map(transformCountdown) || [];
        
        // If no countdowns found and this is a regular category (not custom), check for sample data
        if (transformedCountdowns.length === 0 && category !== "pinned" && category !== "hidden" && category !== "custom") {
          // Get deleted sample IDs for this category
          const deletedSamplesKey = `deleted_samples_${category}`;
          const deletedSamples = JSON.parse(localStorage.getItem(deletedSamplesKey) || '[]');
          
          // Show sample data for new users, excluding deleted ones
          const sampleCountdowns = getDefaultCountdowns(category).filter(
            sample => !deletedSamples.includes(sample.id)
          );
          
          if (sampleCountdowns.length > 0) {
            setCountdowns(sampleCountdowns);
            return;
          }
        }
        
        setCountdowns(transformedCountdowns);
      }
    } catch (err) {
      console.error('Error in loadCountdownsFromSupabase:', err);
      setError('Failed to load countdowns');
    } finally {
      setLoading(false);
    }
  };

  // Main load function that chooses the right method
  const loadCountdowns = async (userId: string) => {
    if (isDevelopmentMode()) {
      console.log('🔧 Dev mode: Loading countdowns from localStorage');
      loadCountdownsFromLocalStorage(userId);
    } else {
      console.log('📡 Production mode: Loading countdowns from Supabase');
      await loadCountdownsFromSupabase(userId);
    }
  };

  // Add countdown to localStorage (for dev mode)
  const addCountdownToLocalStorage = useCallback((countdown: Countdown, userId: string) => {
    try {
      const storageKey = getUserStorageKey(`countdowns_${countdown.originalCategory}`, userId);
      const existingData = localStorage.getItem(storageKey);
      const existingCountdowns = existingData ? JSON.parse(existingData) as Countdown[] : [];
      
      const updatedCountdowns = [countdown, ...existingCountdowns];
      localStorage.setItem(storageKey, JSON.stringify(updatedCountdowns));
      
      // Update state directly for immediate UI update
      setCountdowns(prev => [countdown, ...prev]);
      return countdown;
    } catch (err) {
      console.error('Error in addCountdownToLocalStorage:', err);
      throw new Error('Failed to add countdown to local storage');
    }
  }, []);

  // Add countdown to Supabase (for production mode)
  const addCountdownToSupabase = async (countdown: Countdown, userId: string) => {
    try {
      const supabaseData = transformToSupabase(countdown, userId);

      const { data, error: insertError } = await supabase
        .from('countdowns')
        .insert(supabaseData)
        .select()
        .single();

      if (insertError) {
        console.error('Error adding countdown:', insertError);
        throw new Error(insertError.message);
      }

      const newCountdown = transformCountdown(data);
      setCountdowns(prev => [newCountdown, ...prev]);
      return newCountdown;
    } catch (err) {
      console.error('Error in addCountdownToSupabase:', err);
      throw err;
    }
  };

  // Main add function that chooses the right method
  const addCountdown = async (countdown: Countdown, userId: string) => {
    if (isDevelopmentMode()) {
      console.log('🔧 Dev mode: Adding countdown to localStorage');
      return addCountdownToLocalStorage(countdown, userId);
    } else {
      console.log('📡 Production mode: Adding countdown to Supabase');
      return await addCountdownToSupabase(countdown, userId);
    }
  };

  // Update countdown in localStorage (for dev mode)
  const updateCountdownInLocalStorage = useCallback((countdown: Countdown, userId: string) => {
    try {
      const storageKey = getUserStorageKey(`countdowns_${countdown.originalCategory}`, userId);
      const existingData = localStorage.getItem(storageKey);
      const existingCountdowns = existingData ? JSON.parse(existingData) as Countdown[] : [];
      
      const updatedCountdowns = existingCountdowns.map(c => 
        c.id === countdown.id ? countdown : c
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedCountdowns));
      
      // Update state directly for immediate UI update
      setCountdowns(prev => prev.map(c => {
        if (c.id !== countdown.id) return c;
        return { ...c, ...countdown };
      }));
      return countdown;
    } catch (err) {
      console.error('Error in updateCountdownInLocalStorage:', err);
      throw new Error('Failed to update countdown in local storage');
    }
  }, []);

  // Update countdown in Supabase (for production mode)
  const updateCountdownInSupabase = async (countdown: Countdown, userId: string) => {
    try {
      const supabaseData = transformToSupabase(countdown, userId);

      const { data, error: updateError } = await supabase
        .from('countdowns')
        .update(supabaseData)
        .eq('id', countdown.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating countdown:', updateError);
        throw new Error(updateError.message);
      }

      const updatedCountdown = transformCountdown(data);
      // Optimistically merge just-updated fields to avoid race with realtime payload order
      setCountdowns(prev => prev.map(c => {
        if (c.id !== countdown.id) return c;
        return { ...c, ...updatedCountdown };
      }));
      return updatedCountdown;
    } catch (err) {
      console.error('Error in updateCountdownInSupabase:', err);
      throw err;
    }
  };

  // Main update function that chooses the right method
  const updateCountdown = async (countdown: Countdown, userId: string) => {
    if (isDevelopmentMode()) {
      console.log('🔧 Dev mode: Updating countdown in localStorage');
      return updateCountdownInLocalStorage(countdown, userId);
    } else {
      console.log('📡 Production mode: Updating countdown in Supabase');
      return await updateCountdownInSupabase(countdown, userId);
    }
  };

  // Delete countdown from localStorage (for dev mode)
  const deleteCountdownFromLocalStorage = useCallback((countdownId: string, userId: string) => {
    try {
      // Find which category this countdown belongs to
      const categories = ["general", "personal", "custom"];
      let found = false;
      
      for (const cat of categories) {
        const storageKey = getUserStorageKey(`countdowns_${cat}`, userId);
        const existingData = localStorage.getItem(storageKey);
        
        if (existingData) {
          const existingCountdowns = JSON.parse(existingData) as Countdown[];
          const countdownExists = existingCountdowns.some(c => c.id === countdownId);
          
          if (countdownExists) {
            const updatedCountdowns = existingCountdowns.filter(c => c.id !== countdownId);
            localStorage.setItem(storageKey, JSON.stringify(updatedCountdowns));
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        console.warn(`Countdown with id ${countdownId} not found in localStorage`);
      }
      
      // Update state directly for immediate UI update
      setCountdowns(prev => prev.filter(c => c.id !== countdownId));
    } catch (err) {
      console.error('Error in deleteCountdownFromLocalStorage:', err);
      throw new Error('Failed to delete countdown from local storage');
    }
  }, []);

  // Delete countdown from Supabase (for production mode)
  const deleteCountdownFromSupabase = async (countdownId: string, userId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('countdowns')
        .delete()
        .eq('id', countdownId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting countdown:', deleteError);
        throw new Error(deleteError.message);
      }

      setCountdowns(prev => prev.filter(c => c.id !== countdownId));
    } catch (err) {
      console.error('Error in deleteCountdownFromSupabase:', err);
      throw err;
    }
  };

  // Main delete function that chooses the right method
  const deleteCountdown = async (countdownId: string, userId: string) => {
    if (isDevelopmentMode()) {
      console.log('🔧 Dev mode: Deleting countdown from localStorage');
      deleteCountdownFromLocalStorage(countdownId, userId);
    } else {
      console.log('📡 Production mode: Deleting countdown from Supabase');
      await deleteCountdownFromSupabase(countdownId, userId);
    }
  };

  // Set up real-time subscription (only for production mode)
  useEffect(() => {
    // Skip real-time subscription in development mode
    if (isDevelopmentMode()) {
      console.log('🔧 Dev mode: Skipping real-time subscription');
      return;
    }

    console.log('📡 Production mode: Setting up real-time subscription');
    const channel = supabase
      .channel('countdowns')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'countdowns',
        },
        (payload) => {
          process.env.NODE_ENV === 'development' && console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newCountdown = transformCountdown(payload.new as CountdownRow);
            if (newCountdown.originalCategory === category) {
              setCountdowns(prev => [newCountdown, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedCountdown = transformCountdown(payload.new as CountdownRow);
            if (updatedCountdown.originalCategory === category) {
              setCountdowns(prev => 
                prev.map(c => c.id === updatedCountdown.id ? updatedCountdown : c)
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setCountdowns(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, transformCountdown, isDevelopmentMode]);

  return {
    countdowns,
    loading,
    error,
    loadCountdowns,
    addCountdown,
    updateCountdown,
    deleteCountdown,
  };
} 