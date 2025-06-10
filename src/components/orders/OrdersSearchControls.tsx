
import React from 'react';
import { Search, Upload, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PremiumDateRangePicker } from './PremiumDateRangePicker';
import { useScreenSize } from '@/hooks/useScreenSize';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface OrdersSearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onImport: () => void;
  onExport: () => void;
  selectedCount: number;
}

export const OrdersSearchControls: React.FC<OrdersSearchControlsProps> = ({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onImport,
  onExport,
  selectedCount
}) => {
  const { isMobile, isTablet } = useScreenSize();

  return (
    <div className="p-4 sm:p-6 border-b border-gray-100 bg-white">
      {/* Single Row Layout */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search orders, customers, reference numbers..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-9 h-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-all" 
          />
        </div>
        
        {/* Date Range Picker */}
        <PremiumDateRangePicker 
          onDateChange={onDateRangeChange} 
          className={isMobile ? "w-full" : "min-w-[200px]"} 
        />

        {/* Import/Export Buttons - Same Row */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport} 
            className="h-10 px-3 border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Download className="h-4 w-4 mr-1" />
            {!isMobile && "Export"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onImport} 
            className="h-10 px-3 border-gray-200 hover:bg-gray-50 transition-all"
          >
            <Upload className="h-4 w-4 mr-1" />
            {!isMobile && "Import"}
          </Button>
        </div>
      </div>
    </div>
  );
};
