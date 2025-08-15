"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, X, Plus } from 'lucide-react'

interface TimerNotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: TimerNotificationSettings) => void
  currentSettings?: TimerNotificationSettings
}

export interface TimerNotificationSettings {
  enabled: boolean
  custom_times: number[] // 이 타이머만의 커스텀 알림 시간
  use_global: boolean // 전역 설정 사용 여부
}

const TIME_OPTIONS = [
  { value: 24 * 30, label: '1달 전' },
  { value: 24 * 14, label: '2주 전' },
  { value: 24 * 7, label: '1주일 전' },
  { value: 24 * 3, label: '3일 전' },
  { value: 24 * 2, label: '2일 전' },
  { value: 24, label: '1일 전' },
  { value: 12, label: '12시간 전' },
  { value: 6, label: '6시간 전' },
  { value: 3, label: '3시간 전' },
  { value: 1, label: '1시간 전' },
  { value: 0.5, label: '30분 전' },
  { value: 0.25, label: '15분 전' },
  { value: 0, label: '정확한 시간' }
]

export default function TimerNotificationSettings({ 
  isOpen, 
  onClose, 
  onSave, 
  currentSettings 
}: TimerNotificationSettingsProps) {
  const [settings, setSettings] = useState<TimerNotificationSettings>(
    currentSettings || {
      enabled: true,
      custom_times: [],
      use_global: true
    }
  )

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

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#4E724C]" />
            <h3 className="font-medium">타이머 알림 설정</h3>
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

        <div className="space-y-4">
          {/* 알림 활성화 */}
          <div className="flex items-center justify-between">
            <span className="text-sm">이 타이머 알림</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {settings.enabled && (
            <>
              {/* 전역 설정 사용 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">기본 설정 사용</p>
                  <p className="text-xs text-gray-500">전역 알림 설정 따르기</p>
                </div>
                <Switch
                  checked={settings.use_global}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, use_global: checked }))
                  }
                />
              </div>

              {/* 커스텀 시간 설정 */}
              {!settings.use_global && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">이 타이머만의 알림 시간</p>
                  
                  {/* 현재 설정된 시간들 */}
                  {settings.custom_times.length > 0 && (
                    <div className="space-y-2">
                      {settings.custom_times.map((hours) => {
                        const option = TIME_OPTIONS.find(opt => opt.value === hours)
                        return (
                          <div
                            key={hours}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                          >
                            <span>{option?.label || `${hours}시간 전`}</span>
                            <button
                              onClick={() => removeCustomTime(hours)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 새 시간 추가 */}
                  <Select onValueChange={(value) => addCustomTime(Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="알림 시간 추가..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.filter(option => 
                        !settings.custom_times.includes(option.value)
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {settings.custom_times.length === 0 && (
                    <p className="text-xs text-gray-500">
                      알림 시간을 추가하세요. 추가하지 않으면 알림이 오지 않습니다.
                    </p>
                  )}
                </div>
              )}
            </>
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
            onClick={handleSave}
            className="flex-1 bg-[#4E724C] hover:bg-[#3A5A38]"
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  )
}