
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Package, Check, Clock, AlertTriangle, DollarSign, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/components/orders/OrdersTableRow';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrdersTable from '@/components/orders/OrdersTable';
import PickupDetailsDialog from '@/components/pickups/PickupDetailsDialog';

const Dashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [pickupDetailsOpen, setPickupDetailsOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Mock data for the dashboard
  const dashboardData = {
    newOrders: {
      value: 78
    },
    delivered: {
      value: 485
    },
    inProgress: {
      value: 164
    },
    failedOrders: {
      value: 24
    },
    averageOrderValue: {
      value: "$142.58"
    },
    collectedCash: {
      usd: 32450,
      lbp: 875400000
    }
  };

  // Mock data for recent orders (today's orders)
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
    lastUpdate: new Date().toISOString(),
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
    lastUpdate: new Date().toISOString(),
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
    lastUpdate: new Date().toISOString(),
    note: 'Call customer before delivery. Building has security gate access.'
  }];

  // Mock data for upcoming pickups
  const upcomingPickups = [{
    id: "PIC-892",
    status: "Scheduled",
    location: "Beirut Bakery",
    address: "Verdun, Main Street",
    contactPerson: "Sara Abboud",
    contactPhone: "+961 3 123 456",
    pickupDate: "May 4, 2025, 10:00 AM",
    courier: {
      name: "Mohammed Ali",
      phone: "+961 71 987 654"
    },
    requested: true,
    pickedUp: false,
    validated: false,
    note: "This is a priority pickup. Please arrive on time."
  }, {
    id: "PIC-891",
    status: "In Progress",
    location: "Tech Store",
    address: "Hamra, Bliss Street",
    contactPerson: "Fadi Mansour",
    contactPhone: "+961 71 234 567",
    pickupDate: "May 4, 2025, 2:30 PM",
    courier: {
      name: "Jad Makari",
      phone: "+961 76 123 456"
    },
    requested: true,
    pickedUp: false,
    validated: false
  }, {
    id: "PIC-890",
    status: "Scheduled",
    location: "Lebanese Sweets",
    address: "Ashrafieh, Sassine Square",
    contactPerson: "Maya Khalil",
    contactPhone: "+961 76 345 678",
    pickupDate: "May 5, 2025, 9:00 AM",
    courier: {
      name: "Ali Hamdan",
      phone: "+961 76 345 678"
    },
    requested: true,
    pickedUp: false,
    validated: false
  }];

  // Handle viewing order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Handle viewing pickup details
  const handleViewPickupDetails = (pickup: any) => {
    setSelectedPickup(pickup);
    setPickupDetailsOpen(true);
  };
  
  // Toggle select all orders
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(mockOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };
  
  // Toggle select individual order
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-[12px]">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 px-[11px]">Hello, Walid! 👋</h1>
          </div>
        </div>

        <div className="px-[12px]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 px-[9px]">Today's Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-[12px]">
          {/* New Orders */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    New Orders In
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.newOrders.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center shadow-sm">
                  <Package className="h-6 w-6 text-orange-500" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Delivered */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Delivered
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.delivered.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center shadow-sm">
                  <Check className="h-6 w-6 text-green-500" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* In Progress */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    In Progress
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.inProgress.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center shadow-sm">
                  <Clock className="h-6 w-6 text-blue-500" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Failed Orders */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">Canceled Orders</h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.failedOrders.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-200 to-red-100 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Average Order Value */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Avg. Order Value
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.averageOrderValue.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center shadow-sm">
                  <DollarSign className="h-6 w-6 text-purple-500" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Collected Cash */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Collected Cash
                  </h3>
                  <div className="flex flex-col mt-2">
                    <p className="text-2xl font-semibold">${dashboardData.collectedCash.usd.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{dashboardData.collectedCash.lbp.toLocaleString()} LBP</p>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 flex items-center justify-center shadow-sm">
                  <DollarSign className="h-6 w-6 text-amber-500" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabbed Tables Section */}
        <div className="px-[12px] mt-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <Tabs defaultValue="recent-orders" className="w-full">
                <div className="border-b">
                  <TabsList className="bg-transparent h-14 w-full justify-start px-6 gap-8">
                    <TabsTrigger value="recent-orders" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 border-0 data-[state=active]:shadow-none rounded-none h-14 text-gray-600">
                      Recent Orders
                    </TabsTrigger>
                    <TabsTrigger value="upcoming-pickups" className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 border-0 data-[state=active]:shadow-none rounded-none h-14 text-gray-600">
                      Upcoming Pickups
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="recent-orders" className="mt-0 p-4">
                  <OrdersTable 
                    orders={mockOrders} 
                    selectedOrders={selectedOrders} 
                    toggleSelectAll={toggleSelectAll} 
                    toggleSelectOrder={toggleSelectOrder} 
                    showActions={false}
                  />
                  
                  <div className="flex items-center justify-end p-4 border-t">
                    <a href="/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      View all orders <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </TabsContent>
                
                <TabsContent value="upcoming-pickups" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Pickup ID</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Scheduled Date</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Contact Person</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingPickups.map(pickup => (
                          <TableRow 
                            key={pickup.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewPickupDetails(pickup)}
                          >
                            <TableCell className="font-medium">{pickup.id}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "px-2 py-1 rounded-full", 
                                pickup.status === "Scheduled" ? "bg-blue-50 text-blue-700" : 
                                pickup.status === "In Progress" ? "bg-yellow-50 text-yellow-700" : 
                                pickup.status === "Completed" ? "bg-green-50 text-green-700" : 
                                "bg-red-50 text-red-700"
                              )}>
                                {pickup.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{pickup.location}</TableCell>
                            <TableCell>{pickup.pickupDate}</TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contactPerson}</div>
                                <div className="text-xs text-gray-500">{pickup.contactPhone}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-end p-4 border-t">
                    <a href="/pickups" className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      View all pickups <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Order Details Dialog */}
      <OrderDetailsDialog 
        order={selectedOrder}
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
      />
      
      {/* Pickup Details Dialog */}
      <PickupDetailsDialog
        pickup={selectedPickup}
        open={pickupDetailsOpen}
        onOpenChange={setPickupDetailsOpen}
      />
    </MainLayout>
  );
};

export default Dashboard;
