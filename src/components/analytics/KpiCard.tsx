
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

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
  variant?: 'default' | 'success' | 'danger' | 'warning';
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
  currencySymbol = '$',
  variant = 'default'
}: KpiCardProps) {
  const formattedValue = typeof value === 'number' 
    ? isCurrency 
      ? `${currencySymbol}${formatNumber(value)}`
      : formatNumber(value)
    : value;

  // Color mappings based on variant
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bgGradient: 'from-emerald-50/10 to-emerald-900/5',
          border: 'border-emerald-200/20',
          iconBg: 'bg-emerald-500/10',
          iconColor: 'text-emerald-500',
        };
      case 'danger':
        return {
          bgGradient: 'from-rose-50/10 to-rose-900/5',
          border: 'border-rose-200/20',
          iconBg: 'bg-rose-500/10',
          iconColor: 'text-rose-500',
        };
      case 'warning':
        return {
          bgGradient: 'from-amber-50/10 to-amber-900/5',
          border: 'border-amber-200/20',
          iconBg: 'bg-amber-500/10',
          iconColor: 'text-amber-500',
        };
      default:
        return {
          bgGradient: 'from-topspeed-50/10 to-topspeed-900/5',
          border: 'border-topspeed-200/20',
          iconBg: 'bg-topspeed-500/10',
          iconColor: 'text-topspeed-500',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all hover:shadow-md border backdrop-blur-md",
        colors.border,
        "bg-gradient-to-br", 
        colors.bgGradient,
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && (
            <div className={cn("p-1.5 rounded-lg", colors.iconBg, colors.iconColor)}>
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              {subtitle && <Skeleton className="h-4 w-1/2" />}
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold tracking-tight">{formattedValue}</div>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              {change !== undefined && (
                <div className="flex items-center mt-2 gap-1">
                  <span className={cn(
                    "flex items-center text-xs font-medium rounded px-1.5 py-0.5",
                    change > 0 
                      ? "text-emerald-700 bg-emerald-50/30" 
                      : change < 0 
                        ? "text-rose-700 bg-rose-50/30" 
                        : "text-muted-foreground"
                  )}>
                    {change > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : change < 0 ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {change > 0 ? "+" : ""}{change}%
                  </span>
                  <span className="text-xs text-muted-foreground">from previous period</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
