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
      return <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Orders: <span className="font-medium">{formatNumber(payload[0].value as number)}</span>
          </p>
          <p className="text-sm">
            Success Rate: <span className="font-medium">{Math.round(payload[1].value as number)}%</span>
          </p>
        </div>;
    }
    return null;
  };
  return;
}