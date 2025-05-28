
import React, { useState, useMemo, useCallback } from 'react';
import { FileBarChart, PackageSearch, CheckCheck, AlertCircle, Download, Upload } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import OrdersTable from '@/components/orders/OrdersTable';
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
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import { toast } from 'sonner';
import { Order } from '@/components/orders/OrdersTableRow';
import { OrderWithCustomer } from '@/services/orders';
import { Package, Search, Filter, MoreHorizontal, Eye, Trash2 } from "lucide-react";

// Transform Supabase data to match the Order interface used by the UI components
const transformOrderData = (order: OrderWithCustomer): Order => {
  return {
    id: order.id,
    referenceNumber: order.reference_number || '',
    type: order.type as any,
    customer: {
      name: order.customer?.name || 'Unknown',
      phone: order.customer?.phone || 'N/A'
    },
    location: {
      city: order.customer?.city_name || 'Unknown',
      area: order.customer?.governorate_name || 'Unknown',
      address: order.customer?.address
    },
    amount: {
      valueLBP: order.cash_collection_lbp ? Number(order.cash_collection_lbp) : 0,
      valueUSD: order.cash_collection_usd ? Number(order.cash_collection_usd) : 0
    },
    deliveryCharge: {
      valueLBP: order.delivery_fees_lbp ? Number(order.delivery_fees_lbp) : 0,
      valueUSD: order.delivery_fees_usd ? Number(order.delivery_fees_usd) : 0
    },
    status: order.status as any,
    lastUpdate: order.updated_at,
    note: order.note
  };
};

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

  // Transform database order format to UI component order format
  const transformedOrders = useMemo(() => {
    return allOrders ? mapOrdersToTableFormat(allOrders) : [];
  }, [allOrders]);
  
  // Search function for orders
  const searchOrders = (orders: Order[], query: string) => {
    if (!query.trim()) return orders;
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    return orders.filter(order => {
      return (
        // Search by Order ID
        order.id.toLowerCase().includes(lowercaseQuery) ||
        // Search by Reference Number
        order.referenceNumber.toLowerCase().includes(lowercaseQuery) ||
        // Search by Customer Name
        order.customer.name.toLowerCase().includes(lowercaseQuery) ||
        // Search by Phone
        order.customer.phone.toLowerCase().includes(lowercaseQuery) ||
        // Search by Location
        order.location.city.toLowerCase().includes(lowercaseQuery) ||
        order.location.area.toLowerCase().includes(lowercaseQuery) ||
        // Search by Amount (as string)
        order.amount.valueUSD.toString().includes(lowercaseQuery) ||
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
  const filterByDateRange = (orders: Order[], from?: Date, to?: Date) => {
    if (!from && !to) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.lastUpdate);
      
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
        return newOrders ? mapOrdersToTableFormat(newOrders) : [];
      case 'pending':
        return pendingOrders ? mapOrdersToTableFormat(pendingOrders) : [];
      case 'inProgress':
        return inProgressOrders ? mapOrdersToTableFormat(inProgressOrders) : [];
      case 'successful':
        return successfulOrders ? mapOrdersToTableFormat(successfulOrders) : [];
      case 'unsuccessful':
        return unsuccessfulOrders ? mapOrdersToTableFormat(unsuccessfulOrders) : [];
      case 'returned':
        return returnedOrders ? mapOrdersToTableFormat(returnedOrders) : [];
      case 'paid':
        return paidOrders ? mapOrdersToTableFormat(paidOrders) : [];
      case 'awaitingAction':
        // Filter orders with status 'Awaiting Action'
        return transformedOrders.filter(order => order.status === 'Awaiting Action');
      default:
        return transformedOrders;
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
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{activeTab === 'all' ? 'All Orders' : 
                 activeTab === 'new' ? 'New' :
                 activeTab === 'pending' ? 'Pending Pickup' :
                 activeTab === 'inProgress' ? 'In Progress' :
                 activeTab === 'successful' ? 'Successful' :
                 activeTab === 'unsuccessful' ? 'Unsuccessful' :
                 activeTab === 'returned' ? 'Returned' :
                 activeTab === 'awaitingAction' ? 'Awaiting Action' :
                 activeTab === 'paid' ? 'Paid' : 'Filter'}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Filter Orders</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full py-4">
          <div className="space-y-2">
            <Button 
              variant={activeTab === 'all' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('all');
                setFilterSheetOpen(false);
              }}
            >
              All Orders
            </Button>
            <Button 
              variant={activeTab === 'new' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('new');
                setFilterSheetOpen(false);
              }}
            >
              New
            </Button>
            <Button 
              variant={activeTab === 'pending' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('pending');
                setFilterSheetOpen(false);
              }}
            >
              Pending Pickup
            </Button>
            <Button 
              variant={activeTab === 'inProgress' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('inProgress');
                setFilterSheetOpen(false);
              }}
            >
              In Progress
            </Button>
            <Button 
              variant={activeTab === 'successful' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('successful');
                setFilterSheetOpen(false);
              }}
            >
              Successful
            </Button>
            <Button 
              variant={activeTab === 'unsuccessful' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('unsuccessful');
                setFilterSheetOpen(false);
              }}
            >
              Unsuccessful
            </Button>
            <Button 
              variant={activeTab === 'returned' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('returned');
                setFilterSheetOpen(false);
              }}
            >
              Returned
            </Button>
            <Button 
              variant={activeTab === 'awaitingAction' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('awaitingAction');
                setFilterSheetOpen(false);
              }}
            >
              Awaiting Action
            </Button>
            <Button 
              variant={activeTab === 'paid' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('paid');
                setFilterSheetOpen(false);
              }}
            >
              Paid
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
  
  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Orders</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none items-center gap-1.5 border-border/20 shadow-sm transition-all hover:border-border/40"
            onClick={() => setImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 text-gray-600" />
            <span>Import</span>
          </Button>
          <ExportOrdersDropdown 
            selectedOrdersCount={selectedOrders.length}
            totalFilteredCount={filteredOrders.length}
            className="flex-1 sm:flex-none"
          />
        </div>
      </div>
      
      {/* Unified full-width search and filter bar - mobile and desktop */}
      <div className="mt-4 space-y-4">
        {/* Full width search and date filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <OrdersDateFilter 
            onDateChange={handleDateChange} 
            className="w-full md:w-auto order-1 md:order-1"
          />
          <OrdersSearch 
            onSearch={handleSearch}
            className="flex-1 order-2 md:order-2"
          />
        </div>
        
        {/* Mobile status filter */}
        {isMobile && (
          <div className="flex gap-2">
            {renderMobileTabsMenu()}
          </div>
        )}
        
        {/* Desktop tabs */}
        {!isMobile && (
          <div className="flex gap-4 border-b border-border/10 overflow-x-auto">
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('all')}
            >
              All Orders
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'new' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('new')}
            >
              New
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'pending' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Pickup
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'inProgress' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('inProgress')}
            >
              In Progress
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'successful' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('successful')}
            >
              Successful
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'unsuccessful' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('unsuccessful')}
            >
              Unsuccessful
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'returned' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('returned')}
            >
              Returned
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'awaitingAction' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('awaitingAction')}
            >
              Awaiting Action
            </button>
            <button 
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'paid' ? 'text-[#DB271E] border-b-2 border-[#DB271E]' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('paid')}
            >
              Paid
            </button>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {isLoadingAllOrders && (
        <div className="mt-8 flex justify-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      )}

      {/* Error state */}
      {ordersError && (
        <div className="mt-8 flex justify-center">
          <p className="text-red-500">Failed to load orders. Please try again later.</p>
        </div>
      )}
      
      {/* Render orders table or empty state */}
      {!isLoadingAllOrders && !ordersError && (
        <>
          {filteredOrders.length > 0 ? (
            <OrdersTable 
              orders={filteredOrders}
              selectedOrders={selectedOrders}
              toggleSelectAll={toggleSelectAll}
              toggleSelectOrder={toggleSelectOrder}
              showActions={true}
            />
          ) : (
            <div className="mt-4">
              {renderEmptyState()}
            </div>
          )}
        </>
      )}
      
      {/* Import Modal */}
      <ImportOrdersModal 
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
      
      {/* Add padding at the bottom for mobile to account for the navigation bar */}
      {isMobile && <div className="h-16" />}
    </MainLayout>
  );
};

export default OrdersList;
