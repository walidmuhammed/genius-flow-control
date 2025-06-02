
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, AlertCircle, DollarSign, ShoppingCart, Calendar, Inbox } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
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

        {/* Overview Cards - Responsive Grid */}
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
          {/* New Orders Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={!isMobile ? { y: -4, transition: { duration: 0.2 } } : {}}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-blue-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className={cn("p-4", !isMobile && "p-6")}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 shadow-sm">
                    <Package className={cn("h-4 w-4", !isMobile && "h-5 w-5")} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className={cn("font-medium text-gray-500 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>New Orders</h3>
                  <div className={cn("font-bold text-gray-800 dark:text-white", isMobile ? "text-xl" : "text-2xl")}>
                    {isOrdersLoading ? '--' : todayOrders.length}
                  </div>
                  <p className={cn("text-gray-500 dark:text-gray-400 mt-1", isMobile ? "text-xs" : "text-xs")}>New orders today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* In Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={!isMobile ? { y: -4, transition: { duration: 0.2 } } : {}}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-amber-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className={cn("p-4", !isMobile && "p-6")}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 shadow-sm">
                    <Clock className={cn("h-4 w-4", !isMobile && "h-5 w-5")} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className={cn("font-medium text-gray-500 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>In Progress</h3>
                  <div className={cn("font-bold text-gray-800 dark:text-white", isMobile ? "text-xl" : "text-2xl")}>
                    {isOrdersLoading ? '--' : inProgressOrders.length}
                  </div>
                  <p className={cn("text-gray-500 dark:text-gray-400 mt-1", isMobile ? "text-xs" : "text-xs")}>Orders filtered as In Progress</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Awaiting Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={!isMobile ? { y: -4, transition: { duration: 0.2 } } : {}}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-orange-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className={cn("p-4", !isMobile && "p-6")}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 shadow-sm">
                    <AlertCircle className={cn("h-4 w-4", !isMobile && "h-5 w-5")} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className={cn("font-medium text-gray-500 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>Awaiting Action</h3>
                  <div className={cn("font-bold text-gray-800 dark:text-white", isMobile ? "text-xl" : "text-2xl")}>
                    {isOrdersLoading ? '--' : awaitingActionOrders.length}
                  </div>
                  <p className={cn("text-gray-500 dark:text-gray-400 mt-1", isMobile ? "text-xs" : "text-xs")}>Orders requiring intervention</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Expected Cash Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={!isMobile ? { y: -4, transition: { duration: 0.2 } } : {}}
          >
            <Card className="overflow-hidden border-0 shadow-lg shadow-emerald-500/5 backdrop-blur-lg bg-gradient-to-br from-white dark:from-gray-800/80 to-white/90 dark:to-gray-800/60 rounded-2xl border-t border-white/20 dark:border-white/5">
              <CardContent className={cn("p-4", !isMobile && "p-6")}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 shadow-sm">
                    <DollarSign className={cn("h-4 w-4", !isMobile && "h-5 w-5")} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className={cn("font-medium text-gray-500 dark:text-gray-400", isMobile ? "text-xs" : "text-sm")}>Expected Cash</h3>
                  <div className={cn("font-bold text-gray-800 dark:text-white", isMobile ? "text-xl" : "text-2xl")}>
                    {isOrdersLoading ? '--' : `$${todayTotalCash.toFixed(2)}`}
                  </div>
                  <p className={cn("text-gray-500 dark:text-gray-400 mt-1", isMobile ? "text-xs" : "text-xs")}>Total amount today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* NEW SLEEK TAB NAVIGATION - Edge to Edge with Clean Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="-mx-6 sm:-mx-6 md:-mx-6 px-0"
        >
          <Tabs defaultValue="new-orders" className="w-full">
            {/* Redesigned Sleek Tab Navigation */}
            <div className="relative border-b border-gray-200 dark:border-gray-800">
              <TabsList className="flex w-full h-12 bg-transparent justify-start overflow-x-auto scrollbar-hide p-0">
                <TabsTrigger 
                  value="new-orders"
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 h-full rounded-none border-0 relative",
                    "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                    "data-[state=active]:text-[#DB271E] data-[state=active]:font-medium",
                    "transition-all duration-200 bg-transparent",
                    "focus:outline-none focus:ring-0 focus-visible:ring-0",
                    isMobile ? "min-w-[33.333%] text-sm" : "min-w-[160px] text-base"
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>New Orders</span>
                  {todayOrders.length > 0 && (
                    <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-2 rounded-full">
                      {todayOrders.length}
                    </span>
                  )}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-[#DB271E]" 
                    initial={false}
                    animate={{ 
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.2 }}
                    layoutId="activeTabIndicator"
                  />
                </TabsTrigger>

                <TabsTrigger 
                  value="pickups"
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 h-full rounded-none border-0 relative",
                    "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                    "data-[state=active]:text-[#DB271E] data-[state=active]:font-medium",
                    "transition-all duration-200 bg-transparent",
                    "focus:outline-none focus:ring-0 focus-visible:ring-0",
                    isMobile ? "min-w-[33.333%] text-sm" : "min-w-[160px] text-base"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Scheduled Pickups</span>
                  {todayPickups.length > 0 && (
                    <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-2 rounded-full">
                      {todayPickups.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger 
                  value="awaiting"
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 h-full rounded-none border-0 relative",
                    "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                    "data-[state=active]:text-[#DB271E] data-[state=active]:font-medium",
                    "transition-all duration-200 bg-transparent",
                    "focus:outline-none focus:ring-0 focus-visible:ring-0",
                    isMobile ? "min-w-[33.333%] text-sm" : "min-w-[160px] text-base"
                  )}
                >
                  <Inbox className="h-4 w-4" />
                  <span>Awaiting Action</span>
                  {awaitingActionOrders.length > 0 && (
                    <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-0.5 px-2 rounded-full">
                      {awaitingActionOrders.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <TabsContent 
                value="new-orders" 
                className="mt-6 focus-visible:outline-none focus-visible:ring-0"
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
                      actionHref="/orders/new"
                    />
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent 
                value="pickups" 
                className="mt-6 focus-visible:outline-none focus-visible:ring-0"
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
                      actionHref="/pickups"
                    />
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent 
                value="awaiting" 
                className="mt-6 focus-visible:outline-none focus-visible:ring-0"
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
                      actionHref="/orders/new"
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
