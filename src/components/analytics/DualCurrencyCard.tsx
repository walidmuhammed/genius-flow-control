
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';
import { motion } from 'framer-motion';

interface DualCurrencyCardProps {
  title: string;
  valueUSD: number;
  valueLBP: number;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  subtitle?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

export default function DualCurrencyCard({
  title,
  valueUSD,
  valueLBP,
  icon,
  className,
  isLoading = false,
  subtitle,
  variant = 'default'
}: DualCurrencyCardProps) {
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
              <Skeleton className="h-8 w-3/4" />
              {subtitle && <Skeleton className="h-4 w-1/2" />}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">${formatNumber(valueUSD)}</span>
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100/30 px-2 py-0.5 text-xs font-medium text-blue-700">USD</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">{formatNumber(valueLBP)}</span>
                <span className="inline-flex items-center justify-center rounded-full bg-green-100/30 px-2 py-0.5 text-xs font-medium text-green-700">LBP</span>
              </div>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
