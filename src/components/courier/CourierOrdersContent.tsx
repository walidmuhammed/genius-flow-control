import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package } from 'lucide-react';
import { OrdersDateFilter } from '../orders/OrdersDateFilter';
import { CourierOrdersFilterTabs } from './CourierOrdersFilterTabs';
import { CourierOrdersTable } from './CourierOrdersTable';
import { CourierOrdersTableMobile } from './CourierOrdersTableMobile';
import { CourierOrderDetailsDialog } from './CourierOrderDetailsDialog';
import { useCourierOrders, useUpdateOrderStatus, useAddDeliveryNote } from '@/hooks/use-courier-orders';
import { OrderWithCustomer, OrderStatus } from '@/services/orders';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmptyState } from '@/components/ui/empty-state';

const CourierOrdersContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageTypeFilter, setPackageTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);

  const isMobile = useIsMobile();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: orders = [], isLoading } = useCourierOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const addDeliveryNote = useAddDeliveryNote();

  // Filter orders based on search, date range, package type, and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const searchMatch = !debouncedSearchQuery || 
        order.order_id?.toString().includes(debouncedSearchQuery) ||
        order.reference_number?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        order.customer?.phone?.includes(debouncedSearchQuery);

      // Date filter
      const dateMatch = !dateRange?.from || 
        (new Date(order.created_at) >= dateRange.from && 
         (!dateRange.to || new Date(order.created_at) <= dateRange.to));

      // Package type filter
      const packageMatch = packageTypeFilter === 'all' || 
        order.package_type?.toLowerCase() === packageTypeFilter.toLowerCase();

      // Status filter
      const statusMatch = statusFilter === 'all' || 
        order.status.toLowerCase().replace(' ', '_') === statusFilter;

      return searchMatch && dateMatch && packageMatch && statusMatch;
    });
  }, [orders, debouncedSearchQuery, dateRange, packageTypeFilter, statusFilter]);

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
      paid: orders.filter(o => o.status === 'paid').length
    };
  }, [orders]);

  const activeFilterCount = useMemo(() => {
    if (statusFilter === 'all') {
      return orders.length;
    }
    return filteredOrders.length;
  }, [statusFilter, orders.length, filteredOrders.length]);

  const handleViewOrder = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
  };

  const handleMarkPickedUp = useCallback(async (order: OrderWithCustomer) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: 'In Progress' as OrderStatus
      });
    } catch (error) {
      console.error('Error marking order as picked up:', error);
    }
  }, [updateOrderStatus]);

  const handleMarkDelivered = useCallback(async (order: OrderWithCustomer, data?: any) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: 'Successful' as OrderStatus,
        collected_amount_usd: data?.collected_amount_usd,
        collected_amount_lbp: data?.collected_amount_lbp,
        collected_currency: data?.collected_currency,
        note: data?.note
      });
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  }, [updateOrderStatus]);

  const handleMarkUnsuccessful = useCallback(async (order: OrderWithCustomer, data?: any) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: 'Unsuccessful' as OrderStatus,
        unsuccessful_reason: data?.unsuccessful_reason,
        collected_amount_usd: data?.collected_amount_usd || 0,
        collected_amount_lbp: data?.collected_amount_lbp || 0,
        collected_currency: data?.collected_currency,
        note: data?.note,
        reason: data?.unsuccessful_reason
      });
    } catch (error) {
      console.error('Error marking order as unsuccessful:', error);
    }
  }, [updateOrderStatus]);

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        <div className="mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage orders assigned to you
            </p>
          </div>
        </div>

      {/* Search and Filters - Fully Responsive */}
      <div className="space-y-4 mb-6">
        {/* Mobile: Stack everything vertically */}
        <div className="block md:hidden space-y-4">
          {/* Search - Full width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search orders..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base" 
            />
          </div>
          
          {/* Filters row - Two columns */}
          <div className="grid grid-cols-1 gap-3">
            <Select value={packageTypeFilter} onValueChange={setPackageTypeFilter}>
              <SelectTrigger className="h-11">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <SelectValue placeholder="Package Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="parcel">Parcel</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="bulky">Bulky</SelectItem>
              </SelectContent>
            </Select>
            
            <OrdersDateFilter onDateChange={setDateRange} />
          </div>
        </div>

        {/* Tablet: Two rows */}
        <div className="hidden md:block lg:hidden space-y-3">
          {/* Search - Full width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by Order ID, Reference, Customer Phone, Name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>
          
          {/* Filters row */}
          <div className="flex gap-4">
            <Select value={packageTypeFilter} onValueChange={setPackageTypeFilter}>
              <SelectTrigger className="w-48">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <SelectValue placeholder="Package Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="parcel">Parcel</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="bulky">Bulky</SelectItem>
              </SelectContent>
            </Select>
            
            <OrdersDateFilter onDateChange={setDateRange} />
          </div>
        </div>

        {/* Desktop: Single row */}
        <div className="hidden lg:flex gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by Order ID, Reference, Customer Phone, Name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>

          {/* Package Type Filter */}
          <Select value={packageTypeFilter} onValueChange={setPackageTypeFilter}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <SelectValue placeholder="Package Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="parcel">Parcel</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="bulky">Bulky</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <OrdersDateFilter onDateChange={setDateRange} />
        </div>
      </div>
      </div>

      {/* Table Container - Separate from header */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-6 min-w-0 overflow-hidden">
        <Card className="border-0 sm:border sm:border-gray-200/60 dark:sm:border-gray-700/40 rounded-none sm:rounded-xl shadow-none sm:shadow-sm h-full">
          <CardContent className="p-0 sm:p-6 space-y-4 h-full flex flex-col">
            {/* Filter Tabs */}
            <CourierOrdersFilterTabs
              activeTab={statusFilter}
              onTabChange={setStatusFilter}
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

            {/* Table Content */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="px-4 sm:px-6">
                  <EmptyState
                    icon={Package}
                    title="No orders found"
                    description={searchQuery ? "Try adjusting your search terms." : "No orders match the selected filters."}
                  />
                </div>
              ) : (
                isMobile ? (
                  <div className="px-4 sm:px-6">
                    <CourierOrdersTableMobile
                      orders={filteredOrders}
                      onViewOrder={handleViewOrder}
                    />
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px]">
                      <CourierOrdersTable
                        orders={filteredOrders}
                        onViewOrder={handleViewOrder}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedOrder && (
        <CourierOrderDetailsDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          onMarkPickedUp={async (orderId: string) => {
            const order = orders?.find(o => o.id === orderId);
            if (order) {
              await handleMarkPickedUp(order);
            }
          }}
          onMarkDelivered={async (orderId: string, data: any) => {
            const order = orders?.find(o => o.id === orderId);
            if (order) {
              await handleMarkDelivered(order, data);
            }
          }}
          onMarkUnsuccessful={async (orderId: string, data: any) => {
            const order = orders?.find(o => o.id === orderId);
            if (order) {
              await handleMarkUnsuccessful(order, data);
            }
          }}
        />
      )}
    </div>
  );
};

export default CourierOrdersContent;