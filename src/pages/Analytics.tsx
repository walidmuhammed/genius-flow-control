import React, { useState } from 'react';
import { Info } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import CurrencyDisplay from '@/components/dashboard/CurrencyDisplay';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('financial');
  
  // Mock data
  const cashCycleData = {
    collectedCash: { usd: 2450, lbp: 65000000 },
    geniusFees: { usd: 122.5, lbp: 3250000 },
    netValue: { usd: 2327.5, lbp: 61750000 },
  };
  
  const chartData = [
    { date: 'Apr 01', usd: 150, lbp: 4500000 },
    { date: 'Apr 04', usd: 220, lbp: 6600000 },
    { date: 'Apr 08', usd: 180, lbp: 5400000 },
    { date: 'Apr 12', usd: 320, lbp: 9600000 },
    { date: 'Apr 16', usd: 280, lbp: 8400000 },
    { date: 'Apr 20', usd: 250, lbp: 7500000 },
    { date: 'Apr 24', usd: 410, lbp: 12300000 },
    { date: 'Apr 27', usd: 390, lbp: 11700000 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Measure the delivery performance of your orders over a period of time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              This month
            </Button>
            <Button variant="outline">
              Cities
            </Button>
            <Button variant="outline">
              Order Type
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-lg border bg-card">
            <TabsTrigger value="delivery" className="rounded-lg">
              Delivery Performance
            </TabsTrigger>
            <TabsTrigger value="geographical" className="rounded-lg">
              Geographical Analysis
            </TabsTrigger>
            <TabsTrigger value="financial" className="rounded-lg">
              Financial Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Delivery Success Rate</h3>
                    <p className="text-sm text-muted-foreground">The percentage of successful orders.</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Success rate based on completed orders</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-center items-center my-12">
                  <div className="relative">
                    <svg className="w-32 h-32">
                      <circle 
                        className="text-gray-200" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="56" 
                        cx="64" 
                        cy="64"
                      />
                      <circle 
                        className="text-primary" 
                        strokeWidth="10" 
                        strokeDasharray={351.9}
                        strokeDashoffset={351.9 * (1 - 84.3/100)} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="56" 
                        cx="64" 
                        cy="64"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                      84.3%
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">In the Fashion industry:</span>
                    <span className="font-medium">84.3%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">The average success rate is 84.3%</p>
                  <Button variant="link" className="text-primary text-sm p-0 mt-1">
                    Learn more
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Unsuccessful Delivery Reasons</h3>
                    <p className="text-sm text-muted-foreground">The top reasons of unsuccessful deliveries.</p>
                  </div>
                </div>
                <div className="flex justify-center items-center h-64">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <path d="m2 5 10 9 10-9" />
                        </svg>
                      </div>
                    </div>
                    <p className="font-medium mb-1">No Data</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="geographical" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">Geographical Analysis</h3>
                  <p className="text-sm text-muted-foreground">The top performing cities and their share.</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Based on successful deliveries by region</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-center items-center h-64">
                <div className="text-center text-muted-foreground">
                  <div className="mb-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                      </svg>
                    </div>
                  </div>
                  <p className="font-medium mb-1">No completed orders to show.</p>
                  <p className="text-sm">You can select a different filter to show the geographical analysis.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Cash Cycles</h3>
                    <p className="text-sm text-muted-foreground">The total Cash collected and fees for completed orders.</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Financial data from completed orders</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <CurrencyDisplay
                      label="Collected Cash"
                      usd={cashCycleData.collectedCash.usd}
                      lbp={cashCycleData.collectedCash.lbp}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <CurrencyDisplay
                      label="Genius Fees"
                      usd={cashCycleData.geniusFees.usd}
                      lbp={cashCycleData.geniusFees.lbp}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <CurrencyDisplay
                      label="Net Value"
                      usd={cashCycleData.netValue.usd}
                      lbp={cashCycleData.netValue.lbp}
                    />
                  </div>
                </div>
                
                <div className="mt-6 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="usd" 
                        stroke="#f97316" 
                        fillOpacity={1} 
                        fill="url(#colorUsd)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="link" className="text-primary">
                    View Breakdown
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Cash-outs</h3>
                    <p className="text-sm text-muted-foreground">The total revenue that has been cashed-out to you.</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Money that has been transferred to your account</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-center items-center h-64">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 14V4M17 14V20M17 14H11M7 14V4M7 14V20M7 14H1" />
                        </svg>
                      </div>
                    </div>
                    <p className="font-medium mb-1">No cash-outs took place in this date.</p>
                    <p className="text-sm">You can select a different date to show the cash-out receipts.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
