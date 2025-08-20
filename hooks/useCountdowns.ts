import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Countdown } from '@/lib/types';
import type { Database } from '@/lib/supabase';
import { getDefaultCountdowns } from '@/lib/countdown-utils';

type CountdownRow = Database['public']['Tables']['countdowns']['Row'];

export function useCountdowns(category: string) {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load countdowns
  const loadCountdowns = async (userId: string) => {
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
      console.error('Error in loadCountdowns:', err);
      setError('Failed to load countdowns');
    } finally {
      setLoading(false);
    }
  };

  // Add countdown
  const addCountdown = async (countdown: Countdown, userId: string) => {
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
      console.error('Error in addCountdown:', err);
      throw err;
    }
  };

  // Update countdown
  const updateCountdown = async (countdown: Countdown, userId: string) => {
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
      console.error('Error in updateCountdown:', err);
      throw err;
    }
  };

  // Delete countdown
  const deleteCountdown = async (countdownId: string, userId: string) => {
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
      console.error('Error in deleteCountdown:', err);
      throw err;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
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
  }, [category, transformCountdown]);

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