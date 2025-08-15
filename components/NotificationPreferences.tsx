"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Bell, Settings, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface NotificationSettings {
  custom_times: number[] // 시간 단위로 저장 (24, 1, 0.5 등)
  daily_summary: boolean // 매일 요약 알림
  daily_summary_time: string // 매일 요약 시간 (HH:MM 형태)
  timezone: string // 사용자 타임존
}

interface NotificationPreferencesProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (settings: NotificationSettings) => void
}

const TIME_OPTIONS = [
  { value: 24 * 7, label: '7일 전' },
  { value: 24 * 3, label: '3일 전' },
  { value: 24, label: '1일 전' }
]

export default function NotificationPreferences({ isOpen, onClose, onSave }: NotificationPreferencesProps) {
  const user = useUser()
  // 현재 시간 + 1분 후를 기본값으로 (테스트용)
  const getDefaultSummaryTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 1)
    return now.toTimeString().slice(0, 5) // HH:MM 형태
  }

  const [settings, setSettings] = useState<NotificationSettings>({
    custom_times: [24], // 기본값: 1일 전
    daily_summary: false, // 기본값: 끔
    daily_summary_time: getDefaultSummaryTime(), // 기본값: 지금 + 1분
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // 사용자 타임존 자동 감지
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadPreferences()
    }
  }, [user, isOpen])

  const loadPreferences = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('notification_preferences')
        .eq('user_id', user.id)
        .maybeSingle() // Use maybeSingle instead of single to handle no rows

      if (error) {
        console.warn('Failed to load notification preferences:', error.message)
        return
      }

      if (data?.notification_preferences) {
        setSettings({
          custom_times: data.notification_preferences.hours_before ?? [24],
          daily_summary: data.notification_preferences.daily_summary ?? false,
          daily_summary_time: data.notification_preferences.daily_summary_time ?? getDefaultSummaryTime(),
          timezone: data.notification_preferences.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      }
    } catch (error) {
      console.warn('Error loading preferences:', error)
    }
  }

  const savePreferences = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // DB에 설정 저장
      const notificationPrefs = {
        hours_before: settings.custom_times,
        daily_summary: settings.daily_summary,
        daily_summary_time: settings.daily_summary_time,
        timezone: settings.timezone
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.id,
            notification_preferences: notificationPrefs,
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )

      if (error) {
        console.error('Error saving to DB:', error)
        toast.error('설정 저장에 실패했습니다.')
        return
      }

      toast.success('알림 설정이 저장되었습니다!')
      
      // 외부에서 전달된 onSave 콜백 실행 (실제 구독 처리)
      if (onSave) {
        onSave(settings)
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('설정 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const addCustomTime = (hours: number) => {
    if (!settings.custom_times.includes(hours)) {
      setSettings(prev => ({
        ...prev,
        custom_times: [...prev.custom_times, hours].sort((a, b) => b - a)
      }))
    }
  }

  const removeCustomTime = (hours: number) => {
    setSettings(prev => ({
      ...prev,
      custom_times: prev.custom_times.filter(time => time !== hours)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4E724C]" />
            <h2 className="text-lg font-semibold">알림 설정</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* 매일 요약 설정 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">매일 요약</p>
                <p className="text-xs text-gray-500">매일 설정한 시간에 오늘의 타이머들 요약</p>
              </div>
              <Switch
                checked={settings.daily_summary}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, daily_summary: checked }))
                }
              />
            </div>

            {/* 요약 시간 설정 */}
            {settings.daily_summary && (
              <div className="ml-0 space-y-2">
                <label className="text-xs text-gray-600">알림 시간</label>
                <input
                  type="time"
                  value={settings.daily_summary_time}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, daily_summary_time: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#4E724C] focus:border-transparent"
                />
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>🌍 {settings.timezone}</span>
                </div>
              </div>
            )}
          </div>

          {/* 알림 시간 설정 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">언제 알림을 받을까요?</h3>
            
            <div className="space-y-3">
              
              {/* 현재 설정된 시간들 */}
              <div className="flex flex-wrap gap-2">
                {settings.custom_times.map((hours) => {
                  const option = TIME_OPTIONS.find(opt => opt.value === hours)
                  return (
                    <div
                      key={hours}
                      className="flex items-center gap-1 bg-[#4E724C]/10 text-[#4E724C] px-2 py-1 rounded text-xs"
                    >
                      <span>{option?.label || `${hours}시간 전`}</span>
                      <button
                        onClick={() => removeCustomTime(hours)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* 새 시간 추가 */}
              <Select onValueChange={(value) => addCustomTime(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="알림 시간 추가..." />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 예시 */}
          {settings.custom_times.length > 0 && (
            <div className="bg-[#4E724C]/5 p-3 rounded-lg border border-[#4E724C]/20">
              <p className="text-xs text-[#4E724C] font-medium">
                ✨ {settings.custom_times.map(h => {
                  const opt = TIME_OPTIONS.find(o => o.value === h)
                  return opt?.label || `${h}시간 전`
                }).join(', ')}에 알림받기
              </p>
            </div>
          )}
        </div>

        {/* 저장 버튼 */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={savePreferences}
            disabled={isLoading}
            className="flex-1 bg-[#4E724C] hover:bg-[#3A5A38]"
          >
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </Card>
    </div>
  )
}