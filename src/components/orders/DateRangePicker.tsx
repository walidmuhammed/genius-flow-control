
import React, { useState } from 'react';
import { addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

type Preset = {
  name: string;
  label: string;
  date: () => DateRange;
};

export function DateRangePicker({ className, onDateChange }: { 
  className?: string;
  onDateChange?: (range: DateRange) => void;
}) {
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [isOpen, setIsOpen] = useState(false);

  // Enhanced presets for better filtering
  const presets: Preset[] = [
    {
      name: 'today',
      label: 'Today',
      date: () => {
        const today = new Date();
        return { from: today, to: today };
      }
    },
    {
      name: 'yesterday',
      label: 'Yesterday',
      date: () => {
        const yesterday = addDays(new Date(), -1);
        return { from: yesterday, to: yesterday };
      }
    },
    {
      name: 'last3',
      label: 'Last 3 days',
      date: () => {
        const today = new Date();
        const last3Days = addDays(today, -2);
        return { from: last3Days, to: today };
      }
    },
    {
      name: 'last7',
      label: 'Last 7 days',
      date: () => {
        const today = new Date();
        const last7Days = addDays(today, -6);
        return { from: last7Days, to: today };
      }
    },
    {
      name: 'last15',
      label: 'Last 15 days',
      date: () => {
        const today = new Date();
        const last15Days = addDays(today, -14);
        return { from: last15Days, to: today };
      }
    },
    {
      name: 'last30',
      label: 'Last 30 days',
      date: () => {
        const today = new Date();
        const last30Days = addDays(today, -29);
        return { from: last30Days, to: today };
      }
    },
    {
      name: 'thisWeek',
      label: 'This week',
      date: () => {
        const today = new Date();
        return { 
          from: startOfWeek(today, { weekStartsOn: 1 }), 
          to: endOfWeek(today, { weekStartsOn: 1 })
        };
      }
    },
    {
      name: 'lastWeek',
      label: 'Last week',
      date: () => {
        const lastWeek = addDays(new Date(), -7);
        return { 
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
          to: endOfWeek(lastWeek, { weekStartsOn: 1 })
        };
      }
    },
    {
      name: 'thisMonth',
      label: 'This month',
      date: () => {
        const today = new Date();
        return { 
          from: startOfMonth(today), 
          to: endOfMonth(today)
        };
      }
    },
    {
      name: 'lastMonth',
      label: 'Last month',
      date: () => {
        const lastMonth = subMonths(new Date(), 1);
        return { 
          from: startOfMonth(lastMonth), 
          to: endOfMonth(lastMonth)
        };
      }
    },
    {
      name: 'thisYear',
      label: 'This year',
      date: () => {
        const today = new Date();
        return { 
          from: startOfYear(today), 
          to: endOfYear(today)
        };
      }
    }
  ];

  const handleSelectPreset = (preset: Preset) => {
    const newDate = preset.date();
    setDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const handleClear = () => {
    setDate({ from: undefined, to: undefined });
    if (onDateChange) {
      onDateChange({ from: undefined, to: undefined });
    }
  };

  const handleApply = () => {
    setIsOpen(false);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setDate(range);
    }
  };

  const formatDateRange = () => {
    if (date.from && date.to) {
      if (date.from.toDateString() === date.to.toDateString()) {
        return format(date.from, 'MMM d, yyyy');
      } else {
        return `${format(date.from, 'MMM d')} – ${format(date.to, 'MMM d, yyyy')}`;
      }
    } else if (date.from) {
      return `From ${format(date.from, 'MMM d, yyyy')}`;
    }
    return 'Filter by date';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-11 gap-2 border-gray-200/60 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 rounded-xl text-sm font-medium shadow-sm transition-all w-full md:w-auto min-w-[200px]",
            date.from && "text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="truncate font-medium">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl rounded-xl" align="end">
        <div className="flex flex-col lg:flex-row">
          {/* Enhanced Presets Panel */}
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-900/50 w-full lg:w-[180px] rounded-t-xl lg:rounded-tr-none lg:rounded-l-xl">
            <h3 className="font-semibold text-sm mb-3 px-2 text-gray-900 dark:text-gray-100">Quick Filters</h3>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {presets.map(preset => (
                <Button 
                  key={preset.name} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left font-normal h-9 px-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-700 dark:text-gray-300" 
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Calendar */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-b-xl lg:rounded-bl-none lg:rounded-r-xl">
            <Calendar 
              mode="range" 
              selected={date} 
              onSelect={handleSelect} 
              numberOfMonths={window.innerWidth >= 1024 ? 2 : 1}
              className="p-0 pointer-events-auto"
            />
            
            {/* Status Message */}
            {date.from && !date.to && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                Please select an end date
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm h-9 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" 
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-2" /> 
                Clear
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleApply} 
                className="text-sm bg-[#DB271E] hover:bg-[#B91C1C] text-white h-9 px-6 rounded-lg font-medium shadow-sm"
                disabled={!date.from}
              >
                <Check className="h-4 w-4 mr-2" /> 
                Apply Filter
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
