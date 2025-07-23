"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import type { Countdown } from "@/lib/types"
import { CountdownForm, CountdownFormValues, formSchema } from "./add-countdown-form"
import { isDateInPast, handleHtmlDateInput } from "@/lib/countdown-utils"

interface EditCountdownFormProps {
  countdown: Countdown
  onSave: (id: string, updatedCountdown: Partial<Countdown>, newCategory?: string) => void
  onCancel: () => void
}

export default function EditCountdownForm({ countdown, onSave, onCancel }: EditCountdownFormProps) {
  const [success, setSuccess] = useState(false)

  // Use the exact date from the countdown
  const exactDate = countdown.date

  // Determine the current category
  const currentCategory = countdown.originalCategory || "custom"
  
  // Ensure the category is one of the allowed values
  const validCategory = (currentCategory === "general" || currentCategory === "personal") 
    ? currentCategory 
    : "general" // Convert "custom" to "general"

  const defaultValues: CountdownFormValues = {
    title: countdown.title.slice(0, 20),
    date: exactDate,
    category: validCategory,
    isCountUp: countdown.isCountUp
  }

  function onSubmit(values: CountdownFormValues) {
    // Use the exact date value from the form
    const exactDate = values.date
    
    // Determine if this is a count up event (past date)
    const isCountUp = isDateInPast(exactDate)
    
    // Create updated countdown with the exact date
    const updatedCountdown: Partial<Countdown> = {
      title: values.title,
      date: exactDate,
      isCountUp: isCountUp,
    }

    // Call the onSave callback with the updated countdown and new category if changed
    const newCategory = values.category !== validCategory ? values.category : undefined
    onSave(countdown.id, updatedCountdown, newCategory)

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('countdownsUpdated', {
      detail: { 
        category: newCategory || validCategory,
        originalCategory: validCategory
      }
    }))

    // Show success message
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onCancel() // Close the edit form after success
    }, 1500)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-charcoal/10 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl font-merriweather">Edit Timer</CardTitle>
          <CardDescription>Update your timer details</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-white border-charcoal/20 text-charcoal">
              <CheckCircle2 className="h-4 w-4 text-charcoal" />
              <AlertDescription>Timer updated and saved</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <CountdownForm 
              defaultValues={defaultValues} 
              onSubmit={onSubmit} 
              submitButtonText="Save Changes" 
              onCancel={onCancel}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 