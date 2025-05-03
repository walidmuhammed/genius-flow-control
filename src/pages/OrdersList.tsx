
import React, { useState } from 'react';
import { Plus, FileText, Download, Search, Calendar } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersTable from '@/components/orders/OrdersTable';
import { Order } from '@/components/orders/OrdersTableRow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRangePicker } from '@/components/orders/DateRangePicker';

const OrdersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

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
    if (activeTab === 'all') return mockOrders;
    return mockOrders.filter(order => {
      switch (activeTab) {
        case 'new': return order.status === 'New';
        case 'pending': return order.status === 'Pending Pickup';
        case 'process': return order.status === 'In Progress';
        case 'completed': return order.status === 'Successful';
        case 'unsuccessful': return order.status === 'Unsuccessful';
        case 'returned': return order.status === 'Returned';
        case 'paid': return order.status === 'Paid';
        default: return true;
      }
    });
  };
  
  return <MainLayout>
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
          <CardHeader className="border-b">
            <div className="pb-1">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent p-0 h-auto">
                  <TabsTrigger value="all" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    All Orders
                  </TabsTrigger>
                  <TabsTrigger value="new" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    New
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    Pending Pickup
                  </TabsTrigger>
                  <TabsTrigger value="process" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    Successful
                  </TabsTrigger>
                  <TabsTrigger value="unsuccessful" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    Unsuccessful
                  </TabsTrigger>
                  <TabsTrigger value="returned" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    Returned
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#46d483] font-medium">
                    Paid
                  </TabsTrigger>
                </TabsList>
                
                <CardContent className="p-4">
                  <div className="flex justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search orders..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white border-gray-200" />
                    </div>
                    
                    <DateRangePicker />
                  </div>
                
                  <TabsContent value="all" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="new" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="pending" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="process" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="completed" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="unsuccessful" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="returned" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                  
                  <TabsContent value="paid" className="p-0 mt-4">
                    <OrdersTable orders={getFilteredOrders()} selectedOrders={selectedOrders} toggleSelectAll={toggleSelectAll} toggleSelectOrder={toggleSelectOrder} />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </div>
    </MainLayout>;
};
export default OrdersList;
