
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, AlertTriangle, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useOrders } from '@/hooks/use-orders';
import { usePickups } from '@/hooks/use-pickups';
import OrdersTable from '@/components/orders/OrdersTable';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import DashboardCard from '@/components/dashboard/DashboardCard';
import PickupsTable from '@/components/pickups/PickupsTable';

const HomePage: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedPickups, setSelectedPickups] = useState<string[]>([]);
  
  // Get orders data
  const { data: allOrders, isLoading: isOrdersLoading } = useOrders();
  
  // Get pickups data
  const { data: allPickups, isLoading: isPickupsLoading } = usePickups();
  
  // Filter orders created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = allOrders?.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  }) || [];
  
  const inProgressOrders = allOrders?.filter(order => 
    order.status === 'In Progress'
  ) || [];
  
  const awaitingActionOrders = allOrders?.filter(order => 
    order.status === 'New' || order.status === 'Pending Pickup'
  ) || [];
  
  // Calculate expected cash from today's orders
  const expectedCash = todayOrders.reduce((total, order) => {
    return total + (Number(order.cash_collection_usd) || 0);
  }, 0);
  
  // Today's pickups
  const todayPickups = allPickups?.filter(pickup => {
    const pickupDate = new Date(pickup.pickup_date);
    const today = new Date();
    return pickupDate.toDateString() === today.toDateString();
  }) || [];

  const toggleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(todayOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const toggleSelectAllPickups = (checked: boolean) => {
    if (checked) {
      setSelectedPickups(todayPickups.map(pickup => pickup.id));
    } else {
      setSelectedPickups([]);
    }
  };

  const toggleSelectPickup = (pickupId: string) => {
    if (selectedPickups.includes(pickupId)) {
      setSelectedPickups(selectedPickups.filter(id => id !== pickupId));
    } else {
      setSelectedPickups([...selectedPickups, pickupId]);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header section with animation */}
        <motion.div 
          className="space-y-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold tracking-tight">HELLO USER</h2>
          <p className="text-muted-foreground">TODAY'S OVERVIEW</p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <DashboardCard 
              title="New Orders"
              description="The new orders registered today"
              value={todayOrders.length.toString()}
              icon={<Package className="h-5 w-5" />}
              accentColor="#26A4DB"
              isLoading={isOrdersLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DashboardCard 
              title="In Progress"
              description="Orders filtered as In Progress"
              value={inProgressOrders.length.toString()}
              icon={<Truck className="h-5 w-5" />}
              accentColor="#FFD166" // Yellow
              isLoading={isOrdersLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <DashboardCard 
              title="Awaiting Action"
              description="Orders that require intervention"
              value={awaitingActionOrders.length.toString()}
              icon={<AlertTriangle className="h-5 w-5" />}
              accentColor="#FF9F1C" // Orange
              isLoading={isOrdersLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <DashboardCard 
              title="Expected Cash"
              description="Total cash expected from today's orders"
              value={`$${expectedCash.toFixed(2)}`}
              icon={<DollarSign className="h-5 w-5" />}
              accentColor="#DC291E" // Red
              isLoading={isOrdersLoading}
            />
          </motion.div>
        </div>

        {/* Tabs Container */}
        <Card className="backdrop-blur-sm bg-white/80 border-border/20 shadow-lg overflow-hidden">
          <Tabs defaultValue="new-orders" className="w-full">
            <TabsList className="flex gap-2 p-4 w-full bg-white/40 border-b border-border/10">
              <TabsTrigger 
                value="new-orders" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                New Orders ({todayOrders.length} Today)
              </TabsTrigger>
              <TabsTrigger 
                value="pickup-exceptions" 
                className="data-[state=active]:bg-topspeed-600 data-[state=active]:text-white"
              >
                Pickup Exceptions ({todayPickups.length} Today)
              </TabsTrigger>
              <TabsTrigger 
                value="awaiting-action" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Awaiting Action ({awaitingActionOrders.length} Orders)
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="p-0">
              <TabsContent value="new-orders" className="m-0">
                <div className="py-2">
                  <OrdersTable 
                    orders={mapOrdersToTableFormat(todayOrders)}
                    selectedOrders={selectedOrders}
                    toggleSelectAll={toggleSelectAllOrders}
                    toggleSelectOrder={toggleSelectOrder}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="pickup-exceptions" className="m-0">
                <div className="py-2">
                  {allPickups && (
                    <PickupsTable
                      pickups={todayPickups}
                      selectedPickups={selectedPickups}
                      toggleSelectAll={toggleSelectAllPickups}
                      toggleSelectPickup={toggleSelectPickup}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="awaiting-action" className="m-0">
                <div className="py-2">
                  <OrdersTable 
                    orders={mapOrdersToTableFormat(awaitingActionOrders)}
                    selectedOrders={selectedOrders}
                    toggleSelectAll={toggleSelectAllOrders}
                    toggleSelectOrder={toggleSelectOrder}
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;
