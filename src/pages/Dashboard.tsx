import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Package, Check, Clock, AlertTriangle, DollarSign, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import PickupDetailsDialog from '@/components/pickups/PickupDetailsDialog';
import { useOrders, useOrdersByStatus } from '@/hooks/use-orders';
import { usePickups } from '@/hooks/use-pickups';
import { Order, OrderWithCustomer } from '@/services/orders';
import { Pickup } from '@/services/pickups';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from "@/integrations/supabase/client";
import { mapOrdersToTableFormat } from "@/utils/orderMappers";
import { mapPickupToComponentFormat } from "@/utils/pickupMappers";

// Remove the duplicate mapOrderToTableFormat function since we're now importing it

const Dashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [pickupDetailsOpen, setPickupDetailsOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    newOrders: { value: 0 },
    delivered: { value: 0 },
    inProgress: { value: 0 },
    failedOrders: { value: 0 },
    averageOrderValue: { value: "$0.00" },
    collectedCash: {
      usd: 0,
      lbp: 0
    }
  });

  // Fetch recent orders
  const { 
    data: recentOrders, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useOrdersByStatus('New');
  
  // Fetch upcoming pickups
  const { 
    data: pickups, 
    isLoading: pickupsLoading, 
    error: pickupsError 
  } = usePickups();

  useEffect(() => {
    if (ordersError) {
      toast.error("Failed to load recent orders");
      console.error(ordersError);
    }
    
    if (pickupsError) {
      toast.error("Failed to load upcoming pickups");
      console.error(pickupsError);
    }
  }, [ordersError, pickupsError]);

  // Subscribe to realtime updates
  useEffect(() => {
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders change received:', payload);
          // Refresh the dashboard stats
          fetchDashboardStats();
          // The ordersByStatus query will be invalidated and refetched by React Query
        }
      )
      .subscribe();

    const pickupsChannel = supabase
      .channel('pickups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickups'
        },
        (payload) => {
          console.log('Pickups change received:', payload);
          // The pickups query will be invalidated and refetched by React Query
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(pickupsChannel);
    };
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      // Count of new orders
      const { count: newOrdersCount, error: newOrdersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'New');

      if (newOrdersError) throw newOrdersError;

      // Count of delivered orders
      const { count: deliveredCount, error: deliveredError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Successful');

      if (deliveredError) throw deliveredError;

      // Count of in-progress orders
      const { count: inProgressCount, error: inProgressError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'In Progress');

      if (inProgressError) throw inProgressError;

      // Count of failed orders
      const { count: failedCount, error: failedError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Unsuccessful');

      if (failedError) throw failedError;

      // Collect successful orders for average and total calculations
      const { data: successfulOrders, error: successfulOrdersError } = await supabase
        .from('orders')
        .select('cash_collection_usd, cash_collection_lbp')
        .eq('status', 'Successful');

      if (successfulOrdersError) throw successfulOrdersError;

      // Calculate average order value
      let totalUSD = 0;
      let totalLBP = 0;
      
      if (successfulOrders.length > 0) {
        successfulOrders.forEach(order => {
          totalUSD += Number(order.cash_collection_usd || 0);
          totalLBP += Number(order.cash_collection_lbp || 0);
        });
        
        const averageUSD = successfulOrders.length > 0 
          ? totalUSD / successfulOrders.length 
          : 0;

        setDashboardStats({
          newOrders: { value: newOrdersCount || 0 },
          delivered: { value: deliveredCount || 0 },
          inProgress: { value: inProgressCount || 0 },
          failedOrders: { value: failedCount || 0 },
          averageOrderValue: { 
            value: `$${averageUSD.toFixed(2)}` 
          },
          collectedCash: {
            usd: totalUSD,
            lbp: totalLBP
          }
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Handle viewing order details
  const handleViewOrderDetails = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Handle viewing pickup details - make sure to map the pickup first
  const handleViewPickupDetails = (pickup: Pickup) => {
    // Map the pickup to the expected format before setting it
    setSelectedPickup(pickup);
    setPickupDetailsOpen(true);
  };
  
  // Toggle select all orders
  const toggleSelectAll = (checked: boolean) => {
    if (checked && recentOrders) {
      setSelectedOrders(recentOrders.map(order => order.id));
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

  // Format pickup date
  const formatPickupDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format current time and date
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

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-[12px]">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 px-[11px]">Hello, Walid! 👋</h1>
            <p className="text-gray-500 px-[11px]">{currentDate} • {currentTime}</p>
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
                  {dashboardStats ? (
                    <p className="mt-2 text-3xl font-semibold">{dashboardStats.newOrders.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-16 mt-2" />
                  )}
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
                  {dashboardStats ? (
                    <p className="mt-2 text-3xl font-semibold">{dashboardStats.delivered.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-16 mt-2" />
                  )}
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
                  {dashboardStats ? (
                    <p className="mt-2 text-3xl font-semibold">{dashboardStats.inProgress.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-16 mt-2" />
                  )}
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
                  {dashboardStats ? (
                    <p className="mt-2 text-3xl font-semibold">{dashboardStats.failedOrders.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-16 mt-2" />
                  )}
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
                  {dashboardStats ? (
                    <p className="mt-2 text-3xl font-semibold">{dashboardStats.averageOrderValue.value}</p>
                  ) : (
                    <Skeleton className="h-8 w-16 mt-2" />
                  )}
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
                  {dashboardStats ? (
                    <div className="flex flex-col mt-2">
                      <p className="text-2xl font-semibold">${dashboardStats.collectedCash.usd.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{dashboardStats.collectedCash.lbp.toLocaleString()} LBP</p>
                    </div>
                  ) : (
                    <>
                      <Skeleton className="h-8 w-16 mt-2" />
                      <Skeleton className="h-4 w-24 mt-1" />
                    </>
                  )}
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
                  {ordersLoading ? (
                    <div className="p-12 text-center">
                      <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
                      <Skeleton className="h-8 w-full mx-auto mb-2" />
                      <Skeleton className="h-8 w-full mx-auto mb-2" />
                      <Skeleton className="h-8 w-full mx-auto" />
                    </div>
                  ) : recentOrders && recentOrders.length > 0 ? (
                    <OrdersTable 
                      orders={recentOrders ? mapOrdersToTableFormat(recentOrders) : []} 
                      selectedOrders={selectedOrders} 
                      toggleSelectAll={toggleSelectAll} 
                      toggleSelectOrder={toggleSelectOrder} 
                      showActions={false}
                    />
                  ) : (
                    <div className="p-12 text-center text-gray-500">
                      No recent orders found
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end p-4 border-t">
                    <a href="/orders" className="text-sm font-medium text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      View all orders <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                </TabsContent>
                
                <TabsContent value="upcoming-pickups" className="mt-0">
                  {pickupsLoading ? (
                    <div className="p-12 text-center">
                      <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
                      <Skeleton className="h-8 w-full mx-auto mb-2" />
                      <Skeleton className="h-8 w-full mx-auto mb-2" />
                      <Skeleton className="h-8 w-full mx-auto" />
                    </div>
                  ) : (
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
                          {pickups && pickups.length > 0 ? (
                            pickups.map(pickup => {
                              const pickupData = mapPickupToComponentFormat(pickup);
                              return (
                                <TableRow 
                                  key={pickup.id} 
                                  className="hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleViewPickupDetails(pickup)}
                                >
                                  <TableCell className="font-medium">{pickupData.pickupId}</TableCell>
                                  <TableCell>
                                    <Badge className={cn(
                                      "px-2 py-1 rounded-full", 
                                      pickupData.status === "Scheduled" ? "bg-blue-50 text-blue-700" : 
                                      pickupData.status === "In Progress" ? "bg-yellow-50 text-yellow-700" : 
                                      pickupData.status === "Completed" ? "bg-green-50 text-green-700" : 
                                      "bg-red-50 text-red-700"
                                    )}>
                                      {pickupData.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{pickupData.location}</TableCell>
                                  <TableCell>{formatPickupDate(pickupData.pickupDate)}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div>{pickupData.contactPerson}</div>
                                      <div className="text-xs text-gray-500">{pickupData.contactPhone}</div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No upcoming pickups found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
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
