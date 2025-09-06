import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrdersDateFilter } from '../orders/OrdersDateFilter';

interface CourierOrdersPageHeaderProps {
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
  packageTypeFilter: string;
  onPackageTypeChange: (type: string) => void;
}

export const CourierOrdersPageHeader: React.FC<CourierOrdersPageHeaderProps> = ({
  totalOrders,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  packageTypeFilter,
  onPackageTypeChange
}) => {
  return (
    <div className="space-y-8 pt-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            My Orders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage orders assigned to you
          </p>
        </div>
      </div>
    </div>
  );
};

// Search controls component for inside the unified container
export const CourierOrdersSearchControls: React.FC<{
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
  packageTypeFilter: string;
  onPackageTypeChange: (type: string) => void;
}> = ({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  packageTypeFilter,
  onPackageTypeChange
}) => {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200/30 dark:border-gray-700/30 mt-6">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-4 lg:hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by Order ID, Reference, Customer Phone, Name..." 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10 h-11 border-gray-200/60 dark:border-gray-700/40 focus:border-[#DB271E] focus:ring-[#DB271E]/20 rounded-xl bg-gray-50/50 dark:bg-gray-900/50" 
          />
        </div>

        {/* Date Range */}
        <OrdersDateFilter onDateChange={onDateRangeChange} className="w-full" />

        {/* Package Type Filter */}
        <Select value={packageTypeFilter} onValueChange={onPackageTypeChange}>
          <SelectTrigger className="w-full h-11 border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
            <SelectValue placeholder="All Package Types" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all">All Package Types</SelectItem>
            <SelectItem value="parcel">Parcel</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="bulky">Bulky</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Layout - Inline */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by Order ID, Reference, Customer Phone, Name..." 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10 h-11 border-gray-200/60 dark:border-gray-700/40 focus:border-[#DB271E] focus:ring-[#DB271E]/20 rounded-xl bg-gray-50/50 dark:bg-gray-900/50" 
          />
        </div>

        {/* Date Range */}
        <div className="flex-shrink-0">
          <OrdersDateFilter onDateChange={onDateRangeChange} />
        </div>

        {/* Package Type Filter */}
        <div className="flex-shrink-0">
          <Select value={packageTypeFilter} onValueChange={onPackageTypeChange}>
            <SelectTrigger className="w-48 h-11 border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
              <SelectValue placeholder="All Package Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all">All Package Types</SelectItem>
              <SelectItem value="parcel">Parcel</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="bulky">Bulky</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};