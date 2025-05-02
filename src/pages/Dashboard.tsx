import React, { useState } from 'react';
import { Clock, CalendarIcon, PlusCircle, ArrowRight, ArrowUpRight, Package, TrendingUp, Users } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import CurrencyDisplay from '@/components/dashboard/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
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
    inProgressOrders: 5,
    headingToCustomer: 2,
    completedOrders: {
      value: 15,
      total: 18,
      progress: 83
    },
    awaitingAction: 3,
    newOrders: 8,
    headingToYou: 1,
    expectedCash: {
      usd: 1250,
      lbp: 32500000
    },
    collectedCash: {
      usd: 975,
      lbp: 25400000,
      progress: 78
    }
  };

  // Recent activity data
  const recentActivity = [{
    id: 'ORD-2305',
    type: 'Order Created',
    time: '2 hours ago',
    status: 'New',
    customer: 'Sara Haddad'
  }, {
    id: 'ORD-2304',
    type: 'Delivery Completed',
    time: '4 hours ago',
    status: 'Successful',
    customer: 'Ahmad Khalil'
  }, {
    id: 'ORD-2303',
    type: 'Payment Received',
    time: '5 hours ago',
    status: 'Paid',
    customer: 'Layla Nassif'
  }, {
    id: 'ORD-2301',
    type: 'Address Updated',
    time: '8 hours ago',
    status: 'Updated',
    customer: 'Omar Farhat'
  }];
  return <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hello, Walid! 👋</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Last updated at {currentTime} • {currentDate}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-sm border-border/20">
              <CalendarIcon className="h-4 w-4" />
              <span>April 2025</span>
            </Button>
            <Button className="h-9 gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>New Order</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-none">
          {/* Main Stats */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Today's Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="In Progress Orders" value={dashboardData.inProgressOrders.toString()} icon={<Package className="h-4 w-4 text-amber-500" />} trend="+15% vs. yesterday" className="animate-fade-in" />
                <StatCard title="Heading to Customer" value={dashboardData.headingToCustomer.toString()} icon={<TrendingUp className="h-4 w-4 text-green-500" />} className="animate-fade-in [animation-delay:100ms]" />
                <StatCard title="Completed Orders" value={dashboardData.completedOrders.value.toString()} secondaryValue={dashboardData.completedOrders.total.toString()} progress={dashboardData.completedOrders.progress} className="animate-fade-in [animation-delay:200ms]" />
                <StatCard title="Awaiting Action" value={dashboardData.awaitingAction.toString()} labelColor="text-amber-600" className="animate-fade-in [animation-delay:300ms]" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">Activity & Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="New Orders" value={dashboardData.newOrders.toString()} icon={<PlusCircle className="h-4 w-4 text-blue-500" />} className="animate-fade-in [animation-delay:400ms]" />
                <StatCard title="Expected Cash" value="" className="animate-fade-in [animation-delay:500ms]">
                  <div className="mt-2">
                    <CurrencyDisplay usdValue={dashboardData.expectedCash.usd} lbpValue={dashboardData.expectedCash.lbp.toLocaleString()} label="Total expected today" />
                  </div>
                </StatCard>
                <StatCard title="Collected Cash" value="" progress={dashboardData.collectedCash.progress} className="animate-fade-in [animation-delay:600ms]">
                  <div className="mt-1">
                    <CurrencyDisplay usdValue={dashboardData.collectedCash.usd} lbpValue={dashboardData.collectedCash.lbp.toLocaleString()} label="Total collected today" />
                  </div>
                </StatCard>
              </div>
            </div>
          </div>
          
          {/* Sidebars */}
          
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Orders Awaiting Action</h2>
          <Card className="border-border/10 shadow-sm p-4 bg-white rounded-lg">
            <Tabs defaultValue="today" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="bg-muted/30">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                  <TabsTrigger value="thisWeek">This Week</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 shadow-sm border-border/20">
                  See All Orders <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <TabsContent value="today">
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">You're all caught up! ✅</p>
                  <p className="max-w-md mx-auto mb-6">No orders are awaiting your action for today. Enjoy your productive day!</p>
                  <Button size="sm" className="gap-1.5 px-6 shadow-sm">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Order</span>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="tomorrow">
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Looking ahead! 🔍</p>
                  <p>No orders scheduled for tomorrow yet.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="thisWeek">
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Planning ahead! 📅</p>
                  <p>No orders are scheduled for this week.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </section>
      </div>
    </MainLayout>;
};
export default Dashboard;