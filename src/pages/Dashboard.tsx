
import React from 'react';
import { ArrowUp, ArrowDown, Package, Check, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent } from '@/components/ui/card';
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
    newOrders: {
      value: 78,
      percentChange: "+12.4%",
      period: "from last week"
    },
    delivered: {
      value: 485,
      percentChange: "+5.8%",
      period: "from last week"
    },
    inProgress: {
      value: 164,
      percentChange: "+2.5%",
      period: "from last week"
    },
    failedOrders: {
      value: 24,
      percentChange: "-3.2%",
      period: "from last week"
    },
    averageOrderValue: {
      value: "$142.58",
      percentChange: "+4.3%",
      period: "from last week"
    },
    collectedCash: {
      usd: 32450,
      lbp: 875400000,
      percentChange: "+7.1%",
      period: "from last week"
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-[12px]">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Hello, Walid! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">
              {currentDate} • {currentTime}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-[12px]">
          {/* New Orders */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    New Orders In
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.newOrders.value}</p>
                  <p className={cn("mt-1.5 text-xs flex items-center gap-1", 
                    dashboardData.newOrders.percentChange.includes('+') ? "text-green-600" : "text-red-500")}>
                    <span className="font-medium">{dashboardData.newOrders.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.newOrders.period}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-500" />
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
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.delivered.value}</p>
                  <p className={cn("mt-1.5 text-xs flex items-center gap-1", 
                    dashboardData.delivered.percentChange.includes('+') ? "text-green-600" : "text-red-500")}>
                    <span className="font-medium">{dashboardData.delivered.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.delivered.period}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
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
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.inProgress.value}</p>
                  <p className={cn("mt-1.5 text-xs flex items-center gap-1", 
                    dashboardData.inProgress.percentChange.includes('+') ? "text-green-600" : "text-red-500")}>
                    <span className="font-medium">{dashboardData.inProgress.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.inProgress.period}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Failed Orders */}
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Failed Orders
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.failedOrders.value}</p>
                  <p className={cn("mt-1.5 text-xs flex items-center gap-1", 
                    dashboardData.failedOrders.percentChange.includes('+') ? "text-red-500" : "text-green-600")}>
                    <span className="font-medium">{dashboardData.failedOrders.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.failedOrders.period}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
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
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.averageOrderValue.value}</p>
                  <p className={cn("mt-1.5 text-xs flex items-center gap-1", 
                    dashboardData.averageOrderValue.percentChange.includes('+') ? "text-green-600" : "text-red-500")}>
                    <span className="font-medium">{dashboardData.averageOrderValue.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.averageOrderValue.period}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-500" />
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
                  <div className="flex flex-col mt-2">
                    <p className="text-2xl font-semibold">${dashboardData.collectedCash.usd.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{dashboardData.collectedCash.lbp.toLocaleString()} LBP</p>
                  </div>
                  <p className={cn("mt-1.5 text-xs flex items-center gap-1", 
                    dashboardData.collectedCash.percentChange.includes('+') ? "text-green-600" : "text-red-500")}>
                    <span className="font-medium">{dashboardData.collectedCash.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.collectedCash.period}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
