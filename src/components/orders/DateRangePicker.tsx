
import React, { useState } from 'react';
import { addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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
      name: 'last7',
      label: 'Last 7 days',
      date: () => {
        const today = new Date();
        const last7Days = addDays(today, -6);
        return { from: last7Days, to: today };
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
      label: 'Year to date',
      date: () => {
        const today = new Date();
        return { 
          from: startOfYear(today), 
          to: today
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
    if (isMobile) {
      setIsOpen(false);
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

  const triggerButton = (
    <Button 
      variant="outline" 
      className={cn(
        "h-11 gap-2 border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium shadow-sm transition-all w-full md:w-auto min-w-[200px]",
        date.from && "text-gray-900 bg-white border-gray-300",
        className
      )}
    >
      <CalendarIcon className="h-4 w-4 text-gray-500" />
      <span className="truncate font-medium">{formatDateRange()}</span>
    </Button>
  );

  const content = (
    <div className="flex flex-col h-full">
      {/* Presets */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Quick Filters</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map(preset => (
            <Button 
              key={preset.name} 
              variant="ghost" 
              size="sm" 
              className="justify-start text-left font-normal h-9 rounded-lg hover:bg-gray-100 text-gray-700" 
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Calendar */}
      <div className="flex-1 p-4">
        <Calendar 
          mode="range" 
          selected={date} 
          onSelect={handleSelect} 
          numberOfMonths={1}
          className="w-full pointer-events-auto"
        />
        
        {/* Status Message */}
        {date.from && !date.to && (
          <p className="text-center text-sm text-gray-500 mt-3 py-2 bg-gray-50 rounded-lg">
            Please select an end date
          </p>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm h-9 px-4 text-gray-600 hover:text-gray-900" 
          onClick={handleClear}
        >
          <X className="h-4 w-4 mr-2" /> 
          Clear
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleApply} 
          className="text-sm bg-[#DB271E] hover:bg-[#B91C1C] text-white h-9 px-6 rounded-lg font-medium"
          disabled={!date.from}
        >
          <Check className="h-4 w-4 mr-2" /> 
          Apply Filter
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {triggerButton}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] bg-white">
          <SheetHeader className="pb-4">
            <SheetTitle>Select Date Range</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-gray-200 shadow-xl rounded-xl" align="end">
        <div className="flex flex-col lg:flex-row">
          {/* Presets Panel */}
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200 p-3 bg-gray-50 w-full lg:w-[180px]">
            <h3 className="font-semibold text-sm mb-3 px-2 text-gray-900">Quick Filters</h3>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {presets.map(preset => (
                <Button 
                  key={preset.name} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left font-normal h-9 px-3 rounded-lg hover:bg-white hover:shadow-sm text-gray-700" 
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-4 bg-white">
            <Calendar 
              mode="range" 
              selected={date} 
              onSelect={handleSelect} 
              numberOfMonths={window.innerWidth >= 1024 ? 2 : 1}
              className="p-0 pointer-events-auto"
            />
            
            {/* Status Message */}
            {date.from && !date.to && (
              <p className="text-center text-sm text-gray-500 mt-3 py-2 bg-gray-50 rounded-lg">
                Please select an end date
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm h-9 px-4 text-gray-600 hover:text-gray-900" 
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
