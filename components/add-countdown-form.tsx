"use client"

import { useState, useEffect, useRef } from "react"
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
import { Clock, Hourglass } from "lucide-react"
import { isDateInPast } from "@/lib/countdown-utils"
import { getUserStorageKey, updateUrlWithUserId } from "@/lib/user-utils"

// Modern color indicators for count up and count down
const countUpColor = "#e11d48"; // Clean red for count up
const countDownColor = "#16a34a"; // Clean green for count down

// Enhanced date validation
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Define the form schema with enhanced validation
export const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters",
  }).max(20, {
    message: "Title cannot exceed 20 characters"
  }),
  date: z.string()
    .min(1, "Date is required")
    .regex(dateRegex, "Please enter date in YYYY-MM-DD format")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100;
    }, {
      message: "Please enter a valid date between 1900-2100",
    }),
  category: z.enum(["general", "personal"], {
    required_error: "Please select a category",
    invalid_type_error: "Invalid category selected",
  }).default("general"),
  isCountUp: z.boolean().optional(),
})

export type CountdownFormValues = z.infer<typeof formSchema>

interface CountdownFormProps {
  defaultValues?: CountdownFormValues
  onSubmit: (values: CountdownFormValues) => void
  submitButtonText?: string
  onCancel: () => void
}

export function CountdownForm({ defaultValues, onSubmit, submitButtonText = "Create Timer", onCancel }: CountdownFormProps) {
  const [dateChanged, setDateChanged] = useState(true)
  const [isCountUp, setIsCountUp] = useState(false)

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
      const isPastDate = isDateInPast(dateValue)
      setIsCountUp(isPastDate)
      setDateChanged(true)
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
    const exactDate = e.target.value;
    onChange(exactDate);
    
    // Only update count status for valid dates
    if (dateRegex.test(exactDate)) {
      const parsedDate = new Date(exactDate);
      if (!isNaN(parsedDate.getTime())) {
        const isPastDate = isDateInPast(exactDate);
        setIsCountUp(isPastDate);
        setDateChanged(true);
      }
    }
  }

  // Function to handle form submission with isCountUp value
  const handleSubmit = (values: CountdownFormValues) => {
    const exactDate = values.date;
    const isPastDate = isDateInPast(exactDate);
    
    onSubmit({
      ...values,
      date: exactDate,
      isCountUp: isPastDate
    });
    
    resetForm();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-1 w-full max-w-xs sm:max-w-md mx-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm">Title</FormLabel>
              <div className="w-full max-w-xs sm:max-w-md mx-auto">
                <FormControl>
                  <Input placeholder="Enter timer title" {...field} maxLength={20} className="w-full" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => {
            const inputRef = useRef<HTMLInputElement>(null);
            
            return (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm">Date</FormLabel>
                <div className="w-full max-w-xs sm:max-w-md mx-auto">
                  {/* Quick preset buttons */}
                  <div className="flex gap-1 mb-2 max-w-xs sm:max-w-md">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().slice(0, 10);
                        field.onChange(today);
                        const isPastDate = isDateInPast(today);
                        setIsCountUp(isPastDate);
                        setDateChanged(true);
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
                        field.onChange(tomorrowStr);
                        const isPastDate = isDateInPast(tomorrowStr);
                        setIsCountUp(isPastDate);
                        setDateChanged(true);
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                    >
                      Tomorrow
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleDateChange(e, field.onChange)}
                        className="h-8 w-full text-center"
                        placeholder="Select date"
                        readOnly
                        onFocus={(e) => {
                          const input = document.createElement('input');
                          input.type = 'date';
                          input.value = field.value || '';
                          input.style.display = 'none';
                          document.body.appendChild(input);
                          
                          input.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            field.onChange(target.value);
                            const isPastDate = isDateInPast(target.value);
                            setIsCountUp(isPastDate);
                            setDateChanged(true);
                            document.body.removeChild(input);
                          };
                          
                          input.onblur = () => {
                            if (document.body.contains(input)) {
                              document.body.removeChild(input);
                            }
                          };
                          
                          input.showPicker();
                        }}
                      />
                    </FormControl>
                  </div>
                </div>
                {dateChanged && field.value && dateRegex.test(field.value) && (
                  <div className="w-full max-w-xs sm:max-w-md mx-auto mt-8 px-3 py-1 rounded-md text-xs font-medium text-center"
                    style={{ backgroundColor: isCountUp ? 'rgba(241,192,192,0.25)' : 'rgba(139,207,190,0.25)' }}>
                    {isCountUp ? (
                      <><Clock className="h-3 w-3 mr-1 inline" /> Count Up</>
                    ) : (
                      <><Hourglass className="h-3 w-3 mr-1 inline" /> Count Down</>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm">Category</FormLabel>
              <div className="w-full max-w-xs sm:max-w-md mx-auto">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full max-w-xs sm:max-w-md mx-auto">
                  <Button type="submit" className="w-full bg-white border border-input hover:border-input focus:border-input text-gray-800 h-7 text-sm">
          {submitButtonText}
        </Button>
        </div>
        <div className="w-full max-w-xs sm:max-w-md mx-auto">
  <Button type="button" onClick={onCancel} variant="outline" className="w-full mt-0 h-7 text-sm">
    Cancel
  </Button>
</div>
      </form>
    </Form>
  )
}

interface AddCountdownFormProps {
  onCancel?: () => void;
}

export default function AddCountdownForm({ onCancel }: AddCountdownFormProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  
  function onSubmit(values: CountdownFormValues) {
    const exactDate = values.date;
    const isPastDate = isDateInPast(exactDate);
    
    const newCountdown: Countdown = {
      id: uuidv4(),
      title: values.title,
      date: exactDate,
      isCountUp: isPastDate,
      hidden: false,
      pinned: false,
      originalCategory: values.category,
    }
    
    try {
      const storageKey = getUserStorageKey(`countdowns_${values.category}`);
      const existingCountdowns = localStorage.getItem(storageKey)
      const countdowns = existingCountdowns ? JSON.parse(existingCountdowns) : []
      
      countdowns.push(newCountdown)
      localStorage.setItem(storageKey, JSON.stringify(countdowns))
      
      window.dispatchEvent(new CustomEvent('countdownsUpdated', {
        detail: { category: values.category }
      }))
      
      const userId = localStorage.getItem("now_then_user_id");
      if (userId) {
        updateUrlWithUserId(userId, false);
      }
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error saving countdown:", error)
    }
  }

  return (
    <Card className="max-w-[280px] mx-auto">
      <CardHeader className="pb-1 pt-3 px-4">
        <CardTitle className="text-base font-medium">Create Timer</CardTitle>
        <CardDescription className="text-sm">Set up your countdown or count-up timer</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 px-4">
        {showSuccess && (
          <div className="mb-2 py-1 text-xs text-center text-green-600 animate-fade-in-out">
            Timer created successfully
          </div>
        )}
        <CountdownForm onSubmit={onSubmit} onCancel={onCancel || (() => {})} />
      </CardContent>
    </Card>
  )
}

