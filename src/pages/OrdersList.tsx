
import React, { useState, useMemo, useCallback } from 'react';
import { FileBarChart, PackageSearch, CheckCheck, AlertCircle, Download, Upload } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import OrdersTable from '@/components/orders/OrdersTable';
import { EmptyState } from '@/components/ui/empty-state';
import { Order } from '@/components/orders/OrdersTableRow';
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

// Mock data for orders with proper structure to match Order type
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    referenceNumber: "REF12345",
    type: "Deliver",
    customer: {
      name: "John Doe",
      phone: "+961 1 234 567"
    },
    location: {
      city: "Beirut",
      area: "Downtown"
    },
    amount: {
      valueLBP: 3600000,
      valueUSD: 120
    },
    deliveryCharge: {
      valueLBP: 150000,
      valueUSD: 5
    },
    status: "New",
    lastUpdate: "2023-05-20T14:30:00Z",
    note: "Handle with care"
  },
  {
    id: "ORD-002",
    referenceNumber: "REF67890",
    type: "Exchange",
    customer: {
      name: "Jane Smith",
      phone: "+961 3 456 789"
    },
    location: {
      city: "Tripoli",
      area: "Al Mina"
    },
    amount: {
      valueLBP: 2565000,
      valueUSD: 85.50
    },
    deliveryCharge: {
      valueLBP: 105000,
      valueUSD: 3.50
    },
    status: "Pending Pickup",
    lastUpdate: "2023-05-19T10:15:00Z",
    note: "Fragile items"
  },
  {
    id: "ORD-003",
    referenceNumber: "REF54321",
    type: "Deliver",
    customer: {
      name: "Robert Johnson",
      phone: "+961 76 123 456"
    },
    location: {
      city: "Sidon",
      area: "Old City"
    },
    amount: {
      valueLBP: 6322500,
      valueUSD: 210.75
    },
    deliveryCharge: {
      valueLBP: 217500,
      valueUSD: 7.25
    },
    status: "Successful",
    lastUpdate: "2023-05-18T09:45:00Z",
    note: "Express delivery"
  },
  {
    id: "ORD-004",
    referenceNumber: "REF98765",
    type: "Cash Collection",
    customer: {
      name: "Emily Chen",
      phone: "+961 71 234 567"
    },
    location: {
      city: "Beirut",
      area: "Hamra"
    },
    amount: {
      valueLBP: 4500000,
      valueUSD: 150
    },
    deliveryCharge: {
      valueLBP: 180000,
      valueUSD: 6
    },
    status: "In Progress",
    lastUpdate: "2023-05-17T16:20:00Z",
    note: "Call before delivery"
  },
  {
    id: "ORD-005",
    referenceNumber: "REF45678",
    type: "Deliver",
    customer: {
      name: "Ahmad Hassan",
      phone: "+961 3 987 654"
    },
    location: {
      city: "Tyre",
      area: "Old Town"
    },
    amount: {
      valueLBP: 1800000,
      valueUSD: 60
    },
    deliveryCharge: {
      valueLBP: 195000,
      valueUSD: 6.5
    },
    status: "Unsuccessful",
    lastUpdate: "2023-05-16T11:45:00Z",
    note: "Customer not available"
  },
  {
    id: "ORD-006",
    referenceNumber: "REF34567",
    type: "Exchange",
    customer: {
      name: "Sarah Williams",
      phone: "+961 70 123 987"
    },
    location: {
      city: "Jounieh",
      area: "Maameltein"
    },
    amount: {
      valueLBP: 5100000,
      valueUSD: 170
    },
    deliveryCharge: {
      valueLBP: 240000,
      valueUSD: 8
    },
    status: "Returned",
    lastUpdate: "2023-05-15T09:30:00Z",
    note: "Wrong item shipped"
  },
  {
    id: "ORD-007",
    referenceNumber: "REF23456",
    type: "Cash Collection",
    customer: {
      name: "Michael Brown",
      phone: "+961 71 876 543"
    },
    location: {
      city: "Byblos",
      area: "Downtown"
    },
    amount: {
      valueLBP: 7500000,
      valueUSD: 250
    },
    deliveryCharge: {
      valueLBP: 270000,
      valueUSD: 9
    },
    status: "Paid",
    lastUpdate: "2023-05-14T14:15:00Z",
    note: "Payment received in full"
  },
  {
    id: "ORD-008",
    referenceNumber: "REF78901",
    type: "Deliver",
    customer: {
      name: "Olivia Wilson",
      phone: "+961 78 345 678"
    },
    location: {
      city: "Beirut",
      area: "Achrafieh"
    },
    amount: {
      valueLBP: 3000000,
      valueUSD: 100
    },
    deliveryCharge: {
      valueLBP: 150000,
      valueUSD: 5
    },
    status: "Awaiting Action",
    lastUpdate: "2023-05-13T16:45:00Z",
    note: "Customer requested delivery reschedule"
  },
  {
    id: "ORD-009",
    referenceNumber: "REF89012",
    type: "Exchange",
    customer: {
      name: "Liam Davis",
      phone: "+961 3 567 890"
    },
    location: {
      city: "Zahle",
      area: "Center"
    },
    amount: {
      valueLBP: 4800000,
      valueUSD: 160
    },
    deliveryCharge: {
      valueLBP: 225000,
      valueUSD: 7.5
    },
    status: "Awaiting Action",
    lastUpdate: "2023-05-12T11:30:00Z",
    note: "Product damaged on delivery"
  }
];

const OrdersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { isMobile, isTablet } = useScreenSize();
  
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
  
  // Filter by status based on active tab
  const filterByStatus = (orders: Order[]) => {
    if (activeTab === 'all') {
      return orders;
    } else if (activeTab === 'awaitingAction') {
      return orders.filter(order => order.status === 'Awaiting Action');
    } else {
      return orders.filter(order => {
        switch (activeTab) {
          case 'new':
            return order.status === 'New';
          case 'pending':
            return order.status === 'Pending Pickup';
          case 'inProgress':
            return order.status === 'In Progress';  
          case 'successful':
            return order.status === 'Successful';
          case 'unsuccessful':
            return order.status === 'Unsuccessful';
          case 'returned':
            return order.status === 'Returned';
          case 'paid':
            return order.status === 'Paid';
          default:
            return true;
        }
      });
    }
  };
  
  // Combined filtering and searching
  const filteredOrders = useMemo(() => {
    // First filter by status
    const statusFiltered = filterByStatus(mockOrders);
    
    // Then filter by date range
    const dateFiltered = filterByDateRange(statusFiltered, dateRange.from, dateRange.to);
    
    // Finally filter by search query
    return searchOrders(dateFiltered, searchQuery);
  }, [activeTab, searchQuery, dateRange.from, dateRange.to]);
  
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
            description="No new orders have been created today."
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
      
      {/* Render orders table or empty state */}
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
