
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MissionControlCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  chart?: React.ReactNode;
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function MissionControlCard({
  title,
  value,
  description,
  icon,
  trend,
  chart,
  isLoading = false,
  variant = 'default'
}: MissionControlCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
    danger: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
  };

  const variantValueStyles = {
    default: 'text-foreground',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('overflow-hidden backdrop-blur-lg', variantStyles[variant])}>
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {title}
              {description && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
          </div>
          {icon && <div className="opacity-80">{icon}</div>}
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <div className="flex items-baseline gap-2">
              <div className={cn('text-2xl font-bold', variantValueStyles[variant])}>{value}</div>
              {trend && (
                <div className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </div>
              )}
            </div>
          )}
        </CardContent>
        {chart && (
          <div className="px-4 pb-4">
            {isLoading ? <Skeleton className="h-12 w-full" /> : chart}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
