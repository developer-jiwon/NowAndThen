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
import Holidays from 'date-holidays'

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
    if (!user) {
      console.error('No user found for memo update');
      return;
    }
    const countdown = countdowns.find(c => c.id === id);
    if (!countdown) {
      console.error('Countdown not found:', id);
      return;
    }
    
    try {
      console.log('🔍 Updating memo for countdown:', id, 'memo:', memo);
      console.log('🔍 Current countdown:', countdown);
      console.log('🔍 Updated countdown will be:', { ...countdown, memo });
      
      await updateCountdown(
        { ...countdown, memo },
        user.id
      );
      console.log('✅ Memo updated successfully');
      // Reload to ensure UI reflects the change
      await loadCountdowns(user.id);
    } catch (error) {
      console.error('❌ Error updating memo:', error);
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
      pinned: values.pinned || false,
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

  // Show samples only when user has no pinned items
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3 px-4 w-full max-w-5xl mb-0">
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
    try {
      const currentYear = new Date().getFullYear();
      const hd = new Holidays();
      
      // Map country codes to date-holidays format with specific states/regions
      const countryMapping: Record<string, { country: string, state?: string }> = {
        'KR': { country: 'KR' },  // South Korea
        'JP': { country: 'JP' },  // Japan  
        'CN': { country: 'CN' },  // China
        'CA': { country: 'CA', state: 'ON' },  // Canada (Ontario)
        'US': { country: 'US', state: 'CA' },  // United States (California)
        'IN': { country: 'IN' }   // India
      };
      
      const mappedCountry = countryMapping[countryCode];
      if (!mappedCountry) return [];
      
      // Initialize with country and optional state
      if (mappedCountry.state) {
        hd.init(mappedCountry.country, mappedCountry.state);
      } else {
        hd.init(mappedCountry.country);
      }
      
      const holidays = hd.getHolidays(currentYear);
      
      // Remove duplicates by date
      const uniqueHolidays = new Map();
      
      return holidays
        .filter((holiday: any) => holiday.type === 'public') // Only public holidays
        .map((holiday: any) => {
          // Format date to YYYY-MM-DD
          const date = new Date(holiday.date);
          const formattedDate = date.toISOString().split('T')[0];
          
          // Always use English names for all countries
          let translatedName = holiday.name;
          
          // Translate non-English names to English
          const englishNames: Record<string, string> = {
            // Korean holidays
            '신정': "New Year's Day",
            '설날': 'Lunar New Year',
            '3·1절': 'Independence Movement Day',
            '부처님오신날': "Buddha's Birthday",
            '어린이날': "Children's Day",
            '현충일': 'Memorial Day',
            '광복절': 'Liberation Day',
            '추석': 'Chuseok (Harvest Festival)',
            '개천절': 'National Foundation Day',
            '한글날': 'Hangeul Day',
            '기독탄신일': 'Christmas Day',
            '성탄절': 'Christmas Day',
            // Chinese holidays
            '春节': 'Spring Festival (Chinese New Year)',
            '元旦': "New Year's Day",
            '清明节': 'Qingming Festival',
            '劳动节': 'Labour Day',
            '端午节': 'Dragon Boat Festival',
            '中秋节': 'Mid-Autumn Festival',
            '国庆节': 'National Day',
            // Japanese holidays
            '元日': "New Year's Day",
            '成人の日': 'Coming of Age Day',
            '建国記念の日': 'National Foundation Day',
            '春分の日': 'Vernal Equinox Day',
            '昭和の日': 'Showa Day',
            '憲法記念日': 'Constitution Memorial Day',
            'みどりの日': 'Greenery Day',
            'こどもの日': "Children's Day",
            '海の日': 'Marine Day',
            '山の日': 'Mountain Day',
            '敬老の日': 'Respect for the Aged Day',
            '秋分の日': 'Autumnal Equinox Day',
            'スポーツの日': 'Sports Day',
            '文化の日': 'Culture Day',
            '勤労感謝の日': 'Labour Thanksgiving Day',
            '天皇誕生日': "Emperor's Birthday",
          };
          
          // Apply translation if exists, otherwise keep original
          translatedName = englishNames[holiday.name] || holiday.name;
          
          // Generate specific descriptions for each country's holidays
          const countryName = countries.find(c => c.code === countryCode)?.name || countryCode;
          const getHolidayDescription = (holidayName: string, country: string) => {
            // Country-specific holiday descriptions
            const descriptions: Record<string, Record<string, string>> = {
              'KR': {
                "New Year's Day": "The first day of the year - a time for family gatherings and fresh starts in Korea.",
                'Lunar New Year': "Korean New Year (Seollal) - the most important traditional holiday for family reunions.",
                'Independence Movement Day': "Commemorating the March 1st independence movement against Japanese rule in 1919.",
                "Buddha's Birthday": "Celebrating the birth of Buddha with lantern festivals and temple visits.",
                "Children's Day": "A special day dedicated to children's happiness and rights in Korea.",
                'Memorial Day': "Honoring Korean patriots and veterans who sacrificed for the country.",
                'Liberation Day': "Celebrating Korea's liberation from Japanese colonial rule on August 15, 1945.",
                'Chuseok (Harvest Festival)': "Korean Thanksgiving - a major harvest festival for honoring ancestors.",
                'National Foundation Day': "Celebrating the legendary founding of Korea by Dangun in 2333 BC.",
                'Hangeul Day': "Commemorating the creation of the Korean alphabet by King Sejong the Great.",
                'Christmas Day': "Celebrating the birth of Jesus Christ - a public holiday in Korea."
              },
              'JP': {
                "New Year's Day": "The most important holiday in Japan - a time for family, reflection, and new beginnings.",
                'Coming of Age Day': "Celebrating young people who turn 20 years old and reach adulthood in Japan.",
                'National Foundation Day': "Commemorating the legendary founding of Japan by Emperor Jimmu.",
                'Vernal Equinox Day': "Celebrating the spring equinox and honoring ancestors in Buddhist tradition.",
                'Showa Day': "Remembering Emperor Showa's reign and reflecting on Japan's turbulent pre-war era.",
                'Constitution Memorial Day': "Commemorating Japan's post-war constitution that came into effect in 1947.",
                'Greenery Day': "A day to appreciate nature and be grateful for blessings from the environment.",
                "Children's Day": "Celebrating children's happiness and growth with carp streamers (koinobori).",
                'Marine Day': "Appreciating the ocean's bounty and Japan's maritime heritage.",
                'Mountain Day': "A newer holiday to appreciate Japan's mountainous terrain and nature.",
                'Respect for the Aged Day': "Honoring elderly citizens and their contributions to society.",
                'Autumnal Equinox Day': "Celebrating the autumn equinox and remembering deceased family members.",
                'Sports Day': "Promoting health and physical activity - originally commemorating Tokyo Olympics 1964.",
                'Culture Day': "Celebrating arts, culture, academic endeavor, and the pursuit of freedom and peace.",
                'Labour Thanksgiving Day': "Honoring workers and expressing gratitude for labor and production.",
                "Emperor's Birthday": "Celebrating the current Emperor's birthday - Japan's national day."
              },
              'CN': {
                'Spring Festival (Chinese New Year)': "China's most important traditional holiday - a time for family reunions and celebration.",
                "New Year's Day": "The first day of the international calendar year celebrated in modern China.",
                'Qingming Festival': "Tomb Sweeping Day - honoring ancestors by cleaning graves and making offerings.",
                'Labour Day': "International Workers' Day celebrating the contributions of workers to society.",
                'Dragon Boat Festival': "Commemorating poet Qu Yuan with dragon boat races and zongzi rice dumplings.",
                'Mid-Autumn Festival': "A harvest festival celebrating family unity with moon cakes and moon viewing.",
                'National Day': "Celebrating the founding of the People's Republic of China on October 1, 1949."
              },
              'CA': {
                "New Year's Day": "The first day of the year celebrated with resolutions and fresh starts across Canada.",
                'Family Day': "A day to spend quality time with family and loved ones (celebrated in most provinces).",
                'Good Friday': "The Friday before Easter, commemorating the crucifixion of Jesus Christ.",
                'Victoria Day': "Celebrating Queen Victoria's birthday and the official start of summer in Canada.",
                'Canada Day': "Canada's national day commemorating Confederation on July 1, 1867.",
                'Civic Holiday': "A day for community celebration and rest (varies by province).",
                'Labour Day': "Honoring workers and their contributions to Canadian society and economy.",
                'Thanksgiving Day': "A harvest festival for giving thanks for the year's blessings (second Monday in October).",
                'Remembrance Day': "Honoring Canadian veterans and those who died in military service.",
                'Christmas Day': "Celebrating the birth of Jesus Christ with family gatherings and gift-giving.",
                'Boxing Day': "A Canadian tradition of giving to those less fortunate and spending time with family."
              },
              'US': {
                "New Year's Day": "Celebrating the beginning of a new year with resolutions and fresh starts.",
                "Martin Luther King Jr. Day": "Honoring the civil rights leader's legacy and fight for equality.",
                "Presidents' Day": "Commemorating all U.S. presidents, especially Washington and Lincoln.",
                'Memorial Day': "Honoring American military personnel who died while serving their country.",
                'Independence Day': "Celebrating American independence with fireworks, barbecues, and patriotic displays.",
                'Labor Day': "Honoring American workers and their contributions to the nation's economy.",
                'Columbus Day': "Commemorating Christopher Columbus's arrival in the Americas (controversial).",
                'Veterans Day': "Honoring all American military veterans who served in the U.S. Armed Forces.",
                'Thanksgiving Day': "A harvest festival for giving thanks with family gatherings and traditional meals.",
                'Christmas Day': "Celebrating the birth of Jesus Christ with family, gifts, and religious observances."
              },
              'IN': {
                'Republic Day': "Commemorating India's constitution coming into force on January 26, 1950.",
                'Independence Day': "Celebrating India's independence from British rule on August 15, 1947.",
                'Gandhi Jayanti': "Honoring Mahatma Gandhi's birthday and his philosophy of non-violence.",
                'Diwali': "The festival of lights celebrating the triumph of light over darkness.",
                'Holi': "The festival of colors celebrating spring, love, and the victory of good over evil.",
                'Dussehra': "Celebrating the victory of good over evil, commemorating Lord Rama's victory.",
                'Eid al-Fitr': "Celebrating the end of Ramadan with feasts, prayers, and charity.",
                'Eid al-Adha': "The festival of sacrifice commemorating Abraham's willingness to sacrifice his son.",
                'Christmas Day': "Celebrating the birth of Jesus Christ in this diverse, multi-religious nation.",
                'Good Friday': "Commemorating the crucifixion of Jesus Christ, observed by Indian Christians."
              }
            };
            
            return descriptions[country]?.[holidayName] || `Traditional public holiday celebrated in ${countryName}.`;
          };
          
          const memo = getHolidayDescription(translatedName, countryCode);
          
          const holidayObj = {
            id: `${countryCode.toLowerCase()}-${formattedDate}-${holiday.name.replace(/[\s\W]+/g, '').toLowerCase()}`,
            title: translatedName,
            date: formattedDate,
            memo: memo,
            hidden: false,
            pinned: false,
            originalCategory: undefined, // Holidays don't have a category
          };
          
          // Store only first holiday per date to avoid duplicates
          if (!uniqueHolidays.has(formattedDate)) {
            uniqueHolidays.set(formattedDate, holidayObj);
          }
          
          return holidayObj;
        })
        .filter((holiday: any) => {
          // Return only unique holidays
          return uniqueHolidays.get(holiday.date) === holiday;
        })
        .slice(0, 15); // Limit to 15 holidays per country to avoid overwhelming UI
        
    } catch (error) {
      console.error(`Error generating holidays for ${countryCode}:`, error);
      // Fallback to empty array if library fails
      return [];
    }
  };

  // Holidays tab rendering
  if (category === 'holidays') {
    const holidays = getHolidaysForCountry(selectedCountry);
    
    // Sort holidays by closest D-day first using the same logic as other tabs
    const sortedHolidays = [...holidays].sort(compareByValue);

    return (
      <div className="flex flex-col items-center justify-center w-full">
        {/* Country Selection Dropdown */}
        <div className="mb-2 flex items-center gap-2">
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

        <div className="mb-3 text-[10px] text-gray-400">
          Public holidays for {new Date().getFullYear()}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3 px-4 w-full max-w-5xl mb-0">
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
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm p-4 w-full max-w-xs sm:max-w-[250px] flex flex-col items-center justify-center mx-auto">
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
    <div className="font-manrope w-full">
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
              className="w-7 h-7 bg-[#4E724C] text-white hover:bg-[#5A7F58] flex items-center justify-center transition-all duration-200 rounded-md relative animate-pulse shadow-lg hover:shadow-xl"
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
                  <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 px-4 sm:gap-5 sm:px-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
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