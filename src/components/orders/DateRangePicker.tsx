
import * as React from "react"
import { format, isValid, startOfToday } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  onSelect?: (range: DateRange | undefined) => void
}

export function DateRangePicker({ className, onSelect }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>()

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (onSelect) {
      onSelect(range)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[260px] justify-start text-left font-normal h-9 text-gray-700",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from ?? startOfToday()}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />

          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelect(undefined)}
              className="text-gray-500"
            >
              Clear
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = startOfToday();
                  handleSelect({
                    from: today,
                    to: today,
                  });
                }}
                className="text-gray-700"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (date?.from && isValid(date.from)) {
                    handleSelect(date);
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
