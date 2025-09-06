import React, { useState, useMemo } from 'react';
import { CourierOrdersFilterTabs } from './CourierOrdersFilterTabs';
import { CourierOrdersTable } from './CourierOrdersTable';
import { CourierOrdersTableMobile } from './CourierOrdersTableMobile';
import { CourierOrderDetailsDialog } from './CourierOrderDetailsDialog';
import MarkAsDeliveredModal from './MarkAsDeliveredModal';
import MarkAsUnsuccessfulModal from './MarkAsUnsuccessfulModal';
import { CourierOrdersSearchControls } from './CourierOrdersPageHeader';
import { CourierBulkActionsBar } from './CourierBulkActionsBar';
import { useCourierOrders, useUpdateOrderStatus } from '@/hooks/use-courier-orders';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrderWithCustomer } from '@/services/orders';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showUnsuccessfulModal, setShowUnsuccessfulModal] = useState(false);
  
  const isMobile = useIsMobile();
  const { data: orders = [] } = useCourierOrders();
  const updateOrderStatus = useUpdateOrderStatus();

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
      const statusMatch = activeTab === 'all' || 
        (activeTab === 'new' && order.status === 'New') ||
        (activeTab === 'pending_pickup' && order.status === 'Pending Pickup') ||
        (activeTab === 'assigned' && order.status === 'Assigned') ||
        (activeTab === 'in_progress' && order.status === 'In Progress') ||
        (activeTab === 'successful' && order.status === 'Successful') ||
        (activeTab === 'unsuccessful' && order.status === 'Unsuccessful') ||
        (activeTab === 'returned' && order.status === 'Returned') ||
        (activeTab === 'awaiting_payment' && order.status === 'Awaiting Payment') ||
        (activeTab === 'paid' && order.status === 'paid');

      return searchMatch && dateMatch && packageMatch && statusMatch;
    });
  }, [orders, searchQuery, dateRange, packageTypeFilter, activeTab]);

  const handleViewOrder = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleMarkPickedUp = (order: OrderWithCustomer) => {
    updateOrderStatus.mutate({
      orderId: order.id,
      status: 'In Progress'
    });
  };

  const handleMarkDelivered = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
    setShowDeliveredModal(true);
  };

  const handleMarkUnsuccessful = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
    setShowUnsuccessfulModal(true);
  };

  // Bulk selection handlers
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    const visibleOrderIds = filteredOrders.map(order => order.id);
    setSelectedOrders(prev => 
      prev.length === visibleOrderIds.length 
        ? [] 
        : visibleOrderIds
    );
  };

  const isAllSelected = selectedOrders.length === filteredOrders.length && filteredOrders.length > 0;

  const handleClearSelection = () => {
    setSelectedOrders([]);
  };

  const handleBulkMarkPickedUp = () => {
    selectedOrders.forEach(orderId => {
      const order = filteredOrders.find(o => o.id === orderId);
      if (order && ['New', 'Assigned'].includes(order.status)) {
        updateOrderStatus.mutate({
          orderId,
          status: 'In Progress'
        });
      }
    });
    handleClearSelection();
    toast.success(`${selectedOrders.length} orders marked as picked up`);
  };

  const handleBulkMarkDelivered = () => {
    selectedOrders.forEach(orderId => {
      const order = filteredOrders.find(o => o.id === orderId);
      if (order && order.status === 'In Progress') {
        updateOrderStatus.mutate({
          orderId,
          status: 'Successful'
        });
      }
    });
    handleClearSelection();
    toast.success(`${selectedOrders.length} orders marked as delivered`);
  };

  const handleBulkMarkUnsuccessful = () => {
    selectedOrders.forEach(orderId => {
      const order = filteredOrders.find(o => o.id === orderId);
      if (order && order.status === 'In Progress') {
        updateOrderStatus.mutate({
          orderId,
          status: 'Unsuccessful'
        });
      }
    });
    handleClearSelection();
    toast.success(`${selectedOrders.length} orders marked as unsuccessful`);
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <CourierOrdersSearchControls
        searchQuery={searchQuery}
        onSearchChange={() => {}} // Handled by parent
        dateRange={dateRange}
        onDateRangeChange={() => {}} // Handled by parent
        packageTypeFilter={packageTypeFilter}
        onPackageTypeChange={() => {}} // Handled by parent
      />

      {/* Filter Tabs */}
      <div className="px-4 sm:px-6">
        <CourierOrdersFilterTabs 
          onTabChange={setActiveTab}
          activeTab={activeTab}
          tabs={[
            { key: 'all', label: 'All Orders', count: orders.length },
            { key: 'new', label: 'New', count: orders.filter(o => o.status === 'New').length },
            { key: 'pending_pickup', label: 'Pending Pickup', count: orders.filter(o => o.status === 'Pending Pickup').length },
            { key: 'assigned', label: 'Assigned', count: orders.filter(o => o.status === 'Assigned').length },
            { key: 'in_progress', label: 'In Progress', count: orders.filter(o => o.status === 'In Progress').length },
            { key: 'successful', label: 'Successful', count: orders.filter(o => o.status === 'Successful').length },
            { key: 'unsuccessful', label: 'Unsuccessful', count: orders.filter(o => o.status === 'Unsuccessful').length },
            { key: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'Returned').length },
            { key: 'awaiting_payment', label: 'Awaiting Payment', count: orders.filter(o => o.status === 'Awaiting Payment').length },
            { key: 'paid', label: 'Paid', count: orders.filter(o => o.status === 'paid').length }
          ]}
        />

        {/* Bulk Actions Bar */}
        <CourierBulkActionsBar
          selectedCount={selectedOrders.length}
          onClearSelection={handleClearSelection}
          onBulkMarkPickedUp={handleBulkMarkPickedUp}
          onBulkMarkDelivered={handleBulkMarkDelivered}
          onBulkMarkUnsuccessful={handleBulkMarkUnsuccessful}
        />

        {/* Orders Table */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 shadow-sm">
          {isMobile ? (
            <CourierOrdersTableMobile
              orders={filteredOrders}
              onViewOrder={handleViewOrder}
            />
          ) : (
            <CourierOrdersTable
              orders={filteredOrders}
              onViewOrder={handleViewOrder}
              selectedOrders={selectedOrders}
              onOrderSelect={handleOrderSelect}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      {selectedOrder && showDetailsDialog && (
        <CourierOrderDetailsDialog
          order={selectedOrder}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      )}

      {selectedOrder && showDeliveredModal && (
        <MarkAsDeliveredModal
          open={showDeliveredModal}
          onOpenChange={setShowDeliveredModal}
          originalAmount={{
            usd: selectedOrder.cash_collection_usd || 0,
            lbp: selectedOrder.cash_collection_lbp || 0
          }}
          onConfirm={(data) => {
            updateOrderStatus.mutate({
              orderId: selectedOrder.id,
              status: 'Successful',
              collected_amount_usd: data.collectedAmountUSD,
              collected_amount_lbp: data.collectedAmountLBP,
              collected_currency: data.collectedAmountUSD > 0 ? 'USD' : 'LBP',
              note: data.note
            });
            setShowDeliveredModal(false);
          }}
        />
      )}

      {selectedOrder && showUnsuccessfulModal && (
        <MarkAsUnsuccessfulModal
          open={showUnsuccessfulModal}
          onOpenChange={setShowUnsuccessfulModal}
          onConfirm={(data) => {
            updateOrderStatus.mutate({
              orderId: selectedOrder.id,
              status: 'Unsuccessful',
              unsuccessful_reason: data.reason,
              note: data.note
            });
            setShowUnsuccessfulModal(false);
          }}
        />
      )}
    </div>
  );
};