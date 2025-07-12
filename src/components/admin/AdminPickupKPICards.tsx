import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, Clock, XCircle, DollarSign, TrendingUp } from 'lucide-react';
import { AdminPickupStats } from '@/services/admin-pickups';
import { formatCurrency } from '@/utils/format';

interface AdminPickupKPICardsProps {
  stats: AdminPickupStats;
  isLoading?: boolean;
}

const AdminPickupKPICards: React.FC<AdminPickupKPICardsProps> = ({ stats, isLoading }) => {
  const kpiCards = [
    {
      title: 'Total Pickups Today',
      value: stats.totalPickups,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Assigned Pickups',
      value: stats.totalAssigned + stats.totalInProgress,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Completed Pickups',
      value: stats.totalCompleted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Canceled',
      value: stats.totalCanceled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Cash to Collect (USD)',
      value: formatCurrency(stats.totalCashToCollect.usd, 'USD'),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      isAmount: true,
    },
    {
      title: 'Success Rate',
      value: `${stats.pickupSuccessRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpiCards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <span className={card.isAmount || card.isPercentage ? 'text-lg' : ''}>
                  {card.value}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.title === 'Total Pickups Today' && 'All pickup requests'}
              {card.title === 'Assigned Pickups' && 'Active & in progress'}
              {card.title === 'Completed Pickups' && 'Successfully finished'}
              {card.title === 'Canceled' && 'Canceled or failed'}
              {card.title === 'Cash to Collect (USD)' && `LBP ${formatCurrency(stats.totalCashToCollect.lbp, 'LBP')}`}
              {card.title === 'Success Rate' && 'Completed vs total'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminPickupKPICards;