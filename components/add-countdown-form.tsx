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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { getUserStorageKey } from "@/lib/user-utils"
import { format, addDays, isBefore, startOfDay, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  memo: z.string().max(300, {
    message: "Memo cannot exceed 300 characters"
  }).optional(),
  isCountUp: z.boolean().optional(),
  pinned: z.boolean().optional(),
})

export type CountdownFormValues = z.infer<typeof formSchema>

interface CountdownFormProps {
  defaultValues?: CountdownFormValues
  onSubmit: (values: CountdownFormValues) => void
  submitButtonText?: string
  onCancel: () => void
  onReset?: () => void
}

export function CountdownForm({ defaultValues, onSubmit, submitButtonText = "Create Timer", onCancel, onReset }: CountdownFormProps) {
  const [dateChanged, setDateChanged] = useState(true)
  const [isCountUp, setIsCountUp] = useState(false)

  const form = useForm<CountdownFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      date: "",
      category: "general",
      memo: "",
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

  // Add a reset function that we can call after submission or when reset button is clicked
  const resetForm = () => {
    form.reset({
      title: "",
      date: "",
      category: "general",
      memo: "",
    });
    setIsCountUp(false);
    setDateChanged(true);
  };

  // Handle reset button click
  const handleReset = () => {
    resetForm();
    if (onReset) {
      onReset();
    }
  };

  // Helper function to handle date input changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    let value = e.target.value;
    
    // 하이픈 제거하고 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    
    // 8자리 이상이면 8자리로 제한
    if (numbers.length > 8) {
      return;
    }
    
    // YYYY-MM-DD 형식으로 변환
    let formattedValue = '';
    if (numbers.length >= 1) formattedValue += numbers.slice(0, 4);
    if (numbers.length >= 5) formattedValue += '-' + numbers.slice(4, 6);
    if (numbers.length >= 7) formattedValue += '-' + numbers.slice(6, 8);
    
    onChange(formattedValue);
    
    // Only update count status for valid dates
    if (dateRegex.test(formattedValue)) {
      const parsedDate = new Date(formattedValue);
      if (!isNaN(parsedDate.getTime())) {
        const isPastDate = isDateInPast(formattedValue);
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2 w-full max-w-md sm:max-w-lg mx-auto bg-gradient-to-br from-gray-50 to-white rounded-md border border-gray-100 shadow-sm pt-3 pb-4 px-3 sm:px-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-0.5">
              <FormLabel className="text-xs font-medium text-[#4A2C3A]">Title</FormLabel>
              <div className="w-full">
                <FormControl>
                  <Input 
                    placeholder="Enter timer title" 
                    {...field} 
                    maxLength={20} 
                    className="w-full h-9 text-base border-[#4E724C]/30 focus:border-[#4E724C] focus:ring-[#4E724C]/20 rounded-md transition-all duration-200" 
                  />
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
            <FormItem className="space-y-0.5">
              <FormLabel className="text-xs font-medium text-[#4A2C3A]">Date</FormLabel>
                <div className="w-full">
                  {/* Quick preset buttons */}
                  <div className="flex gap-1 mb-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        const today = format(new Date(), "yyyy-MM-dd");
                        field.onChange(today);
                        const isPastDate = isDateInPast(today);
                        setIsCountUp(isPastDate);
                        setDateChanged(true);
                      }}
                      className="w-full px-2.5 py-1 text-[11px] bg-white hover:bg-gray-50 rounded-md text-[#4E724C] transition-all duration-200 font-medium border border-[#4E724C]/40 hover:border-[#4E724C] shadow-sm"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = addDays(new Date(), 1);
                        const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
                        field.onChange(tomorrowStr);
                        const isPastDate = isDateInPast(tomorrowStr);
                        setIsCountUp(isPastDate);
                        setDateChanged(true);
                      }}
                      className="w-full px-2.5 py-1 text-[11px] bg-white hover:bg-gray-50 rounded-md text-[#4E724C] transition-all duration-200 font-medium border border-[#4E724C]/40 hover:border-[#4E724C] shadow-sm"
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
                        className="h-9 flex-1 text-center text-base border-[#4E724C]/30 focus:border-[#4E724C] focus:ring-[#4E724C]/20 rounded-md transition-all duration-200"
                        placeholder="YYYYMMDD"
                      />
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-2 border-[#4E724C]/30 hover:border-[#4E724C] hover:bg-[#4E724C]/5 transition-all duration-200"
                        >
                          <CalendarIcon className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0" align="start" side="top" sideOffset={4}>
                        <Calendar
                          mode="single"
                          selected={field.value ? parseISO(field.value) : undefined}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              const dateString = format(date, "yyyy-MM-dd");
                              field.onChange(dateString);
                              const isPastDate = isDateInPast(dateString);
                              setIsCountUp(isPastDate);
                              setDateChanged(true);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {dateChanged && field.value && dateRegex.test(field.value) && (
                  <div className="w-full mt-2 px-2 py-0.5 rounded-md text-[11px] font-medium text-center"
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
            <FormItem className="space-y-0.5">
              <FormLabel className="text-xs font-medium text-[#4A2C3A]">Category</FormLabel>
              <div className="w-full">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 w-full text-base border-[#4E724C]/30 focus:border-[#4E724C] focus:ring-[#4E724C]/20 rounded-md transition-all duration-200">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" side="bottom" align="start" className="w-full">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem className="space-y-0.5">
              <FormLabel className="text-xs font-medium text-[#4A2C3A]">Memo (Optional)</FormLabel>
              <div className="w-full">
                <FormControl>
                  <Textarea 
                    placeholder="Add a personal note about this timer..." 
                    {...field} 
                    maxLength={300}
                    className="w-full min-h-[64px] text-base border-[#4E724C]/30 focus:border-[#4E724C] focus:ring-[#4E724C]/20 rounded-md transition-all duration-200 resize-none"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pinned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-[#4E724C]/30 data-[state=checked]:bg-[#4E724C] data-[state=checked]:border-[#4E724C]"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-xs font-medium text-[#4A2C3A]">
                  Pin to top
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="w-full max-w-sm sm:max-w-md mx-auto flex gap-2 pt-3">
          <Button type="submit" className="flex-1 bg-gradient-to-r from-[#4E724C] to-[#3A5A38] hover:from-[#5A7F58] hover:to-[#4A6A48] text-white border-0 h-9 text-sm font-medium rounded-md shadow-sm transition-all duration-200">
            {submitButtonText}
          </Button>
          <Button type="button" onClick={handleReset} variant="outline" className="flex-1 h-9 text-sm font-medium border-[#4E724C]/30 hover:bg-[#4E724C]/5 hover:border-[#4E724C] rounded-md transition-all duration-200">
            Reset
          </Button>
          <Button type="button" onClick={onCancel} variant="outline" className="flex-1 h-9 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-md transition-all duration-200">
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
      pinned: values.pinned || false,
      originalCategory: values.category,
      memo: values.memo || "",
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
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error saving countdown:", error)
    }
  }

  return (
    <Card className="max-w-[340px] sm:max-w-[380px] mx-auto">
      <CardHeader className="pb-0 pt-2 px-3">
        <CardTitle className="text-base font-medium">Create Timer</CardTitle>
        <CardDescription className="text-sm">Set up your countdown or count-up timer</CardDescription>
      </CardHeader>
      <CardContent className="pt-1 px-3 pb-2">
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

