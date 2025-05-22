
import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// Update the type to match react-day-picker's DateRange type
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

  // Presets for quick date selection
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
      name: 'last7',
      label: 'Last 7 days',
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
      name: 'last30',
      label: 'Last 30 days',
      date: () => {
        const today = new Date();
        const last30Days = addDays(today, -29);
        return {
          from: last30Days,
          to: today
        };
      }
    }, 
    {
      name: 'thisMonth',
      label: 'This month',
      date: () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: firstDayOfMonth,
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

  // Handler to properly set the date range
  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setDate(range);
    }
  };

  // Format the display string for the button
  const formatDateRange = () => {
    if (date.from && date.to) {
      if (date.from.toDateString() === date.to.toDateString()) {
        return format(date.from, 'MMM d, yyyy');
      } else {
        return `${format(date.from, 'MMM d')} – ${format(date.to, 'MMM d')}`;
      }
    }
    return 'Filter by date';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-10 gap-2 border-gray-200 bg-white shadow-sm text-sm w-full md:w-auto",
            date.from && "text-black",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="truncate">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col md:flex-row">
          {/* Presets - more compact */}
          <div className="border-b md:border-b-0 md:border-r p-2 space-y-1 bg-white w-full md:w-[140px]">
            <h3 className="font-medium text-sm mb-2 px-1">Date presets</h3>
            {presets.map(preset => (
              <Button 
                key={preset.name} 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-left font-normal h-8 px-2" 
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          {/* Calendar - show two months */}
          <div className="p-2">
            <Calendar 
              mode="range" 
              selected={date} 
              onSelect={handleSelect} 
              numberOfMonths={2} 
              className="p-2 pointer-events-auto" 
            />
            
            {/* Instruction text if selecting range */}
            {date.from && !date.to && (
              <p className="text-center text-sm text-muted-foreground mt-1">
                Please select an end date
              </p>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t mt-2">
              <Button variant="ghost" size="sm" className="text-sm h-8" onClick={handleClear}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleApply} 
                className="text-sm bg-[#ff243a] hover:bg-[#e01e32] h-8"
                disabled={!date.from}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
