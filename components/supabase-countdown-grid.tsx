"use client"

import { useEffect } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { useCountdowns } from "@/hooks/useCountdowns"
import CountdownCard from "@/components/countdown-card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { CountdownForm } from "@/components/add-countdown-form"
import type { Countdown } from "@/lib/types"

interface SupabaseCountdownGridProps {
  category: string;
  showHidden?: boolean;
}

export default function SupabaseCountdownGrid({ 
  category, 
  showHidden = false 
}: SupabaseCountdownGridProps) {
  const { user, loading: authLoading } = useAnonymousAuth();
  const { 
    countdowns, 
    loading: dataLoading, 
    error, 
    loadCountdowns, 
    addCountdown, 
    updateCountdown, 
    deleteCountdown 
  } = useCountdowns(category);
  
  const [showAddForm, setShowAddForm] = useState(false);

  // 사용자가 로드되면 카운트다운 데이터 로드
  useEffect(() => {
    if (user && !authLoading) {
      loadCountdowns(user.id);
    }
  }, [user, authLoading, category]);

  // 카운트다운 필터링
  const filteredCountdowns = countdowns.filter(countdown => {
    if (showHidden) {
      return countdown.hidden;
    }
    return !countdown.hidden;
  });

  // 핀된 카운트다운을 상단으로 정렬
  const sortedCountdowns = [...filteredCountdowns].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const handleRemove = async (id: string) => {
    if (!user) return;
    try {
      await deleteCountdown(id, user.id);
    } catch (error) {
      console.error('Error removing countdown:', error);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    if (!user) return;
    const countdown = countdowns.find(c => c.id === id);
    if (!countdown) return;
    
    try {
      await updateCountdown(
        { ...countdown, hidden: !countdown.hidden },
        user.id
      );
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleTogglePin = async (id: string) => {
    if (!user) return;
    const countdown = countdowns.find(c => c.id === id);
    if (!countdown) return;
    
    try {
      await updateCountdown(
        { ...countdown, pinned: !countdown.pinned },
        user.id
      );
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleEdit = async (id: string) => {
    // Edit functionality will be implemented later
    console.log('Edit countdown:', id);
  };

  const handleAddCountdown = async (values: any) => {
    if (!user) return;
    
    const newCountdown: Countdown = {
      id: values.id || crypto.randomUUID(),
      title: values.title,
      date: values.date,
      isCountUp: values.isCountUp || false,
      hidden: false,
      pinned: false,
      originalCategory: values.category,
    };
    
    try {
      await addCountdown(newCountdown, user.id);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding countdown:', error);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading countdowns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button 
          onClick={() => user && loadCountdowns(user.id)}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please wait while we connect...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6">
          <div className="max-w-sm mx-auto">
            <CountdownForm 
              onSubmit={handleAddCountdown}
              submitButtonText="Add Timer"
            />
            <Button 
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="w-full mt-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showAddForm && category === 'custom' && (
        <div className="mb-6">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Countdown
          </Button>
        </div>
      )}

      {/* Countdowns Grid */}
      {sortedCountdowns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {showHidden 
              ? "No hidden countdowns" 
              : category === 'custom' 
                ? "No custom countdowns yet" 
                : `No ${category} countdowns`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedCountdowns.map((countdown) => (
            <CountdownCard
              key={countdown.id}
              countdown={countdown}
              onRemove={handleRemove}
              onToggleVisibility={handleToggleVisibility}
              onTogglePin={handleTogglePin}
              onEdit={handleEdit}
              category={category}
            />
          ))}
        </div>
      )}
    </div>
  );
} 