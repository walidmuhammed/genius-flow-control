
import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import { Badge } from '@/components/ui/badge';

type OrderStatus = 'Successful' | 'Returned' | 'Delayed';
type OrderType = 'Deliver' | 'Cash Collection';

interface Order {
  id: string;
  type: OrderType;
  customer: {
    name: string;
    phone: string;
  };
  location: {
    city: string;
    area: string;
  };
  amount: {
    value: number;
    currency: CurrencyType;
  };
  status: OrderStatus;
  attempts: string;
  lastUpdate: string;
}

const OrdersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data
  const mockOrders: Order[] = [
    {
      id: '232940',
      type: 'Deliver',
      customer: {
        name: 'هيثم السكري',
        phone: '01008852624',
      },
      location: {
        city: 'Cairo',
        area: 'Giza & Haram - Dokki',
      },
      amount: {
        value: 215,
        currency: 'USD',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Tue, 02 Mar 3:19 PM',
    },
    {
      id: '1237118',
      type: 'Deliver',
      customer: {
        name: 'محمود ابو الزهراء',
        phone: '01110290407',
      },
      location: {
        city: 'Sharqia',
        area: 'Sharqia - Faqous',
      },
      amount: {
        value: 0,
        currency: 'USD',
      },
      status: 'Returned',
      attempts: '2/3',
      lastUpdate: 'Tue, 09 Feb 6:53 PM',
    },
    {
      id: '6690815',
      type: 'Deliver',
      customer: {
        name: 'محمد مصطفى سرحان',
        phone: '01203777633',
      },
      location: {
        city: 'El Kalioubia',
        area: 'El Kalioubia - Benha',
      },
      amount: {
        value: 515,
        currency: 'USD',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 3:06 AM',
    },
    {
      id: '2451006',
      type: 'Cash Collection',
      customer: {
        name: 'محمد مصطفى سرحان',
        phone: '01203777633',
      },
      location: {
        city: 'El Kalioubia',
        area: 'El Kalioubia - Benha',
      },
      amount: {
        value: 385,
        currency: 'USD',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Sat, 05 Dec 1:42 PM',
    },
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Successful':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Successful</Badge>;
      case 'Returned':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Returned</Badge>;
      case 'Delayed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttemptsBadge = (attempts: string) => {
    const [current, total] = attempts.split('/').map(Number);
    
    if (current === 1) {
      return <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>{attempts}</span>;
    } else if (current === 2) {
      return <span className="flex items-center"><span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>{attempts}</span>;
    } else {
      return <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>{attempts}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track all your created orders.</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 lg:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in-progress">In progress</TabsTrigger>
            <TabsTrigger value="heading">Heading to customer</TabsTrigger>
            <TabsTrigger value="awaiting">Awaiting action</TabsTrigger>
            <TabsTrigger value="successful">Successful</TabsTrigger>
            <TabsTrigger value="unsuccessful">Unsuccessful</TabsTrigger>
            <TabsTrigger value="returns">Rejected Returns</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by Phone (Separate multiple phones by a space or a comma)." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-4">
            <div className="rounded-lg border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Info</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attempts</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Update</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 whitespace-nowrap text-primary">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.type}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer.name}</span>
                            <span className="text-muted-foreground">{order.customer.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{order.location.city}</span>
                            <span className="text-muted-foreground text-xs">{order.location.area}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.amount.value > 0 ? (
                            <div className="flex items-center">
                              <span className="text-green-600 font-medium">
                                {order.amount.currency === 'USD' ? '$' : 'LBP'} {order.amount.value}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                Cash on delivery
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Cash Collection</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getAttemptsBadge(order.attempts)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-muted-foreground">{order.lastUpdate}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Order</DropdownMenuItem>
                              <DropdownMenuItem>Print Label</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">36</span> orders
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OrdersList;
