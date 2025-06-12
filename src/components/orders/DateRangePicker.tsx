
import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  onDateChange: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}

interface DatePreset {
  label: string;
  range: { from: Date; to: Date };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  onDateChange, 
  className 
}) => {
  const { isMobile, isTablet } = useScreenSize();
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date }>({});
  const [mobileStep, setMobileStep] = useState<'presets' | 'custom'>('presets');

  const today = new Date();
  
  const presets: DatePreset[] = [
    {
      label: 'Today',
      range: { from: today, to: today }
    },
    {
      label: 'Yesterday', 
      range: { from: subDays(today, 1), to: subDays(today, 1) }
    },
    {
      label: 'This Week',
      range: { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) }
    },
    {
      label: 'Last Week',
      range: { from: startOfWeek(subDays(today, 7), { weekStartsOn: 1 }), to: endOfWeek(subDays(today, 7), { weekStartsOn: 1 }) }
    },
    {
      label: 'This Month',
      range: { from: startOfMonth(today), to: endOfMonth(today) }
    },
    {
      label: 'Last Month',
      range: { from: startOfMonth(subDays(today, 30)), to: endOfMonth(subDays(today, 30)) }
    },
    {
      label: 'Last 7 Days',
      range: { from: subDays(today, 7), to: today }
    },
    {
      label: 'Last 30 Days',
      range: { from: subDays(today, 30), to: today }
    },
    {
      label: 'Last 90 Days',
      range: { from: subDays(today, 90), to: today }
    }
  ];

  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedRange(preset.range);
    onDateChange(preset.range);
    setOpen(false);
    setMobileStep('presets');
  };

  const handleCustomRangeApply = () => {
    if (selectedRange.from && selectedRange.to) {
      onDateChange(selectedRange);
      setOpen(false);
      setMobileStep('presets');
    }
  };

  const formatDateRange = () => {
    if (!selectedRange.from && !selectedRange.to) {
      return "Select date range";
    }
    if (selectedRange.from && selectedRange.to) {
      if (selectedRange.from.getTime() === selectedRange.to.getTime()) {
        return format(selectedRange.from, 'MMM dd, yyyy');
      }
      return `${format(selectedRange.from, 'MMM dd')} - ${format(selectedRange.to, 'MMM dd, yyyy')}`;
    }
    if (selectedRange.from) {
      return `From ${format(selectedRange.from, 'MMM dd, yyyy')}`;
    }
    return "Select date range";
  };

  // Mobile View
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className={cn(
            "w-full h-11 justify-start text-left border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-gray-50/50 dark:bg-gray-900/50",
            className
          )}
        >
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatDateRange()}
          </span>
        </Button>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {mobileStep === 'presets' ? '📅 Choose Date Filter' : 'Select your travel dates'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setMobileStep('presets');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                {mobileStep === 'presets' ? (
                  /* Presets Step */
                  <div className="p-6 space-y-3">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetSelect(preset)}
                        className="w-full p-4 text-left rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {preset.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {preset.range.from.getTime() === preset.range.to.getTime() 
                            ? format(preset.range.from, 'MMM dd, yyyy')
                            : `${format(preset.range.from, 'MMM dd')} - ${format(preset.range.to, 'MMM dd, yyyy')}`
                          }
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setMobileStep('custom')}
                      className="w-full p-4 text-left rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        Custom Range
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Choose specific dates
                      </div>
                    </button>
                  </div>
                ) : (
                  /* Custom Range Step */
                  <div className="p-6 space-y-6">
                    {/* Date Inputs */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start date
                          </label>
                          <Input
                            value={selectedRange.from ? format(selectedRange.from, 'dd.MM.yyyy') : ''}
                            placeholder="23.06.2025"
                            readOnly
                            className="h-11 text-center border-gray-200 dark:border-gray-700 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            End date
                          </label>
                          <Input
                            value={selectedRange.to ? format(selectedRange.to, 'dd.MM.yyyy') : ''}
                            placeholder="09.07.2025"
                            readOnly
                            className="h-11 text-center border-gray-200 dark:border-gray-700 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="space-y-4">
                      <CalendarComponent
                        mode="range"
                        numberOfMonths={2}
                        selected={selectedRange}
                        onSelect={setSelectedRange}
                        className="w-full border-0 p-0"
                        classNames={{
                          months: "flex flex-col space-y-6",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center text-base font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 dark:border-gray-700 rounded-lg",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-xs uppercase tracking-wide",
                          row: "flex w-full mt-2",
                          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors",
                          day_selected: "bg-[#22c55e] text-white hover:bg-[#22c55e] rounded-lg",
                          day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg",
                          day_outside: "text-gray-400 dark:text-gray-600",
                          day_disabled: "text-gray-300 dark:text-gray-700",
                          day_range_middle: "bg-[#22c55e]/20 text-gray-900 dark:text-gray-100 rounded-none",
                          day_range_start: "bg-[#22c55e] text-white hover:bg-[#22c55e] rounded-lg",
                          day_range_end: "bg-[#22c55e] text-white hover:bg-[#22c55e] rounded-lg"
                        }}
                      />
                    </div>

                    {/* Apply Button */}
                    <Button
                      onClick={handleCustomRangeApply}
                      disabled={!selectedRange.from || !selectedRange.to}
                      className="w-full h-12 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white rounded-xl font-medium"
                    >
                      Save dates
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop/Tablet View
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 justify-start text-left border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-gray-50/50 dark:bg-gray-900/50",
            isTablet ? "w-full" : "w-[280px]",
            className
          )}
        >
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatDateRange()}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-xl" 
        align="center"
        side="bottom"
        sideOffset={8}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
          <div className="flex">
            {/* Left Side - Presets */}
            <div className="w-48 p-6 border-r border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm">
                Quick Select
              </h3>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left py-2 px-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Calendar */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Date Inputs */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Start date
                    </label>
                    <Input
                      value={selectedRange.from ? format(selectedRange.from, 'dd.MM.yyyy') : ''}
                      placeholder="23.06.2025"
                      readOnly
                      className="h-10 text-center border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      End date
                    </label>
                    <Input
                      value={selectedRange.to ? format(selectedRange.to, 'dd.MM.yyyy') : ''}
                      placeholder="09.07.2025"
                      readOnly
                      className="h-10 text-center border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Calendar */}
                <CalendarComponent
                  mode="range"
                  numberOfMonths={2}
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  className="border-0 p-0"
                  classNames={{
                    months: "flex space-x-6",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-200 dark:border-gray-700 rounded-md",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-8 font-normal text-xs uppercase tracking-wide",
                    row: "flex w-full mt-1",
                    cell: "h-8 w-8 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-sm",
                    day_selected: "bg-[#22c55e] text-white hover:bg-[#22c55e] rounded-md",
                    day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md",
                    day_outside: "text-gray-400 dark:text-gray-600",
                    day_disabled: "text-gray-300 dark:text-gray-700",
                    day_range_middle: "bg-[#22c55e]/20 text-gray-900 dark:text-gray-100 rounded-none",
                    day_range_start: "bg-[#22c55e] text-white hover:bg-[#22c55e] rounded-md",
                    day_range_end: "bg-[#22c55e] text-white hover:bg-[#22c55e] rounded-md"
                  }}
                />

                {/* Apply Button */}
                <Button
                  onClick={handleCustomRangeApply}
                  disabled={!selectedRange.from || !selectedRange.to}
                  className="w-full h-10 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white rounded-lg font-medium text-sm"
                >
                  Apply Filter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
