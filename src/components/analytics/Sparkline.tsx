
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip as RechartsTooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface SparklineProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
  isLoading?: boolean;
}

export default function Sparkline({
  data,
  color = '#f97316',
  height = 40,
  showTooltip = false,
  isLoading = false
}: SparklineProps) {
  if (isLoading) {
    return <Skeleton className={`w-full h-[${height}px]`} />;
  }

  return (
    <div style={{ width: '100%', height: `${height}px` }} className="sparkline overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          {showTooltip && (
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded px-2 py-1 text-xs shadow-lg">
                      <p>{`Date: ${payload[0].payload.date}`}</p>
                      <p>{`Value: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          {showTooltip && <XAxis dataKey="date" hide />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`${color}25`}
            strokeWidth={1.5}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
