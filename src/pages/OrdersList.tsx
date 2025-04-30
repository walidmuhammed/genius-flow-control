
import React, { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, Eye, Printer, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

type OrderStatus = 'Successful' | 'Returned' | 'Delayed' | 'In Progress' | 'Pending';
type OrderType = 'Deliver' | 'Cash Collection' | 'Return';

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
    valueLBP: number;
    valueUSD: number;
  };
  deliveryCharge: number;
  status: OrderStatus;
  lastUpdate: string;
  selected?: boolean;
}

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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Successful':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">Successful</Badge>;
      case 'Returned':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Returned</Badge>;
      case 'Delayed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">Delayed</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">In Progress</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy h:mm a');
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
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
          <div className="border-b">
            <div className="overflow-auto scrollbar-none pb-1">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="in-progress" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  In Progress
                </TabsTrigger>
                <TabsTrigger 
                  value="successful" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Successful
                </TabsTrigger>
                <TabsTrigger 
                  value="returned" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Returned
                </TabsTrigger>
                <TabsTrigger 
                  value="delayed" 
                  className="py-3 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Delayed
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by order ID, phone, or customer name" 
                className="pl-10 border-border/20 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10 border-border/20">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Date Range</h4>
                      <div className="p-2 border rounded-md">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="pointer-events-auto"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="successful" 
                            checked={statusFilter.includes('Successful')}
                            onCheckedChange={() => handleStatusFilterChange('Successful')}
                          />
                          <label htmlFor="successful" className="text-sm">Successful</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="returned" 
                            checked={statusFilter.includes('Returned')}
                            onCheckedChange={() => handleStatusFilterChange('Returned')}
                          />
                          <label htmlFor="returned" className="text-sm">Returned</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="delayed" 
                            checked={statusFilter.includes('Delayed')}
                            onCheckedChange={() => handleStatusFilterChange('Delayed')}
                          />
                          <label htmlFor="delayed" className="text-sm">Delayed</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="pending" 
                            checked={statusFilter.includes('Pending')}
                            onCheckedChange={() => handleStatusFilterChange('Pending')}
                          />
                          <label htmlFor="pending" className="text-sm">Pending</label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm">Apply Filters</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" className="border-border/20">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {selectedOrders.length > 0 && (
            <div className="bg-primary/5 rounded-lg py-2 px-4 mt-4 flex justify-between items-center">
              <div className="text-sm font-medium">
                {selectedOrders.length} orders selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1" /> 
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <TabsContent value="all" className="mt-6 p-0">
            <div className="rounded-lg border border-border/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedOrders.length === mockOrders.length && mockOrders.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Order ID</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Customer Info</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Amount</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Delivery Charge</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Last Update</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        className={cn(
                          "hover:bg-muted/20",
                          selectedOrders.includes(order.id) && "bg-primary/5"
                        )}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => toggleSelectOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {order.type}
                          </Badge>
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
                          {(order.amount.valueUSD > 0 || order.amount.valueLBP > 0) ? (
                            <div className="flex flex-col">
                              <span className="text-green-600 font-medium">
                                ${order.amount.valueUSD}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {order.amount.valueLBP.toLocaleString()} LBP
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">$0</span>
                              <span className="text-muted-foreground text-xs">0 LBP</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${order.deliveryCharge}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">{formatDate(order.lastUpdate)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] shadow-lg border-border/20">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Order</DropdownMenuItem>
                                <DropdownMenuItem>Print Label</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="bg-white border-t border-border/20 px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{mockOrders.length}</span> of <span className="font-medium">36</span> orders
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" disabled>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    Next <ChevronRight className="h-4 w-4" />
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
