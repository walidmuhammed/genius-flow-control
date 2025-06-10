import React from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumDateRangePicker } from './PremiumDateRangePicker';
import { motion } from 'framer-motion';
interface DateRange {
  from?: Date;
  to?: Date;
}
interface OrdersPageHeaderProps {
  totalOrders: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
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
  return <motion.div initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your delivery orders
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1">
            {totalOrders} Total Orders
          </Badge>
          {selectedCount > 0 && <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
              {selectedCount} Selected
            </Badge>}
        </div>
      </div>

      {/* Controls Section */}
      
    </motion.div>;
};