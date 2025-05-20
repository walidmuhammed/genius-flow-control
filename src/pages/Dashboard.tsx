
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, AlertCircle, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import OrdersTable from '@/components/orders/OrdersTable';
import PickupsTable from '@/components/pickups/PickupsTable';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils/format';
import { getOrders } from '@/services/orders';
import { getPickups } from '@/services/pickups';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';

const Dashboard: React.FC = () => {
  const today = new Date();
  const dayStart = new Date(today);
  dayStart.setHours(0, 0, 0, 0);
  
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedPickups, setSelectedPickups] = useState<string[]>([]);
  
  // Fetch all orders
  const { data: allOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });
  
  // Fetch all pickups
  const { data: allPickups = [], isLoading: isPickupsLoading } = useQuery({
    queryKey: ['pickups'],
    queryFn: getPickups
  });
  
  // Filter orders created today
  const todayOrders = allOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= dayStart && orderDate <= today;
  });
  
  // Filter orders with "In Progress" status
  const inProgressOrders = allOrders.filter(order => order.status === 'In Progress');
  
  // Filter orders with "Awaiting Action" status (this is new - we'll consider certain statuses as awaiting action)
  const awaitingActionOrders = allOrders.filter(order => 
    order.status === 'New' || 
    order.status === 'Pending Pickup' || 
    order.status === 'Unsuccessful'
  );
  
  // Calculate total expected cash from today's orders
  const todayTotalCash = todayOrders.reduce((total, order) => {
    return total + (Number(order.cash_collection_usd) || 0);
  }, 0);
  
  // Filter pickups scheduled for today
  const todayPickups = allPickups.filter(pickup => {
    const pickupDate = new Date(pickup.pickup_date);
    const todayDate = new Date();
    return pickupDate.setHours(0,0,0,0) === todayDate.setHours(0,0,0,0);
  });
  
  // Toggle select all orders
  const toggleSelectAllOrders = (checked: boolean) => {
    setSelectedOrders(checked ? todayOrders.map(order => order.id) : []);
  };
  
  // Toggle select individual order
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };
  
  // Toggle select all pickups
  const toggleSelectAllPickups = (checked: boolean) => {
    setSelectedPickups(checked ? todayPickups.map(pickup => pickup.id) : []);
  };
  
  // Toggle select individual pickup
  const toggleSelectPickup = (pickupId: string) => {
    setSelectedPickups(prev => 
      prev.includes(pickupId) 
        ? prev.filter(id => id !== pickupId)
        : [...prev, pickupId]
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Greeting Header */}
        <AnimatePresence>
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Hello, Admin
            </motion.h2>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Today's Overview — {formatDate(new Date())}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Overview Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* New Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="overflow-hidden border backdrop-blur-lg from-blue-500/5 to-blue-900/5 border-blue-500/10 bg-gradient-to-br">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">New Orders</h3>
                  <div className="text-2xl font-bold">
                    {isOrdersLoading ? '--' : todayOrders.length}
                  </div>
                  <p className="text-xs text-muted-foreground">The new orders registered today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* In Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="overflow-hidden border backdrop-blur-lg from-amber-500/5 to-amber-900/5 border-amber-500/10 bg-gradient-to-br">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
                  <div className="text-2xl font-bold">
                    {isOrdersLoading ? '--' : inProgressOrders.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Orders filtered as In Progress</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Awaiting Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="overflow-hidden border backdrop-blur-lg from-orange-500/5 to-orange-900/5 border-orange-500/10 bg-gradient-to-br">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Awaiting Action</h3>
                  <div className="text-2xl font-bold">
                    {isOrdersLoading ? '--' : awaitingActionOrders.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Orders requiring intervention</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Expected Cash Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="overflow-hidden border backdrop-blur-lg from-emerald-500/5 to-emerald-900/5 border-emerald-500/10 bg-gradient-to-br">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Expected Cash</h3>
                  <div className="text-2xl font-bold">
                    {isOrdersLoading ? '--' : `$${todayTotalCash.toFixed(2)}`}
                  </div>
                  <p className="text-xs text-muted-foreground">Total amount of today's orders</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabbed Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Tabs defaultValue="new-orders" className="space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1 flex border border-border/10 shadow-sm">
              <TabsList className="w-full h-12 grid grid-cols-3 bg-transparent gap-2 p-1">
                <TabsTrigger 
                  value="new-orders" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-base"
                >
                  New Orders ({todayOrders.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="pickups" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-base"
                >
                  Pickup Exceptions ({todayPickups.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg text-base"
                >
                  Awaiting Action ({awaitingActionOrders.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="new-orders" className="animate-in fade-in-50 mt-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-border/10 shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Today's New Orders</h3>
                <OrdersTable 
                  orders={mapOrdersToTableFormat(todayOrders)}
                  selectedOrders={selectedOrders}
                  toggleSelectAll={toggleSelectAllOrders}
                  toggleSelectOrder={toggleSelectOrder}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="pickups" className="animate-in fade-in-50 mt-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-border/10 shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Today's Scheduled Pickups</h3>
                <PickupsTable 
                  pickups={todayPickups}
                  selectedPickups={selectedPickups}
                  toggleSelectAll={toggleSelectAllPickups}
                  toggleSelectPickup={toggleSelectPickup}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="awaiting" className="animate-in fade-in-50 mt-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-border/10 shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">Orders Awaiting Action</h3>
                <OrdersTable 
                  orders={mapOrdersToTableFormat(awaitingActionOrders)}
                  selectedOrders={selectedOrders}
                  toggleSelectAll={toggleSelectAllOrders}
                  toggleSelectOrder={toggleSelectOrder}
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
