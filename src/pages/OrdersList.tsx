import React, { useState, useMemo, useCallback } from 'react';
import { FileBarChart, PackageSearch, CheckCheck, AlertCircle, Download, Upload, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { EmptyState } from '@/components/ui/empty-state';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrdersSearch } from '@/components/orders/OrdersSearch';
import { OrdersDateFilter } from '@/components/orders/OrdersDateFilter';
import { ImportOrdersModal } from '@/components/orders/ImportOrdersModal';
import { ExportOrdersDropdown } from '@/components/orders/ExportOrdersDropdown';
import { useOrders, useOrdersByStatus } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { OrderWithCustomer } from '@/services/orders';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const OrdersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
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
  
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };
  
  const toggleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? filteredOrders.map(order => order.id) : []);
  };
  
  const renderEmptyState = () => {
    switch(activeTab) {
      case 'new':
        return (
          <EmptyState 
            icon={FileBarChart}
            title="No new orders today"
            description="No new orders have been created yet. Start by creating a new order."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      case 'pending':
        return (
          <EmptyState 
            icon={PackageSearch}
            title="No pending pickups"
            description="No orders are pending pickup at the moment."
            actionLabel="Schedule Pickup"
            actionHref="/pickups"
          />
        );
      case 'awaitingAction':
        return (
          <EmptyState 
            icon={AlertCircle}
            title="No orders awaiting action"
            description="There are no orders that require your attention right now."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      case 'successful':
        return (
          <EmptyState 
            icon={CheckCheck}
            title="No successful orders"
            description="There are no successful orders matching your current filters."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      default:
        return (
          <EmptyState 
            icon={FileBarChart}
            title="No orders found"
            description="There are no orders matching your current filters."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
    }
  };

  const renderMobileTabsMenu = () => (
    <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl border-gray-200 dark:border-gray-700">
          <Filter className="h-4 w-4" />
          <span className="truncate">
            {activeTab === 'all' ? 'All Orders' : 
             activeTab === 'new' ? 'New' :
             activeTab === 'pending' ? 'Pending' :
             activeTab === 'inProgress' ? 'In Progress' :
             activeTab === 'successful' ? 'Successful' :
             activeTab === 'unsuccessful' ? 'Unsuccessful' :
             activeTab === 'returned' ? 'Returned' :
             activeTab === 'awaitingAction' ? 'Awaiting' :
             activeTab === 'paid' ? 'Paid' : 'Filter'}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-0 bg-white dark:bg-gray-900">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-lg font-semibold">Filter Orders</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full pb-20">
          <div className="space-y-2">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'new', label: 'New' },
              { key: 'pending', label: 'Pending Pickup' },
              { key: 'inProgress', label: 'In Progress' },
              { key: 'successful', label: 'Successful' },
              { key: 'unsuccessful', label: 'Unsuccessful' },
              { key: 'returned', label: 'Returned' },
              { key: 'awaitingAction', label: 'Awaiting Action' },
              { key: 'paid', label: 'Paid' }
            ].map((tab) => (
              <Button 
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl h-12 text-left",
                  activeTab === tab.key && "bg-[#DC291E] hover:bg-[#DC291E]/90"
                )}
                onClick={() => {
                  setActiveTab(tab.key);
                  setFilterSheetOpen(false);
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  const tabItems = [
    { key: 'all', label: 'All Orders' },
    { key: 'new', label: 'New' },
    { key: 'pending', label: 'Pending Pickup' },
    { key: 'inProgress', label: 'In Progress' },
    { key: 'successful', label: 'Successful' },
    { key: 'unsuccessful', label: 'Unsuccessful' },
    { key: 'returned', label: 'Returned' },
    { key: 'awaitingAction', label: 'Awaiting Action' },
    { key: 'paid', label: 'Paid' }
  ];
  
  return (
    <MainLayout>
      <div className={cn(
        "flex justify-between items-start gap-4",
        isMobile ? "flex-col" : "flex-row items-center"
      )}>
        <div className={cn(isMobile && "w-full")}>
          <h1 className={cn(
            "font-semibold tracking-tight text-gray-900 dark:text-gray-100",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            Orders
          </h1>
          {!isMobile && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all your orders
            </p>
          )}
        </div>
        <div className={cn(
          "flex gap-2",
          isMobile ? "w-full" : "w-auto"
        )}>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "items-center gap-1.5 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-600",
              isMobile ? "flex-1" : "flex-none"
            )}
            onClick={() => setImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span>Import</span>
          </Button>
          <ExportOrdersDropdown 
            selectedOrdersCount={selectedOrders.length}
            totalFilteredCount={filteredOrders.length}
            className={cn(isMobile ? "flex-1" : "flex-none")}
          />
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className={cn(
          "flex gap-3",
          isMobile ? "flex-col" : "flex-row"
        )}>
          <OrdersDateFilter 
            onDateChange={handleDateChange} 
            className={cn(
              isMobile ? "w-full order-2" : "w-auto order-1"
            )}
          />
          <OrdersSearch 
            onSearch={handleSearch}
            className={cn(
              isMobile ? "w-full order-1" : "flex-1 order-2"
            )}
          />
        </div>
        
        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="flex gap-2">
            {renderMobileTabsMenu()}
          </div>
        )}
        
        {/* Desktop/Tablet Tabs */}
        {!isMobile && (
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabItems.map((tab) => (
              <motion.button 
                key={tab.key}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg relative",
                  activeTab === tab.key 
                    ? 'text-[#DC291E] bg-[#DC291E]/5' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                onClick={() => setActiveTab(tab.key)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC291E]"
                    layoutId="activeTab"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isLoadingAllOrders && (
        <motion.div 
          className="flex justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#DC291E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            <OrdersTable 
              orders={filteredOrders}
            />
          ) : (
            <div className="mt-8">
              {renderEmptyState()}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Import Modal */}
      <ImportOrdersModal 
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </MainLayout>
  );
};

export default OrdersList;
