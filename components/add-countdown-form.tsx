"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidv4 } from "uuid"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Countdown } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Clock, Hourglass } from "lucide-react"
import { standardizeDate, isDateInPast, handleHtmlDateInput } from "@/lib/countdown-utils"
import { getUserStorageKey, updateUrlWithUserId } from "@/lib/user-utils"

// Define colors for past and future events
const charcoal = "#333333"; // Pantone charcoal for past events
const skyBlue = "#87CEEB"; // Sky blue for future events
const countUpColor = "#f1c0c0"; // Soft pink/light coral for count up (matching the card color)
const countDownColor = "#8BCFBE"; // Mint green for count down (matching the card background)

// Define the form schema with validation
export const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title too short",
  }).max(20, {
    message: "Title too long"
  }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Need a valid date",
  }),
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
      date: "",
      category: "general",
    },
  })

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

  // Add a reset function that we can call after submission
  const resetForm = () => {
    form.reset({
      title: "",
      date: "",
      category: "general",
    });
  };

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
    // Get the exact date value from the form
    const exactDate = values.date;
    console.log("Exact date from form:", exactDate);
    
    // Determine if this is a count up event (past date)
    const isPastDate = isDateInPast(exactDate);
    console.log("isCountUp:", isPastDate);
    
    // Pass all values to the parent component
    onSubmit({
      ...values,
      date: exactDate, // Use the exact date value
      isCountUp: isPastDate // Explicitly pass isCountUp to the parent component
    });
    
    // Reset the form after submission
    resetForm();
  }

  // Custom error message component with proper typing
  const CustomFormMessage = ({ name }: { name: keyof CountdownFormValues }) => {
    const error = form.formState.errors[name];
    if (!error) return null;
    
    return (
      <div className="text-xs text-[#36454F]/70 mt-1 font-medium animate-fade-in-out">
        {error.message as string}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 w-full max-w-sm mx-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-1 w-full max-w-sm">
              <FormLabel className="text-sm">Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title (max 20 chars)" {...field} maxLength={20} className="h-8 w-full" />
              </FormControl>
              <CustomFormMessage name="title" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="space-y-1 w-full max-w-sm">
              <FormLabel className="text-sm">Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  onChange={(e) => {
                    handleDateChange(e, field.onChange);
                  }}
                  className="h-8 w-full min-w-0 max-w-full"
                />
              </FormControl>
              {dateChanged && (
                <div className="w-full mt-2 px-3 py-1 rounded-md text-xs font-medium text-center"
                  style={{ backgroundColor: isCountUp ? 'rgba(241,192,192,0.25)' : 'rgba(139,207,190,0.25)' }}>
                  {isCountUp ? (
                    <><Clock className="h-3 w-3 mr-1 inline" /> Count Up</>
                  ) : (
                    <><Hourglass className="h-3 w-3 mr-1 inline" /> Count Down</>
                  )}
                </div>
              )}
              <CustomFormMessage name="date" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-1 w-full max-w-sm">
              <FormLabel className="text-sm">Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <CustomFormMessage name="category" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-charcoal hover:bg-charcoal/90 h-8 mt-2 max-w-sm mx-auto">
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
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('countdownsUpdated', {
        detail: { category: values.category }
      }))
      
      // Update the URL with just the user ID
      const userId = localStorage.getItem("now_then_user_id");
      if (userId) {
        updateUrlWithUserId(userId, false);
      }
      
      // Show success message with minimal design
      setShowSuccess(true)
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
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
          <div className="mb-2 py-1 text-xs text-center text-[#36454F]/70 animate-fade-in-out">
            Timer added
          </div>
        )}
        <CountdownForm onSubmit={onSubmit} />
      </CardContent>
    </Card>
  )
}

