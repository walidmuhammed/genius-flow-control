
import React, { useState, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { useScreenSize } from '@/hooks/useScreenSize';
import { ImportOrdersModal } from '@/components/orders/ImportOrdersModal';
import { useOrders, useOrdersByStatus } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { OrderWithCustomer } from '@/services/orders';
import { motion } from 'framer-motion';
import OrdersTableMobile from '@/components/orders/OrdersTableMobile';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import { OrdersPageHeader } from '@/components/orders/OrdersPageHeader';
import { OrdersFilterTabs } from '@/components/orders/OrdersFilterTabs';
import { EnhancedOrdersTable } from '@/components/orders/EnhancedOrdersTable';
import { BulkActionsBar } from '@/components/orders/BulkActionsBar';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';

const OrdersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const { isMobile } = useScreenSize();
  
  // Fetch orders from the database using our hooks
  const { data: allOrders, isLoading: isLoadingAllOrders, error: ordersError } = useOrders();
  const { data: newOrders } = useOrdersByStatus('New');
  const { data: pendingOrders } = useOrdersByStatus('Pending Pickup');
  const { data: inProgressOrders } = useOrdersByStatus('In Progress');
  const { data: successfulOrders } = useOrdersByStatus('Successful');
  const { data: unsuccessfulOrders } = useOrdersByStatus('Unsuccessful');
  const { data: returnedOrders } = useOrdersByStatus('Returned');
  const { data: paidOrders } = useOrdersByStatus('Paid');
  
  // Show toast notification if there's an error loading orders
  React.useEffect(() => {
    if (ordersError) {
      toast.error("Failed to load orders. Please try again.");
      console.error("Error loading orders:", ordersError);
    }
  }, [ordersError]);
  
  // Search function for orders
  const searchOrders = (orders: OrderWithCustomer[], query: string) => {
    if (!query.trim()) return orders;
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    return orders.filter(order => {
      return (
        // Search by Order ID
        order.order_id.toString().includes(lowercaseQuery) ||
        // Search by Reference Number
        order.reference_number?.toLowerCase().includes(lowercaseQuery) ||
        // Search by Customer Name
        order.customer?.name.toLowerCase().includes(lowercaseQuery) ||
        // Search by Phone
        order.customer?.phone.toLowerCase().includes(lowercaseQuery) ||
        // Search by Location
        order.customer?.city_name?.toLowerCase().includes(lowercaseQuery) ||
        order.customer?.governorate_name?.toLowerCase().includes(lowercaseQuery) ||
        // Search by Amount (as string)
        order.cash_collection_usd?.toString().includes(lowercaseQuery) ||
        // Search by Status
        order.status.toLowerCase().includes(lowercaseQuery) ||
        // Search by Type
        order.type.toLowerCase().includes(lowercaseQuery) ||
        // Search by Note
        (order.note && order.note.toLowerCase().includes(lowercaseQuery))
      );
    });
  };
  
  // Filter orders by date range
  const filterByDateRange = (orders: OrderWithCustomer[], from?: Date, to?: Date) => {
    if (!from && !to) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.updated_at);
      
      if (from && to) {
        return orderDate >= from && orderDate <= to;
      } else if (from) {
        return orderDate >= from;
      } else if (to) {
        return orderDate <= to;
      }
      
      return true;
    });
  };
  
  // Get currently active orders based on tab
  const getActiveTabOrders = () => {
    if (!allOrders) return [];
    
    switch (activeTab) {
      case 'new':
        return newOrders || [];
      case 'pending':
        return pendingOrders || [];
      case 'inProgress':
        return inProgressOrders || [];
      case 'successful':
        return successfulOrders || [];
      case 'unsuccessful':
        return unsuccessfulOrders || [];
      case 'returned':
        return returnedOrders || [];
      case 'paid':
        return paidOrders || [];
      case 'awaitingAction':
        // Filter orders with status 'Awaiting Action'
        return allOrders.filter(order => order.status === 'New' || order.status === 'Pending Pickup' || order.status === 'Unsuccessful');
      default:
        return allOrders;
    }
  };
  
  // Combined filtering and searching
  const filteredOrders = useMemo(() => {
    // First filter by status/tab
    const tabFilteredOrders = getActiveTabOrders();
    
    // Then filter by date range
    const dateFiltered = filterByDateRange(tabFilteredOrders, dateRange.from, dateRange.to);
    
    // Finally filter by search query
    return searchOrders(dateFiltered, searchQuery);
  }, [activeTab, searchQuery, dateRange.from, dateRange.to, allOrders, newOrders, pendingOrders, 
      inProgressOrders, successfulOrders, unsuccessfulOrders, returnedOrders, paidOrders]);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleDateChange = useCallback((range: {from: Date | undefined, to: Date | undefined}) => {
    setDateRange(range);
  }, []);

  const handleViewOrder = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleEditOrder = (order: OrderWithCustomer) => {
    // Navigate to edit order page
    console.log('Edit order:', order.id);
  };

  const handleDeleteOrder = (order: OrderWithCustomer) => {
    // Show confirmation dialog and delete
    console.log('Delete order:', order.id);
  };

  const handleBulkActions = {
    print: () => console.log('Bulk print:', selectedOrders),
    export: () => console.log('Bulk export:', selectedOrders),
    delete: () => console.log('Bulk delete:', selectedOrders),
  };

  const canDeleteSelected = selectedOrders.every(id => 
    filteredOrders.find(order => order.id === id)?.status === 'New'
  );

  const tabs = [
    { key: 'all', label: 'All Orders', count: allOrders?.length },
    { key: 'new', label: 'New', count: newOrders?.length },
    { key: 'pending', label: 'Pending Pickup', count: pendingOrders?.length },
    { key: 'inProgress', label: 'In Progress', count: inProgressOrders?.length },
    { key: 'successful', label: 'Successful', count: successfulOrders?.length },
    { key: 'unsuccessful', label: 'Unsuccessful', count: unsuccessfulOrders?.length },
    { key: 'returned', label: 'Returned', count: returnedOrders?.length },
    { key: 'awaitingAction', label: 'Awaiting Action', count: undefined },
    { key: 'paid', label: 'Paid', count: paidOrders?.length }
  ];

  // Transform orders for mobile display
  const filteredOrdersForMobile = useMemo(() => mapOrdersToTableFormat(filteredOrders), [filteredOrders]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <OrdersPageHeader
          totalOrders={allOrders?.length || 0}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          dateRange={dateRange}
          onDateRangeChange={handleDateChange}
          onImport={() => setImportModalOpen(true)}
          onExport={() => console.log('Export')}
          selectedCount={selectedOrders.length}
        />
        
        {/* Filter Tabs */}
        <OrdersFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />
        
        {/* Loading State */}
        {isLoadingAllOrders && (
          <motion.div 
            className="flex justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#DB271E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {ordersError && (
          <motion.div 
            className="flex justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400">Failed to load orders. Please try again later.</p>
            </div>
          </motion.div>
        )}
        
        {/* Orders Content */}
        {!isLoadingAllOrders && !ordersError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {/* Bulk Actions Bar */}
                <BulkActionsBar
                  selectedCount={selectedOrders.length}
                  onClearSelection={() => setSelectedOrders([])}
                  onBulkPrint={handleBulkActions.print}
                  onBulkExport={handleBulkActions.export}
                  onBulkDelete={handleBulkActions.delete}
                  canDelete={canDeleteSelected}
                />

                {/* Table or Mobile Cards */}
                {isMobile ? (
                  <OrdersTableMobile 
                    orders={filteredOrdersForMobile}
                    selectedOrders={selectedOrders}
                    toggleSelectOrder={(id) => {
                      setSelectedOrders(prev => 
                        prev.includes(id) 
                          ? prev.filter(orderId => orderId !== id)
                          : [...prev, id]
                      );
                    }}
                    onViewDetails={(order) => handleViewOrder(filteredOrders.find(o => o.id === order.id)!)}
                    showActions={true}
                  />
                ) : (
                  <EnhancedOrdersTable
                    orders={filteredOrders}
                    selectedOrderIds={selectedOrders}
                    onOrderSelection={setSelectedOrders}
                    onViewOrder={handleViewOrder}
                    onEditOrder={handleEditOrder}
                    onDeleteOrder={handleDeleteOrder}
                  />
                )}
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState 
                  icon={AlertCircle}
                  title="No orders found"
                  description="There are no orders matching your current filters."
                  actionLabel="Create Order"
                  actionHref="/orders/new"
                />
              </div>
            )}
          </motion.div>
        )}
        
        {/* Import Modal */}
        <ImportOrdersModal 
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
        />

        {/* Order Details Dialog */}
        {selectedOrder && (
          <OrderDetailsDialog
            order={mapOrdersToTableFormat([selectedOrder])[0]}
            open={orderDetailsOpen}
            onOpenChange={setOrderDetailsOpen}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersList;
