
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

const DashboardCard = ({ title, value, icon, trend, className }: DashboardCardProps) => {
  return (
    <div className={cn('genius-card', className)}>
      <div className="genius-card-gradient" />
      <div className="relative z-10">
        <div className="genius-icon-container">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span className={cn(
              "text-xs font-medium flex items-center",
              trend.positive ? "text-green-600" : "text-red-500"
            )}>
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
