"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  date: { from: Date; to: Date }
  onDateChange: (date: { from: Date; to: Date }) => void
  className?: string
}

export function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetChange = (preset: string) => {
    const today = new Date()
    let from: Date
    const to: Date = today

    switch (preset) {
      case "last7days":
        from = addDays(today, -7)
        break
      case "last30days":
        from = addDays(today, -30)
        break
      case "last90days":
        from = addDays(today, -90)
        break
      case "lastYear":
        from = addDays(today, -365)
        break
      default:
        from = addDays(today, -30)
    }

    onDateChange({ from, to })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between space-x-2 border-b p-3">
            <Select onValueChange={handlePresetChange} defaultValue="last30days">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="lastYear">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={{
              from: date?.from,
              to: date?.to,
            }}
            onSelect={(selectedDate) => {
              if (selectedDate?.from && selectedDate?.to) {
                onDateChange({
                  from: selectedDate.from,
                  to: selectedDate.to,
                })
                setIsOpen(false)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

