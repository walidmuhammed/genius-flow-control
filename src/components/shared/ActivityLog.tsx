
import React from 'react';
import { format } from 'date-fns';
import { Clock, Package, TrendingUp, Check, X, ArrowRight, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityLogItem {
  timestamp: string;
  user: string;
  action: string;
}

interface ActivityLogProps {
  items: ActivityLogItem[];
  className?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ items, className }) => {
  const getIconForAction = (action: string) => {
    if (action.includes('created')) return <Package className="h-4 w-4" />;
    if (action.includes('status changed')) return <TrendingUp className="h-4 w-4" />;
    if (action.includes('successful')) return <Check className="h-4 w-4" />;
    if (action.includes('unsuccessful')) return <X className="h-4 w-4" />;
    if (action.includes('progress')) return <ArrowRight className="h-4 w-4" />;
    if (action.includes('paid')) return <DollarSign className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getColorForAction = (action: string) => {
    if (action.includes('created')) return 'bg-blue-100 text-blue-600';
    if (action.includes('successful')) return 'bg-emerald-100 text-emerald-600';
    if (action.includes('unsuccessful')) return 'bg-red-100 text-red-600';
    if (action.includes('picked up')) return 'bg-green-100 text-green-600';
    if (action.includes('progress')) return 'bg-yellow-100 text-yellow-600';
    if (action.includes('paid')) return 'bg-indigo-100 text-indigo-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (!items.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-500">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {items.map((log, index) => (
        <div key={index} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="relative flex-shrink-0">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", getColorForAction(log.action))}>
              {getIconForAction(log.action)}
            </div>
            {index < items.length - 1 && (
              <div className="absolute top-10 bottom-0 left-[15px] w-0.5 -ml-px bg-gray-200 h-full" />
            )}
          </div>
          <div className="flex-1 pb-5">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-1">
              <p className="font-medium text-gray-900">{log.user}</p>
              <p className="text-xs text-gray-500 mt-0.5 sm:mt-0">{format(new Date(log.timestamp), 'PPP p')}</p>
            </div>
            <p className="text-sm text-gray-700">{log.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
