
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
import { Badge } from '@/components/ui/badge';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">Successful</Badge>;
      case 'Returned':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Returned</Badge>;
      case 'Delayed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttemptsBadge = (attempts: string) => {
    const [current, total] = attempts.split('/').map(Number);
    
    if (current === 1) {
      return <span className="flex items-center"><span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>{attempts}</span>;
    } else if (current === 2) {
      return <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>{attempts}</span>;
    } else {
      return <span className="flex items-center"><span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></span>{attempts}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Track all your created orders.</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="border-b">
            <div className="overflow-auto scrollbar-none pb-1">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger value="all" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  All
                </TabsTrigger>
                <TabsTrigger value="new" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  New
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  In progress
                </TabsTrigger>
                <TabsTrigger value="heading" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Heading to customer
                </TabsTrigger>
                <TabsTrigger value="awaiting" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Awaiting action
                </TabsTrigger>
                <TabsTrigger value="successful" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Successful
                </TabsTrigger>
                <TabsTrigger value="unsuccessful" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Unsuccessful
                </TabsTrigger>
                <TabsTrigger value="returns" className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Rejected Returns
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by Phone (Separate multiple phones by a space or a comma)." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Date Range</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input type="date" placeholder="From" />
                        </div>
                        <div>
                          <Input type="date" placeholder="To" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="success" />
                          <label htmlFor="success">Successful</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="returned" />
                          <label htmlFor="returned">Returned</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="delayed" />
                          <label htmlFor="delayed">Delayed</label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm">Apply Filters</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-6 p-0">
            <div className="rounded-lg border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Order ID</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Customer Info</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Amount</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Attempts</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Last Update</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-primary">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          {order.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer.name}</span>
                            <span className="text-muted-foreground text-sm">{order.customer.phone}</span>
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
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {getAttemptsBadge(order.attempts)}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">{order.lastUpdate}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
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
