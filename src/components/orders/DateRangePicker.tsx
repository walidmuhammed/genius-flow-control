
import React, { useState } from 'react';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subWeeks, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
        return {
          from: today,
          to: today
        };
      }
    },
    {
      name: 'yesterday',
      label: 'Yesterday',
      date: () => {
        const yesterday = addDays(new Date(), -1);
        return {
          from: yesterday,
          to: yesterday
        };
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
        return {
          from: last7Days,
          to: today
        };
      }
    },
    {
      name: 'thisMonth',
      label: 'This Month',
      date: () => {
        const today = new Date();
        return {
          from: startOfMonth(today),
          to: today
        };
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
        return {
          from: startOfQuarter(today),
          to: today
        };
      }
    },
    {
      name: 'thisYear',
      label: 'This Year',
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
    setIsOpen(false);
  };

  const handleClear = () => {
    setDate({
      from: undefined,
      to: undefined
    });
    if (onDateChange) {
      onDateChange({
        from: undefined,
        to: undefined
      });
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

  const triggerButton = (
    <Button 
      variant="outline" 
      className={cn(
        "gap-2 border-gray-200 bg-white shadow-sm text-sm",
        isMobile ? "h-10 w-full justify-start" : "h-10 w-auto justify-start",
        date.from && "text-black border-[#DB271E]/20 bg-[#DB271E]/5",
        className
      )}
    >
      <CalendarIcon className="h-4 w-4 text-gray-500" />
      <span className={cn(
        "truncate",
        isMobile ? "text-sm" : "text-sm"
      )}>{formatDateRange()}</span>
    </Button>
  );

  const pickerContent = (
    <div className="flex flex-col space-y-4">
      {/* Presets Section */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Quick Select</h3>
        <div className={cn(
          "grid gap-2",
          isMobile ? "grid-cols-2" : "grid-cols-3"
        )}>
          {presets.map(preset => (
            <Button 
              key={preset.name} 
              variant="ghost" 
              size="sm" 
              className="justify-start text-left font-normal h-9 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Calendar Section */}
      <div className="border-t pt-4">
        <Calendar 
          mode="range" 
          selected={date} 
          onSelect={handleSelect} 
          numberOfMonths={isMobile ? 1 : 2} 
          className="p-0" 
        />
        
        {/* Instruction text */}
        {date.from && !date.to && (
          <p className="text-center text-sm text-muted-foreground mt-3 p-2 bg-blue-50 rounded-lg">
            Please select an end date
          </p>
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
  );

  // Mobile: Use Sheet (slide-up modal)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {triggerButton}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Select Date Range</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {pickerContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop & iPad: Use Popover (floating dropdown)
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-6 bg-white shadow-xl border-gray-200",
          isTablet ? "max-w-md" : "max-w-2xl"
        )} 
        align="end"
        sideOffset={8}
      >
        {pickerContent}
      </PopoverContent>
    </Popover>
  );
}
