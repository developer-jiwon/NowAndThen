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
import { getUserStorageKey } from "@/lib/user-utils"

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
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group w-full max-w-sm cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div>
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
    const loadCountdowns = () => {
      console.log(`Loading countdowns for category: ${category}`);
      let loadedCountdowns: Countdown[] = [];

      try {
        if (category === "hidden") {
          // For the hidden tab, collect all hidden countdowns from all categories
          const categories = ["general", "personal", "custom"];
          categories.forEach(cat => {
            const storageKey = getUserStorageKey(`countdowns_${cat}`);
            const storedData = localStorage.getItem(storageKey);
            if (!storedData) return;
            
            try {
              const catCountdowns = JSON.parse(storedData);
              const hiddenCountdowns = catCountdowns.filter((c: Countdown) => c.hidden);
              // Add original category info to each countdown
              hiddenCountdowns.forEach((c: Countdown) => {
                c.originalCategory = cat as "general" | "personal" | "custom";
              });
              loadedCountdowns = [...loadedCountdowns, ...hiddenCountdowns];
            } catch (error) {
              console.error(`Error parsing countdowns for category ${cat}:`, error);
            }
          });
        } else if (category === "pinned") {
          loadedCountdowns = getAllPinnedCountdowns();
        } else {
          const storageKey = getUserStorageKey(`countdowns_${category}`);
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            try {
              loadedCountdowns = JSON.parse(storedData);
            } catch (error) {
              console.error(`Error parsing countdowns for category ${category}:`, error);
              loadedCountdowns = [];
            }
          } else {
            loadedCountdowns = [];
          }
        }

        console.log(`Loaded ${loadedCountdowns.length} countdowns for category: ${category}`);
        setCountdowns(loadedCountdowns);
        setLoading(false);
      } catch (error) {
        console.error(`Error loading countdowns for category ${category}:`, error);
        setCountdowns([]);
        setLoading(false);
      }
    };

    loadCountdowns();

    // Set up a storage event listener to refresh data when localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('countdowns_')) {
        console.log(`Storage changed for key: ${event.key}, reloading countdowns`);
        loadCountdowns();
      }
    };

    // Set up a custom event listener for countdown updates
    const handleCountdownsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && 
          (customEvent.detail.category === category || 
           category === 'pinned' || 
           category === 'hidden')) {
        console.log(`Received countdownsUpdated event for category: ${customEvent.detail.category}, reloading countdowns`);
        loadCountdowns();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('countdownsUpdated', handleCountdownsUpdated);

    // Clean up the event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('countdownsUpdated', handleCountdownsUpdated);
    };
  }, [category]);

  const handleRemove = (id: string) => {
    console.log(`Deleting countdown with ID: ${id} from category: ${category}`);
    
    try {
      // Find the countdown to be removed
      const countdownToRemove = countdowns.find(c => c.id === id);
      if (!countdownToRemove) {
        console.error(`Countdown with ID ${id} not found in category ${category}`);
        return;
      }
      
      // First, update the UI by removing the countdown from the current view
      setCountdowns(prevCountdowns => prevCountdowns.filter(c => c.id !== id));
      
      // Determine which storage key to update based on the category
      if (category === "pinned" || category === "hidden") {
        // For pinned or hidden countdowns, we need to update the original category
        if (countdownToRemove.originalCategory) {
          const originalCategory = countdownToRemove.originalCategory;
          const originalStorageKey = getUserStorageKey(`countdowns_${originalCategory}`);
          
          // Get the countdowns from the original category
          const originalCountdownsStr = localStorage.getItem(originalStorageKey);
          if (originalCountdownsStr) {
            const originalCountdowns = JSON.parse(originalCountdownsStr);
            
            // Remove the countdown from the original category
            const updatedOriginalCountdowns = originalCountdowns.filter(
              (c: Countdown) => c.id !== id
            );
            
            // Save the updated countdowns back to localStorage
            localStorage.setItem(originalStorageKey, JSON.stringify(updatedOriginalCountdowns));
            console.log(`Removed countdown from original category: ${originalCategory}`);
            
            // Notify components about the update to the original category
            window.dispatchEvent(
              new CustomEvent("countdownsUpdated", {
                detail: { category: originalCategory }
              })
            );
          }
        }
      } else {
        // For regular categories (general, personal, custom), update the current category
        const storageKey = getUserStorageKey(`countdowns_${category}`);
        
        // Get the current countdowns
        const currentCountdownsStr = localStorage.getItem(storageKey);
        if (currentCountdownsStr) {
          const currentCountdowns = JSON.parse(currentCountdownsStr);
          
          // Remove the countdown
          const updatedCountdowns = currentCountdowns.filter(
            (c: Countdown) => c.id !== id
          );
          
          // Save the updated countdowns back to localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedCountdowns));
          console.log(`Removed countdown from category: ${category}`);
        }
      }
      
      // Force a reload of all tabs to ensure consistency
      const categories = ["general", "personal", "custom", "pinned", "hidden"];
      categories.forEach(cat => {
        window.dispatchEvent(
          new CustomEvent("countdownsUpdated", {
            detail: { category: cat }
          })
        );
      });
      
      console.log("Countdown deletion completed successfully");
    } catch (error) {
      console.error("Error deleting countdown:", error);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const countdownToToggle = countdowns.find((c) => c.id === id);
    if (!countdownToToggle) return;

    const isCurrentlyHidden = countdownToToggle.hidden;
    
    // If we're in the hidden tab and unhiding a countdown
    if (category === "hidden" && isCurrentlyHidden) {
      // Get the original category
      const originalCategory = countdownToToggle.originalCategory || "custom";
      
      // Update the countdown in its original category
      const storageKey = getUserStorageKey(`countdowns_${originalCategory}`);
      const originalCategoryCountdowns = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updatedOriginalCountdowns = originalCategoryCountdowns.map((c: Countdown) =>
        c.id === id ? { ...c, hidden: false } : c
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedOriginalCountdowns));
      
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
        const storageKey = getUserStorageKey(`countdowns_${originalCategory}`);
        const originalCountdowns = JSON.parse(localStorage.getItem(storageKey) || "[]")
        const updatedOriginalCountdowns = originalCountdowns.map((c: Countdown) =>
          c.id === id ? { ...c, hidden: !countdownToUpdate.hidden } : c,
        )
        localStorage.setItem(storageKey, JSON.stringify(updatedOriginalCountdowns))
      }
    } else {
      const storageKey = getUserStorageKey(`countdowns_${category}`);
      localStorage.setItem(storageKey, JSON.stringify(updatedCountdowns))
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
      const storageKey = getUserStorageKey(`countdowns_${originalCategory}`);
      const originalCountdowns = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const updatedOriginalCountdowns = originalCountdowns.map((c: Countdown) =>
        c.id === id ? { ...c, pinned: !isPinned } : c,
      )
      localStorage.setItem(storageKey, JSON.stringify(updatedOriginalCountdowns))
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
        const currentStorageKey = getUserStorageKey(`countdowns_${category}`);
        localStorage.setItem(currentStorageKey, JSON.stringify(updatedCurrentCategoryCountdowns))
      }

      // Add to new category
      const newStorageKey = getUserStorageKey(`countdowns_${newCategory}`);
      const targetCategoryCountdowns = JSON.parse(localStorage.getItem(newStorageKey) || "[]")
      const updatedCountdown = {
        ...countdownToUpdate,
        ...updatedData,
        originalCategory: category === "pinned" ? countdownToUpdate.originalCategory : undefined
      }
      
      // Ensure we're at the beginning of the array for better visibility
      const updatedTargetCategoryCountdowns = [updatedCountdown, ...targetCategoryCountdowns]
      localStorage.setItem(newStorageKey, JSON.stringify(updatedTargetCategoryCountdowns))
      
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
        const storageKey = getUserStorageKey(`countdowns_${originalCategory}`);
        const originalCountdowns = JSON.parse(localStorage.getItem(storageKey) || "[]")
        const updatedOriginalCountdowns = originalCountdowns.map((c: Countdown) =>
          c.id === id ? { ...c, ...updatedData } : c
        )
        localStorage.setItem(storageKey, JSON.stringify(updatedOriginalCountdowns))
      }
    } else {
      const storageKey = getUserStorageKey(`countdowns_${category}`);
      localStorage.setItem(storageKey, JSON.stringify(updatedCountdowns))
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
          const storageKey = getUserStorageKey(`countdowns_${category}`);
          localStorage.setItem(storageKey, JSON.stringify(reorderedItems))
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
        <span>Drag cards to reorder</span>
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

