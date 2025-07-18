"use client"

import { useEffect, useRef, useLayoutEffect, useState } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { useCountdowns } from "@/hooks/useCountdowns"
import CountdownCard from "@/components/countdown-card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { CountdownForm } from "@/components/add-countdown-form"
import type { Countdown } from "@/lib/types"
import EditCountdownForm from "@/components/edit-countdown-form"
import { useInView } from "react-intersection-observer"
import AdSenseComponent from "@/components/AdSenseComponent"

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
  const [editingCountdownId, setEditingCountdownId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const { ref: adRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Filter countdowns based on hidden state and search query
  const filteredCountdowns = countdowns.filter(countdown => {
    const matchesVisibility = showHidden ? countdown.hidden : !countdown.hidden;
    const matchesSearch = searchQuery.trim() === "" || 
      countdown.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVisibility && matchesSearch;
  });

  // Sort pinned countdowns to the top
  const sortedCountdowns = [...filteredCountdowns].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  useLayoutEffect(() => {
    if (!gridRef.current) return;
    const checkWidth = () => {
      const width = gridRef.current?.offsetWidth || 0;
      // Width checking logic can be added here if needed
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [sortedCountdowns.length]);

  // Load countdown data when user is loaded
  useEffect(() => {
    if (user && !authLoading) {
      loadCountdowns(user.id);
    }
  }, [user, authLoading, category]);

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

  const handleEdit = (id: string) => {
    setEditingCountdownId(id);
  };

  const handleDuplicate = async (id: string) => {
    if (!user) return;
    const originalCountdown = countdowns.find(c => c.id === id);
    if (!originalCountdown) return;
    
    const duplicatedCountdown: Countdown = {
      ...originalCountdown,
      id: crypto.randomUUID(),
      title: `${originalCountdown.title} (Copy)`,
      pinned: false, // Don't pin the copy by default
    };
    
    try {
      await addCountdown(duplicatedCountdown, user.id);
    } catch (error) {
      console.error('Error duplicating countdown:', error);
    }
  };

  const handleSaveEdit = async (id: string, updatedData: Partial<Countdown>, newCategory?: string) => {
    if (!user) return;
    const countdownToUpdate = countdowns.find((c) => c.id === id);
    if (!countdownToUpdate) return;
    
    // Handle category change by moving the countdown
    if (newCategory && newCategory !== category) {
      // Remove from current category
      await deleteCountdown(id, user.id);
      
      // Add to new category
      const newCountdown: Countdown = {
        ...countdownToUpdate,
        ...updatedData,
        originalCategory: (newCategory === 'general' || newCategory === 'personal') ? newCategory : undefined,
      };
      await addCountdown(newCountdown, user.id);
      setEditingCountdownId(null);
      await loadCountdowns(user.id);
      return;
    }
    
    // Update without category change
    await updateCountdown({ ...countdownToUpdate, ...updatedData }, user.id);
    setEditingCountdownId(null);
    await loadCountdowns(user.id);
  };

  const handleCancelEdit = () => {
    setEditingCountdownId(null);
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
      originalCategory: (values.category === 'general' || values.category === 'personal') ? values.category : undefined,
    };
    
    try {
      await addCountdown(newCountdown, user.id);
      setShowAddForm(false);
      
      // Refresh custom tab immediately after adding to hide the newly created timer
      if (category === 'custom') {
        await loadCountdowns(user.id);
      }
    } catch (error) {
      console.error('Error adding countdown:', error);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading your timers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Unable to load timers: {error}</p>
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
        <p className="text-gray-500">Connecting to your account...</p>
      </div>
    );
  }

  // Show edit form when editing
  if (editingCountdownId) {
    const countdownToEdit = countdowns.find((c) => c.id === editingCountdownId);
    if (countdownToEdit) {
      return (
        <div className="w-full flex justify-center">
          <div className="max-w-md w-full">
            <EditCountdownForm
              countdown={countdownToEdit}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-full">
      {/* Search bar for non-custom categories with timers */}
      {category !== 'custom' && sortedCountdowns.length > 0 && (
        <div className="mb-6 flex justify-center">
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search timers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pr-10 rounded-full bg-gray-50 border-0 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-md transition-all duration-200 max-w-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
      {/* Add search bar below pinned tab title */}
      {category === 'pinned' && (
        <div className="mb-4 flex justify-center">
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search pinned timers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pr-10 rounded-full bg-gray-50 border-0 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-md transition-all duration-200 max-w-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 flex justify-center">
          <div className="max-w-sm w-full">
            <CountdownForm 
              onSubmit={handleAddCountdown}
              submitButtonText="Create Timer"
            />
            <Button 
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="w-full mt-2 h-7 text-sm px-3"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingCountdownId && (() => {
        const editingCountdown = countdowns.find((c) => c.id === editingCountdownId);
        return editingCountdown ? (
          <div className="mb-4 flex justify-center">
            <EditCountdownForm
              countdown={editingCountdown}
              onSave={handleSaveEdit}
              onCancel={() => setEditingCountdownId(null)}
            />
          </div>
        ) : null;
      })()}

      {/* Search Results or Empty State */}
      <div className="grid gap-3 md:gap-4">
        {filteredCountdowns.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">No search results</h3>
                <p className="text-gray-600 text-sm">
                  No timers found for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs px-3 py-1 rounded-md"
                >
                  Clear search
                </button>
              </div>
            </div>
          ) : category === 'custom' ? (
            // Custom 탭에서는 기본적으로 폼 표시
            <div className="mb-4 flex justify-center">
              <div className="max-w-sm w-full">
                <CountdownForm 
                  onSubmit={handleAddCountdown}
                  submitButtonText="Create Timer"
                />
                <Button 
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="w-full mt-2 h-7 text-sm px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {showHidden 
                    ? "No Hidden Timers" 
                    : `No ${category.charAt(0).toUpperCase() + category.slice(1)} Timers`}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {category === 'pinned' 
                    ? "Pin important timers." 
                    : category === 'general'
                    ? "Track deadlines and goals."
                    : category === 'personal'
                    ? "Personal milestones."
                    : showHidden
                    ? "Hidden timers appear here."
                    : "Create custom timers."}
                </p>
                
                {!showHidden && category !== 'general' && category !== 'personal' && (
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 text-sm"
                  >
                    Add Timer
                  </Button>
                )}
              </div>
            </div>
          )
        ) : (
          <>
            <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-1 sm:gap-4 sm:px-0">
              {filteredCountdowns.map((countdown) => (
                <CountdownCard
                  key={countdown.id}
                  countdown={countdown}
                  onRemove={handleRemove}
                  onToggleVisibility={handleToggleVisibility}
                  onTogglePin={handleTogglePin}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  category={category}
                />
              ))}
            </div>
            
            {/* AdSense placement for content-rich pages */}
            {filteredCountdowns.length >= 4 && inView && (
              <div ref={adRef} className="mt-8">
                <AdSenseComponent 
                  className="flex justify-center my-6"
                  adFormat="auto"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 