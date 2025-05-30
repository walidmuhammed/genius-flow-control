
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const quickFilters = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const handleQuickFilter = (days: number) => {
    const endDate = days === 0 ? new Date() : days === 1 ? subDays(new Date(), 1) : new Date();
    const startDate = days === 0 || days === 1 ? endDate : subDays(new Date(), days);
    
    onDateRangeChange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 min-w-[200px] justify-start">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">
            {format(new Date(dateRange.startDate), 'MMM dd')} - {format(new Date(dateRange.endDate), 'MMM dd')}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b">
          <div className="grid grid-cols-2 gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.label}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter(filter.days)}
                className="justify-start"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-3">
          <Calendar
            mode="range"
            selected={{
              from: new Date(dateRange.startDate),
              to: new Date(dateRange.endDate)
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({
                  startDate: range.from.toISOString(),
                  endDate: range.to.toISOString()
                });
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
