"use client"

import { useEffect, useState } from "react"
import CountdownCard from "./countdown-card"
import { getCountdowns, getAllPinnedCountdowns } from "@/lib/countdown-utils"
import type { Countdown } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableCardProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  category: string
  isDragging: boolean
}

function SortableCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  category,
  isDragging,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: countdown.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-grab z-10 bg-gradient-to-r from-gray-100/80 to-transparent"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-6 w-6 text-gray-400" />
      </div>
      <div className="pl-6">
        <CountdownCard
          countdown={countdown}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
          onTogglePin={onTogglePin}
          category={category}
        />
      </div>
    </div>
  )
}

export default function CountdownGrid({ category }: { category: string }) {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Reduce the activation constraint to make it easier to start dragging
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    // Load countdowns from localStorage or default ones
    let loadedCountdowns: Countdown[] = []

    if (category === "pinned") {
      loadedCountdowns = getAllPinnedCountdowns()
    } else {
      loadedCountdowns = getCountdowns(category)
    }

    setCountdowns(loadedCountdowns)
    setLoading(false)
  }, [category])

  const handleRemove = (id: string) => {
    if (category === "pinned") {
      // For pinned countdowns, we need to find the original category and update there
      const countdownToRemove = countdowns.find((c) => c.id === id)
      if (countdownToRemove && countdownToRemove.originalCategory) {
        const originalCategory = countdownToRemove.originalCategory
        const originalCountdowns = JSON.parse(localStorage.getItem(`countdowns_${originalCategory}`) || "[]")
        const updatedOriginalCountdowns = originalCountdowns.filter((c: Countdown) => c.id !== id)
        localStorage.setItem(`countdowns_${originalCategory}`, JSON.stringify(updatedOriginalCountdowns))
      }
    }

    const updatedCountdowns = countdowns.filter((countdown) => countdown.id !== id)
    setCountdowns(updatedCountdowns)

    // Update localStorage for the current category
    if (category !== "pinned") {
      localStorage.setItem(`countdowns_${category}`, JSON.stringify(updatedCountdowns))
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updatedCountdowns = countdowns.map((countdown) =>
      countdown.id === id ? { ...countdown, hidden: !countdown.hidden } : countdown,
    )
    setCountdowns(updatedCountdowns)

    // Update localStorage
    if (category === "pinned") {
      // For pinned countdowns, we need to find the original category and update there
      const countdownToUpdate = countdowns.find((c) => c.id === id)
      if (countdownToUpdate && countdownToUpdate.originalCategory) {
        const originalCategory = countdownToUpdate.originalCategory
        const originalCountdowns = JSON.parse(localStorage.getItem(`countdowns_${originalCategory}`) || "[]")
        const updatedOriginalCountdowns = originalCountdowns.map((c: Countdown) =>
          c.id === id ? { ...c, hidden: !countdownToUpdate.hidden } : c,
        )
        localStorage.setItem(`countdowns_${originalCategory}`, JSON.stringify(updatedOriginalCountdowns))
      }
    } else {
      localStorage.setItem(`countdowns_${category}`, JSON.stringify(updatedCountdowns))
    }
  }

  const handleTogglePin = (id: string) => {
    const countdownToToggle = countdowns.find((c) => c.id === id)
    if (!countdownToToggle) return

    const isPinned = countdownToToggle.pinned || false

    // Update the current list
    const updatedCountdowns = countdowns.map((countdown) =>
      countdown.id === id ? { ...countdown, pinned: !isPinned } : countdown,
    )

    setCountdowns(updatedCountdowns)

    // If we're in the pinned category and unpinning, remove from the list
    if (category === "pinned" && isPinned) {
      setCountdowns((prev) => prev.filter((c) => c.id !== id))
    }

    // Update in the original category's storage
    const originalCategory = category === "pinned" ? countdownToToggle.originalCategory : category

    if (originalCategory) {
      const originalCountdowns = JSON.parse(localStorage.getItem(`countdowns_${originalCategory}`) || "[]")
      const updatedOriginalCountdowns = originalCountdowns.map((c: Countdown) =>
        c.id === id ? { ...c, pinned: !isPinned } : c,
      )
      localStorage.setItem(`countdowns_${originalCategory}`, JSON.stringify(updatedOriginalCountdowns))
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCountdowns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const reorderedItems = arrayMove(items, oldIndex, newIndex)

        // Save the new order to localStorage
        if (category !== "pinned") {
          localStorage.setItem(`countdowns_${category}`, JSON.stringify(reorderedItems))
        } else {
          // For pinned items, we need to update the order in the pinned view
          // but we don't change the order in their original categories
          const pinnedItems = reorderedItems.map((item) => ({
            ...item,
            originalCategory: item.originalCategory,
          }))

          // We don't save pinned order to localStorage as it's derived from other categories
          // But we could if we wanted to maintain a separate pinned order
        }

        return reorderedItems
      })
    }

    setActiveId(null)
  }

  if (loading) {
    return <div className="text-center py-12">Loading timers...</div>
  }

  if (countdowns.length === 0) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <AlertCircle className="h-4 w-4 text-gray-500" />
        <AlertDescription>
          {category === "pinned"
            ? "No pinned timers found. Pin your favorite timers from other categories to see them here."
            : `No timers found in this category. ${category === "custom" ? "Add a custom timer using the form above." : ""}`}
        </AlertDescription>
      </Alert>
    )
  }

  const visibleCountdowns = countdowns.filter((countdown) => !countdown.hidden)

  return (
    <>
      <div className="mb-4 text-sm text-gray-500 flex items-center">
        <GripVertical className="h-4 w-4 mr-1" />
        <span>Drag the handle on the left side of each card to reorder</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleCountdowns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCountdowns.map((countdown) => (
              <SortableCard
                key={countdown.id}
                countdown={countdown}
                onRemove={handleRemove}
                onToggleVisibility={handleToggleVisibility}
                onTogglePin={handleTogglePin}
                category={category}
                isDragging={activeId === countdown.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}

