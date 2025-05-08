
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KpiCard from '@/components/analytics/KpiCard';
import PeriodSelector from '@/components/analytics/PeriodSelector';
import { useDeliveryPerformanceStats } from '@/hooks/use-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatPercent } from '@/utils/format';
import { Package, CheckCircle, XCircle, Timer } from 'lucide-react';
import SpeedometerGauge from '@/components/analytics/SpeedometerGauge';

export default function DeliveryPerformance() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { data, isLoading } = useDeliveryPerformanceStats(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Delivery Performance</h2>
        <PeriodSelector period={period} onPeriodChange={setPeriod} />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          icon={<Package className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Successful Orders"
          value={data?.successfulOrders || 0}
          icon={<CheckCircle className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Unsuccessful Orders"
          value={data?.unsuccessfulOrders || 0}
          icon={<XCircle className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Success Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={data?.deliverySuccessOverTime?.slice(-30) || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{fontSize: 12}}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        return [
                          name === 'rate' ? `${value.toFixed(1)}%` : formatNumber(value),
                          name === 'rate' ? 'Success Rate' : name === 'successful' ? 'Successful Orders' : 'Unsuccessful Orders'
                        ];
                      }}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="successful" 
                      stackId="a" 
                      fill="#10B981" 
                      name="Successful"
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="unsuccessful" 
                      stackId="a" 
                      fill="#EF4444" 
                      name="Unsuccessful" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Success Rate"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unsuccessful Delivery Reasons Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unsuccessful Delivery Reasons</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data?.unsuccessfulReasons || []}
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="reason" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip formatter={(value: number) => [formatNumber(value), 'Count']} />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="#F97316" 
                      name="Occurrences" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Average Delivery Time Gauge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" /> Average Delivery Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center">
              <SpeedometerGauge 
                value={data?.averageDeliveryTime || 0} 
                min={0} 
                max={180} // 3 hours max
                label="minutes"
                threshold={[60, 120]} // 1-hour and 2-hour thresholds
                size={200}
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Average time from order creation to successful delivery
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
