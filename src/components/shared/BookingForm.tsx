
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const bookingFormSchema = z.object({
  date: z.date({
    required_error: "A date for booking is required.",
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Please enter a valid start time (HH:MM).",
  }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Please enter a valid end time (HH:MM).",
  }),
  purpose: z.string().min(10, {
    message: "Purpose must be at least 10 characters.",
  }).max(200, {
    message: "Purpose must not exceed 200 characters.",
  }),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: "End time must be after start time.",
  path: ["endTime"], // Path to show error on endTime field
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  hallName: string;
}

export function BookingForm({ hallName }: BookingFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      purpose: "",
      startTime: "",
      endTime: "",
    }
  });

  function onSubmit(data: BookingFormValues) {
    console.log(data);
    toast({
      title: "Booking Request Submitted!",
      description: `Your request for ${hallName} on ${format(data.date, "PPP")} from ${data.startTime} to ${data.endTime} has been sent for approval.`,
      className: "bg-primary text-primary-foreground",
    });
    // Simulate redirect
    router.push("/faculty/halls");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the date for your seminar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input type="time" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                 <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input type="time" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormDescription className="col-span-2">
            Choose the start and end times for your booking.
        </FormDescription>


        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose of Booking</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe the purpose of this booking..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a short description (10-200 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Submit Booking Request</Button>
      </form>
    </Form>
  );
}
