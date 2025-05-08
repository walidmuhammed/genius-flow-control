
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';

interface DualCurrencyCardProps {
  title: string;
  valueUSD: number;
  valueLBP: number;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function DualCurrencyCard({
  title,
  valueUSD,
  valueLBP,
  icon,
  className,
  isLoading = false
}: DualCurrencyCardProps) {
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
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${formatNumber(valueUSD)}</span>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatNumber(valueLBP)}</span>
              <span className="text-xs text-muted-foreground">LBP</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
