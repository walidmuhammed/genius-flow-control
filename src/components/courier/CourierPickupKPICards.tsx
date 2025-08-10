import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Clock, Truck, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { CourierPickupStats } from '@/services/courier-pickups';

interface CourierPickupKPICardsProps {
  stats: CourierPickupStats;
  isLoading?: boolean;
}

const CourierPickupKPICards: React.FC<CourierPickupKPICardsProps> = ({ 
  stats, 
  isLoading 
}) => {
  const kpiCards = [
    {
      title: 'Total Assigned Pickups',
      value: stats.totalPickups,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Scheduled',
      value: stats.totalScheduled,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'In Progress',
      value: stats.totalInProgress,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: stats.totalCompleted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Canceled',
      value: stats.totalCanceled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Cash to Collect (USD)',
      value: formatCurrency(stats.totalCashToCollectUSD, 'USD'),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: `${formatCurrency(stats.totalCashToCollectLBP, 'LBP')} LBP`
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                {card.description && (
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CourierPickupKPICards;