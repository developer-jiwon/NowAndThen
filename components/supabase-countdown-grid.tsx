"use client"

import { useEffect, useRef, useLayoutEffect, useState } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { useCountdowns } from "@/hooks/useCountdowns"
import CountdownCard from "@/components/countdown-card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Trash2 } from "lucide-react"
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
  // Sort controls only
  const [sortMode, setSortMode] = useState<'lowest' | 'highest'>('lowest');

  const gridRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
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

  // Filter countdowns based on hidden state
  const filteredCountdowns = countdowns.filter(countdown => {
    const matchesVisibility = showHidden ? countdown.hidden : !countdown.hidden;
    return matchesVisibility;
  });

  // No additional view filter; keep all visible items
  const modeFilteredCountdowns = filteredCountdowns;

  // Helper: absolute days distance from today (for sorting)
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const getAbsDays = (c: Countdown) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - todayStart.getTime()) / dayMs);
    return Math.abs(diff);
  };

  // Sort all countdowns by value (lowest/highest), with pinned items getting priority
  const baseArr = [...modeFilteredCountdowns];
  const compareByValue = (a: Countdown, b: Countdown) => {
    // First, pinned items always come first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then sort by value within each group
    const av = getAbsDays(a);
    const bv = getAbsDays(b);
    return sortMode === 'lowest' ? av - bv : bv - av;
  };
  const sortedCountdowns = baseArr.sort(compareByValue);

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

  const handleUpdateMemo = async (id: string, memo: string) => {
    if (!user) return;
    const countdown = countdowns.find(c => c.id === id);
    if (!countdown) return;
    
    try {
      console.log('Updating memo for countdown:', id, 'memo:', memo);
      await updateCountdown(
        { ...countdown, memo },
        user.id
      );
      console.log('Memo updated successfully');
      // No forced reload; state already updated optimistically in hook
    } catch (error) {
      console.error('Error updating memo:', error);
    }
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
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm">Loading your timers...</span>
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

  if (sortedCountdowns.length === 0 && !showAddForm && showSamples && category === 'pinned') {
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
      <div className="flex flex-col items-center justify-center pt-1 pb-0 w-full">
        <div className="mb-5 mt-0 text-[10px] text-gray-400">Sample timers. Click edit to convert, or clear all.</div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 px-4 w-full max-w-4xl mb-0">
          {sampleCountdowns.map((sample) => (
            <CountdownCard
              key={sample.id}
              countdown={sample}
              onRemove={handleSampleRemove}
              onToggleVisibility={() => {}} // 샘플에서는 비활성화
              onTogglePin={() => {}} // 샘플에서는 비활성화
              onEdit={() => handleSampleEdit(sample)}
              onDuplicate={() => {}} // 샘플에서는 비활성화
              onUpdateMemo={() => {}} // 샘플에서는 비활성화
              category={sample.originalCategory || 'general'}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-6 mb-0 self-center">
          <Button
            variant="outline"
            onClick={() => setActiveTab('custom')}
            className="h-7 text-[12px] font-medium rounded-full px-3 border border-[#4E724C] text-[#3A5A38] bg-white hover:bg-[#4E724C]/10 shadow-none flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Timer
          </Button>
          <Button
            variant="outline"
            onClick={handleClearAllSamples}
            className="h-7 text-[12px] font-medium rounded-full px-3 border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50/40 shadow-none flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Samples
          </Button>
        </div>
      </div>
    );
  }

  // Custom 탭에서는 바로 폼 표시
  if (category === 'custom' && sortedCountdowns.length === 0 && !showAddForm) {
    return (
      <div className="-mt-2 mb-0 flex justify-center">
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
      <div className="my-0 flex justify-center">
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



  // Show search results or empty state for other tabs
  if (sortedCountdowns.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        category === 'general' ? 'pt-0 pb-0 -mb-6' :
        category === 'personal' ? 'pt-0 pb-0 -mb-4 -mt-2' :
        showHidden ? 'pt-0 pb-0 -mb-0 -mt-6' :
        'pt-2 pb-0 -mb-8'
      }`}>
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm p-4 w-[280px] sm:w-[300px] inline-flex flex-col items-center justify-center mx-auto shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4E724C]/10 to-[#3A5A38]/10 flex items-center justify-center mb-3">
            {showHidden ? (
              <svg className="w-6 h-6 text-[#4E724C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M9 9a3 3 0 015.83 1.28L15.54 15.54a3 3 0 01-5.83-1.28L9 9z" />
              </svg>
            ) : category === 'general' ? (
              <svg className="w-6 h-6 text-[#4E724C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : category === 'personal' ? (
              <svg className="w-6 h-6 text-[#4E724C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : category === 'custom' ? (
              <svg className="w-6 h-6 text-[#4E724C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[#4E724C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-base font-semibold text-gray-900 mb-1.5 text-center">
            {showHidden 
              ? "Nothing hidden" 
              : category === 'pinned'
              ? "Start your journey"
              : category === 'general'
              ? "Ready to organize"
              : category === 'personal'
              ? "Your story begins"
              : category === 'custom'
              ? "Create something unique"
              : `No ${category} timers`}
          </h3>
          
          <p className="text-gray-600 text-xs mb-3 text-center leading-relaxed">
            {category === 'pinned' 
              ? "Pin your most important moments and keep them close."
              : category === 'general'
              ? "Track deadlines, goals, and important milestones."
              : category === 'personal'
              ? "Your personal milestones and special moments."
              : category === 'custom'
              ? "Design your own unique countdowns and track what matters to you."
              : showHidden
              ? "Hidden timers will appear here when you need them."
              : "Create custom timers for your unique needs."}
          </p>
          
          {category === 'pinned' && (
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1 h-1 rounded-full bg-[#4E724C]"></div>
                  <span>Project deadlines</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1 h-1 rounded-full bg-[#4E724C]"></div>
                  <span>Birthdays & anniversaries</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1 h-1 rounded-full bg-[#4E724C]"></div>
                  <span>Fitness goals</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1 h-1 rounded-full bg-[#4E724C]"></div>
                  <span>Exam preparation</span>
                </div>
              </div>
            </div>
          )}
          
          {category === 'general' && (
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Work deadlines</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Project milestones</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Meeting schedules</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Goal targets</span>
                </div>
              </div>
            </div>
          )}
          
          {category === 'personal' && (
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Personal goals</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Health milestones</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Learning targets</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4E724C]"></div>
                  <span>Life events</span>
                </div>
              </div>
            </div>
          )}
          
          {!showHidden && (
            <div className="text-center">
              <Button 
                onClick={() => setActiveTab('custom')}
                className="bg-transparent border-0 shadow-none px-0 py-0 text-[11px] text-[#3A5A38] hover:text-[#2F4A2E] font-medium underline-offset-2 hover:underline"
              >
                Create Timer
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sort controls */}
      <div className="flex items-center justify-start px-4 mb-2 mt-0 sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 text-[11px] rounded-md border ${sortMode==='lowest'?'bg-[#4E724C] text-white border-[#4E724C]':'bg-white text-[#4E724C] border-[#4E724C]/30'} transition`}
            onClick={() => setSortMode('lowest')}
          >Lowest</button>
          <button
            className={`px-2 py-1 text-[11px] rounded-md border ${sortMode==='highest'?'bg-[#4E724C] text-white border-[#4E724C]':'bg-white text-[#4E724C] border-[#4E724C]/30'} transition`}
            onClick={() => setSortMode('highest')}
          >Highest</button>
        </div>
      </div>
      
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

      {/* Empty State */}
      {sortedCountdowns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-2">
          {/* 빈 상태 - 아무것도 표시하지 않음 */}
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4">
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:gap-5 sm:px-6">
            {sortedCountdowns.map((countdown) => (
              <CountdownCard
                key={countdown.id}
                countdown={countdown}
                onRemove={handleRemove}
                onToggleVisibility={handleToggleVisibility}
                onTogglePin={handleTogglePin}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onUpdateMemo={handleUpdateMemo}
                category={category}
              />
            ))}
          </div>
          
          {/* Only show ads when there's substantial content */}
          {sortedCountdowns.length >= 8 && (
            <div ref={inViewRef} className="mt-8">
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