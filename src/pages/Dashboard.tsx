import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { OrdersTable } from '@/components/orders/OrdersTable';
import PickupsTable from '@/components/pickups/PickupsTable';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils/format';
import { getOrders } from '@/services/orders';
import { getPickups } from '@/services/pickups';
import { EmptyState } from '@/components/ui/empty-state';
import { useScreenSize } from '@/hooks/useScreenSize';
import OrdersTableMobile from '@/components/orders/OrdersTableMobile';
import { mapOrdersToTableFormat } from '@/utils/orderMappers';
import DashboardStatCard from '@/components/dashboard/DashboardStatCard';

const Dashboard: React.FC = () => {
  const today = new Date();
  const dayStart = new Date(today);
  dayStart.setHours(0, 0, 0, 0);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedPickups, setSelectedPickups] = useState<string[]>([]);
  const { isMobile, isTablet } = useScreenSize();

  // Fetch all orders
  const {
    data: allOrders = [],
    isLoading: isOrdersLoading
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  // Fetch all pickups
  const {
    data: allPickups = [],
    isLoading: isPickupsLoading
  } = useQuery({
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
  const awaitingActionOrders = allOrders.filter(order => order.status === 'New' || order.status === 'Pending Pickup' || order.status === 'Unsuccessful');

  // Calculate total expected cash from today's orders
  const todayTotalCash = todayOrders.reduce((total, order) => {
    return total + (Number(order.cash_collection_usd) || 0);
  }, 0);

  // Filter pickups scheduled for today
  const todayPickups = allPickups.filter(pickup => {
    const pickupDate = new Date(pickup.pickup_date);
    const todayDate = new Date();
    return pickupDate.setHours(0, 0, 0, 0) === todayDate.setHours(0, 0, 0, 0);
  });

  // Toggle select all orders
  const toggleSelectAllOrders = (checked: boolean) => {
    setSelectedOrders(checked ? todayOrders.map(order => order.id) : []);
  };

  // Toggle select individual order
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  // Toggle select all pickups
  const toggleSelectAllPickups = (checked: boolean) => {
    setSelectedPickups(checked ? todayPickups.map(pickup => pickup.id) : []);
  };

  // Toggle select individual pickup
  const toggleSelectPickup = (pickupId: string) => {
    setSelectedPickups(prev => prev.includes(pickupId) ? prev.filter(id => id !== pickupId) : [...prev, pickupId]);
  };

  // Transform orders to table format for mobile component
  const todayOrdersForTable = mapOrdersToTableFormat(todayOrders);
  const awaitingActionOrdersForTable = mapOrdersToTableFormat(awaitingActionOrders);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Greeting Header */}
        <AnimatePresence>
          <motion.div 
            className="space-y-2" 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className={cn(
                "font-bold tracking-tight text-gray-800 dark:text-gray-100",
                isMobile ? "text-2xl" : "text-3xl"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Hello, Admin
            </motion.h2>
            <motion.p 
              className={cn(
                "text-gray-500 dark:text-gray-400",
                isMobile ? "text-sm" : "text-base"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Today's Overview — {formatDate(new Date())}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Modern, Consistent Stat Cards */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
            "w-full"
          )}
        >
          <DashboardStatCard
            type="new"
            label="New Orders"
            value={isOrdersLoading ? undefined : todayOrders.length}
            loading={isOrdersLoading}
            description="New today"
          />
          <DashboardStatCard
            type="progress"
            label="In Progress"
            value={isOrdersLoading ? undefined : inProgressOrders.length}
            loading={isOrdersLoading}
            description="Filtered"
          />
          <DashboardStatCard
            type="awaiting"
            label="Awaiting Action"
            value={isOrdersLoading ? undefined : awaitingActionOrders.length}
            loading={isOrdersLoading}
            description="Needs attention"
          />
          <DashboardStatCard
            type="cash"
            label="Expected Cash"
            value={isOrdersLoading ? undefined : `$${todayTotalCash.toFixed(2)}`}
            loading={isOrdersLoading}
            description="Total amount"
          />
        </div>

        {/* Enhanced Tab Bar - Full Width, Clean, Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <Tabs defaultValue="new-orders" className="w-full">
            {/* Enhanced Tab Navigation - Modern & Clean */}
            <div className="w-full mb-6">
              <TabsList className="w-full h-16 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/30 rounded-xl p-2 grid grid-cols-3 gap-2">
                <TabsTrigger 
                  value="new-orders" 
                  className={cn(
                    "flex items-center justify-center gap-2 h-12 rounded-lg transition-all duration-300 font-medium",
                    "data-[state=active]:bg-[#DB271E] data-[state=active]:text-white data-[state=active]:shadow-md",
                    "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-50",
                    "dark:data-[state=inactive]:bg-gray-700/30 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB271E]/20",
                    isMobile ? "text-sm px-3" : "text-sm px-4"
                  )}
                >
                  <ShoppingCart className={cn("h-4 w-4", isMobile && "h-4 w-4")} />
                  <span className={cn("font-medium", isMobile ? "text-sm" : "text-sm")}>New Orders</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="pickups" 
                  className={cn(
                    "flex items-center justify-center gap-2 h-12 rounded-lg transition-all duration-300 font-medium",
                    "data-[state=active]:bg-[#DB271E] data-[state=active]:text-white data-[state=active]:shadow-md",
                    "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-50",
                    "dark:data-[state=inactive]:bg-gray-700/30 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB271E]/20",
                    isMobile ? "text-sm px-3" : "text-sm px-4"
                  )}
                >
                  <Calendar className={cn("h-4 w-4", isMobile && "h-4 w-4")} />
                  <span className={cn("font-medium", isMobile ? "text-sm" : "text-sm")}>Pickups</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="awaiting" 
                  className={cn(
                    "flex items-center justify-center gap-2 h-12 rounded-lg transition-all duration-300 font-medium",
                    "data-[state=active]:bg-[#DB271E] data-[state=active]:text-white data-[state=active]:shadow-md",
                    "data-[state=inactive]:bg-white data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:bg-gray-50",
                    "dark:data-[state=inactive]:bg-gray-700/30 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB271E]/20",
                    isMobile ? "text-sm px-3" : "text-sm px-4"
                  )}
                >
                  <Inbox className={cn("h-4 w-4", isMobile && "h-4 w-4")} />
                  <span className={cn("font-medium", isMobile ? "text-sm" : "text-sm")}>Awaiting</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <TabsContent 
                value="new-orders" 
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-sm"
                >
                  <h3 className={cn("font-semibold mb-6 text-gray-800 dark:text-gray-100", isMobile ? "text-lg" : "text-xl")}>Today's New Orders</h3>
                  {todayOrders.length > 0 ? (
                    isMobile ? (
                      <OrdersTableMobile 
                        orders={todayOrdersForTable}
                        selectedOrders={selectedOrders}
                        toggleSelectOrder={toggleSelectOrder}
                        onViewDetails={() => {}}
                        showActions={true}
                      />
                    ) : (
                      <OrdersTable 
                        orders={todayOrders}
                      />
                    )
                  ) : (
                    <EmptyState
                      icon={ShoppingCart}
                      title="No new orders today"
                      description="When new orders come in, they will appear here."
                      actionLabel="Create Order"
                      actionHref="/create-order"
                    />
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent 
                value="pickups" 
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-sm"
                >
                  <h3 className={cn("font-semibold mb-6 text-gray-800 dark:text-gray-100", isMobile ? "text-lg" : "text-xl")}>Today's Scheduled Pickups</h3>
                  {todayPickups.length > 0 ? (
                    <PickupsTable 
                      pickups={todayPickups} 
                      selectedPickups={selectedPickups} 
                      toggleSelectAll={toggleSelectAllPickups} 
                      toggleSelectPickup={toggleSelectPickup} 
                    />
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No pickups scheduled today"
                      description="When pickups are scheduled for today, they will appear here."
                      actionLabel="Schedule Pickup"
                      actionHref="/schedule-pickup"
                    />
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent 
                value="awaiting" 
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-sm"
                >
                  <h3 className={cn("font-semibold mb-6 text-gray-800 dark:text-gray-100", isMobile ? "text-lg" : "text-xl")}>Orders Awaiting Action</h3>
                  {awaitingActionOrders.length > 0 ? (
                    isMobile ? (
                      <OrdersTableMobile 
                        orders={awaitingActionOrdersForTable}
                        selectedOrders={selectedOrders}
                        toggleSelectOrder={toggleSelectOrder}
                        onViewDetails={() => {}}
                        showActions={true}
                      />
                    ) : (
                      <OrdersTable 
                        orders={awaitingActionOrders}
                      />
                    )
                  ) : (
                    <EmptyState
                      icon={Inbox}
                      title="No orders are awaiting your action today"
                      description="When orders need your attention, they will appear here."
                      actionLabel="Create Order"
                      actionHref="/create-order"
                    />
                  )}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
