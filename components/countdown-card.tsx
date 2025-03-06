"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, Pin, PinOff, Clock } from "lucide-react"
import type { Countdown } from "@/lib/types"
import { calculateTimeRemaining } from "@/lib/countdown-utils"

interface CountdownCardProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  category: string
}

export default function CountdownCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  category,
}: CountdownCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(countdown.date, countdown.isCountUp))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(countdown.date, countdown.isCountUp))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown.date, countdown.isCountUp])

  const isPast = !countdown.isCountUp && timeRemaining.total <= 0
  const isCustom = category === "custom" || (category === "pinned" && countdown.originalCategory === "custom")
  const isPinned = countdown.pinned || false
  const isCountUp = countdown.isCountUp || false

  // Determine header color based on countdown/countup type
  const headerClass = isPast
    ? "bg-gray-100"
    : isCountUp
      ? "bg-gradient-to-r from-emerald-700 to-emerald-600 text-white"
      : "bg-gradient-to-r from-charcoal to-charcoal/90 text-white"

  return (
    <Card className="overflow-hidden border-charcoal/10 transition-all hover:shadow-md">
      <CardHeader className={`py-3 ${headerClass} relative flex items-center justify-center min-h-[60px]`}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-1">
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-current hover:bg-white/10"
              onClick={() => onTogglePin(countdown.id)}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-current hover:bg-white/10"
            onClick={() => onToggleVisibility(countdown.id)}
            title={countdown.hidden ? "Show" : "Hide"}
          >
            {countdown.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          {isCustom && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-current hover:bg-white/10"
              onClick={() => onRemove(countdown.id)}
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{isCountUp && <Clock className="h-4 w-4" />}</div>
        <CardTitle className="font-merriweather text-center text-base px-10">{countdown.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="font-merriweather text-charcoal">
          {isPast ? (
            <div className="text-center">
              <p className="text-lg font-bold text-gray-500">This event has passed</p>
              <p className="text-sm text-gray-400">{new Date(countdown.date).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{timeRemaining.days}</span>
                <span className="text-xs uppercase">Days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{timeRemaining.hours}</span>
                <span className="text-xs uppercase">Hours</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{timeRemaining.minutes}</span>
                <span className="text-xs uppercase">Mins</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{timeRemaining.seconds}</span>
                <span className="text-xs uppercase">Secs</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <p className="text-sm text-gray-500 w-full text-center">
          {isCountUp ? (
            <>
              Since{" "}
              {countdown.description ||
                new Date(countdown.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </>
          ) : (
            <>
              {countdown.description ||
                new Date(countdown.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}

