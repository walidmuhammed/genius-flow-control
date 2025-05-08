
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialStats } from '@/hooks/use-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';
import { DollarSign, CreditCard, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DualCurrencyCard from './DualCurrencyCard';
import PeriodSelector from './PeriodSelector';

export default function FinancialSummary() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { data, isLoading } = useFinancialStats(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Financial Summary</h2>
        <PeriodSelector period={period} onPeriodChange={setPeriod} />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DualCurrencyCard
          title="Collected Amount"
          valueUSD={data?.cashCollected.usd || 0}
          valueLBP={data?.cashCollected.lbp || 0}
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <DualCurrencyCard
          title="Total Fees"
          valueUSD={data?.deliveryFees.usd || 0}
          valueLBP={data?.deliveryFees.lbp || 0}
          icon={<CreditCard className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <DualCurrencyCard
          title="Net Value"
          valueUSD={data?.netValue.usd || 0}
          valueLBP={data?.netValue.lbp || 0}
          icon={<Wallet className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cash Flow Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="usd" className="w-full">
            <div className="flex justify-end mb-2">
              <TabsList>
                <TabsTrigger value="usd">USD</TabsTrigger>
                <TabsTrigger value="lbp">LBP</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="usd">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data?.cashFlow || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          // Format depending on period
                          if (period === 'daily') {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }
                          return value;
                        }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tickFormatter={(value) => `$${formatNumber(value)}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${formatNumber(value)}`, 'USD']}
                        labelFormatter={(label) => {
                          if (period === 'daily') {
                            const date = new Date(label);
                            return date.toLocaleDateString();
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="usd" 
                        name="Cash Collected (USD)" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="lbp">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data?.cashFlow || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          // Format depending on period
                          if (period === 'daily') {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }
                          return value;
                        }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatNumber(value), 'LBP']}
                        labelFormatter={(label) => {
                          if (period === 'daily') {
                            const date = new Date(label);
                            return date.toLocaleDateString();
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="lbp" 
                        name="Cash Collected (LBP)" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
