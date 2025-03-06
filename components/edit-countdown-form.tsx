"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import type { Countdown } from "@/lib/types"
import { CountdownForm, CountdownFormValues } from "./add-countdown-form"

interface EditCountdownFormProps {
  countdown: Countdown
  onSave: (id: string, updatedCountdown: Partial<Countdown>, newCategory?: string) => void
  onCancel: () => void
}

export default function EditCountdownForm({ countdown, onSave, onCancel }: EditCountdownFormProps) {
  const [success, setSuccess] = useState(false)

  // Format the date for the form (YYYY-MM-DD)
  const formattedDate = new Date(countdown.date).toISOString().split('T')[0]

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
  }

  function onSubmit(values: CountdownFormValues) {
    // Create a date object with time set to midnight
    const dateObj = new Date(values.date);
    dateObj.setHours(0, 0, 0, 0);
    
    // Determine if this is a count up event (past date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCountUp = dateObj < today;
    
    // Create updated countdown
    const updatedCountdown: Partial<Countdown> = {
      title: values.title,
      date: dateObj.toISOString(), // Ensure we're using ISO string format
      description: values.description || "",
      isCountUp: isCountUp, // Make sure isCountUp is explicitly set
    }

    console.log("Saving countdown with date:", dateObj.toISOString(), "isCountUp:", isCountUp);

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