
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import CurrencyDisplay from '@/components/dashboard/CurrencyDisplay';

const Dashboard: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Mock data for the dashboard
  const dashboardData = {
    inProgressOrders: 5,
    headingToCustomer: 2,
    completedOrders: { value: 15, total: 18, progress: 83 },
    awaitingAction: 3,
    newOrders: 8,
    headingToYou: 1,
    expectedCash: { usd: 1250, lbp: 32500000 },
    collectedCash: { usd: 975, lbp: 25400000, progress: 78 },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hello, Walid! 👋</h1>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4" />
              Last updated at {currentTime} • {currentDate}
            </p>
          </div>
        </div>

        <section className="space-y-1">
          <h2 className="text-lg font-medium">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="In Progress Orders"
              value={dashboardData.inProgressOrders.toString()}
              className="animate-fade-in"
            />
            <StatCard
              title="Heading to Customer"
              value={dashboardData.headingToCustomer.toString()}
              className="animate-fade-in [animation-delay:100ms]"
            />
            <StatCard
              title="Completed Orders"
              value={dashboardData.completedOrders.value.toString()}
              secondaryValue={dashboardData.completedOrders.total.toString()}
              progress={dashboardData.completedOrders.progress}
              className="animate-fade-in [animation-delay:200ms]"
            />
            <StatCard
              title="Awaiting Action"
              value={dashboardData.awaitingAction.toString()}
              className="animate-fade-in [animation-delay:300ms]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <StatCard
              title="New Orders"
              value={dashboardData.newOrders.toString()}
              className="animate-fade-in [animation-delay:400ms]"
            />
            <StatCard 
              title="Expected Cash"
              value=""
              className="animate-fade-in [animation-delay:500ms]"
            >
              <div className="mt-2">
                <CurrencyDisplay
                  usdValue={dashboardData.expectedCash.usd}
                  lbpValue={dashboardData.expectedCash.lbp.toLocaleString()}
                  label="Total expected today"
                />
              </div>
            </StatCard>
            <StatCard
              title="Collected Cash"
              value=""
              progress={dashboardData.collectedCash.progress}
              className="animate-fade-in [animation-delay:600ms]"
            >
              <div className="mt-1">
                <CurrencyDisplay
                  usdValue={dashboardData.collectedCash.usd}
                  lbpValue={dashboardData.collectedCash.lbp.toLocaleString()}
                  label="Total collected today"
                />
              </div>
            </StatCard>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Recent Orders</h2>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-medium mb-2">You're all caught up!</p>
              <p>No orders are awaiting your action today.</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
