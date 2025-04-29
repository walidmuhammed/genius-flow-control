
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  secondaryValue?: string | number;
  progress?: number;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  secondaryValue,
  progress,
  children,
}) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-baseline">
        <h3 className="text-2xl font-bold">{value}</h3>
        {secondaryValue && (
          <span className="ml-1 text-sm text-muted-foreground">/ {secondaryValue}</span>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="mt-2">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-muted-foreground mt-1 inline-block">
            {progress}%
          </span>
        </div>
      )}
      
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      
      {children}
    </div>
  );
};

export default StatCard;
