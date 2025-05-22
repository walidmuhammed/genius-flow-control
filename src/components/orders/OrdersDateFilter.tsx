
import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay, subMonths, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    setSelectedDateRange(range);
    
    // If we have a complete range, automatically apply it
    if (range.from && range.to) {
      setSelectedPreset(null);
      onDateChange(range);
    }
  };

  const formatDisplayText = () => {
    if (selectedPreset) return selectedPreset;
    
    if (selectedDateRange.from && selectedDateRange.to) {
      if (selectedDateRange.from.toDateString() === selectedDateRange.to.toDateString()) {
        return format(selectedDateRange.from, 'MMM d, yyyy');
      }
      return `${format(selectedDateRange.from, 'MMM d')} - ${format(selectedDateRange.to, 'MMM d, yyyy')}`;
    }
    
    return 'Select date range';
  };

  const handleClear = () => {
    setSelectedDateRange({ from: undefined, to: undefined });
    setSelectedPreset(null);
    onDateChange({ from: undefined, to: undefined });
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 whitespace-nowrap w-full md:w-auto shadow-sm border-border/20 h-10"
          >
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium truncate">{formatDisplayText()}</span>
            <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white shadow-lg" align="start">
          <div className="flex max-h-[500px] flex-col md:flex-row">
            <div className="border-b md:border-b-0 md:border-r p-3 md:min-w-[150px] md:max-h-none">
              <h4 className="font-medium text-sm px-2 py-1.5">Preset Ranges</h4>
              <ScrollArea className="h-full max-h-[200px] md:max-h-[350px] overflow-y-auto pr-2">
                <div className="space-y-1 pt-1">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start font-normal text-sm",
                        selectedPreset === preset.name && "bg-muted"
                      )}
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="p-3">
              <CalendarComponent
                mode="range"
                selected={selectedDateRange}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                className="pointer-events-auto"
                initialFocus
              />
              {selectedDateRange.from && !selectedDateRange.to && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Now select the end date
                </p>
              )}
            </div>
          </div>
          <div className="border-t border-border/10 p-3 flex justify-between">
            <Button 
              size="sm"
              variant="ghost"
              className="text-sm"
              onClick={handleClear}
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
            <Button 
              size="sm"
              onClick={() => setOpen(false)}
              disabled={!selectedDateRange.from}
              className="bg-[#ff243a] hover:bg-[#e01e32] text-white"
            >
              <Check className="h-4 w-4 mr-1" /> Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
