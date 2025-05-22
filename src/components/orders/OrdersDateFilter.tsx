
import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay, subMonths, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DatePreset = {
  name: string;
  getValue: () => DateRange;
};

interface OrdersDateFilterProps {
  onDateChange: (range: DateRange) => void;
  className?: string;
}

export const OrdersDateFilter: React.FC<OrdersDateFilterProps> = ({
  onDateChange,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const today = new Date();

  const presets: DatePreset[] = [
    {
      name: 'Today',
      getValue: () => ({
        from: startOfDay(today),
        to: endOfDay(today)
      })
    },
    {
      name: 'Yesterday',
      getValue: () => {
        const yesterday = subDays(today, 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        };
      }
    },
    {
      name: 'Last 7 days',
      getValue: () => ({
        from: subDays(today, 6),
        to: today
      })
    },
    {
      name: 'Last 30 days',
      getValue: () => ({
        from: subDays(today, 29),
        to: today
      })
    },
    {
      name: 'Last 90 days',
      getValue: () => ({
        from: subDays(today, 89),
        to: today
      })
    },
    {
      name: 'Last 365 days',
      getValue: () => ({
        from: subDays(today, 364),
        to: today
      })
    },
    {
      name: 'Last month',
      getValue: () => {
        const lastMonth = subMonths(today, 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfDay(subDays(startOfMonth(today), 1))
        };
      }
    },
    {
      name: 'Last 12 months',
      getValue: () => ({
        from: subMonths(today, 12),
        to: today
      })
    },
    {
      name: 'Last year',
      getValue: () => {
        const lastYear = subMonths(today, 12);
        return {
          from: startOfYear(lastYear),
          to: endOfDay(subDays(startOfYear(today), 1))
        };
      }
    },
    {
      name: 'Week to date',
      getValue: () => ({
        from: startOfWeek(today),
        to: today
      })
    },
    {
      name: 'Month to date',
      getValue: () => ({
        from: startOfMonth(today),
        to: today
      })
    },
    {
      name: 'Quarter to date',
      getValue: () => ({
        from: startOfQuarter(today),
        to: today
      })
    },
    {
      name: 'Year to date',
      getValue: () => ({
        from: startOfYear(today),
        to: today
      })
    },
  ];

  const handlePresetClick = (preset: DatePreset) => {
    const range = preset.getValue();
    setSelectedDateRange(range);
    setSelectedPreset(preset.name);
    onDateChange(range);
    setOpen(false);
  };

  const handleCalendarSelect = (range: DateRange) => {
    // Only update if we have a complete range
    if (range.from && range.to) {
      setSelectedDateRange(range);
      setSelectedPreset(null);
      onDateChange(range);
    } else {
      setSelectedDateRange(range);
    }
  };

  const formatDisplayText = () => {
    if (selectedPreset) return selectedPreset;
    
    if (selectedDateRange.from && selectedDateRange.to) {
      return `${format(selectedDateRange.from, 'MMM d, yyyy')} - ${format(selectedDateRange.to, 'MMM d, yyyy')}`;
    }
    
    return 'Select date range';
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDisplayText()}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <div className="flex">
            <div className="border-r border-border/10 p-3 space-y-1 min-w-[150px] max-h-[350px] overflow-y-auto">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start font-normal",
                    selectedPreset === preset.name && "bg-muted"
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            <div>
              <CalendarComponent
                mode="range"
                selected={selectedDateRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
