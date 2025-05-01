
import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  trend?: string;
  icon?: React.ReactNode;
  progress?: number;
  children?: React.ReactNode;
  className?: string;
  labelColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  secondaryValue,
  trend,
  icon,
  progress,
  children,
  className,
  labelColor
}) => {
  return (
    <Card
      className={cn(
        "stat-card border-border/10 shadow-sm hover:border-border/20 transition-all overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className={cn("text-sm font-medium", labelColor)}>{title}</h3>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
        
        {value && (
          <div className="flex items-end gap-1.5 mb-1">
            <div className="text-2xl font-bold">{value}</div>
            {secondaryValue && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                of <span>{secondaryValue}</span>
              </div>
            )}
          </div>
        )}
        
        {trend && (
          <div className="flex items-center gap-1.5 text-xs mb-2">
            {trend.includes('+') ? (
              <span className="flex items-center text-green-500 font-medium">
                <ArrowUp className="h-3 w-3" /> {trend}
              </span>
            ) : trend.includes('-') ? (
              <span className="flex items-center text-red-500 font-medium">
                <ArrowDown className="h-3 w-3" /> {trend}
              </span>
            ) : (
              <span className="text-muted-foreground">{trend}</span>
            )}
          </div>
        )}
        
        {progress !== undefined && (
          <div className="mt-1 mb-2">
            <div className="w-full bg-muted/50 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}
        
        {children}
      </div>
    </Card>
  );
};

export default StatCard;
