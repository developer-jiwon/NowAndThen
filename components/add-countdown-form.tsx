"use client"

import { useState } from "react"
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
import { CheckCircle2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date",
  }),
  description: z.string().optional(),
  isCountUp: z.boolean().default(false),
})

export default function AddCountdownForm() {
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      description: "",
      isCountUp: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Create new countdown
    const newCountdown: Countdown = {
      id: uuidv4(),
      title: values.title,
      date: new Date(values.date).toISOString(),
      description: values.description || "",
      hidden: false,
      pinned: false,
      isCountUp: values.isCountUp,
    }

    // Get existing countdowns
    const existingCountdowns = JSON.parse(localStorage.getItem("countdowns_custom") || "[]")

    // Add new countdown
    const updatedCountdowns = [...existingCountdowns, newCountdown]

    // Save to localStorage
    localStorage.setItem("countdowns_custom", JSON.stringify(updatedCountdowns))

    // Reset form
    form.reset()

    // Show success message
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const isCountUp = form.watch("isCountUp")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-merriweather">Add Custom Timer</CardTitle>
        <CardDescription>Create your own countdown or countup for any event</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">Timer added successfully!</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Anniversary, Job Start Date, etc." {...field} />
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    {isCountUp
                      ? "The date the event started (for counting up from)"
                      : "The date of your upcoming event (for counting down to)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isCountUp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Count Up</FormLabel>
                    <FormDescription>
                      Toggle to count up from a past date instead of counting down to a future date
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
              Add Timer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

