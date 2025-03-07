"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Countdown } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Clock, Hourglass } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { standardizeDate, isDateInPast, handleHtmlDateInput } from "@/lib/countdown-utils"
import { getUserStorageKey } from "@/lib/user-utils"

// Define colors for past and future events
const charcoal = "#333333"; // Pantone charcoal for past events
const skyBlue = "#87CEEB"; // Sky blue for future events
const countUpColor = "#E5E1E6"; // Light lavender for count up
const countDownColor = "#87CEEB"; // Sky blue for count down

export const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50, {
    message: "Title cannot exceed 50 characters."
  }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  description: z.string().max(200, {
    message: "Description cannot exceed 200 characters."
  }).optional(),
  category: z.enum(["general", "personal"]).default("general"),
  isCountUp: z.boolean().optional(),
})

export type CountdownFormValues = z.infer<typeof formSchema>

interface CountdownFormProps {
  defaultValues?: CountdownFormValues
  onSubmit: (values: CountdownFormValues) => void
  submitButtonText?: string
}

export function CountdownForm({ defaultValues, onSubmit, submitButtonText = "Add Timer" }: CountdownFormProps) {
  const [dateChanged, setDateChanged] = useState(true)
  const [isCountUp, setIsCountUp] = useState(false)
  const [animationActive, setAnimationActive] = useState(true)

  const form = useForm<CountdownFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "general",
      isCountUp: false,
    },
  });

  // Initialize the count up/down status based on the default date
  useEffect(() => {
    const dateValue = form.getValues("date")
    if (dateValue) {
      // Standardize the date format
      const standardizedDate = standardizeDate(dateValue)
      
      // Determine if this is a count up event (past date)
      const isPastDate = isDateInPast(standardizedDate)
      
      setIsCountUp(isPastDate)
      setDateChanged(true)
      setAnimationActive(true)
      
      console.log("Initial date check:", standardizedDate, "isCountUp:", isPastDate)
    }
  }, [form, defaultValues])

  // Helper function to handle date input changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    // Get the exact date value from the input
    const exactDate = e.target.value;
    console.log("Exact date from input:", exactDate);
    
    // Pass the exact value to the form
    onChange(exactDate);
    
    // Determine if this is a count up event (past date)
    const isPastDate = isDateInPast(exactDate);
    
    setIsCountUp(isPastDate);
    setDateChanged(true);
    setAnimationActive(true);
    
    console.log("Date changed to:", exactDate, "isCountUp:", isPastDate);
  }

  // Function to handle form submission with isCountUp value
  const handleSubmit = (values: CountdownFormValues) => {
    console.log("Form values before submission:", values);
    
    // Get the exact date value from the form
    const exactDate = values.date;
    console.log("Exact date for submission:", exactDate);
    
    // Determine if this is a count up event (past date)
    const isPastDate = isDateInPast(exactDate);
    
    console.log("Submitting form with date:", exactDate);
    console.log("isCountUp:", isPastDate);
    
    onSubmit({
      ...values,
      date: exactDate, // Use the exact date value
      isCountUp: isPastDate // Explicitly pass isCountUp to the parent component
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm">Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} maxLength={50} className="h-8" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm">Date</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      console.log("Date input raw value:", e.target.value);
                      handleDateChange(e, field.onChange);
                    }}
                    className="h-8"
                  />
                </FormControl>
                {dateChanged && (
                  <div 
                    className={`absolute right-0 top-0 h-full flex items-center justify-center pr-3 text-xs font-medium rounded-r-md transition-all duration-500 ${
                      isCountUp 
                        ? 'bg-opacity-90 text-amber-900' 
                        : 'bg-opacity-90 text-indigo-900'
                    }`}
                    style={{ 
                      backgroundColor: isCountUp ? countUpColor : countDownColor,
                      width: '120px',
                      boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                    }}
                  >
                    <span className="flex items-center">
                      {isCountUp ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" /> Count Up
                        </>
                      ) : (
                        <>
                          <Hourglass className="h-3 w-3 mr-1" /> Count Down
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter description" 
                  className="resize-none h-16 text-sm" 
                  {...field} 
                  maxLength={200}
                />
              </FormControl>
              <div className="text-xs text-right text-gray-500">{field.value?.length || 0}/200</div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm">Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-charcoal hover:bg-charcoal/90 h-8 mt-2">
          {submitButtonText}
        </Button>
      </form>
    </Form>
  )
}

export default function AddCountdownForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  function onSubmit(values: CountdownFormValues) {
    console.log("AddCountdownForm received values:", values);
    
    // Get the exact date value from the form
    const exactDate = values.date;
    console.log("Exact date from form:", exactDate);
    
    // Determine if this is a count up event (past date)
    // We'll still use isDateInPast for this, but we won't modify the date
    const isPastDate = isDateInPast(exactDate);
    
    // Create a new countdown with the form values
    const newCountdown: Countdown = {
      id: uuidv4(),
      title: values.title,
      date: exactDate, // Use the exact date value
      description: values.description || "",
      isCountUp: isPastDate,
      hidden: false,
      pinned: false,
      originalCategory: values.category,
    }
    
    console.log("Saving countdown with exact date:", newCountdown.date);
    
    try {
      // Get existing countdowns from localStorage using user-specific key
      const storageKey = getUserStorageKey(`countdowns_${values.category}`);
      const existingCountdowns = localStorage.getItem(storageKey)
      const countdowns = existingCountdowns ? JSON.parse(existingCountdowns) : []
      
      // Add the new countdown to the array
      countdowns.push(newCountdown)
      
      // Save the updated countdowns to localStorage
      localStorage.setItem(storageKey, JSON.stringify(countdowns))
      
      // Show success message
      setShowSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
        // Refresh the page to show the new countdown
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error saving countdown:", error)
    }
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="text-base font-medium">Add New Timer</CardTitle>
        <CardDescription className="text-sm">Create a new countdown or count-up timer</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 px-4">
        {showSuccess && (
          <Alert className="mb-3 bg-green-50 text-green-800 border-green-200 py-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <AlertDescription>Timer added successfully!</AlertDescription>
          </Alert>
        )}
        <CountdownForm onSubmit={onSubmit} />
      </CardContent>
    </Card>
  )
}

