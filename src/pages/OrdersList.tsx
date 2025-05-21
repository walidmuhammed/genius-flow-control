
import React, { useState } from 'react';
import { Plus, FileText, Download, Search, Calendar } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersTable from '@/components/orders/OrdersTable';
import { Order } from '@/components/orders/OrdersTableRow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/orders/DateRangePicker';
import OrdersFilter from '@/components/orders/OrdersFilter';
import { EmptyState } from '@/components/ui/empty-state';
import { FileBarChart, PackageSearch, ClockCheck } from 'lucide-react';

const OrdersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Mock data with Lebanese localized content
  const mockOrders: Order[] = [{
    id: '232940',
    referenceNumber: 'REF-A5921',
    type: 'Deliver',
    customer: {
      name: 'محمد الخطيب',
      phone: '03-123456'
    },
    location: {
      city: 'Beirut',
      area: 'Hamra'
    },
    amount: {
      valueLBP: 750000,
      valueUSD: 25
    },
    deliveryCharge: {
      valueLBP: 150000,
      valueUSD: 5
    },
    status: 'New',
    lastUpdate: '2025-04-15T15:19:00Z',
    note: 'Customer requested delivery after 2 PM. Fragile items inside the package. Need careful handling.'
  }, {
    id: '1237118',
    referenceNumber: 'REF-B3801',
    type: 'Cash Collection',
    customer: {
      name: 'سارة الحريري',
      phone: '76-654321'
    },
    location: {
      city: 'Tripoli',
      area: 'Mina'
    },
    amount: {
      valueLBP: 300000,
      valueUSD: 10
    },
    deliveryCharge: {
      valueLBP: 90000,
      valueUSD: 3
    },
    status: 'Returned',
    lastUpdate: '2025-04-12T18:53:00Z',
    note: 'Customer was not available. Attempted delivery twice.'
  }, {
    id: '6690815',
    referenceNumber: 'REF-C7462',
    type: 'Deliver',
    customer: {
      name: 'علي حسن',
      phone: '71-908765'
    },
    location: {
      city: 'Saida',
      area: 'Downtown'
    },
    amount: {
      valueLBP: 1500000,
      valueUSD: 50
    },
    deliveryCharge: {
      valueLBP: 180000,
      valueUSD: 6
    },
    status: 'In Progress',
    lastUpdate: '2025-04-10T03:06:00Z',
    note: 'Call customer before delivery. Building has security gate access.'
  }, {
    id: '2451006',
    referenceNumber: 'REF-D9254',
    type: 'Exchange',
    customer: {
      name: 'ليلى سليم',
      phone: '81-345678'
    },
    location: {
      city: 'Zahle',
      area: 'Haouch Hala'
    },
    amount: {
      valueLBP: 1200000,
      valueUSD: 40
    },
    deliveryCharge: {
      valueLBP: 240000,
      valueUSD: 8
    },
    status: 'Pending Pickup',
    lastUpdate: '2025-04-08T13:42:00Z'
  }, {
    id: '8712354',
    referenceNumber: 'REF-E6138',
    type: 'Deliver',
    customer: {
      name: 'كريم نجار',
      phone: '70-234567'
    },
    location: {
      city: 'Beirut',
      area: 'Achrafieh'
    },
    amount: {
      valueLBP: 900000,
      valueUSD: 30
    },
    deliveryCharge: {
      valueLBP: 150000,
      valueUSD: 5
    },
    status: 'Successful',
    lastUpdate: '2025-04-05T10:15:00Z',
    note: 'Preferred delivery time: Morning hours. Leave with building concierge if not available.'
  }];
  
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(mockOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };
  
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };
  
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Filter orders based on the active tab
  const getFilteredOrders = () => {
    if (!mockOrders.length) return [];
    
    let filteredOrders = mockOrders;
    
    // Apply tab filter
    if (activeTab !== 'all') {
      filteredOrders = filteredOrders.filter(order => {
        switch (activeTab) {
          case 'new': return order.status === 'New';
          case 'pending': return order.status === 'Pending Pickup';
          case 'process': return order.status === 'In Progress';
          case 'completed': return order.status === 'Successful';
          case 'unsuccessful': return order.status === 'Unsuccessful';
          case 'returned': return order.status === 'Returned';
          case 'paid': return order.status === 'Paid';
          case 'awaitingAction': 
            // Orders that require action (New, In Progress, or Pending Pickup)
            return ['New', 'In Progress', 'Pending Pickup'].includes(order.status);
          default: return true;
        }
      });
    }
    
    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.referenceNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.toLowerCase().includes(query) ||
        order.location.city.toLowerCase().includes(query) ||
        order.location.area.toLowerCase().includes(query)
      );
    }
    
    return filteredOrders;
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
            icon={ClockCheck}
            title="No orders awaiting action"
            description="There are no orders that require your attention right now."
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
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track all customer deliveries</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 gap-2 rounded-md border-gray-200 bg-white shadow-sm text-sm font-medium">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" className="h-10 gap-2 rounded-md border-gray-200 bg-white shadow-sm text-sm font-medium">
              <FileText className="h-4 w-4" /> Import
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="border-b p-0">
            <div className="pb-1">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent p-0 h-auto overflow-x-auto">
                  <TabsTrigger value="all" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    All Orders
                  </TabsTrigger>
                  <TabsTrigger value="new" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    New
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    Pending Pickup
                  </TabsTrigger>
                  <TabsTrigger value="process" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    Successful
                  </TabsTrigger>
                  <TabsTrigger value="unsuccessful" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    Unsuccessful
                  </TabsTrigger>
                  <TabsTrigger value="returned" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    Returned
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    Paid
                  </TabsTrigger>
                  <TabsTrigger value="awaitingAction" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#DB271E] font-medium">
                    Awaiting Action
                  </TabsTrigger>
                </TabsList>
                
                <CardContent className="p-4">
                  <OrdersFilter 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    date={date}
                    setDate={setDate}
                    statusFilter={statusFilter}
                    handleStatusFilterChange={handleStatusFilterChange}
                  />
                
                  {filteredOrders.length > 0 ? (
                    <OrdersTable 
                      orders={filteredOrders} 
                      selectedOrders={selectedOrders} 
                      toggleSelectAll={toggleSelectAll} 
                      toggleSelectOrder={toggleSelectOrder} 
                    />
                  ) : (
                    renderEmptyState()
                  )}
                </CardContent>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OrdersList;
