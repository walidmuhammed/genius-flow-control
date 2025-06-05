import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Filter, Upload, Download, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  return <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Orders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 font-medium">
            {totalOrders} Total Orders
          </Badge>
          
        </div>
      </div>

      {/* Unified Controls Strip */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search orders by ID, reference, customer, phone..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-10 h-10 border-gray-200/50 dark:border-gray-700/30 focus:border-[#DC291E] focus:ring-[#DC291E]/20 rounded-xl" />
          </div>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4 border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl min-w-[200px] justify-start">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {dateRange.from ? dateRange.to ? <>
                      {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                    </> : format(dateRange.from, "LLL dd, y") : <span className="text-gray-500">Date range</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent initialFocus mode="range" defaultMonth={dateRange.from} selected={{
              from: dateRange.from,
              to: dateRange.to
            }} onSelect={range => onDateRangeChange({
              from: range?.from,
              to: range?.to
            })} numberOfMonths={2} />
            </PopoverContent>
          </Popover>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onImport} className="h-10 px-4 border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 px-4 border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl">
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
    </div>;
};