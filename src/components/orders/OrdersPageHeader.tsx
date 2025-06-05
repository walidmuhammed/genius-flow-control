
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrdersDateFilter } from './OrdersDateFilter';

interface OrdersPageHeaderProps {
  totalOrders: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  onDateRangeChange: (range: {
    from?: Date;
    to?: Date;
  }) => void;
  onImport: () => void;
  onExport: () => void;
  selectedCount: number;
}

export const OrdersPageHeader: React.FC<OrdersPageHeaderProps> = ({
  totalOrders,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onImport,
  onExport,
  selectedCount
}) => {
  return (
    <div className="space-y-6">
      {/* Page Title - Outside the container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Orders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your orders
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 font-medium self-start sm:self-center">
          {totalOrders} Total Orders
        </Badge>
      </div>
    </div>
  );
};

// New component for the search controls inside the unified container
export const OrdersSearchControls: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  onImport: () => void;
  onExport: () => void;
  selectedCount: number;
}> = ({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onImport,
  onExport,
  selectedCount
}) => {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200/30 dark:border-gray-700/30">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-4 lg:hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search orders by ID, reference, customer, phone..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-10 h-11 border-gray-200/60 dark:border-gray-700/40 focus:border-[#DB271E] focus:ring-[#DB271E]/20 rounded-xl bg-gray-50/50 dark:bg-gray-900/50" 
          />
        </div>

        {/* Date Range */}
        <OrdersDateFilter 
          onDateChange={onDateRangeChange} 
          className="w-full"
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onImport} 
            className="flex-1 h-11 border-gray-200/60 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 h-11 border-gray-200/60 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => onExport()}>
                Export Selected ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export All Filtered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export All Orders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Layout - Inline */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search orders by ID, reference, customer, phone..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-10 h-11 border-gray-200/60 dark:border-gray-700/40 focus:border-[#DB271E] focus:ring-[#DB271E]/20 rounded-xl bg-gray-50/50 dark:bg-gray-900/50" 
          />
        </div>

        {/* Date Range */}
        <div className="flex-shrink-0">
          <OrdersDateFilter onDateChange={onDateRangeChange} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            size="default" 
            onClick={onImport} 
            className="h-11 px-4 border-gray-200/60 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="default" 
                className="h-11 px-4 border-gray-200/60 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => onExport()}>
                Export Selected ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export All Filtered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport()}>
                Export All Orders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
