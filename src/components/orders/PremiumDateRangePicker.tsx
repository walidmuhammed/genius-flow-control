
import React, { useState } from 'react';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subWeeks, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useScreenSize } from '@/hooks/useScreenSize';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

type Preset = {
  name: string;
  label: string;
  date: () => DateRange;
};

export function PremiumDateRangePicker({ className, onDateChange }: { 
  className?: string;
  onDateChange?: (range: DateRange) => void;
}) {
  const { isMobile, isTablet, isDesktop } = useScreenSize();
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  const [isOpen, setIsOpen] = useState(false);
  const [mobileStep, setMobileStep] = useState<'presets' | 'custom'>('presets');

  // Clean presets for business use
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
      label: 'Last 7 Days',
      date: () => {
        const today = new Date();
        const last7Days = addDays(today, -6);
        return { from: last7Days, to: today };
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
    setMobileStep('presets');
  };

  const handleClear = () => {
    setDate({ from: undefined, to: undefined });
    if (onDateChange) {
      onDateChange({ from: undefined, to: undefined });
    }
  };

  const handleApply = () => {
    setIsOpen(false);
    setMobileStep('presets');
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

  // Desktop Layout Component - Clean and centered
  const DesktopDatePicker = () => (
    <div className="flex bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-[720px]">
      {/* Left Panel - Presets */}
      <div className="w-56 bg-gray-50 border-r border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Select</h3>
        <div className="space-y-1">
          {presets.map(preset => (
            <button
              key={preset.name}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-150"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Right Panel - Calendar */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900 mb-1">Select Date Range</h3>
          <p className="text-sm text-gray-600">Choose start and end dates</p>
        </div>
        
        <Calendar 
          mode="range" 
          selected={date} 
          onSelect={handleSelect} 
          numberOfMonths={2} 
          className="p-0 pointer-events-auto w-full" 
          classNames={{
            months: "flex space-x-6",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-3",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-md transition-all",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-xs",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative hover:bg-gray-50 rounded-md transition-colors",
            day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 transition-all",
            day_selected: "bg-[#DB271E] text-white hover:bg-[#c0211a]",
            day_today: "bg-gray-100 text-gray-900 font-medium",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-50",
            day_range_middle: "bg-[#DB271E]/10 text-gray-900 hover:bg-[#DB271E]/20",
            day_range_start: "bg-[#DB271E] text-white hover:bg-[#c0211a]",
            day_range_end: "bg-[#DB271E] text-white hover:bg-[#c0211a]"
          }}
        />
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="h-9 px-4 rounded-lg border-gray-300 hover:bg-gray-50"
          >
            Clear
          </Button>
          
          <Button 
            onClick={handleApply} 
            className="h-9 px-6 rounded-lg bg-[#DB271E] hover:bg-[#c0211a] text-white"
            disabled={!date.from}
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );

  // Tablet Layout Component - Compact and clean
  const TabletDatePicker = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-[640px] max-h-[80vh]">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-medium text-gray-900">Select Date Range</h3>
      </div>
      
      <div className="flex">
        {/* Presets Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 p-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            {presets.map(preset => (
              <button
                key={preset.name}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-150"
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.label}
              </button>
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
            className="p-0 pointer-events-auto w-full mx-auto" 
          />
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="h-8 px-3 rounded-lg text-sm"
            >
              Clear
            </Button>
            
            <Button 
              onClick={handleApply} 
              className="h-8 px-4 rounded-lg bg-[#DB271E] hover:bg-[#c0211a] text-sm"
              disabled={!date.from}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Layout Component - Compact and organized
  const MobileDatePicker = () => (
    <div className="h-full flex flex-col bg-white max-h-[75vh]">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900">Select Date Range</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mobileStep === 'presets' ? (
            <motion.div
              key="presets"
              initial={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="p-4 space-y-2"
            >
              {presets.map(preset => (
                <button
                  key={preset.name}
                  className="w-full text-left px-4 py-3 text-base text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-150 flex items-center justify-between"
                  onClick={() => handleSelectPreset(preset)}
                >
                  <span>{preset.label}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
              
              <button
                className="w-full text-left px-4 py-3 text-base text-gray-700 hover:text-gray-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-150 flex items-center justify-between border border-blue-200"
                onClick={() => setMobileStep('custom')}
              >
                <span>Custom Range</span>
                <ChevronRight className="h-4 w-4 text-blue-600" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-4"
            >
              <div className="mb-4">
                <button 
                  onClick={() => setMobileStep('presets')}
                  className="flex items-center text-blue-600 font-medium mb-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Presets
                </button>
                
                <h4 className="text-base font-medium text-gray-900 mb-1">Custom Date Range</h4>
                <p className="text-gray-600 text-sm">Select start and end dates</p>
              </div>
              
              <Calendar 
                mode="range" 
                selected={date} 
                onSelect={handleSelect} 
                numberOfMonths={1} 
                className="p-0 pointer-events-auto w-full" 
                classNames={{
                  day: "h-10 w-10 p-0 text-sm font-normal rounded-lg hover:bg-gray-100 transition-all",
                  day_selected: "bg-[#DB271E] text-white hover:bg-[#c0211a]",
                  day_today: "bg-gray-100 text-gray-900 font-medium",
                  day_range_middle: "bg-[#DB271E]/10 text-gray-900 hover:bg-[#DB271E]/20",
                }}
              />
              
              {date.from && !date.to && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    Please select an end date
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Fixed Bottom Actions */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex-1 h-10 rounded-lg border-gray-300 text-sm"
          >
            Clear
          </Button>
          
          <Button 
            onClick={handleApply} 
            className="flex-1 h-10 rounded-lg bg-[#DB271E] hover:bg-[#c0211a] text-white text-sm"
            disabled={!date.from}
          >
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );

  // Trigger Button
  const TriggerButton = () => (
    <Button 
      variant="outline" 
      className={cn(
        "gap-2 border-gray-200 bg-white text-sm h-10 justify-start transition-all duration-150",
        date.from && "text-black border-[#DB271E]/20 bg-[#DB271E]/5",
        isMobile ? "w-full" : "min-w-[200px]",
        className
      )}
      onClick={() => setIsOpen(true)}
    >
      <CalendarIcon className="h-4 w-4 text-gray-500" />
      <span className="truncate font-normal">{formatDateRange()}</span>
    </Button>
  );

  // Render based on screen size
  if (isMobile) {
    return (
      <>
        <TriggerButton />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent 
            side="bottom" 
            className="h-[75vh] max-h-[600px] p-0 rounded-t-2xl border-0"
          >
            <MobileDatePicker />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  if (isTablet) {
    return (
      <>
        <TriggerButton />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div style={{ display: 'none' }} />
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 bg-transparent border-0 shadow-none w-auto" 
            align="center"
            sideOffset={8}
            style={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TabletDatePicker />
            </motion.div>
          </PopoverContent>
        </Popover>
      </>
    );
  }

  // Desktop
  return (
    <>
      <TriggerButton />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div style={{ display: 'none' }} />
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 bg-transparent border-0 shadow-none w-auto" 
          align="center"
          sideOffset={12}
          style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DesktopDatePicker />
          </motion.div>
        </PopoverContent>
      </Popover>
    </>
  );
}
