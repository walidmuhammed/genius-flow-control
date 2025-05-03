import React from 'react';
import { ArrowUp, ArrowDown, Package, Check, Clock, AlertTriangle, DollarSign, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
const Dashboard: React.FC = () => {
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

  // Mock data for recent orders
  const recentOrders = [{
    id: "ORD-4781",
    customer: "Ali Hassan",
    location: "Beirut, Hamra",
    amount: 125.50,
    status: "Delivered",
    date: "May 3, 2025"
  }, {
    id: "ORD-4780",
    customer: "Layla Najm",
    location: "Tripoli, Al Mina",
    amount: 78.25,
    status: "In Progress",
    date: "May 2, 2025"
  }, {
    id: "ORD-4779",
    customer: "Karim Saleh",
    location: "Saida, Downtown",
    amount: 214.75,
    status: "Pending Pickup",
    date: "May 2, 2025"
  }, {
    id: "ORD-4778",
    customer: "Nour Khoury",
    location: "Beirut, Achrafieh",
    amount: 56.30,
    status: "Delivered",
    date: "May 1, 2025"
  }, {
    id: "ORD-4777",
    customer: "Hassan Ibrahim",
    location: "Jounieh, Maameltein",
    amount: 92.00,
    status: "Delivered",
    date: "Apr 30, 2025"
  }];

  // Mock data for upcoming pickups
  const upcomingPickups = [{
    id: "PIC-892",
    location: "Beirut Bakery, Verdun",
    scheduledDate: "May 4, 2025, 10:00 AM",
    contact: "Sara Abboud",
    phone: "+961 3 123 456",
    status: "Scheduled"
  }, {
    id: "PIC-891",
    location: "Tech Store, Hamra",
    scheduledDate: "May 4, 2025, 2:30 PM",
    contact: "Fadi Mansour",
    phone: "+961 71 234 567",
    status: "Scheduled"
  }, {
    id: "PIC-890",
    location: "Lebanese Sweets, Ashrafieh",
    scheduledDate: "May 5, 2025, 9:00 AM",
    contact: "Maya Khalil",
    phone: "+961 76 345 678",
    status: "Confirmed"
  }, {
    id: "PIC-889",
    location: "Modern Furniture, Jdeideh",
    scheduledDate: "May 5, 2025, 11:30 AM",
    contact: "Rami Nassar",
    phone: "+961 81 456 789",
    status: "Pending Confirmation"
  }];

  // Function to render status badges with appropriate colors
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      case "Pending Pickup":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{status}</Badge>;
      case "Scheduled":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{status}</Badge>;
      case "Confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case "Pending Confirmation":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };
  return <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-[12px]">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 px-[11px]">Hello, Walid! 👋</h1>
            <p className="text-gray-500 text-sm mt-1 px-[12px]">
              {currentDate} • {currentTime}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            
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
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-500" />
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
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
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
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
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
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
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
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-500" />
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
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* New Tabbed Tables Section */}
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
                
                <TabsContent value="recent-orders" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Order ID</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Customer</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map(order => <TableRow key={order.id} className="hover:bg-gray-50 cursor-pointer">
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.location}</TableCell>
                            <TableCell>${order.amount.toFixed(2)}</TableCell>
                            <TableCell>{renderStatusBadge(order.status)}</TableCell>
                            <TableCell>{order.date}</TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
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
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Location</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Scheduled Date</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Contact Person</TableHead>
                          <TableHead className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingPickups.map(pickup => <TableRow key={pickup.id} className="hover:bg-gray-50 cursor-pointer">
                            <TableCell className="font-medium">{pickup.id}</TableCell>
                            <TableCell>{pickup.location}</TableCell>
                            <TableCell>{pickup.scheduledDate}</TableCell>
                            <TableCell>
                              <div>
                                <div>{pickup.contact}</div>
                                <div className="text-xs text-gray-500">{pickup.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>{renderStatusBadge(pickup.status)}</TableCell>
                          </TableRow>)}
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
    </MainLayout>;
};
export default Dashboard;