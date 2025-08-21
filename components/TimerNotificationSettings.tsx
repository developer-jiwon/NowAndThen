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
  custom_times: number[] // Custom notification times for this timer
  use_global: boolean // Whether to use global settings
}

const TIME_OPTIONS = [
  { value: 24 * 30, label: '1 month before' },
  { value: 24 * 14, label: '2 weeks before' },
  { value: 24 * 7, label: '1 week before' },
  { value: 24 * 3, label: '3 days before' },
  { value: 24 * 2, label: '2 days before' },
  { value: 24, label: '1 day before' },
  { value: 12, label: '12 hours before' },
  { value: 6, label: '6 hours before' },
  { value: 3, label: '3 hours before' },
  { value: 1, label: '1 hour before' },
  { value: 0.5, label: '30 minutes before' },
  { value: 0.25, label: '15 minutes before' },
  { value: 0, label: 'Exact time' }
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
            <h3 className="font-medium">Timer Notification Settings</h3>
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
          {/* Enable notifications */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Enable notifications</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {settings.enabled && (
            <>
              {/* Use global settings */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Use default settings</p>
                  <p className="text-xs text-gray-500">Follow global notification settings</p>
                </div>
                <Switch
                  checked={settings.use_global}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, use_global: checked }))
                  }
                />
              </div>

              {/* Custom time settings */}
              {!settings.use_global && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Custom notification times</p>
                  
                  {/* Currently set times */
                  {settings.custom_times.length > 0 && (
                    <div className="space-y-2">
                      {settings.custom_times.map((hours) => {
                        const option = TIME_OPTIONS.find(opt => opt.value === hours)
                        return (
                          <div
                            key={hours}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                          >
                            <span>{option?.label || `${hours} hours before`}</span>
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

                  {/* Add new time */}
                  <Select onValueChange={(value) => addCustomTime(Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add notification time..." />
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
                      Add notification times. No notifications will be sent if none are added.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Save buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-[#4E724C] hover:bg-[#3A5A38]"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}