import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { CourierOrdersSearchControls } from './CourierOrdersPageHeader';
import { CourierOrdersFilterTabs } from './CourierOrdersFilterTabs';
import { CourierOrdersTable } from './CourierOrdersTable';
import { CourierOrdersTableMobile } from './CourierOrdersTableMobile';
import { CourierOrderDetailsDialog } from './CourierOrderDetailsDialog';
import { useCourierOrders, useUpdateOrderStatus, useAddDeliveryNote } from '@/hooks/use-courier-orders';
import { OrderWithCustomer, OrderStatus } from '@/services/orders';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

interface CourierOrdersUnifiedContainerProps {
  searchQuery: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  packageTypeFilter: string;
  isLoading: boolean;
}

export const CourierOrdersUnifiedContainer: React.FC<CourierOrdersUnifiedContainerProps> = ({
  searchQuery,
  dateRange,
  packageTypeFilter,
  isLoading
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const isMobile = useIsMobile();
  
  const { data: orders = [] } = useCourierOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const addDeliveryNote = useAddDeliveryNote();

  // Filter orders based on search, date range, package type, and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const searchMatch = !searchQuery || 
        order.order_id?.toString().includes(searchQuery) ||
        order.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.phone?.includes(searchQuery);

      // Date filter
      const dateMatch = !dateRange.from || 
        (new Date(order.created_at) >= dateRange.from && 
         (!dateRange.to || new Date(order.created_at) <= dateRange.to));

      // Package type filter
      const packageMatch = packageTypeFilter === 'all' || 
        order.package_type?.toLowerCase() === packageTypeFilter.toLowerCase();

      // Status filter
      const statusMatch = selectedStatus === 'all' || 
        order.status.toLowerCase().replace(' ', '_') === selectedStatus;

      return searchMatch && dateMatch && packageMatch && statusMatch;
    });
  }, [orders, searchQuery, dateRange, packageTypeFilter, selectedStatus]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter(o => o.status === 'New').length,
      pending_pickup: orders.filter(o => o.status === 'Pending Pickup').length,
      assigned: orders.filter(o => o.status === 'Assigned').length,
      in_progress: orders.filter(o => o.status === 'In Progress').length,
      successful: orders.filter(o => o.status === 'Successful').length,
      unsuccessful: orders.filter(o => o.status === 'Unsuccessful').length,
      returned: orders.filter(o => o.status === 'Returned').length,
      awaiting_payment: orders.filter(o => o.status === 'Awaiting Payment').length,
      paid: orders.filter(o => o.status === 'Paid').length
    };
  }, [orders]);

  const handleViewOrder = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
  };

  const handleMarkPickedUp = async (order: OrderWithCustomer) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: 'In Progress' as OrderStatus
      });
    } catch (error) {
      console.error('Error marking order as picked up:', error);
    }
  };

  const handleMarkDelivered = async (order: OrderWithCustomer) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: 'Successful' as OrderStatus
      });
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  const handleMarkUnsuccessful = async (order: OrderWithCustomer, reason?: string) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: 'Unsuccessful' as OrderStatus,
        reason
      });
    } catch (error) {
      console.error('Error marking order as unsuccessful:', error);
    }
  };

  const handleAddDeliveryNote = async (orderId: string, note: string) => {
    try {
      await addDeliveryNote.mutateAsync({ orderId, note });
    } catch (error) {
      console.error('Error adding delivery note:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Card className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-gray-200/30 dark:border-gray-700/30 shadow-sm rounded-xl overflow-hidden">
        <CourierOrdersSearchControls
          searchQuery={searchQuery}
          onSearchChange={() => {}} // Handled by parent
          dateRange={dateRange}
          onDateRangeChange={() => {}} // Handled by parent
          packageTypeFilter={packageTypeFilter}
          onPackageTypeChange={() => {}} // Handled by parent
        />
        
        <CourierOrdersFilterTabs
          activeTab={selectedStatus}
          onTabChange={setSelectedStatus}
          tabs={[
            { key: 'all', label: 'All Orders', count: statusCounts.all },
            { key: 'new', label: 'New', count: statusCounts.new },
            { key: 'pending_pickup', label: 'Pending Pickup', count: statusCounts.pending_pickup },
            { key: 'assigned', label: 'Assigned', count: statusCounts.assigned },
            { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
            { key: 'successful', label: 'Successful', count: statusCounts.successful },
            { key: 'unsuccessful', label: 'Unsuccessful', count: statusCounts.unsuccessful },
            { key: 'returned', label: 'Returned', count: statusCounts.returned },
            { key: 'awaiting_payment', label: 'Awaiting Payment', count: statusCounts.awaiting_payment },
            { key: 'paid', label: 'Paid', count: statusCounts.paid }
          ]}
        />
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-500">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders found"
              description={searchQuery ? "Try adjusting your search terms." : "No orders match the selected filters."}
            />
          ) : (
            <div className="h-full overflow-auto">
              {isMobile ? (
                <CourierOrdersTableMobile
                  orders={filteredOrders}
                  onViewOrder={handleViewOrder}
                  onMarkPickedUp={handleMarkPickedUp}
                  onMarkDelivered={handleMarkDelivered}
                  onMarkUnsuccessful={handleMarkUnsuccessful}
                />
              ) : (
                <CourierOrdersTable
                  orders={filteredOrders}
                  onViewOrder={handleViewOrder}
                  onMarkPickedUp={handleMarkPickedUp}
                  onMarkDelivered={handleMarkDelivered}
                  onMarkUnsuccessful={handleMarkUnsuccessful}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {selectedOrder && (
        <CourierOrderDetailsDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          onMarkPickedUp={handleMarkPickedUp}
          onMarkDelivered={handleMarkDelivered}
          onMarkUnsuccessful={handleMarkUnsuccessful}
        />
      )}
    </div>
  );
};