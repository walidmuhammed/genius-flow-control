
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

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
  className,
}) => {
  const { isMobile, isTablet } = useScreenSize();
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
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
    const range = { from: preset.range.from, to: preset.range.to };
    setSelectedRange(range);
    onDateChange(range);
    setOpen(false);
    setMobileStep('presets');
  };

  const handleCustomRangeApply = () => {
    if (selectedRange?.from && selectedRange?.to) {
      onDateChange({ from: selectedRange.from, to: selectedRange.to });
      setOpen(false);
      setMobileStep('presets');
    }
  };

  const formatDateRange = () => {
    if (!selectedRange?.from && !selectedRange?.to) {
      return "Select date range";
    }
    if (selectedRange?.from && selectedRange?.to) {
      if (selectedRange.from.getTime() === selectedRange.to.getTime()) {
        return format(selectedRange.from, 'MMM dd, yyyy');
      }
      return `${format(selectedRange.from, 'MMM dd')} - ${format(selectedRange.to, 'MMM dd, yyyy')}`;
    }
    if (selectedRange?.from) {
      return `From ${format(selectedRange.from, 'MMM dd, yyyy')}`;
    }
    return "Select date range";
  };

  // Fix: Add overflow-hidden to <body> and html when the modal is open on mobile
  React.useEffect(() => {
    if (open && isMobile) {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [open, isMobile]);

  // Mobile View
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className={cn(
            "w-full h-11 justify-start text-left font-medium bg-white border-gray-200 rounded-xl transition-all duration-200",
            className
          )}
        >
          <Calendar className="h-4 w-4 mr-3 text-gray-500" />
          <span className="text-sm text-gray-800">
            {formatDateRange()}
          </span>
        </Button>

        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100000] bg-black opacity-100 pointer-events-auto"
              style={{ background: "rgba(0,0,0,0.85)" }}
              aria-hidden="true"
              onClick={() => {
                setOpen(false);
                setMobileStep('presets');
              }}
            />

            {/* Bottom Sheet Container - positioned at absolute bottom with no gaps */}
            <div
              className={cn(
                "fixed left-0 right-0 bottom-0 z-[100001] bg-white max-h-[85vh] overflow-hidden",
                "transform transition-all duration-300 ease-out",
                open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              )}
              style={{ 
                background: '#fff',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                marginBottom: '0px',
                paddingBottom: '0px'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-white">
                <h2 className="text-lg font-medium text-gray-900">
                  {mobileStep === 'presets' ? 'Date Filter' : 'Select Range'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setMobileStep('presets');
                  }}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>

              {/* Content */}
              <div
                className="overflow-y-auto bg-white"
                style={{ maxHeight: 'calc(85vh - 72px)', background: '#fff' }}
              >
                {mobileStep === 'presets' ? (
                  <div className="px-5 pb-5 space-y-2 bg-white">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetSelect(preset)}
                        className="w-full p-3 text-left rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-900 font-medium text-base bg-white"
                      >
                        {preset.label}
                      </button>
                    ))}

                    <div className="pt-3">
                      <button
                        onClick={() => setMobileStep('custom')}
                        className="w-full p-3 text-left rounded-lg hover:bg-[#DC291E]/5 active:bg-[#DC291E]/10 transition-colors text-[#DC291E] font-medium text-base bg-white"
                      >
                        Custom Range
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 pb-5 space-y-4 bg-white">
                    <button
                      onClick={() => setMobileStep('presets')}
                      className="flex items-center gap-2 text-[#DC291E] font-medium hover:text-[#DC291E]/80 transition-colors"
                    >
                      ← Back
                    </button>

                    {/* Date Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start date
                        </label>
                        <Input
                          value={selectedRange?.from ? format(selectedRange.from, 'dd.MM.yyyy') : ''}
                          placeholder="23.06.2025"
                          readOnly
                          className="text-center border-gray-200 rounded-lg h-10 bg-gray-50 font-medium text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End date
                        </label>
                        <Input
                          value={selectedRange?.to ? format(selectedRange.to, 'dd.MM.yyyy') : ''}
                          placeholder="09.07.2025"
                          readOnly
                          className="text-center border-gray-200 rounded-lg h-10 bg-gray-50 font-medium text-gray-800"
                        />
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="py-2">
                      <CalendarComponent
                        mode="range"
                        numberOfMonths={1}
                        selected={selectedRange}
                        onSelect={setSelectedRange}
                        className="w-full border-0 p-0 pointer-events-auto bg-white"
                        classNames={{
                          months: "flex flex-col space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center text-base font-medium text-gray-900",
                          nav: "hidden",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-gray-600 rounded-md w-10 font-medium text-sm",
                          row: "flex w-full mt-2",
                          cell: "h-10 w-10 text-center text-sm p-0 relative",
                          day: "h-10 w-10 p-0 font-medium hover:bg-gray-100 rounded-lg transition-colors text-gray-800",
                          day_selected: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90 rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg font-semibold",
                          day_outside: "text-gray-400",
                          day_disabled: "text-gray-300",
                          day_range_middle: "bg-[#DC291E]/15 text-gray-900 rounded-none",
                          day_range_start: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90 rounded-lg",
                          day_range_end: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90 rounded-lg"
                        }}
                        fixedWeeks
                        showOutsideDays={false}
                        style={{ background: '#fff' }}
                      />
                    </div>

                    <Button
                      onClick={handleCustomRangeApply}
                      disabled={!selectedRange?.from || !selectedRange?.to}
                      className="w-full h-12 bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply Range
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
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
            "h-10 justify-start text-left font-normal bg-white border-gray-200 rounded-lg",
            isTablet ? "w-full" : "w-[280px]",
            className
          )}
        >
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm text-gray-700">
            {formatDateRange()}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-lg" 
        align="center"
        side="bottom"
        sideOffset={8}
      >
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex">
            {/* Left Side - Presets */}
            <div className="w-48 p-4 border-r border-gray-100">
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Calendar */}
            <div className="p-4">
              <div className="space-y-4">
                {/* Date Inputs */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Start date
                    </label>
                    <Input
                      value={selectedRange?.from ? format(selectedRange.from, 'dd.MM.yyyy') : ''}
                      placeholder="23.06.2025"
                      readOnly
                      className="h-9 text-center border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      End date
                    </label>
                    <Input
                      value={selectedRange?.to ? format(selectedRange.to, 'dd.MM.yyyy') : ''}
                      placeholder="09.07.2025"
                      readOnly
                      className="h-9 text-center border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Calendar */}
                <CalendarComponent
                  mode="range"
                  numberOfMonths={2}
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  className="border-0 p-0 pointer-events-auto"
                  classNames={{
                    months: "flex space-x-4",
                    month: "space-y-3",
                    caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-8 font-normal text-xs",
                    row: "flex w-full mt-1",
                    cell: "h-8 w-8 text-center text-sm p-0 relative",
                    day: "h-8 w-8 p-0 font-normal hover:bg-gray-100 rounded-md transition-colors text-sm",
                    day_selected: "bg-[#DC291E] text-white hover:bg-[#DC291E] rounded-md",
                    day_today: "bg-gray-100 text-gray-900 rounded-md",
                    day_outside: "text-gray-400",
                    day_disabled: "text-gray-300",
                    day_range_middle: "bg-[#DC291E]/20 text-gray-900 rounded-none",
                    day_range_start: "bg-[#DC291E] text-white hover:bg-[#DC291E] rounded-md",
                    day_range_end: "bg-[#DC291E] text-white hover:bg-[#DC291E] rounded-md"
                  }}
                />

                {/* Apply Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleCustomRangeApply}
                    disabled={!selectedRange?.from || !selectedRange?.to}
                    className="h-9 bg-[#DC291E] hover:bg-[#DC291E]/90 text-white rounded-lg font-medium text-sm px-6"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
