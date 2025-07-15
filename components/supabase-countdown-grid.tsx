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
import EditCountdownForm from "@/components/edit-countdown-form";
import { v4 as uuidv4 } from 'uuid';
import AdSenseComponent from "@/components/AdSenseComponent";

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

  // 사용자가 로드되면 카운트다운 데이터 로드
  useEffect(() => {
    if (user && !authLoading) {
      loadCountdowns(user.id);
    }
  }, [user, authLoading, category]);

  // 예시 타이머 자동 생성 (최초 1회, 해당 카테고리에 아무것도 없을 때만)
  useEffect(() => {
    if (!user || authLoading || dataLoading) return;
    if (category === 'pinned') return;
    // 카테고리별 예시 타이머 정의
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = today.getFullYear();
    const mm = pad(today.getMonth() + 1);
    const dd = pad(today.getDate());
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const defaultExamples: Record<string, Countdown[]> = {
      general: [
        {
          id: uuidv4(),
          title: '100 Day Challenge',
          date: new Date(today.getTime() + 100 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          hidden: false,
          pinned: true,
          originalCategory: 'general',
        },
        {
          id: uuidv4(),
          title: 'Birthday',
          date: `${yyyy}-12-25`,
          hidden: false,
          pinned: true,
          originalCategory: 'general',
        },
      ],
      personal: [
        {
          id: uuidv4(),
          title: 'Work Anniversary',
          date: `${yyyy - 2}-01-01`,
          hidden: false,
          pinned: false,
          originalCategory: 'personal',
        },
        {
          id: uuidv4(),
          title: 'Wedding Anniversary',
          date: `${yyyy - 4}-05-20`,
          hidden: false,
          pinned: false,
          originalCategory: 'personal',
        },
      ],
      custom: [
        {
          id: uuidv4(),
          title: 'My Custom Timer',
          date: dateStr,
          hidden: false,
          pinned: false,
          originalCategory: 'custom',
        },
      ],
    };
    const examples = defaultExamples[category] || [];
    // 중복 체크: 이미 같은 title/date/pinned 조합이 있으면 생성하지 않음
    const alreadyExists = (title: string, date: string, pinned: boolean) =>
      countdowns.some(c => c.title === title && c.date === date && c.pinned === pinned);
    const toAdd = examples.filter(ex => !alreadyExists(ex.title, ex.date, !!ex.pinned));
    if (toAdd.length === 0) return;
    Promise.all(toAdd.map(example => addCountdown(example, user.id))).then(() => {
      loadCountdowns(user.id);
    });
  }, [user, authLoading, dataLoading, countdowns.length, category]);

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

  const handleEdit = (id: string) => {
    setEditingCountdownId(id);
  };

  const handleSaveEdit = async (id: string, updatedData: Partial<Countdown>, newCategory?: string) => {
    if (!user) return;
    const countdownToUpdate = countdowns.find((c) => c.id === id);
    if (!countdownToUpdate) return;
    // 카테고리 변경 시 이동
    if (newCategory && newCategory !== category) {
      // 기존 카테고리에서 제거
      await deleteCountdown(id, user.id);
      // 새 카테고리에 추가
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
    // 카테고리 변경 없으면 업데이트
    await updateCountdown({ ...countdownToUpdate, ...updatedData }, user.id);
    setEditingCountdownId(null);
    await loadCountdowns(user.id);
  };

  const handleCancelEdit = () => {
    setEditingCountdownId(null);
  };

  const handleAddCountdown = async (values: any) => {
    if (!user) return;
    // category는 values.category(사용자 선택값)로 저장
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
      // custom 탭에서 추가한 경우, custom 탭을 즉시 새로고침해서 방금 만든 게 안 보이게
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

  // Edit 모드일 때 EditCountdownForm 보여주기
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
    <div className="w-full mt-3">
      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 mt-2 flex justify-center">
          <div className="max-w-sm mx-auto w-full">
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
        <div className="mb-3 mt-2 flex justify-center">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="w-auto px-5 py-2 mx-auto flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Timer
          </Button>
        </div>
      )}

      {/* Countdowns Grid */}
      {category === 'custom' ? null : (
        sortedCountdowns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {showHidden 
                ? "No hidden countdowns" 
                : `No ${category} countdowns`
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            {/* Safe AdSense placement: only show with real content */}
            <div className="flex justify-center mt-4">
              <AdSenseComponent />
            </div>
          </>
        )
      )}
    </div>
  );
} 