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

        {/* Tabbed Data Section - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <Tabs defaultValue="new-orders" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200/50 dark:border-gray-700/30">
              <TabsList className={cn(
                "w-full grid bg-transparent gap-1 p-1",
                isMobile ? "grid-cols-3 h-12" : "grid-cols-3 h-16"
              )}>
                <TabsTrigger 
                  value="new-orders" 
                  className={cn(
                    "rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-1 data-[state=active]:bg-[#DB271E] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700/40",
                    isMobile ? "text-xs py-2 px-2" : "text-base py-3 px-4"
                  )}
                >
                  <ShoppingCart className={cn("h-3 w-3", !isMobile && "h-5 w-5")} />
                  <div className="flex flex-col items-center">
                    <span className={isMobile ? "text-xs" : ""}>New Orders</span>
                    {todayOrders.length > 0 && (
                      <span className="bg-white/20 text-white text-xs py-0.5 px-1.5 rounded-full mt-0.5">
                        {todayOrders.length}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="pickups" 
                  className={cn(
                    "rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-1 data-[state=active]:bg-[#DB271E] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700/40",
                    isMobile ? "text-xs py-2 px-2" : "text-base py-3 px-4"
                  )}
                >
                  <Calendar className={cn("h-3 w-3", !isMobile && "h-5 w-5")} />
                  <div className="flex flex-col items-center">
                    <span className={isMobile ? "text-xs" : ""}>Pickups</span>
                    {todayPickups.length > 0 && (
                      <span className="bg-white/20 text-white text-xs py-0.5 px-1.5 rounded-full mt-0.5">
                        {todayPickups.length}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="awaiting" 
                  className={cn(
                    "rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-1 data-[state=active]:bg-[#DB271E] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700/40",
                    isMobile ? "text-xs py-2 px-2" : "text-base py-3 px-4"
                  )}
                >
                  <Inbox className={cn("h-3 w-3", !isMobile && "h-5 w-5")} />
                  <div className="flex flex-col items-center">
                    <span className={isMobile ? "text-xs" : ""}>Awaiting</span>
                    {awaitingActionOrders.length > 0 && (
                      <span className="bg-white/20 text-white text-xs py-0.5 px-1.5 rounded-full mt-0.5">
                        {awaitingActionOrders.length}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <AnimatePresence mode="wait">
              <TabsContent 
                value="new-orders" 
                className="animate-in fade-in-50 mt-4 transition-all duration-300"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4"
                >
                  <h3 className={cn("font-semibold mb-4 text-gray-800 dark:text-gray-100", isMobile ? "text-base" : "text-lg")}>Today's New Orders</h3>
                  {todayOrders.length > 0 ? (
                    isMobile ? (
                      <OrdersTableMobile 
                        orders={todayOrders}
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
                className="animate-in fade-in-50 mt-4 transition-all duration-300"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4"
                >
                  <h3 className={cn("font-semibold mb-4 text-gray-800 dark:text-gray-100", isMobile ? "text-base" : "text-lg")}>Today's Scheduled Pickups</h3>
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
                className="animate-in fade-in-50 mt-4 transition-all duration-300"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4"
                >
                  <h3 className={cn("font-semibold mb-4 text-gray-800 dark:text-gray-100", isMobile ? "text-base" : "text-lg")}>Orders Awaiting Action</h3>
                  {awaitingActionOrders.length > 0 ? (
                    isMobile ? (
                      <OrdersTableMobile 
                        orders={awaitingActionOrders}
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
