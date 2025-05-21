
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
              className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Hello, Admin
            </motion.h2>
            <motion.p 
              className="text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Today's Overview — {formatDate(new Date())}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Overview Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* New Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-blue-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 shadow-sm">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">New Orders</h3>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isOrdersLoading ? '--' : todayOrders.length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The new orders registered today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* In Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-amber-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isOrdersLoading ? '--' : inProgressOrders.length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders filtered as In Progress</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Awaiting Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-orange-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Awaiting Action</h3>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isOrdersLoading ? '--' : awaitingActionOrders.length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders requiring intervention</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Expected Cash Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-emerald-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 shadow-sm">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Cash</h3>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isOrdersLoading ? '--' : `$${todayTotalCash.toFixed(2)}`}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total amount of today's orders</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabbed Data Section - Premium Redesign */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10"
        >
          <Tabs defaultValue="new-orders" className="space-y-6">
            <div className="bg-gray-100/70 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl p-1.5 flex border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
              <TabsList className="w-full h-12 grid grid-cols-3 bg-transparent gap-2 p-1">
                <TabsTrigger 
                  value="new-orders" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md rounded-xl text-base transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80"
                >
                  New Orders ({todayOrders.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="pickups" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md rounded-xl text-base transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80"
                >
                  Pickup Exceptions ({todayPickups.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-md rounded-xl text-base transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80"
                >
                  Awaiting Action ({awaitingActionOrders.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="new-orders" className="animate-in fade-in-50 mt-6">
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Today's New Orders</h3>
                <OrdersTable 
                  orders={mapOrdersToTableFormat(todayOrders)}
                  selectedOrders={selectedOrders}
                  toggleSelectAll={toggleSelectAllOrders}
                  toggleSelectOrder={toggleSelectOrder}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="pickups" className="animate-in fade-in-50 mt-6">
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Today's Scheduled Pickups</h3>
                <PickupsTable 
                  pickups={todayPickups}
                  selectedPickups={selectedPickups}
                  toggleSelectAll={toggleSelectAllPickups}
                  toggleSelectPickup={toggleSelectPickup}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="awaiting" className="animate-in fade-in-50 mt-6">
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Orders Awaiting Action</h3>
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
