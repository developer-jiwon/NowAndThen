"use client"

import { useEffect, useRef, useLayoutEffect, useState } from "react"
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth"
import { useCountdowns } from "@/hooks/useCountdowns"
import CountdownCard from "@/components/countdown-card"
import CountdownCompact from "@/components/countdown-compact"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Trash2, Grid3X3, List, Layers3, AlertTriangle, Calendar, Clock, CalendarDays, CalendarRange } from "lucide-react"
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
  // View mode and grouping controls
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [groupMode, setGroupMode] = useState<'none' | 'time'>('none');
  
  // Country selection for holidays
  const [selectedCountry, setSelectedCountry] = useState('KR');

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

  // Helper: D-day calculation in user's local timezone (no UTC parsing pitfalls)
  const dayMs = 24 * 60 * 60 * 1000;
  const getLocalMidnightFromString = (dateStr: string) => {
    // If the string is plain YYYY-MM-DD, parse as local date to avoid UTC shift
    const simple = /^\d{4}-\d{2}-\d{2}$/;
    if (simple.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, (m as number) - 1, d as number, 0, 0, 0, 0);
    }
    // Otherwise, parse normally and normalize to local midnight
    const dt = new Date(dateStr);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
  };
  const getTodayLocalMidnight = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  };
  const getDDay = (c: Countdown) => {
    const todayStart = getTodayLocalMidnight();
    const targetStart = getLocalMidnightFromString(c.date);
    // Positive when target is in the future by N days (in ms may be 23/25h at DST; round to days)
    const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / dayMs);
    // D-day convention: future -> negative (D-1), past -> positive (D+1)
    return -diffDays;
  };

  // Helper functions for grouping
  const getTimeGroup = (countdown: Countdown) => {
    const dDay = getDDay(countdown);
    
    if (dDay > 0) return 'overdue';    // D+1, D+2... (과거)
    if (dDay === 0) return 'today';    // D-day (오늘)
    if (dDay === -1) return 'tomorrow'; // D-1 (내일)
    if (dDay >= -7) return 'thisWeek'; // D-2 to D-7 (이번 주)
    if (dDay >= -30) return 'thisMonth'; // D-8 to D-30 (이번 달)
    return 'later';                    // D-31... (먼 미래)
  };

  const getGroupLabel = (group: string) => {
    switch (group) {
      case 'overdue': return 'Past Due';
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'later': return 'Future';
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
      case 'later': return CalendarRange;
      default: return Calendar;
    }
  };

  const getGroupOrder = (group: string) => {
    // Closest first: today -> tomorrow -> thisWeek -> thisMonth -> later -> overdue
    switch (group) {
      case 'today': return 0;
      case 'tomorrow': return 1;
      case 'thisWeek': return 2;
      case 'thisMonth': return 3;
      case 'later': return 4;
      case 'overdue': return 5;
      default: return 6;
    }
  };

  // Sort all countdowns by value (lowest/highest), with pinned items getting priority
  const baseArr = [...modeFilteredCountdowns];
  const compareByValue = (a: Countdown, b: Countdown) => {
    // Sort by D-day (upcoming first): 0, -1, -2, ... then 1, 2, 3 ...
    const aDDay = getDDay(a);
    const bDDay = getDDay(b);
    
    // Explicitly prioritize today first
    if (aDDay === 0 && bDDay !== 0) return -1;
    if (bDDay === 0 && aDDay !== 0) return 1;

    const aFuture = aDDay < 0; // future only (exclude today)
    const bFuture = bDDay < 0;

    // Future (including today already handled) before past
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;

    let diff: number;
    if (aFuture && bFuture) {
      // Both future: -1 before -47 (i.e., less negative first)
      diff = bDDay - aDDay; // desc on negatives
    } else if (!aFuture && !bFuture) {
      // Both past: 1 before 27 (asc on positives)
      diff = aDDay - bDDay;
    } else {
      // Should not reach here due to earlier branches
      diff = 0;
    }
    if (diff !== 0) return diff;
    
    // Tie-breaker: pinned first within same D-day bucket
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Final tie-breaker: alphabetical by title for stability
    return (a.title || '').localeCompare(b.title || '');
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
      // Width checking logic can be added here if needed
      // Currently no width-based logic needed
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

  // Countries and holidays data
  const countries = [
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
  ];

  const getHolidaysForCountry = (countryCode: string) => {
    const currentYear = new Date().getFullYear();
    const holidaysByCountry: Record<string, any[]> = {
      'KR': [
        {
          id: `kr-newyear${currentYear}`,
          title: 'New Year\'s Day',
          date: `${currentYear}-01-01`,
          memo: 'The first day of the year in the Gregorian calendar',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-seollal${currentYear}`,
          title: 'Lunar New Year',
          date: `${currentYear}-01-29`,
          memo: 'Korean traditional New Year based on lunar calendar',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-independence${currentYear}`,
          title: 'Independence Movement Day',
          date: `${currentYear}-03-01`,
          memo: 'Commemorates the March 1st Movement against Japanese rule',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-childrens${currentYear}`,
          title: 'Children\'s Day',
          date: `${currentYear}-05-05`,
          memo: 'A day to celebrate children and promote their welfare',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-buddha${currentYear}`,
          title: 'Buddha\'s Birthday',
          date: `${currentYear}-05-12`,
          memo: 'Celebrates the birth of Gautama Buddha',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-memorial${currentYear}`,
          title: 'Memorial Day',
          date: `${currentYear}-06-06`,
          memo: 'Honors those who died in military service for Korea',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-liberation${currentYear}`,
          title: 'Liberation Day',
          date: `${currentYear}-08-15`,
          memo: 'Commemorates liberation from Japanese colonial rule',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-chuseok${currentYear}`,
          title: 'Chuseok',
          date: `${currentYear}-10-06`,
          memo: 'Korean harvest festival and time to honor ancestors',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-national${currentYear}`,
          title: 'National Foundation Day',
          date: `${currentYear}-10-03`,
          memo: 'Celebrates the foundation of the Korean nation',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-hangeul${currentYear}`,
          title: 'Hangeul Day',
          date: `${currentYear}-10-09`,
          memo: 'Celebrates the creation of the Korean alphabet',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `kr-christmas${currentYear}`,
          title: 'Christmas Day',
          date: `${currentYear}-12-25`,
          memo: 'Celebrates the birth of Jesus Christ',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
      ],
      'JP': [
        {
          id: `jp-newyear${currentYear}`,
          title: 'New Year\'s Day',
          date: `${currentYear}-01-01`,
          memo: 'The first day of the year celebrated nationwide',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-comingofage${currentYear}`,
          title: 'Coming of Age Day',
          date: `${currentYear}-01-08`,
          memo: 'Celebrates people who have reached the age of majority',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-national${currentYear}`,
          title: 'National Foundation Day',
          date: `${currentYear}-02-11`,
          memo: 'Commemorates the founding of Japan by Emperor Jimmu',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-vernal${currentYear}`,
          title: 'Vernal Equinox Day',
          date: `${currentYear}-03-20`,
          memo: 'Day when day and night are of equal length',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-showa${currentYear}`,
          title: 'Showa Day',
          date: `${currentYear}-04-29`,
          memo: 'Honors Emperor Showa and reflects on his reign',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-constitution${currentYear}`,
          title: 'Constitution Memorial Day',
          date: `${currentYear}-05-03`,
          memo: 'Commemorates the adoption of Japan\'s constitution',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-greenery${currentYear}`,
          title: 'Greenery Day',
          date: `${currentYear}-05-04`,
          memo: 'Celebrates nature and the environment',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `jp-childrens${currentYear}`,
          title: 'Children\'s Day',
          date: `${currentYear}-05-05`,
          memo: 'Celebrates the happiness and well-being of children',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
      ],
      'CN': [
        {
          id: `cn-newyear${currentYear}`,
          title: 'New Year\'s Day',
          date: `${currentYear}-01-01`,
          memo: '元旦',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `cn-springfestival${currentYear}`,
          title: 'Spring Festival',
          date: `${currentYear}-01-29`,
          memo: '春节',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `cn-labour${currentYear}`,
          title: 'Labour Day',
          date: `${currentYear}-05-01`,
          memo: '劳动节',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `cn-national${currentYear}`,
          title: 'National Day',
          date: `${currentYear}-10-01`,
          memo: '国庆节',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
      ],
      'CA': [
        {
          id: `ca-newyear${currentYear}`,
          title: 'New Year\'s Day',
          date: `${currentYear}-01-01`,
          memo: 'Happy New Year!',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `ca-familyday${currentYear}`,
          title: 'Family Day',
          date: `${currentYear}-02-17`,
          memo: 'Family Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `ca-goodfriday${currentYear}`,
          title: 'Good Friday',
          date: `${currentYear}-04-18`,
          memo: 'Good Friday',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `ca-canada${currentYear}`,
          title: 'Canada Day',
          date: `${currentYear}-07-01`,
          memo: 'Canada Day!',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `ca-labour${currentYear}`,
          title: 'Labour Day',
          date: `${currentYear}-09-01`,
          memo: 'Labour Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `ca-thanksgiving${currentYear}`,
          title: 'Thanksgiving',
          date: `${currentYear}-10-13`,
          memo: 'Canadian Thanksgiving',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `ca-christmas${currentYear}`,
          title: 'Christmas Day',
          date: `${currentYear}-12-25`,
          memo: 'Merry Christmas!',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
      ],
      'US': [
        {
          id: `us-newyear${currentYear}`,
          title: 'New Year\'s Day',
          date: `${currentYear}-01-01`,
          memo: 'Happy New Year!',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-mlk${currentYear}`,
          title: 'Martin Luther King Jr. Day',
          date: `${currentYear}-01-20`,
          memo: 'MLK Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-presidents${currentYear}`,
          title: 'Presidents\' Day',
          date: `${currentYear}-02-17`,
          memo: 'Presidents\' Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-memorial${currentYear}`,
          title: 'Memorial Day',
          date: `${currentYear}-05-26`,
          memo: 'Memorial Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-independence${currentYear}`,
          title: 'Independence Day',
          date: `${currentYear}-07-04`,
          memo: 'Fourth of July!',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-labor${currentYear}`,
          title: 'Labor Day',
          date: `${currentYear}-09-01`,
          memo: 'Labor Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-thanksgiving${currentYear}`,
          title: 'Thanksgiving',
          date: `${currentYear}-11-27`,
          memo: 'Thanksgiving Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `us-christmas${currentYear}`,
          title: 'Christmas Day',
          date: `${currentYear}-12-25`,
          memo: 'Merry Christmas!',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
      ],
      'IN': [
        {
          id: `in-republic${currentYear}`,
          title: 'Republic Day',
          date: `${currentYear}-01-26`,
          memo: 'Republic Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `in-independence${currentYear}`,
          title: 'Independence Day',
          date: `${currentYear}-08-15`,
          memo: 'Independence Day',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `in-gandhi${currentYear}`,
          title: 'Gandhi Jayanti',
          date: `${currentYear}-10-02`,
          memo: 'Gandhi Jayanti',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
        {
          id: `in-diwali${currentYear}`,
          title: 'Diwali',
          date: `${currentYear}-10-20`,
          memo: 'Festival of Lights',
          hidden: false,
          pinned: false,
          originalCategory: 'holidays' as const,
        },
      ],
    };

    return holidaysByCountry[countryCode] || [];
  };

  // Holidays tab rendering
  if (category === 'holidays') {
    const holidays = getHolidaysForCountry(selectedCountry);
    
    // Sort holidays by closest D-day first
    const sortedHolidays = [...holidays].sort((a, b) => {
      const aDDay = getDDay(a);
      const bDDay = getDDay(b);
      return aDDay - bDDay;
    });

    return (
      <div className="flex flex-col items-center justify-center pt-1 pb-0 w-full">
        {/* Country Selection Dropdown */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-600">Select Country:</span>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-2 focus:ring-[#4E724C]/20 focus:border-[#4E724C] outline-none"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5 mt-0 text-[10px] text-gray-400">
          Public holidays for {new Date().getFullYear()}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 px-4 w-full max-w-4xl mb-0">
          {sortedHolidays.map((holiday) => (
            <CountdownCard
              key={holiday.id}
              countdown={holiday}
              onRemove={() => {}} // 공휴일은 삭제 불가
              onToggleVisibility={() => {}} // 공휴일은 숨기기 불가
              onTogglePin={() => {}} // 공휴일은 핀 불가
              onEdit={() => {}} // 공휴일은 편집 불가
              onUpdateMemo={() => {}} // 공휴일은 메모 수정 불가
              category="holidays"
            />
          ))}
        </div>
        
        <div className="flex gap-2 mt-6 -mb-3 w-full justify-center">
          <div className="text-[11px] text-gray-500 text-center">
            Enjoy your holidays! These are read-only public holidays.
          </div>
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
          
          {!showHidden && category !== 'holidays' && (
            <div className="text-center">
              <Button 
                onClick={() => setShowAddForm(true)}
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
      {/* View Mode, Group, Sort controls and Add Button */}
      <div className="flex items-center justify-between px-4 mb-3 -mt-2 sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="text-xs text-gray-500">
          {sortedCountdowns.length} timer{sortedCountdowns.length !== 1 ? 's' : ''}
          {sortedCountdowns.length > 1 && groupMode === 'none' && ` • D-day order`}
          {groupMode === 'time' && ` • Grouped by time`}
        </div>
        <div className="flex items-center gap-2">
          {/* Add Timer Button */}
          {category !== 'holidays' && (
            <button
              className="w-7 h-7 bg-black text-white hover:bg-gray-800 flex items-center justify-center transition-colors rounded-md relative animate-pulse shadow-lg"
              style={{
                boxShadow: '0 0 10px rgba(134, 167, 137, 0.6), 0 0 20px rgba(134, 167, 137, 0.4), 0 0 30px rgba(134, 167, 137, 0.2)',
                animation: 'neon-glow 2s ease-in-out infinite alternate'
              }}
              onClick={() => setShowAddForm(true)}
              title="Create Timer"
            >
              <Plus className="w-3.5 h-3.5" />
              <style jsx>{`
                @keyframes neon-glow {
                  from {
                    box-shadow: 0 0 5px rgba(134, 167, 137, 0.4), 0 0 10px rgba(134, 167, 137, 0.3), 0 0 15px rgba(134, 167, 137, 0.2);
                  }
                  to {
                    box-shadow: 0 0 10px rgba(134, 167, 137, 0.8), 0 0 20px rgba(134, 167, 137, 0.6), 0 0 30px rgba(134, 167, 137, 0.4);
                  }
                }
              `}</style>
            </button>
          )}
          
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