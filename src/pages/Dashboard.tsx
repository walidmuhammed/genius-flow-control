import React from 'react';
import { Clock, CalendarIcon, PlusCircle, ArrowRight, Package, TrendingUp, Users, Info } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import { CurrencyType } from '@/components/dashboard/CurrencySelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    totalRevenue: {
      value: "$712,241",
      percentChange: "+4.7%",
      period: "from last week"
    },
    totalCustomers: {
      value: "4,213",
      percentChange: "+3.2%", 
      period: "from last week"
    },
    totalTransactions: {
      value: "563",
      percentChange: "-1.8%",
      period: "from last week" 
    },
    totalProducts: {
      value: "882",
      percentChange: "+1.2%",
      period: "from last week"
    },
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
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Hello, Walid! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">
              {currentDate} • {currentTime}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              className="text-sm font-medium bg-white border-gray-200 shadow-sm"
            >
              Export data
            </Button>
            <Button 
              className="text-sm font-medium bg-[#46d483] hover:bg-[#3ac476] text-white shadow-sm"
            >
              + Connect wallet
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Total Revenue <Info className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.totalRevenue.value}</p>
                  <p className={cn(
                    "mt-1.5 text-xs flex items-center gap-1",
                    dashboardData.totalRevenue.percentChange.includes('+') ? "text-green-600" : "text-red-500"
                  )}>
                    <span className="font-medium">{dashboardData.totalRevenue.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.totalRevenue.period}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Total Customers <Info className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.totalCustomers.value}</p>
                  <p className={cn(
                    "mt-1.5 text-xs flex items-center gap-1",
                    dashboardData.totalCustomers.percentChange.includes('+') ? "text-green-600" : "text-red-500"
                  )}>
                    <span className="font-medium">{dashboardData.totalCustomers.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.totalCustomers.period}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Total Transactions <Info className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.totalTransactions.value}</p>
                  <p className={cn(
                    "mt-1.5 text-xs flex items-center gap-1",
                    dashboardData.totalTransactions.percentChange.includes('+') ? "text-green-600" : "text-red-500"
                  )}>
                    <span className="font-medium">{dashboardData.totalTransactions.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.totalTransactions.period}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 rounded-lg shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    Total Products <Info className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                  </h3>
                  <p className="mt-2 text-3xl font-semibold">{dashboardData.totalProducts.value}</p>
                  <p className={cn(
                    "mt-1.5 text-xs flex items-center gap-1",
                    dashboardData.totalProducts.percentChange.includes('+') ? "text-green-600" : "text-red-500"
                  )}>
                    <span className="font-medium">{dashboardData.totalProducts.percentChange}</span> 
                    <span className="text-gray-500">{dashboardData.totalProducts.period}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-0 rounded-lg shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex p-1 gap-1 bg-gray-100 rounded-md mx-auto">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="drafts" 
                  className="px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  Drafts
                </TabsTrigger>
                <TabsTrigger 
                  value="process" 
                  className="px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  To process <span className="ml-1.5 h-5 w-5 inline-flex items-center justify-center bg-gray-200 rounded-full text-xs">14</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger 
                  value="cancelled" 
                  className="px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  Cancelled
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery" 
                  className="px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
                >
                  On delivery
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">
                      <div className="flex items-center">
                        <input type="checkbox" className="rounded mr-4" />
                        Order
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">Date</th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">Categories</th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">Cust ID</th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">Payment</th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">Status</th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">City</th>
                    <th className="py-4 px-6 text-left font-medium text-sm text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <input type="checkbox" className="rounded mr-4" />
                        <span>Flexy Chair dark oak</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">27/06/24</td>
                    <td className="py-4 px-6 text-sm text-gray-600">Chairs</td>
                    <td className="py-4 px-6 text-sm text-gray-600">#61391</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">To process</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">Jakarta</td>
                    <td className="py-4 px-6 text-sm font-medium">$183</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <input type="checkbox" className="rounded mr-4" />
                        <span>Zenith Sofa</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">27/06/24</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span>Kitchen</span>
                        <span>Electronics</span>
                        <span>Living room</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">#61390</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">To process</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">Philadelphia</td>
                    <td className="py-4 px-6 text-sm font-medium">$2,499</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center p-4 border-t border-gray-100">
              <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <div className="flex gap-1">
                <button className="h-8 w-8 bg-[#46d483] text-white rounded-md flex items-center justify-center text-sm">1</button>
                <button className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center text-sm">2</button>
                <button className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center text-sm">3</button>
                <button className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center text-sm">4</button>
                <button className="h-8 px-2 text-gray-500 flex items-center justify-center text-sm">...</button>
                <button className="h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center text-sm">13</button>
              </div>
              <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
