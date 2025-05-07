
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
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

export default function TopRegionsChart({
  data,
  isLoading = false
}: TopRegionsChartProps) {
  // Process and limit data to top 5 regions
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5).map(region => ({
      name: region.name,
      orders: region.totalOrders,
      successRate: region.successRate
    }));
  }, [data]);

  const CustomTooltip = ({
    active,
    payload,
    label
  }: TooltipProps<ValueType, NameType>) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Top Regions by Order Volume</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Top Regions by Order Volume</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{fontSize: 12}}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                <Bar yAxisId="right" dataKey="successRate" fill="#10b981" name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No regional data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
