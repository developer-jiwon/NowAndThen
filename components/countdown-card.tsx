"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, Pin, PinOff, Clock, Edit } from "lucide-react"
import type { Countdown } from "@/lib/types"
import { calculateTimeRemaining } from "@/lib/countdown-utils"

interface CountdownCardProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  onEdit?: (id: string) => void
  category: string
}

export default function CountdownCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  onEdit,
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
      <CardHeader className={`py-2 sm:py-3 ${headerClass} relative flex items-center justify-center min-h-[50px] sm:min-h-[60px]`}>
        {/* Left side icons */}
        <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
              onClick={() => onTogglePin(countdown.id)}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <PinOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pin className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          )}
          {isCountUp && <Clock className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />}
        </div>
        
        {/* Right side icons */}
        <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
            onClick={() => onToggleVisibility(countdown.id)}
            title={countdown.hidden ? "Show" : "Hide"}
          >
            {category === "hidden" ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : (countdown.hidden ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />)}
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
              onClick={() => onEdit(countdown.id)}
              title="Edit"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          {(
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
              onClick={() => onRemove(countdown.id)}
              title="Remove"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
        
        <CardTitle className="font-merriweather text-center text-sm sm:text-base px-12 sm:px-16">{countdown.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="font-merriweather text-charcoal">
          {isPast ? (
            <div className="text-center">
              <p className="text-base sm:text-lg font-bold text-gray-500">This event has passed</p>
              <p className="text-xs sm:text-sm text-gray-400">{new Date(countdown.date).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold">{timeRemaining.days}</span>
                <span className="text-[10px] sm:text-xs uppercase">Days</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold">{timeRemaining.hours}</span>
                <span className="text-[10px] sm:text-xs uppercase">Hours</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold">{timeRemaining.minutes}</span>
                <span className="text-[10px] sm:text-xs uppercase">Mins</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold">{timeRemaining.seconds}</span>
                <span className="text-[10px] sm:text-xs uppercase">Secs</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 sm:pb-4 px-3 sm:px-6">
        <p className="text-xs sm:text-sm text-gray-500 w-full text-center">
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

