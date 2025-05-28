
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, AlertCircle, DollarSign, ShoppingCart, Calendar, Inbox } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils/format';
import { getOrders } from '@/services/orders';
import { getPickups } from '@/services/pickups';
import { EmptyState } from '@/components/ui/empty-state';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const today = new Date();
  const dayStart = new Date(today);
  dayStart.setHours(0, 0, 0, 0);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedPickups, setSelectedPickups] = useState<string[]>([]);

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

  // Filter orders with "Awaiting Action" status
  const awaitingActionOrders = allOrders.filter(order => order.status === 'New' || order.status === 'Pending Pickup' || order.status === 'Unsuccessful');

  // Calculate total expected cash from today's orders
  const todayTotalCash = todayOrders.reduce((total, order) => {
    return total + (Number(order.cash_collection_usd) || 0);
  }, 0);

  // Filter pickups scheduled for today
  const todayPickups = allPickups.filter(pickup => {
    const pickupDate = new Date(pickup.pickup_date);
    const todayDate = new Date();
    return pickupDate.toDateString() === todayDate.toDateString();
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Greeting Header */}
        <AnimatePresence>
          <motion.div className="space-y-2" initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
            <motion.h2 className="text-3xl font-bold tracking-tight text-gray-800" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.2,
              duration: 0.5
            }}>
              Hello, Welcome
            </motion.h2>
            <motion.p className="text-gray-500" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              delay: 0.4,
              duration: 0.5
            }}>
              Today's Overview — {formatDate(new Date())}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Overview Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* New Orders Card */}
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1,
            duration: 0.5
          }} whileHover={{
            y: -4,
            transition: {
              duration: 0.2
            }
          }}>
            <Card className="overflow-hidden border-0 shadow-lg shadow-blue-500/5 bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 shadow-sm">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500">New Orders</h3>
                  <div className="text-2xl font-bold text-gray-800">
                    {isOrdersLoading ? '--' : todayOrders.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">The new orders registered today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* In Progress Card */}
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2,
            duration: 0.5
          }} whileHover={{
            y: -4,
            transition: {
              duration: 0.2
            }
          }}>
            <Card className="overflow-hidden border-0 shadow-lg shadow-amber-500/5 bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                  <div className="text-2xl font-bold text-gray-800">
                    {isOrdersLoading ? '--' : inProgressOrders.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Orders filtered as In Progress</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Awaiting Action Card */}
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3,
            duration: 0.5
          }} whileHover={{
            y: -4,
            transition: {
              duration: 0.2
            }
          }}>
            <Card className="overflow-hidden border-0 shadow-lg shadow-orange-500/5 bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-500 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500">Awaiting Action</h3>
                  <div className="text-2xl font-bold text-gray-800">
                    {isOrdersLoading ? '--' : awaitingActionOrders.length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Orders requiring intervention</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Expected Cash Card */}
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4,
            duration: 0.5
          }} whileHover={{
            y: -4,
            transition: {
              duration: 0.2
            }
          }}>
            <Card className="overflow-hidden border-0 shadow-lg shadow-emerald-500/5 bg-white rounded-2xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 shadow-sm">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-gray-500">Expected Cash</h3>
                  <div className="text-2xl font-bold text-gray-800">
                    {isOrdersLoading ? '--' : `$${todayTotalCash.toFixed(2)}`}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total amount of today's orders</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link to="/orders/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#DC291E] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c0211a] transition-colors"
            >
              Create New Order
            </motion.button>
          </Link>
          <Link to="/schedule-pickup">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Schedule Pickup
            </motion.button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
