
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { GeographicalStats } from '@/services/analytics';
import { ChartContainer } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';

interface TopRegionsChartProps {
  data?: GeographicalStats['regions'];
  isLoading?: boolean;
}

export default function TopRegionsChart({ data, isLoading = false }: TopRegionsChartProps) {
  // Process and limit data to top 5 regions
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5)
      .map(region => ({
        name: region.name,
        orders: region.totalOrders,
        successRate: region.successRate
      }));
  }, [data]);
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Orders: <span className="font-medium">{formatNumber(payload[0].value as number)}</span>
          </p>
          <p className="text-sm">
            Success Rate: <span className="font-medium">{Math.round(payload[1].value as number)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">Top Regions by Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  barSize={25}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    scale="point" 
                    padding={{ left: 15, right: 15 }} 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    yAxisId="left"
                    dataKey="orders" 
                    name="Total Orders" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="successRate" 
                    name="Success Rate" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No regional data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
