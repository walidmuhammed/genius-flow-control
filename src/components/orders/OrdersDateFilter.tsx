
import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay, subMonths, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';
import { Calendar, ChevronDown, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

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
      name: 'This month',
      getValue: () => ({
        from: startOfMonth(today),
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
      name: 'This quarter',
      getValue: () => ({
        from: startOfQuarter(today),
        to: today
      })
    },
    {
      name: 'This year',
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
    }
  };

  const handleApply = () => {
    if (selectedDateRange.from) {
      onDateChange(selectedDateRange);
      setOpen(false);
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
            className="flex items-center gap-2 whitespace-nowrap w-full md:w-auto shadow-sm border-border/20 h-10 transition-colors hover:border-gray-300 focus:border-gray-300 focus:ring-0"
          >
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium truncate">{formatDisplayText()}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white shadow-lg border border-border/20 rounded-lg" 
          align="start"
          sideOffset={5}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="flex max-h-[500px] flex-col md:flex-row">
              {/* Presets column - more compact */}
              <div className="border-b md:border-b-0 md:border-r border-border/10 p-2 md:min-w-[150px] md:max-w-[150px]">
                <h4 className="font-medium text-sm px-2 py-1 text-gray-700">Preset Ranges</h4>
                <ScrollArea className="h-full max-h-[180px] md:max-h-[350px] overflow-y-auto pr-1">
                  <div className="space-y-0.5 mt-1">
                    {presets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start font-normal text-sm h-8 px-2",
                          selectedPreset === preset.name && "bg-muted text-[#DB271E]"
                        )}
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Calendar - show two months */}
              <div className="p-2">
                <CalendarComponent
                  mode="range"
                  selected={selectedDateRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                  className="pointer-events-auto rounded-md"
                  initialFocus
                  classNames={{
                    day_selected: "bg-[#DB271E] text-white hover:bg-[#DB271E] hover:text-white focus:bg-[#DB271E] focus:text-white",
                    day_today: "bg-muted text-foreground",
                  }}
                />
                {selectedDateRange.from && !selectedDateRange.to && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Now select the end date
                  </p>
                )}
              </div>
            </div>
            
            {/* Footer actions */}
            <div className="border-t border-border/10 p-2 flex justify-between">
              <Button 
                size="sm"
                variant="ghost"
                className="text-sm h-8"
                onClick={handleClear}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
              <Button 
                size="sm"
                onClick={handleApply}
                disabled={!selectedDateRange.from}
                className="bg-[#DB271E] hover:bg-[#c0211a] text-white h-8"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Apply
              </Button>
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
