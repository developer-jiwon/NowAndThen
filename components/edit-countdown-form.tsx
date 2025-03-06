"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import type { Countdown } from "@/lib/types"
import { CountdownForm, CountdownFormValues } from "./add-countdown-form"
import { standardizeDate, isDateInPast } from "@/lib/countdown-utils"

interface EditCountdownFormProps {
  countdown: Countdown
  onSave: (id: string, updatedCountdown: Partial<Countdown>, newCategory?: string) => void
  onCancel: () => void
}

export default function EditCountdownForm({ countdown, onSave, onCancel }: EditCountdownFormProps) {
  const [success, setSuccess] = useState(false)

  // Format the date for the form (YYYY-MM-DD) using our utility function
  const formattedDate = standardizeDate(countdown.date)

  // Determine the current category
  const currentCategory = countdown.originalCategory || "custom"
  
  // Ensure the category is one of the allowed values
  const validCategory = (currentCategory === "general" || currentCategory === "personal") 
    ? currentCategory 
    : "general" // Convert "custom" to "general"

  const defaultValues: CountdownFormValues = {
    title: countdown.title,
    date: formattedDate,
    description: countdown.description || "",
    category: validCategory,
    isCountUp: countdown.isCountUp
  }

  function onSubmit(values: CountdownFormValues) {
    // Standardize the date format
    const standardizedDate = standardizeDate(values.date)
    
    // Determine if this is a count up event (past date) using our utility function
    const isCountUp = isDateInPast(standardizedDate)
    
    console.log("Edit form - Standardized date:", standardizedDate)
    console.log("Edit form - isCountUp:", isCountUp)
    
    // Create updated countdown with the standardized date
    const updatedCountdown: Partial<Countdown> = {
      title: values.title,
      date: standardizedDate, // Use the standardized date
      description: values.description || "",
      isCountUp: isCountUp,
    }

    // Call the onSave callback with the updated countdown and new category if changed
    const newCategory = values.category !== validCategory ? values.category : undefined
    onSave(countdown.id, updatedCountdown, newCategory)

    // Show success message
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onCancel() // Close the edit form after success
    }, 1500)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-charcoal/10 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl font-merriweather">Edit Timer</CardTitle>
          <CardDescription>Update your timer details</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-white border-charcoal/20 text-charcoal">
              <CheckCircle2 className="h-4 w-4 text-charcoal" />
              <AlertDescription>Timer updated successfully!</AlertDescription>
            </Alert>
          )}

          <CountdownForm 
            defaultValues={defaultValues} 
            onSubmit={onSubmit} 
            submitButtonText="Save Changes" 
          />
          
          <button 
            onClick={onCancel}
            className="mt-4 w-full py-2 px-4 border border-charcoal/30 rounded-md text-sm font-medium text-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Cancel
          </button>
        </CardContent>
      </Card>
    </div>
  )
} 