"use client"

import { useEffect, useState } from "react"
import CountdownCard from "./countdown-card"
import EditCountdownForm from "./edit-countdown-form"
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
  onEdit?: (id: string) => void
  category: string
  isDragging: boolean
}

function SortableCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  onEdit,
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
    <div ref={setNodeRef} style={style} className="relative group w-full max-w-sm">
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
          onEdit={onEdit}
          category={category}
        />
      </div>
    </div>
  )
}

export default function CountdownGrid({ category, showHidden = false }: { category: string, showHidden?: boolean }) {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingCountdownId, setEditingCountdownId] = useState<string | null>(null)

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

    if (category === "hidden") {
      // For the hidden tab, collect all hidden countdowns from all categories
      const categories = ["general", "personal", "custom"];
      categories.forEach(cat => {
        const catCountdowns = JSON.parse(localStorage.getItem(`countdowns_${cat}`) || "[]");
        const hiddenCountdowns = catCountdowns.filter((c: Countdown) => c.hidden);
        // Add original category info to each countdown
        hiddenCountdowns.forEach((c: Countdown) => {
          c.originalCategory = cat as "general" | "personal" | "custom";
        });
        loadedCountdowns = [...loadedCountdowns, ...hiddenCountdowns];
      });
    } else if (category === "pinned") {
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
    const countdownToToggle = countdowns.find((c) => c.id === id);
    if (!countdownToToggle) return;

    const isCurrentlyHidden = countdownToToggle.hidden;
    
    // If we're in the hidden tab and unhiding a countdown
    if (category === "hidden" && isCurrentlyHidden) {
      // Get the original category
      const originalCategory = countdownToToggle.originalCategory || "custom";
      
      // Update the countdown in its original category
      const originalCategoryCountdowns = JSON.parse(localStorage.getItem(`countdowns_${originalCategory}`) || "[]");
      const updatedOriginalCountdowns = originalCategoryCountdowns.map((c: Countdown) =>
        c.id === id ? { ...c, hidden: false } : c
      );
      localStorage.setItem(`countdowns_${originalCategory}`, JSON.stringify(updatedOriginalCountdowns));
      
      // Remove from the current view (hidden tab)
      setCountdowns((prev) => prev.filter((c) => c.id !== id));
      
      // Redirect to the original category tab (using client-side navigation)
      const tabLinks = document.querySelectorAll('[role="tab"]');
      tabLinks.forEach((tab) => {
        if ((tab as HTMLElement).getAttribute('data-state') !== 'active' && 
            (tab as HTMLElement).getAttribute('data-value') === originalCategory) {
          (tab as HTMLElement).click();
        }
      });
      
      return;
    }

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

  const handleEdit = (id: string) => {
    setEditingCountdownId(id)
  }

  const handleSaveEdit = (id: string, updatedData: Partial<Countdown>, newCategory?: string) => {
    // Get the countdown to update
    const countdownToUpdate = countdowns.find((c) => c.id === id)
    if (!countdownToUpdate) return

    // If category is changing, we need to move the countdown to the new category
    if (newCategory && newCategory !== category) {
      // Remove from current category
      const updatedCurrentCategoryCountdowns = countdowns.filter((c) => c.id !== id)
      setCountdowns(updatedCurrentCategoryCountdowns)
      
      if (category !== "pinned") {
        localStorage.setItem(`countdowns_${category}`, JSON.stringify(updatedCurrentCategoryCountdowns))
      }

      // Add to new category
      const targetCategoryCountdowns = JSON.parse(localStorage.getItem(`countdowns_${newCategory}`) || "[]")
      const updatedCountdown = {
        ...countdownToUpdate,
        ...updatedData,
        originalCategory: category === "pinned" ? countdownToUpdate.originalCategory : undefined
      }
      
      // Ensure we're at the beginning of the array for better visibility
      const updatedTargetCategoryCountdowns = [updatedCountdown, ...targetCategoryCountdowns]
      localStorage.setItem(`countdowns_${newCategory}`, JSON.stringify(updatedTargetCategoryCountdowns))
      
      // If we're in the pinned category and the countdown is pinned, update it there too
      if (countdownToUpdate.pinned && category !== "pinned") {
        const pinnedCountdowns = getAllPinnedCountdowns()
        const updatedPinnedCountdowns = pinnedCountdowns.map((c) => 
          c.id === id 
            ? { ...c, ...updatedData, originalCategory: newCategory } 
            : c
        )
        // We don't directly save pinned countdowns as they're derived from other categories
      }
      
      // Close the edit form
      setEditingCountdownId(null)
      return
    }

    // Update the countdown in the current list
    const updatedCountdowns = countdowns.map((countdown) =>
      countdown.id === id ? { ...countdown, ...updatedData } : countdown
    )
    
    setCountdowns(updatedCountdowns)

    // Update in localStorage
    if (category === "pinned") {
      // For pinned countdowns, we need to find the original category and update there
      const countdownToUpdate = countdowns.find((c) => c.id === id)
      if (countdownToUpdate && countdownToUpdate.originalCategory) {
        const originalCategory = countdownToUpdate.originalCategory
        const originalCountdowns = JSON.parse(localStorage.getItem(`countdowns_${originalCategory}`) || "[]")
        const updatedOriginalCountdowns = originalCountdowns.map((c: Countdown) =>
          c.id === id ? { ...c, ...updatedData } : c
        )
        localStorage.setItem(`countdowns_${originalCategory}`, JSON.stringify(updatedOriginalCountdowns))
      }
    } else {
      localStorage.setItem(`countdowns_${category}`, JSON.stringify(updatedCountdowns))
    }

    // Close the edit form
    setEditingCountdownId(null)
  }

  const handleCancelEdit = () => {
    setEditingCountdownId(null)
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

  // If we're editing a countdown, show the edit form
  if (editingCountdownId) {
    const countdownToEdit = countdowns.find((c) => c.id === editingCountdownId)
    if (countdownToEdit) {
      return (
        <EditCountdownForm
          countdown={countdownToEdit}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )
    }
  }

  if (countdowns.length === 0) {
    return (
      <Alert className="bg-gray-50 border-gray-200">
        <AlertCircle className="h-4 w-4 text-gray-500" />
        <AlertDescription>
          {category === "pinned"
            ? "No pinned timers found. Pin your favorite timers from other categories to see them here."
            : category === "custom" 
              ? "Use the form above to create custom timers."
              : "No timers found in this category."}
        </AlertDescription>
      </Alert>
    )
  }

  const visibleCountdowns = showHidden 
    ? countdowns // In the hidden tab, show all countdowns (which are all hidden)
    : countdowns.filter((countdown) => !countdown.hidden)

  return (
    <>
      <div className="mb-4 text-sm text-gray-500 flex items-center justify-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center mx-auto">
            {visibleCountdowns.map((countdown) => (
              <SortableCard
                key={countdown.id}
                countdown={countdown}
                onRemove={handleRemove}
                onToggleVisibility={handleToggleVisibility}
                onTogglePin={handleTogglePin}
                onEdit={handleEdit}
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

