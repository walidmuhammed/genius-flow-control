
import React, { useState } from 'react';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subWeeks, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useScreenSize } from '@/hooks/useScreenSize';

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
  const { isMobile, isTablet } = useScreenSize();
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [isOpen, setIsOpen] = useState(false);

  // Premium presets for business use
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
      name: 'thisWeek',
      label: 'This Week',
      date: () => {
        const today = new Date();
        return {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: today
        };
      }
    },
    {
      name: 'lastWeek',
      label: 'Last Week',
      date: () => {
        const lastWeek = subWeeks(new Date(), 1);
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 })
        };
      }
    },
    {
      name: 'last7',
      label: 'Last 7 Days',
      date: () => {
        const today = new Date();
        const last7Days = addDays(today, -6);
        return { from: last7Days, to: today };
      }
    },
    {
      name: 'thisMonth',
      label: 'This Month',
      date: () => {
        const today = new Date();
        return { from: startOfMonth(today), to: today };
      }
    },
    {
      name: 'lastMonth',
      label: 'Last Month',
      date: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
      }
    },
    {
      name: 'thisQuarter',
      label: 'This Quarter',
      date: () => {
        const today = new Date();
        return { from: startOfQuarter(today), to: today };
      }
    },
    {
      name: 'thisYear',
      label: 'This Year',
      date: () => {
        const today = new Date();
        return { from: startOfYear(today), to: today };
      }
    }
  ];

  const handleSelectPreset = (preset: Preset) => {
    const newDate = preset.date();
    setDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
    setIsOpen(false);
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
        return format(date.from, isMobile ? 'MMM d' : 'MMM d, yyyy');
      } else {
        return isMobile 
          ? `${format(date.from, 'MMM d')} – ${format(date.to, 'MMM d')}`
          : `${format(date.from, 'MMM d')} – ${format(date.to, 'MMM d, yyyy')}`;
      }
    }
    return isMobile ? 'Filter dates' : 'Filter by date range';
  };

  // Mobile/Tablet content
  const DatePickerContent = () => (
    <div className="flex flex-col h-full">
      {/* Presets Section */}
      <div className="border-b border-gray-100 p-4 bg-gray-50/50">
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Quick Select</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presets.map(preset => (
            <Button 
              key={preset.name} 
              variant="ghost" 
              size="sm" 
              className="justify-start text-left font-normal h-10 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="flex-1 p-4">
        <Calendar 
          mode="range" 
          selected={date} 
          onSelect={handleSelect} 
          numberOfMonths={isMobile ? 1 : 2} 
          className="p-0 pointer-events-auto" 
        />
        
        {/* Instruction text */}
        {date.from && !date.to && (
          <div className="text-center text-sm text-blue-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            Please select an end date
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/30">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm h-10 px-4 hover:bg-gray-100" 
          onClick={handleClear}
        >
          <X className="h-4 w-4 mr-2" /> 
          Clear
        </Button>
        
        <Button 
          size="sm" 
          onClick={handleApply} 
          className="text-sm h-10 px-6 font-medium bg-[#DB271E] hover:bg-[#c8251c] text-white shadow-sm"
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
      <>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 border-gray-200 bg-white shadow-sm text-sm h-10 w-full justify-start",
            date.from && "text-black border-[#DB271E]/20 bg-[#DB271E]/5",
            className
          )}
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="truncate text-sm">{formatDateRange()}</span>
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-xl">
            <SheetHeader className="p-4 border-b border-gray-100">
              <SheetTitle className="text-lg font-semibold">Select Date Range</SheetTitle>
              <SheetDescription className="text-sm text-gray-600">
                Choose a preset or select custom dates
              </SheetDescription>
            </SheetHeader>
            <DatePickerContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 border-gray-200 bg-white shadow-sm text-sm h-10 w-auto justify-start",
            date.from && "text-black border-[#DB271E]/20 bg-[#DB271E]/5",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="truncate text-sm">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 bg-white shadow-xl border-gray-200 rounded-xl w-auto min-w-[680px]" 
        align="end"
        sideOffset={8}
      >
        <div className="flex">
          {/* Presets Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 rounded-l-xl">
            <h3 className="font-semibold text-sm mb-3 text-gray-900">Quick Select</h3>
            <div className="space-y-1">
              {presets.map(preset => (
                <Button 
                  key={preset.name} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left font-normal h-9 px-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm"
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-6">
            <Calendar 
              mode="range" 
              selected={date} 
              onSelect={handleSelect} 
              numberOfMonths={2} 
              className="p-0 pointer-events-auto" 
            />
            
            {/* Instruction text */}
            {date.from && !date.to && (
              <div className="text-center text-sm text-blue-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                Please select an end date
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm h-9 px-4 hover:bg-gray-100" 
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-2" /> 
                Clear
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleApply} 
                className="text-sm h-9 px-4 font-medium bg-[#DB271E] hover:bg-[#c8251c] text-white shadow-sm"
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
