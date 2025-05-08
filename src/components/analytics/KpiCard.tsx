
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';

interface KpiCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  subtitle?: string;
  isCurrency?: boolean;
  currencySymbol?: string;
}

export default function KpiCard({
  title,
  value,
  change,
  icon,
  className,
  isLoading = false,
  subtitle,
  isCurrency = false,
  currencySymbol = '$'
}: KpiCardProps) {
  const formattedValue = typeof value === 'number' 
    ? isCurrency 
      ? `${currencySymbol}${formatNumber(value)}`
      : formatNumber(value)
    : value;

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            {subtitle && <Skeleton className="h-4 w-1/2" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{formattedValue}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {change !== undefined && (
              <p className={cn(
                "text-xs font-medium mt-2",
                change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {change > 0 ? "+" : ""}{change}%
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
