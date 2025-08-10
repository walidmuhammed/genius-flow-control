import React, { useState } from 'react';
import { CourierOrdersPageHeader } from './CourierOrdersPageHeader';
import { CourierOrdersUnifiedContainer } from './CourierOrdersUnifiedContainer';
import { useCourierOrders } from '@/hooks/use-courier-orders';

const CourierOrdersContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [packageTypeFilter, setPackageTypeFilter] = useState('all');
  
  const { data: orders = [], isLoading } = useCourierOrders();

  return (
    <div className="flex flex-col h-full">
      <CourierOrdersPageHeader
        totalOrders={orders.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        packageTypeFilter={packageTypeFilter}
        onPackageTypeChange={setPackageTypeFilter}
      />
      
      <CourierOrdersUnifiedContainer
        searchQuery={searchQuery}
        dateRange={dateRange}
        packageTypeFilter={packageTypeFilter}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CourierOrdersContent;