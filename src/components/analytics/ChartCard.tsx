
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

interface ChartCardProps {
  title: string;
  description?: string;
  chart: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  headerRight?: React.ReactNode;
}

export default function ChartCard({
  title,
  description,
  chart,
  footer,
  isLoading = false,
  className,
  headerRight
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn('overflow-hidden backdrop-blur-lg', className)}>
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              {description && (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
          </div>
          {headerRight && <div>{headerRight}</div>}
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            chart
          )}
        </CardContent>
        {footer && (
          <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
