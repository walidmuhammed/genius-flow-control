
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersFilter from '@/components/orders/OrdersFilter';
import OrdersTable from '@/components/orders/OrdersTable';
import { Order } from '@/components/orders/OrdersTableRow';

const OrdersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Mock data with Lebanese localized content
  const mockOrders: Order[] = [
    {
      id: '232940',
      type: 'Deliver',
      customer: {
        name: 'محمد الخطيب',
        phone: '03-123456',
      },
      location: {
        city: 'Beirut',
        area: 'Hamra',
      },
      amount: {
        valueLBP: 750000,
        valueUSD: 25,
      },
      deliveryCharge: 5,
      status: 'Successful',
      lastUpdate: '2025-04-15T15:19:00Z',
    },
    {
      id: '1237118',
      type: 'Cash Collection',
      customer: {
        name: 'سارة الحريري',
        phone: '76-654321',
      },
      location: {
        city: 'Tripoli',
        area: 'Mina',
      },
      amount: {
        valueLBP: 0,
        valueUSD: 0,
      },
      deliveryCharge: 3,
      status: 'Returned',
      lastUpdate: '2025-04-12T18:53:00Z',
    },
    {
      id: '6690815',
      type: 'Deliver',
      customer: {
        name: 'علي حسن',
        phone: '71-908765',
      },
      location: {
        city: 'Saida',
        area: 'Downtown',
      },
      amount: {
        valueLBP: 1500000,
        valueUSD: 50,
      },
      deliveryCharge: 6,
      status: 'Successful',
      lastUpdate: '2025-04-10T03:06:00Z',
    },
    {
      id: '2451006',
      type: 'Return',
      customer: {
        name: 'ليلى سليم',
        phone: '81-345678',
      },
      location: {
        city: 'Zahle',
        area: 'Haouch Hala',
      },
      amount: {
        valueLBP: 1200000,
        valueUSD: 40,
      },
      deliveryCharge: 8,
      status: 'Pending',
      lastUpdate: '2025-04-08T13:42:00Z',
    },
    {
      id: '8712354',
      type: 'Deliver',
      customer: {
        name: 'كريم نجار',
        phone: '70-234567',
      },
      location: {
        city: 'Beirut',
        area: 'Achrafieh',
      },
      amount: {
        valueLBP: 900000,
        valueUSD: 30,
      },
      deliveryCharge: 5,
      status: 'In Progress',
      lastUpdate: '2025-04-05T10:15:00Z',
    },
  ];

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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
            <p className="text-muted-foreground">Track and manage all your orders in one place</p>
          </div>
          <Button 
            variant="default" 
            className="h-10 gap-2 font-medium rounded-full"
          >
            New Order
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-border/5">
            <div className="overflow-auto scrollbar-none">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="in-progress" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger 
                  value="successful" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
                >
                  Successful
                </TabsTrigger>
                <TabsTrigger 
                  value="returned" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
                >
                  Returned
                </TabsTrigger>
                <TabsTrigger 
                  value="delayed" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
                >
                  Delayed
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <OrdersFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            date={date}
            setDate={setDate}
            statusFilter={statusFilter}
            handleStatusFilterChange={handleStatusFilterChange}
          />
          
          <TabsContent value="all" className="p-0">
            <OrdersTable 
              orders={mockOrders}
              selectedOrders={selectedOrders}
              toggleSelectAll={toggleSelectAll}
              toggleSelectOrder={toggleSelectOrder}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OrdersList;
