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

// Define colors for past and future events
const burgundy = "#800020";
const brown = "#964B00";

export const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  description: z.string().optional(),
  category: z.enum(["general", "personal"]).default("general"),
})

export type CountdownFormValues = z.infer<typeof formSchema>

interface CountdownFormProps {
  defaultValues?: CountdownFormValues
  onSubmit: (values: CountdownFormValues) => void
  submitButtonText?: string
}

export function CountdownForm({ defaultValues, onSubmit, submitButtonText = "Add Timer" }: CountdownFormProps) {
  const [isCountUp, setIsCountUp] = useState(false);
  const [dateChanged, setDateChanged] = useState(false);

  const form = useForm<CountdownFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      date: "",
      description: "",
      category: "general",
    },
  });

  // Helper function to ensure we only get the date part
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    // Get only the date part (YYYY-MM-DD)
    const dateValue = e.target.value.split('T')[0];
    onChange(dateValue);
    
    // Check if the date is in the past
    const selectedDate = new Date(dateValue);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    setIsCountUp(selectedDate < today);
    setDateChanged(true);
    
    console.log("Date changed to:", dateValue, "isCountUp:", selectedDate < today);
  };

  // Check if the date is in the past when the component mounts or when defaultValues change
  useEffect(() => {
    const dateValue = form.getValues("date");
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      selectedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setIsCountUp(selectedDate < today);
      setDateChanged(true);
      
      console.log("Initial date check:", dateValue, "isCountUp:", selectedDate < today);
    }
  }, [form, defaultValues]);

  // Function to handle form submission with isCountUp value
  const handleSubmit = (values: CountdownFormValues) => {
    // Create a date object to ensure proper formatting
    const dateObj = new Date(values.date);
    dateObj.setHours(0, 0, 0, 0);
    
    // Determine if this is a count up event (past date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentIsCountUp = dateObj < today;
    
    console.log("Submitting form with date:", values.date, "isCountUp:", currentIsCountUp);
    
    onSubmit({
      ...values,
      // We'll add isCountUp in the parent component
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="date" 
                      onChange={(e) => handleDateChange(e, field.onChange)}
                      onBlur={field.onBlur}
                      value={field.value}
                      name={field.name}
                      ref={field.ref}
                      className="transition-all duration-300"
                      style={{ 
                        borderColor: dateChanged ? (isCountUp ? burgundy : brown) : '' 
                      }}
                    />
                    {dateChanged && (
                      <div 
                        className="absolute -right-1 -top-1 rounded-full p-1 text-white animate-pulse"
                        style={{ 
                          backgroundColor: isCountUp ? burgundy : brown 
                        }}
                      >
                        {isCountUp ? <Clock className="h-4 w-4" /> : <Hourglass className="h-4 w-4" />}
                      </div>
                    )}
                  </div>
                </FormControl>
                {dateChanged && (
                  <FormDescription 
                    className="text-xs font-medium animate-fadeIn"
                    style={{ 
                      color: isCountUp ? burgundy : brown 
                    }}
                  >
                    {isCountUp ? "Count Up Event (Past Date)" : "Count Down Event (Future Date)"}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Choose which category to add this timer to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add some details about this event..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-charcoal hover:bg-charcoal/90">
          {submitButtonText}
        </Button>
      </form>
    </Form>
  )
}

export default function AddCountdownForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  function onSubmit(values: CountdownFormValues) {
    // Create a date object with time set to midnight
    const dateObj = new Date(values.date);
    dateObj.setHours(0, 0, 0, 0);
    
    // Determine if this is a count up event (past date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCountUp = dateObj < today;
    
    // Create a new countdown with the form values
    const newCountdown: Countdown = {
      id: uuidv4(),
      title: values.title,
      date: dateObj.toISOString(),
      description: values.description || "",
      isCountUp: isCountUp,
      hidden: false,
      pinned: false,
      originalCategory: values.category,
    }

    // Get existing countdowns from localStorage
    const existingCountdowns = JSON.parse(localStorage.getItem(`countdowns_${values.category}`) || "[]")
    
    // Add the new countdown to the beginning of the array
    const updatedCountdowns = [newCountdown, ...existingCountdowns]
    
    // Save back to localStorage
    localStorage.setItem(`countdowns_${values.category}`, JSON.stringify(updatedCountdowns))
    
    // Show success message
    setShowSuccess(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-charcoal/10 shadow-sm">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl font-merriweather">Add New Timer</CardTitle>
          <CardDescription>Create a custom timer for any event</CardDescription>
        </CardHeader>
        <CardContent>
          {showSuccess && (
            <Alert className="mb-4 bg-white border-charcoal/20 text-charcoal">
              <CheckCircle2 className="h-4 w-4 text-charcoal" />
              <AlertDescription>Timer added successfully!</AlertDescription>
            </Alert>
          )}
          <CountdownForm onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}

