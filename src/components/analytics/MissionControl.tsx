
import React from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, TrendingDown, Check, AlertTriangle, DollarSign, AreaChart } from 'lucide-react';
import { useDashboardStats, useSparklineData, useGeographicalStats } from '@/hooks/use-analytics';
import MissionControlCard from './MissionControlCard';
import Sparkline from './Sparkline';
import ProgressRing from './ProgressRing';
import { formatNumber, formatCurrency } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import TopRegionsChart from './TopRegionsChart';
import RegionalSummary from './RegionalSummary';

export default function MissionControl() {
  const {
    data: dashboardStats,
    isLoading: isStatsLoading
  } = useDashboardStats();
  const {
    data: ordersSparkline,
    isLoading: isOrdersSparklineLoading
  } = useSparklineData('orders');
  const {
    data: successSparkline,
    isLoading: isSuccessSparklineLoading
  } = useSparklineData('successful');
  const {
    data: failedSparkline,
    isLoading: isFailedSparklineLoading
  } = useSparklineData('failed');
  const {
    data: cashSparkline,
    isLoading: isCashSparklineLoading
  } = useSparklineData('cash');
  const {
    data: geoStats,
    isLoading: isGeoStatsLoading
  } = useGeographicalStats();

  return <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Orders Created Today */}
        <MissionControlCard title="Orders Created Today" value={isStatsLoading ? '-' : formatNumber(dashboardStats?.ordersCreatedToday || 0)} icon={<Package className="h-4 w-4 text-muted-foreground" />} isLoading={isStatsLoading} chart={<Sparkline data={ordersSparkline || []} isLoading={isOrdersSparklineLoading} showTooltip={false} />} />
        
        {/* Orders in Transit */}
        <MissionControlCard title="Orders in Transit" value={isStatsLoading ? '-' : formatNumber(dashboardStats?.ordersInTransit || 0)} icon={<TrendingUp className="h-4 w-4 text-blue-500" />} isLoading={isStatsLoading} variant="default" />
        
        {/* Successful Orders */}
        <MissionControlCard title="Successful Orders" value={isStatsLoading ? '-' : formatNumber(dashboardStats?.successfulOrders || 0)} icon={<Check className="h-4 w-4 text-green-500" />} trend={dashboardStats?.successRate ? {
        value: Math.round(dashboardStats.successRate),
        isPositive: true
      } : undefined} isLoading={isStatsLoading} variant="success" chart={<Sparkline data={successSparkline || []} color="#10b981" isLoading={isSuccessSparklineLoading} showTooltip={false} />} />
        
        {/* Failed Deliveries */}
        <MissionControlCard title="Failed Deliveries" value={isStatsLoading ? '-' : formatNumber(dashboardStats?.failedDeliveries || 0)} icon={<AlertTriangle className="h-4 w-4 text-red-500" />} isLoading={isStatsLoading} variant="danger" chart={<Sparkline data={failedSparkline || []} color="#ef4444" isLoading={isFailedSparklineLoading} showTooltip={false} />} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Cash Collected */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              Cash Collected
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-muted-foreground">USD</div>
                <div className="text-2xl font-bold text-orange-700">
                  {isStatsLoading ? '-' : formatCurrency(dashboardStats?.cashCollected.usd || 0, 'USD')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">LBP</div>
                <div className="text-2xl font-bold text-orange-700">
                  {isStatsLoading ? '-' : formatCurrency(dashboardStats?.cashCollected.lbp || 0, 'LBP')}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Sparkline data={cashSparkline || []} color="#f97316" height={60} isLoading={isCashSparklineLoading} showTooltip={true} />
            </div>
          </CardContent>
        </Card>
        
        {/* Delivery Fees Earned */}
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AreaChart className="h-4 w-4 text-blue-500" />
              Delivery Fees Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-center items-center">
              {isStatsLoading ? <div className="h-[120px] w-[120px] flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div> : <ProgressRing value={dashboardStats?.deliveryFees.percentage || 0} color="#3b82f6" size={140} strokeWidth={10} label="of daily target" />}
            </div>
            
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <div className="text-muted-foreground">USD</div>
                <div className="font-medium">
                  {isStatsLoading ? '-' : formatCurrency(dashboardStats?.deliveryFees.usd || 0, 'USD')}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">LBP</div>
                <div className="font-medium">
                  {isStatsLoading ? '-' : formatCurrency(dashboardStats?.deliveryFees.lbp || 0, 'LBP')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Courier */}
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Courier Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isStatsLoading ? <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                </div>
              </div> : dashboardStats?.topCourier ? <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={dashboardStats.topCourier.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {dashboardStats.topCourier.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{dashboardStats.topCourier.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mt-1">
                      {dashboardStats.topCourier.ordersCompleted} orders
                    </Badge>
                  </div>
                </div>
              </div> : <div className="text-center py-6 text-muted-foreground">
                No couriers active today
              </div>}
          </CardContent>
        </Card>
      </div>
      
      {/* Regional Analytics Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <TopRegionsChart data={geoStats?.regions} isLoading={isGeoStatsLoading} />
        </div>
        <div className="md:col-span-1">
          <RegionalSummary data={geoStats?.regions} isLoading={isGeoStatsLoading} />
        </div>
      </div>
    </div>;
}
