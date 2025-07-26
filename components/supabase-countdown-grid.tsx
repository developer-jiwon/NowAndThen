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
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SupabaseCountdownGrid({ 
  category, 
  showHidden = false, 
  activeTab,
  setActiveTab
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
  const [showSamples, setShowSamples] = useState(() => {
    // localStorage에서 샘플 표시 여부 확인
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showSamples') !== 'false';
    }
    return true;
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
      await loadCountdowns(user.id);
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
      <div className="w-full flex justify-center items-center py-8">
        <div className="flex items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading your timers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Unable to load timers: {error}</p>
          <Button 
            onClick={() => user && loadCountdowns(user.id)}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="text-center">
          <p className="text-gray-500">Connecting to your account...</p>
        </div>
      </div>
    );
  }

  // Show edit form when editing
  if (editingCountdownId) {
    const countdownToEdit = countdowns.find((c) => c.id === editingCountdownId);
    if (countdownToEdit) {
      return (
        <div className="w-full flex justify-center">
          <div className="max-w-sm w-full">
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

  if (filteredCountdowns.length === 0 && !showAddForm && showSamples && category === 'pinned') {
    // 샘플 타이머 데이터 (Countdown 타입에 맞게)
    const sampleCountdowns = [
      {
        id: 'sample1',
        title: 'Project Deadline',
        date: '2024-07-31',
        description: 'Complete MVP for launch',
        hidden: false,
        pinned: false,
        originalCategory: 'general' as const,
      },
      {
        id: 'sample2',
        title: "Friend's Birthday",
        date: '2024-08-15',
        description: "Prepare for Jimin's birthday party",
        hidden: false,
        pinned: false,
        originalCategory: 'personal' as const,
      },
      {
        id: 'sample3',
        title: 'Workout Routine',
        date: '2024-07-10',
        description: 'Every Mon/Wed/Fri',
        hidden: false,
        pinned: false,
        originalCategory: 'personal' as const,
      },
      {
        id: 'sample4',
        title: 'Exam D-day',
        date: '2024-09-01',
        description: 'Prepare for TOEIC exam',
        hidden: false,
        pinned: false,
        originalCategory: 'general' as const,
      },
      {
        id: 'sample5',
        title: 'Anniversary',
        date: '2024-10-10',
        description: '1000 days together',
        hidden: false,
        pinned: false,
        originalCategory: 'personal' as const,
      },
    ];

    // 샘플 카드 편집 핸들러
    const handleSampleEdit = (sample: any) => {
      // 샘플 데이터를 실제 DB에 저장
      handleAddCountdown({
        title: sample.title,
        date: sample.date,
        description: sample.description,
        category: sample.originalCategory,
      });
    };

    // 샘플 카드 삭제 핸들러 (화면에서만 제거)
    const handleSampleRemove = (sampleId: string) => {
      // 샘플은 DB에 없으므로 화면에서만 제거 (실제로는 아무것도 안함)
      console.log('Sample removed:', sampleId);
    };

    // 모든 샘플 삭제 핸들러
    const handleClearAllSamples = () => {
      setShowSamples(false);
      // localStorage에 상태 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('showSamples', 'false');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center pt-2 pb-6 w-full">
        <div className="mb-6 mt-0 text-[10px] text-gray-400">These are sample timers. Click edit to convert to real timer, or clear all samples.</div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4 w-full max-w-4xl">
          {sampleCountdowns.map((sample) => (
            <CountdownCard
              key={sample.id}
              countdown={sample}
              onRemove={handleSampleRemove}
              onToggleVisibility={() => {}} // 샘플에서는 비활성화
              onTogglePin={() => {}} // 샘플에서는 비활성화
              onEdit={() => handleSampleEdit(sample)}
              onDuplicate={() => {}} // 샘플에서는 비활성화
              category={sample.originalCategory || 'general'}
            />
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setActiveTab('custom')}
            className="h-7 text-xs font-medium rounded-md bg-gray-800 text-white hover:bg-gray-700 border-gray-800 px-4"
          >
            Add Timer
          </Button>
          <Button
            variant="outline"
            onClick={handleClearAllSamples}
            className="h-7 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4"
          >
            Clear Samples
          </Button>
        </div>
      </div>
    );
  }

  // Custom 탭에서는 바로 폼 표시
  if (category === 'custom' && filteredCountdowns.length === 0 && !showAddForm) {
    return (
      <div className="mb-4 flex justify-center">
        <div className="max-w-sm w-full">
          <CountdownForm 
            onSubmit={handleAddCountdown}
            onCancel={() => setShowAddForm(false)}
            submitButtonText="Create Timer"
          />
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="mb-4 flex justify-center">
        <div className="max-w-sm w-full">
          <CountdownForm 
            onSubmit={handleAddCountdown}
            onCancel={() => setShowAddForm(false)}
            submitButtonText="Create Timer"
          />
        </div>
      </div>
    );
  }

  // General 탭만 특별 처리
  if (filteredCountdowns.length === 0 && !showAddForm && category === 'general') {
    return (
      <div className="flex items-center justify-center pt-0 pb-0 -mb-6">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 max-w-[320px] w-full flex flex-col items-center justify-center">
          <h3 className="text-base font-medium text-gray-800 mb-1 text-center">
            No general timers
          </h3>
          <p className="text-gray-600 text-xs mb-3 text-center">
            Track deadlines and goals.
          </p>
          <div className="mb-3 flex justify-center">
            <ul className="text-gray-500 space-y-0.5 text-xs text-left">
              <li>• Project deadline</li>
              <li>• Family/friend birthday</li>
              <li>• Workout routine</li>
              <li>• Exam D-day</li>
              <li>• Anniversary or event</li>
            </ul>
          </div>
          <div className="text-center">
            <Button 
              onClick={() => setActiveTab('custom')}
              variant="outline"
              className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900 px-3 h-6 text-xs font-medium rounded shadow-sm"
            >
              Add Timer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show search results or empty state for other tabs
  if (filteredCountdowns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center pt-2 pb-0 -mb-8">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 max-w-[320px] w-full flex flex-col items-center justify-center">
          <h3 className="text-base font-medium text-gray-800 mb-1 text-center">
            {showHidden 
              ? "No hidden timers" 
              : category === 'pinned'
              ? "No timers yet"
              : `No ${category} timers`}
          </h3>
          <p className="text-gray-600 text-xs mb-3 text-center">
            {category === 'pinned' 
              ? "Add a timer to keep track of what matters most."
              : category === 'general'
              ? "Track deadlines and goals."
              : category === 'personal'
              ? "Personal milestones."
              : showHidden
              ? "Hidden timers appear here."
              : "Create custom timers."}
          </p>
          
          {category === 'pinned' && (
            <div className="mb-3 flex justify-center">
              <ul className="text-gray-500 space-y-0.5 text-xs text-left">
                <li>• Project deadline</li>
                <li>• Family/friend birthday</li>
                <li>• Workout routine</li>
                <li>• Exam D-day</li>
                <li>• Anniversary or event</li>
              </ul>
            </div>
          )}
          
          {!showHidden && (
            <div className="text-center">
              <Button 
                onClick={() => setActiveTab('custom')}
                variant="outline"
                className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900 px-3 h-6 text-xs font-medium rounded shadow-sm"
              >
                Add Timer
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Single search bar for all categories except custom */}
      {category !== 'custom' && sortedCountdowns.length > 0 && (
        <div className="mb-4 flex justify-center w-full">
          <div className="relative w-full max-w-[320px]">
            <input
              type="text"
              placeholder="Search timers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-white border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all duration-200"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150"
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
              onCancel={() => setShowAddForm(false)}
              submitButtonText="Create Timer"
            />
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
      {filteredCountdowns.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto">
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
                onCancel={() => setShowAddForm(false)}
                submitButtonText="Create Timer"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-2">
            {/* 빈 상태 - 아무것도 표시하지 않음 */}
          </div>
        )
      ) : (
        <div className="grid gap-3 md:gap-4">
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:gap-5 sm:px-6">
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
          
          {/* Only show ads when there's substantial content */}
          {filteredCountdowns.length >= 8 && inView && (
            <div ref={adRef} className="mt-8">
              <AdSenseComponent 
                className="flex justify-center my-6"
                adFormat="auto"
                pageType="app"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 