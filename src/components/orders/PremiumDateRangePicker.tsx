
import React, { useState } from 'react';
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subWeeks, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, ChevronRight } from 'lucide-react';
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

  // Desktop Layout Component
  const DesktopDatePicker = () => (
    <div className="flex bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[800px]">
      {/* Left Panel - Presets */}
      <div className="w-64 bg-gray-50/80 border-r border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Select</h3>
        <div className="space-y-1">
          {presets.map(preset => (
            <motion.button
              key={preset.name}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 flex items-center justify-between group"
              onClick={() => handleSelectPreset(preset)}
            >
              <span>{preset.label}</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Right Panel - Calendar */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Date Range</h3>
          <p className="text-sm text-gray-600">Choose start and end dates for your filter</p>
        </div>
        
        <Calendar 
          mode="range" 
          selected={date} 
          onSelect={handleSelect} 
          numberOfMonths={2} 
          className="p-0 pointer-events-auto w-full" 
          classNames={{
            months: "flex space-x-8",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-sm font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-10 font-medium text-xs uppercase tracking-wide",
            row: "flex w-full mt-2",
            cell: "h-10 w-10 text-center text-sm p-0 relative hover:bg-gray-50 rounded-lg transition-colors",
            day: "h-10 w-10 p-0 font-medium rounded-lg hover:bg-gray-100 transition-all",
            day_selected: "bg-[#DB271E] text-white hover:bg-[#c0211a] shadow-sm",
            day_today: "bg-gray-100 text-gray-900 font-semibold",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-50",
            day_range_middle: "bg-[#DB271E]/10 text-gray-900 hover:bg-[#DB271E]/20",
            day_range_start: "bg-[#DB271E] text-white hover:bg-[#c0211a]",
            day_range_end: "bg-[#DB271E] text-white hover:bg-[#c0211a]"
          }}
        />
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="h-10 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" /> 
            Clear
          </Button>
          
          <Button 
            onClick={handleApply} 
            className="h-10 px-8 rounded-xl bg-[#DB271E] hover:bg-[#c0211a] text-white shadow-sm"
            disabled={!date.from}
          >
            <Check className="h-4 w-4 mr-2" /> 
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );

  // Tablet Layout Component
  const TabletDatePicker = () => (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-[700px] max-h-[90vh]">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
        <p className="text-sm text-gray-600 mt-1">Choose your preferred time period</p>
      </div>
      
      <div className="flex">
        {/* Presets Sidebar */}
        <div className="w-56 bg-gray-50/80 border-r border-gray-100 p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            {presets.map(preset => (
              <motion.button
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Calendar */}
        <div className="flex-1 p-6">
          <Calendar 
            mode="range" 
            selected={date} 
            onSelect={handleSelect} 
            numberOfMonths={1} 
            className="p-0 pointer-events-auto w-full mx-auto" 
          />
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="h-9 px-4 rounded-lg"
            >
              Clear
            </Button>
            
            <Button 
              onClick={handleApply} 
              className="h-9 px-6 rounded-lg bg-[#DB271E] hover:bg-[#c0211a]"
              disabled={!date.from}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Layout Component
  const MobileDatePicker = () => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">Select Date Range</h3>
        <p className="text-gray-600 mt-1">Choose your time period</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mobileStep === 'presets' ? (
            <motion.div
              key="presets"
              initial={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="p-6 space-y-3"
            >
              {presets.map(preset => (
                <motion.button
                  key={preset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left px-6 py-4 text-base font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 flex items-center justify-between"
                  onClick={() => handleSelectPreset(preset)}
                >
                  <span>{preset.label}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </motion.button>
              ))}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left px-6 py-4 text-base font-medium text-gray-700 hover:text-gray-900 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-200 flex items-center justify-between border-2 border-blue-200"
                onClick={() => setMobileStep('custom')}
              >
                <span>Custom Range</span>
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-6"
            >
              <div className="mb-6">
                <button 
                  onClick={() => setMobileStep('presets')}
                  className="flex items-center text-blue-600 font-medium mb-4"
                >
                  <ChevronRight className="h-5 w-5 rotate-180 mr-1" />
                  Back to Presets
                </button>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Custom Date Range</h4>
                <p className="text-gray-600 text-sm">Select start and end dates</p>
              </div>
              
              <Calendar 
                mode="range" 
                selected={date} 
                onSelect={handleSelect} 
                numberOfMonths={1} 
                className="p-0 pointer-events-auto w-full" 
                classNames={{
                  day: "h-12 w-12 p-0 text-base font-medium rounded-xl hover:bg-gray-100 transition-all",
                  day_selected: "bg-[#DB271E] text-white hover:bg-[#c0211a] shadow-sm",
                  day_today: "bg-gray-100 text-gray-900 font-semibold",
                  day_range_middle: "bg-[#DB271E]/10 text-gray-900 hover:bg-[#DB271E]/20",
                }}
              />
              
              {date.from && !date.to && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700 text-center font-medium">
                    Please select an end date
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Fixed Bottom Actions */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex-1 h-12 rounded-xl border-gray-200 text-base font-medium"
          >
            Clear
          </Button>
          
          <Button 
            onClick={handleApply} 
            className="flex-1 h-12 rounded-xl bg-[#DB271E] hover:bg-[#c0211a] text-white text-base font-medium shadow-sm"
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
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button 
        variant="outline" 
        className={cn(
          "gap-3 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm text-sm h-11 justify-start transition-all duration-200 hover:shadow-md hover:border-gray-300",
          date.from && "text-black border-[#DB271E]/30 bg-[#DB271E]/5 shadow-md",
          isMobile ? "w-full" : "min-w-[220px]",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        <span className="truncate font-medium">{formatDateRange()}</span>
      </Button>
    </motion.div>
  );

  // Render based on screen size
  if (isMobile) {
    return (
      <>
        <TriggerButton />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent 
            side="bottom" 
            className="h-[95vh] max-h-[800px] p-0 rounded-t-3xl border-0 shadow-2xl"
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
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
          align="end"
          sideOffset={12}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <DesktopDatePicker />
          </motion.div>
        </PopoverContent>
      </Popover>
    </>
  );
}
