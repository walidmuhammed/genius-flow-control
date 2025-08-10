import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { CourierPickupStats } from '@/services/courier-pickups';

interface CourierPickupsFilterTabsProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  stats: CourierPickupStats | undefined;
  isLoading: boolean;
  activeFilterCount: number;
}

const CourierPickupsFilterTabs: React.FC<CourierPickupsFilterTabsProps> = ({
  statusFilter,
  onStatusFilterChange,
  stats,
  isLoading,
  activeFilterCount,
}) => {
  const statusFilters = [
    { value: 'all', label: 'All', count: stats?.totalPickups || 0, icon: Package },
    { value: 'scheduled', label: 'Scheduled', count: stats?.totalScheduled || 0, icon: Clock },
    { value: 'assigned', label: 'Assigned', count: stats?.totalAssigned || 0, icon: Truck },
    { value: 'in progress', label: 'In Progress', count: stats?.totalInProgress || 0, icon: Clock },
    { value: 'completed', label: 'Completed', count: stats?.totalCompleted || 0, icon: CheckCircle },
    { value: 'canceled', label: 'Canceled', count: stats?.totalCanceled || 0, icon: XCircle },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {statusFilters.map((filter) => {
        const isActive = statusFilter === filter.value;
        const Icon = filter.icon;
        return (
          <Button
            key={filter.value}
            variant={isActive ? undefined : "outline"}
            size="sm"
            onClick={() => onStatusFilterChange(filter.value)}
            className={
              isActive
                ? "bg-[#DB271E] text-white hover:bg-[#c0211a] border-none shadow-sm shadow-[#DB271E]/10"
                : "border border-input bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground"
            }
            disabled={isLoading}
          >
            <Icon className={`h-4 w-4 mr-1 ${isActive ? 'text-white' : 'text-[#DB271E]'}`} />
            {filter.label}
            {isActive && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default CourierPickupsFilterTabs;