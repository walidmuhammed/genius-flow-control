import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Package } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { useScreenSize } from '@/hooks/useScreenSize';
import { ImportOrdersModal } from '@/components/orders/ImportOrdersModal';
import { useOrders, useOrdersByStatus, useDeleteOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { OrderWithCustomer } from '@/services/orders';
import { motion } from 'framer-motion';
import OrdersTableMobile from '@/components/orders/OrdersTableMobile';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import { AdminOrdersPageHeader, AdminOrdersSearchControls } from '@/components/admin/AdminOrdersPageHeader';
import { AdminOrdersFilterTabs } from '@/components/admin/AdminOrdersFilterTabs';
import { AdminEnhancedOrdersTable } from '@/components/admin/AdminEnhancedOrdersTable';
import { AdminBulkActionsBar } from '@/components/admin/AdminBulkActionsBar';
import { AdminOrdersUnifiedContainer } from '@/components/admin/AdminOrdersUnifiedContainer';
import { AdminOrderDetailsDialog } from '@/components/admin/AdminOrderDetailsDialog';
import cn from 'classnames';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

const AdminOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [orderPendingDelete, setOrderPendingDelete] = useState<OrderWithCustomer | null>(null);
  const { isMobile, isTablet } = useScreenSize();
  
  // Fetch orders from the database using our hooks
  const { data: allOrders, isLoading: isLoadingAllOrders, error: ordersError } = useOrders();
  const { data: newOrders } = useOrdersByStatus('New');
  const { data: pendingOrders } = useOrdersByStatus('Pending Pickup');
  const { data: inProgressOrders } = useOrdersByStatus('In Progress');
  const { data: successfulOrders } = useOrdersByStatus('Successful');
  const { data: unsuccessfulOrders } = useOrdersByStatus('Unsuccessful');
  const { data: returnedOrders } = useOrdersByStatus('Returned');
  const { data: paidOrders } = useOrdersByStatus('Paid');
  
  // FIX: Call useDeleteOrder
  const deleteOrderMutation = useDeleteOrder();

  // Handle URL parameters for global search modal opening
  React.useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && allOrders) {
      const foundOrder = allOrders.find(order => order.id === id);
      if (foundOrder) {
        handleViewOrder(foundOrder);
        // Clean up URL without adding to history
        navigate('/dashboard/admin/orders', { replace: true });
      } else {
        // Invalid order ID, clean up URL
        navigate('/dashboard/admin/orders', { replace: true });
        toast.error('Order not found');
      }
    }
  }, [searchParams, allOrders, navigate]);
  
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
    setOrderPendingDelete(order);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderPendingDelete) return;
    await deleteOrderMutation.mutateAsync(orderPendingDelete.id);
    setSelectedOrders((prev) => prev.filter(id => id !== orderPendingDelete.id));
    setConfirmDeleteOpen(false);
    setOrderPendingDelete(null);
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section - Outside unified container */}
        <AdminOrdersPageHeader
          totalOrders={allOrders?.length || 0}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          dateRange={dateRange}
          onDateRangeChange={handleDateChange}
          onImport={() => setImportModalOpen(true)}
          onExport={() => console.log('Export')}
          selectedCount={selectedOrders.length}
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
        
        {/* Unified Container for Search + Filters + Table */}
        {!isLoadingAllOrders && !ordersError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Bulk Actions Bar - Outside container */}
            <AdminBulkActionsBar
              selectedCount={selectedOrders.length}
              onClearSelection={() => setSelectedOrders([])}
              onBulkPrint={handleBulkActions.print}
              onBulkExport={handleBulkActions.export}
              onBulkDelete={handleBulkActions.delete}
              canDelete={canDeleteSelected}
            />

            {/* Unified Container */}
            <AdminOrdersUnifiedContainer>
              {/* Search Controls */}
              <AdminOrdersSearchControls
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                dateRange={dateRange}
                onDateRangeChange={handleDateChange}
                onImport={() => setImportModalOpen(true)}
                onExport={() => console.log('Export')}
                selectedCount={selectedOrders.length}
              />
              
              {/* Filter Tabs */}
              <AdminOrdersFilterTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
              />
              
              {/* Orders Content */}
              <div className="p-4 sm:p-6">
                {filteredOrders.length > 0 ? (
                  isMobile ? (
                    <div className="w-full space-y-4">
                      <OrdersTableMobile
                        orders={filteredOrdersForMobile}
                        selectedOrders={selectedOrders}
                        toggleSelectOrder={(orderId) => {
                          setSelectedOrders(prev => 
                            prev.includes(orderId) 
                              ? prev.filter(id => id !== orderId)
                              : [...prev, orderId]
                          );
                        }}
                        onViewDetails={(order) => {
                          // Use the originalOrder property that's already included in the mapped data
                          if (order.originalOrder) {
                            handleViewOrder(order.originalOrder);
                          }
                        }}
                        onDeleteOrder={(order) => {
                          // For mobile: pass originalOrder for correct .id
                          if (order?.originalOrder) {
                            handleDeleteOrder(order.originalOrder);
                          }
                        }}
                        showActions={true}
                      />
                    </div>
                  ) : isTablet ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <OrdersTableMobile
                        orders={filteredOrdersForMobile}
                        selectedOrders={selectedOrders}
                        toggleSelectOrder={(orderId) => {
                          setSelectedOrders(prev => 
                            prev.includes(orderId) 
                              ? prev.filter(id => id !== orderId)
                              : [...prev, orderId]
                          );
                        }}
                        onViewDetails={(order) => {
                          // Use the originalOrder property that's already included in the mapped data
                          if (order.originalOrder) {
                            handleViewOrder(order.originalOrder);
                          }
                        }}
                        onDeleteOrder={(order) => {
                          if (order?.originalOrder) {
                            handleDeleteOrder(order.originalOrder);
                          }
                        }}
                        showActions={true}
                      />
                    </div>
                  ) : (
                    <AdminEnhancedOrdersTable
                      orders={filteredOrders}
                      selectedOrderIds={selectedOrders}
                      onOrderSelection={setSelectedOrders}
                      onViewOrder={handleViewOrder}
                      onEditOrder={handleEditOrder}
                      onDeleteOrder={handleDeleteOrder}
                    />
                  )
                ) : (
                  <div className="py-12">
                    <EmptyState 
                      icon={Package}
                      title="No orders found"
                      description="No orders match your current filters."
                      actionLabel="View All Orders"
                      actionHref="/dashboard/admin/orders"
                    />
                  </div>
                )}
              </div>
            </AdminOrdersUnifiedContainer>
          </motion.div>
        )}
        
        {/* Import Modal */}
        <ImportOrdersModal 
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
        />

        {/* Order Details Dialog */}
        <AdminOrderDetailsDialog
          order={selectedOrder}
          open={orderDetailsOpen}
          onOpenChange={setOrderDetailsOpen}
        />

        {/* Deletion Confirmation Dialog */}
        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this order? It will be archived and hidden from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDeleteOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#DB271E] hover:bg-[#c0211a] text-white"
                onClick={confirmDelete}
                disabled={deleteOrderMutation.isPending}
              >
                {deleteOrderMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;