
import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Restrict which lucide icons we use, per policy.
import {
  TrendingUp,
  TrendingDown,
  Check,
  Clock,
  DollarSign,
  AlertCircle,
  Home,
  Package,
  Inbox,
  Users
} from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value?: number | string;
  loading?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  iconColor?: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  loading,
  icon,
  subtitle,
  iconColor = "text-primary",
  className,
}) => {
  return (
    <div
      className={cn(
        "dashboard-card flex flex-col items-start justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-none select-none",
        className
      )}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gray-100 dark:bg-gray-800" style={{ minWidth: 44, minHeight: 44 }}>
          <span className={cn("w-6 h-6", iconColor)}>
            {icon}
          </span>
        </div>
        {/* For possible badge or right info in future */}
      </div>
      <div className="flex-1 flex flex-col items-start w-full">
        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</span>
        {loading ? (
          <Skeleton className="h-7 w-28 rounded" />
        ) : (
          <span className="text-[28px] font-bold leading-none text-gray-900 dark:text-white min-h-[36px]">
            {value !== undefined && value !== null ? value : '--'}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-gray-400 mt-1">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
