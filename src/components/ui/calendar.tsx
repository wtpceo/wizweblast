"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-gray-950/90 rounded-lg shadow-xl border border-gray-800", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 pb-3 relative items-center",
        caption_label: "text-lg font-semibold text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-blue-900 border-2 border-blue-500 p-0 opacity-100 hover:bg-blue-700 hover:border-blue-400 text-green-400 hover:text-green-300 rounded-md transition-all"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "grid grid-cols-7 w-full mb-1",
        head_cell:
          "text-blue-300 font-bold text-sm uppercase flex items-center justify-center h-10 w-full border-b border-gray-800",
        row: "grid grid-cols-7 w-full mt-1",
        cell: "text-center p-0 relative h-10 flex items-center justify-center focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-gray-300 hover:bg-blue-900/50 hover:text-white rounded-full transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-700 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-700 focus:text-white rounded-full",
        day_today: "bg-blue-950 text-green-400 font-semibold border border-green-500 rounded-full",
        day_outside:
          "day-outside text-gray-600 opacity-50 hover:bg-gray-800 hover:text-gray-400",
        day_disabled: "text-gray-700 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiers={{
        today: new Date(),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 