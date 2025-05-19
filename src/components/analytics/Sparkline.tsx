
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
  isLoading?: boolean;
  className?: string;
  gradientOpacity?: number;
}

export default function Sparkline({
  data,
  color = '#ea384d',
  height = 40,
  showTooltip = false,
  isLoading = false,
  className,
  gradientOpacity = 0.2
}: SparklineProps) {
  if (isLoading) {
    return <Skeleton className={cn(`w-full h-[${height}px]`, className)} />;
  }

  // Ensure we have data and it's properly formatted
  const validData = Array.isArray(data) && data.length > 0 ? data : [];

  if (validData.length === 0) {
    return (
      <div className={cn(`h-[${height}px] w-full flex items-center justify-center`, className)}>
        <p className="text-xs text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }} className={cn("sparkline overflow-hidden", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={validData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg px-3 py-2 text-xs shadow-lg backdrop-blur-lg">
                      <p className="font-medium">{`Date: ${payload[0].payload.date}`}</p>
                      <p className="font-medium">{`Value: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <defs>
            <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={gradientOpacity} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
            strokeWidth={2}
            animationDuration={500}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
