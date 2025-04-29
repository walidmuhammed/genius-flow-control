import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, CheckCircle, AlertTriangle } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    currency: 'EGP' | 'USD' | 'LBP';
    description?: string;
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
        currency: 'EGP',
        description: 'Cash on delivery',
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
        currency: 'EGP',
        description: 'No Cash Collection',
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
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 3:06 AM',
    },
    {
      id: '8349743',
      type: 'Deliver',
      customer: {
        name: 'علي عبد الرحمن محمد',
        phone: '01110078181',
      },
      location: {
        city: 'Cairo',
        area: 'Cairo - Nasr City',
      },
      amount: {
        value: 1060,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 3:05 AM',
    },
    {
      id: '5810646',
      type: 'Deliver',
      customer: {
        name: 'زيزي فرحات',
        phone: '01900373838',
      },
      location: {
        city: 'Cairo',
        area: 'Maadi & Muqattam -Al Muqattam',
      },
      amount: {
        value: 325,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 12:59 AM',
    },
    {
      id: '2263982',
      type: 'Deliver',
      customer: {
        name: 'Islam Ahmed Nazmy',
        phone: '01001030690',
      },
      location: {
        city: 'Alexandria',
        area: 'East Alex -Smouha',
      },
      amount: {
        value: 730,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '3/3',
      lastUpdate: 'Thu, 28 Jan 12:59 AM',
    },
    {
      id: '7554900',
      type: 'Deliver',
      customer: {
        name: 'بلال صلاح',
        phone: '01096389089',
      },
      location: {
        city: 'El Kalioubia',
        area: 'El Kalioubia -Benha',
      },
      amount: {
        value: 137,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 12:59 AM',
    },
    {
      id: '5339595',
      type: 'Deliver',
      customer: {
        name: 'أحمد صبري حسن',
        phone: '01100300411',
      },
      location: {
        city: 'Cairo',
        area: 'Giza & Haram -Dokki',
      },
      amount: {
        value: 146,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '2/3',
      lastUpdate: 'Thu, 28 Jan 12:59 AM',
    },
    {
      id: '5427196',
      type: 'Deliver',
      customer: {
        name: 'محمد نجاح',
        phone: '01000033827',
      },
      location: {
        city: 'Cairo',
        area: 'Cairo - Nasr City',
      },
      amount: {
        value: 245,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 12:59 AM',
    },
    {
      id: '9110622',
      type: 'Deliver',
      customer: {
        name: 'محمد محمد',
        phone: '01063084864',
      },
      location: {
        city: 'Sharqia',
        area: 'Sharqia -Zakazik',
      },
      amount: {
        value: 181,
        currency: 'EGP',
        description: 'Cash on delivery',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Thu, 28 Jan 12:59 AM',
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
        area: 'El Kalioubia -Benha',
      },
      amount: {
        value: 385,
        currency: 'EGP',
        description: 'Refund',
      },
      status: 'Successful',
      attempts: '1/3',
      lastUpdate: 'Sat, 05 Dec 1:42 PM',
    },
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Successful':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Successful</Badge>;
      case 'Returned':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Returned</Badge>;
      case 'Delayed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttemptsBadge = (attempts: string) => {
    const [current, total] = attempts.split('/').map(Number);
    
    if (current === 1) {
      return <span className="flex items-center"><span className="w-2 h-4 bg-green-500 rounded-sm mr-2"></span>{attempts}</span>;
    } else if (current === 2) {
      return <span className="flex items-center"><span className="w-2 h-4 bg-amber-500 rounded-sm mr-2"></span>{attempts}</span>;
    } else {
      return <span className="flex items-center"><span className="w-2 h-4 bg-red-500 rounded-sm mr-2"></span>{attempts}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track all your created orders.</p>
        </div>

        <div className="bg-white rounded-md border shadow-sm overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b">
              <TabsList className="flex w-full overflow-x-auto bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="new" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  New
                </TabsTrigger>
                <TabsTrigger 
                  value="in-progress" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  In progress
                </TabsTrigger>
                <TabsTrigger 
                  value="heading" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  Heading to customer
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  Awaiting your action
                </TabsTrigger>
                <TabsTrigger 
                  value="successful" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  Successful
                </TabsTrigger>
                <TabsTrigger 
                  value="unsuccessful" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  Unsuccessful
                </TabsTrigger>
                <TabsTrigger 
                  value="returns" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  Rejected Returns
                </TabsTrigger>
                <TabsTrigger 
                  value="fulfilled" 
                  className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600"
                >
                  Fulfilled
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  36 Orders
                </div>
                <div className="flex flex-1 gap-4 justify-end">
                  <div className="relative flex-1 max-w-md">
                    <div className="flex">
                      <Button 
                        variant="outline"
                        className="rounded-r-none border-r-0"
                      >
                        Phone Number
                      </Button>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          placeholder="Search by Phone (Separate multiple phones by a space or a comma)." 
                          className="pl-10 rounded-l-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
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
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-10">
                        <input type="checkbox" className="w-4 h-4" />
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Type</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Customer Info</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Location</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Attempts</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Last Update</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-muted-foreground text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {mockOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="w-10">
                          <input type="checkbox" className="w-4 h-4" />
                        </TableCell>
                        <TableCell className="text-blue-600 font-medium">{order.id}</TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer.name}</span>
                            <span className="text-muted-foreground">{order.customer.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.location.city}</span>
                            <span className="text-muted-foreground text-xs">{order.location.area}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.amount.value > 0 ? (
                            <div className="flex items-center">
                              <div className="h-5 w-5 rounded-sm bg-green-100 flex items-center justify-center mr-2">
                                <span className="text-green-700 text-xs">EGP</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-green-600 font-medium">
                                  {order.amount.value}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {order.amount.description}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{order.amount.description}</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getAttemptsBadge(order.attempts)}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{order.lastUpdate}</span>
                        </TableCell>
                        <TableCell className="text-center">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{mockOrders.length}</span> of <span className="font-medium">36</span> orders
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
            </TabsContent>

            {/* Other tabs content would be similar */}
            <TabsContent value="new">
              <div className="p-8 text-center text-muted-foreground">
                No new orders found
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersList;
