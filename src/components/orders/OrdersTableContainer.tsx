
import React from 'react';
import { OrdersFilterTabs } from './OrdersFilterTabs';
import { EnhancedOrdersTable } from './EnhancedOrdersTable';
import { OrderWithCustomer } from '@/services/orders';

interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface OrdersTableContainerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: FilterTab[];
  orders: OrderWithCustomer[];
  selectedOrderIds: string[];
  onOrderSelection: (orderIds: string[]) => void;
  onViewOrder: (order: OrderWithCustomer) => void;
  onEditOrder?: (order: OrderWithCustomer) => void;
  onDeleteOrder?: (order: OrderWithCustomer) => void;
}

export const OrdersTableContainer: React.FC<OrdersTableContainerProps> = ({
  activeTab,
  onTabChange,
  tabs,
  orders,
  selectedOrderIds,
  onOrderSelection,
  onViewOrder,
  onEditOrder,
  onDeleteOrder
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/30 rounded-2xl overflow-hidden shadow-sm">
      {/* Filter Tabs */}
      <OrdersFilterTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabs={tabs}
      />
      
      {/* Orders Table */}
      <div className="border-t-0">
        <EnhancedOrdersTable
          orders={orders}
          selectedOrderIds={selectedOrderIds}
          onOrderSelection={onOrderSelection}
          onViewOrder={onViewOrder}
          onEditOrder={onEditOrder}
          onDeleteOrder={onDeleteOrder}
        />
      </div>
    </div>
  );
};
