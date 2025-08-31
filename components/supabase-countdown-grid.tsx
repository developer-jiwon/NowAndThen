"use client"

import { useEffect, useRef, useLayoutEffect, useState } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { useCountdowns } from "@/hooks/useCountdowns"
import CountdownCard from "@/components/countdown-card"
import CountdownCompact from "@/components/countdown-compact"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Trash2, Grid3X3, List, Layers3, AlertTriangle, Calendar, Clock, CalendarDays, CalendarRange, FileText } from "lucide-react"
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
  // Sort controls, view mode, and grouping
  const [sortMode, setSortMode] = useState<'future' | 'past'>('future');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [groupMode, setGroupMode] = useState<'none' | 'time'>('none');

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

  // Helper: days distance from today (for sorting)
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const getDays = (c: Countdown) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - todayStart.getTime()) / dayMs);
  };

  // Helper functions for grouping
  const getTimeGroup = (countdown: Countdown) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(countdown.date);
    targetDate.setHours(0, 0, 0, 0);
    
    // Use the same calculation as getDays function for consistency
    const diffMs = targetDate.getTime() - todayStart.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    

    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays <= 7) return 'thisWeek';
    if (diffDays <= 30) return 'thisMonth';
    return 'later';
  };

  const getGroupLabel = (group: string) => {
    switch (group) {
      case 'overdue': return 'Overdue';
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'later': return 'Later';
      default: return '';
    }
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'overdue': return AlertTriangle;
      case 'today': return Calendar;
      case 'tomorrow': return Clock;
      case 'thisWeek': return CalendarDays;
      case 'thisMonth': return CalendarRange;
      case 'later': return FileText;
      default: return Calendar;
    }
  };

  const getGroupOrder = (group: string) => {
    switch (group) {
      case 'overdue': return 0;
      case 'today': return 1;
      case 'tomorrow': return 2;
      case 'thisWeek': return 3;
      case 'thisMonth': return 4;
      case 'later': return 5;
      default: return 6;
    }
  };

  // Sort all countdowns by value (lowest/highest), with pinned items getting priority
  const baseArr = [...modeFilteredCountdowns];
  const compareByValue = (a: Countdown, b: Countdown) => {
    // First, pinned items always come first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Sort by D-day distance from today
    const aDays = getDays(a);
    const bDays = getDays(b);
    
    if (sortMode === 'future') {
      // Future: 미래 날짜 우선, 가까운 미래부터
      // 오늘 > 내일 > 모레 > ... > 과거들
      
      const aIsFuture = aDays >= 0; // 오늘과 미래 (0, -1, -2...)
      const bIsFuture = bDays >= 0;
      
      // 미래 날짜가 과거 날짜보다 우선
      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;
      
      if (aIsFuture && bIsFuture) {
        // 둘 다 미래/오늘: 가까운 미래부터 (0 > -1 > -2...)
        return bDays - aDays;
      } else {
        // 둘 다 과거: 최근 과거부터 (1 > 2 > 3...)
        return aDays - bDays;
      }
      
    } else {
      // Past: 과거 날짜 우선, 최근 과거부터
      // 어제 > 그저께 > ... > 미래들
      
      const aIsPast = aDays < 0; // 과거 (1, 2, 3...)
      const bIsPast = bDays < 0;
      
      // 과거 날짜가 미래 날짜보다 우선
      if (aIsPast && !bIsPast) return -1;
      if (!aIsPast && bIsPast) return 1;
      
      if (aIsPast && bIsPast) {
        // 둘 다 과거: 최근 과거부터 (1 > 2 > 3...)
        return aDays - bDays;
      } else {
        // 둘 다 미래/오늘: 가까운 미래부터 (0 > -1 > -2...)
        return bDays - aDays;
      }
    }
  };
  const sortedCountdowns = baseArr.sort(compareByValue);

  // Group countdowns if grouping is enabled
  const groupedCountdowns = groupMode === 'time' ? 
    Object.entries(
      sortedCountdowns.reduce((groups, countdown) => {
        const group = getTimeGroup(countdown);
        if (!groups[group]) groups[group] = [];
        groups[group].push(countdown);
        return groups;
      }, {} as Record<string, Countdown[]>)
    ).sort(([a], [b]) => getGroupOrder(a) - getGroupOrder(b))
    : [['all', sortedCountdowns]];

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
      process.env.NODE_ENV === 'development' && console.log('Updating memo for countdown:', id, 'memo:', memo);
      await updateCountdown(
        { ...countdown, memo },
        user.id
      );
      process.env.NODE_ENV === 'development' && console.log('Memo updated successfully');
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
      memo: values.memo || "",
    };
    
    try {
      await addCountdown(newCountdown, user.id);
      setShowAddForm(false);
      
      // Switch to the category tab where the timer was created
      const targetCategory = newCountdown.originalCategory || 'general';
      if (targetCategory !== activeTab) {
        setActiveTab(targetCategory);
      }
      
      // Refresh countdowns to show the new timer
      await loadCountdowns(user.id);
      
      // Scroll to top to see the new timer
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error adding countdown:', error);
    }
  };

  if (authLoading || dataLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="w-full flex justify-center">
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
      <div className="w-full flex justify-center">
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
      process.env.NODE_ENV === 'development' && console.log('Sample removed:', sampleId);
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

              onUpdateMemo={() => {}} // 샘플에서는 비활성화
              category={sample.originalCategory || 'general'}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-6 -mb-3 w-full justify-center">
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
      {/* View Mode, Group, and Sort controls */}
      <div className="flex items-center justify-between px-4 mb-3 -mt-2 sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="text-xs text-gray-500">
          {sortedCountdowns.length} timer{sortedCountdowns.length !== 1 ? 's' : ''}
          {sortedCountdowns.length > 1 && groupMode === 'none' && ` • ${sortMode === 'future' ? 'Future first' : 'Past first'}`}
          {groupMode === 'time' && ` • Grouped by time`}
        </div>
        <div className="flex items-center gap-2">
          {/* Grouping Toggle */}
          <button
            className={`px-2 py-1 text-[10px] flex items-center gap-1 border border-[#4E724C]/30 rounded-md ${groupMode==='time'?'bg-[#4E724C] text-white':'bg-white text-[#4E724C] hover:bg-[#4E724C]/5'} transition`}
            onClick={() => setGroupMode(groupMode === 'time' ? 'none' : 'time')}
            title="Group by Time"
          >
            <Layers3 className="w-3 h-3" />
            <span className="hidden sm:inline">Group</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex border border-[#4E724C]/30 rounded-md overflow-hidden">
            <button
              className={`px-2 py-1 text-[10px] flex items-center gap-1 ${viewMode==='card'?'bg-[#4E724C] text-white':'bg-white text-[#4E724C] hover:bg-[#4E724C]/5'} transition`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <Grid3X3 className="w-3 h-3" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              className={`px-2 py-1 text-[10px] flex items-center gap-1 ${viewMode==='compact'?'bg-[#4E724C] text-white':'bg-white text-[#4E724C] hover:bg-[#4E724C]/5'} transition`}
              onClick={() => setViewMode('compact')}
              title="Compact View"
            >
              <List className="w-3 h-3" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
          
          {/* Sort Controls */}
          {groupMode === 'none' && (
            <div className="flex border border-[#4E724C]/30 rounded-md overflow-hidden">
              <button
                className={`px-2 py-1 text-[10px] ${sortMode==='future'?'bg-[#4E724C] text-white':'bg-white text-[#4E724C] hover:bg-[#4E724C]/5'} transition`}
                onClick={() => setSortMode('future')}
              >Future</button>
              <button
                className={`px-2 py-1 text-[10px] ${sortMode==='past'?'bg-[#4E724C] text-white':'bg-white text-[#4E724C] hover:bg-[#4E724C]/5'} transition`}
                onClick={() => setSortMode('past')}
              >Past</button>
            </div>
          )}
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
        <div className="space-y-6">
          {groupedCountdowns.map(([groupKey, countdowns], index) => (
            <div key={`${groupKey}-${index}`}>
              {/* Group Header */}
              {groupMode === 'time' && groupKey !== 'all' && (
                <div className="px-4 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    {(() => {
                      const IconComponent = getGroupIcon(groupKey as string);
                      return <IconComponent className={`w-4 h-4 ${groupKey === 'overdue' ? 'text-red-500' : 'text-[#4E724C]'}`} />;
                    })()}
                    {getGroupLabel(groupKey as string)}
                    <span className="text-xs text-gray-500 font-normal">
                      ({(countdowns as Countdown[]).length} timer{(countdowns as Countdown[]).length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                </div>
              )}
              
              {/* Group Content */}
              <div className="grid gap-3 md:gap-4">
                {viewMode === 'card' ? (
                  <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:gap-5 sm:px-6">
                    {(countdowns as Countdown[]).map((countdown) => (
                      <CountdownCard
                        key={countdown.id}
                        countdown={countdown}
                        onRemove={handleRemove}
                        onToggleVisibility={handleToggleVisibility}
                        onTogglePin={handleTogglePin}
                        onEdit={handleEdit}

                        onUpdateMemo={handleUpdateMemo}
                        category={category}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    {(countdowns as Countdown[]).map((countdown) => (
                      <CountdownCompact
                        key={countdown.id}
                        countdown={countdown}
                        onRemove={handleRemove}
                        onToggleVisibility={handleToggleVisibility}
                        onTogglePin={handleTogglePin}
                        onEdit={handleEdit}

                        onUpdateMemo={handleUpdateMemo}
                        category={category}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Only show ads when there's substantial content */}
          {sortedCountdowns.length >= 6 && (
            <div ref={inViewRef} className="mt-8">
              <AdSenseComponent 
                className="flex justify-center my-6"
                adFormat="auto"
                pageType="app"
                adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GRID as string}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 