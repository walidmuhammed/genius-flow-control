
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, Package, Clock, CheckCircle, AlertTriangle, CreditCard, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/hooks/use-analytics';
import CurrencyToggle from '@/components/analytics/CurrencyToggle';
import Sparkline from '@/components/analytics/Sparkline';
import KpiCard from '@/components/analytics/KpiCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialSummary from '@/components/analytics/FinancialSummary';
import DeliveryPerformance from '@/components/analytics/DeliveryPerformance';
import TopRegionsChart from '@/components/analytics/TopRegionsChart';
import { cn } from '@/lib/utils';
import { useSparklineData } from '@/hooks/use-analytics';

const Dashboard: React.FC = () => {
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: ordersSparkline, isLoading: isOrdersSparklineLoading } = useSparklineData('orders');

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Mission Control</h1>
            <p className="text-muted-foreground mt-1">Real-time delivery analytics and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyToggle currency={currency} onChange={setCurrency} />
            <Button variant="outline" size="sm" className="gap-1">
              <span>Refresh</span>
              <span className="sr-only">Refresh dashboard data</span>
            </Button>
          </div>
        </div>

        {/* Quick stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Active Orders"
            value={isStatsLoading ? '--' : dashboardStats?.ordersInTransit?.toString() || '0'}
            trend={0} // Fixed: using a default value instead of ordersTrend
            icon={<Package className="h-5 w-5" />}
            description="Currently in transit"
            chartData={ordersSparkline}
            isLoading={isStatsLoading || isOrdersSparklineLoading}
            trendLabel="from last period"
          />
          
          <StatsCard 
            title="Today's Deliveries"
            value={isStatsLoading ? '--' : dashboardStats?.ordersCreatedToday?.toString() || '0'}
            trend={8.2}
            icon={<Clock className="h-5 w-5" />}
            description="Orders for today"
            isLoading={isStatsLoading}
            trendLabel="from yesterday"
          />
          
          <StatsCard 
            title="Success Rate"
            value={isStatsLoading ? '--' : `${Math.round(dashboardStats?.successRate || 0)}%`}
            trend={0} // Fixed: using a default value instead of successRateTrend
            icon={<CheckCircle className="h-5 w-5" />}
            description="Successful deliveries"
            variant="success"
            isLoading={isStatsLoading}
            trendLabel="vs target"
          />
          
          <StatsCard 
            title="Failed Deliveries"
            value={isStatsLoading ? '--' : dashboardStats?.failedDeliveries?.toString() || '0'}
            trend={0} // Fixed: using a default value instead of failedTrend
            icon={<AlertTriangle className="h-5 w-5" />}
            description="This week"
            variant="danger"
            isLoading={isStatsLoading}
            trendLabel="change"
          />
        </div>

        {/* Key metrics and custom charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-card/30 backdrop-blur-md border-b border-border/10 pb-2">
              <CardTitle className="text-lg font-semibold flex justify-between items-center">
                <span>Revenue Snapshot</span>
                <Badge variant="outline" className="font-normal">Real-time</Badge>
              </CardTitle>
              <CardDescription>
                Daily revenue breakdown and collection performance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Today's Collection ({currency})</div>
                  <div className="text-3xl font-bold">
                    {currency === 'USD' 
                      ? `$${dashboardStats?.cashCollected?.usd || 0}` // Fixed: using cashCollected instead of cashCollectedToday
                      : `${dashboardStats?.cashCollected?.lbp || 0} LBP` // Fixed: using cashCollected instead of cashCollectedToday
                    }
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Badge variant="outline" className="bg-topspeed-50/30 text-topspeed-800 py-0 px-1.5">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+12%</span>
                    </Badge>
                    <span className="text-muted-foreground">vs. last week</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Delivery Fees ({currency})</div>
                  <div className="text-3xl font-bold">
                    {currency === 'USD' 
                      ? `$${dashboardStats?.deliveryFees?.usd || 0}`
                      : `${dashboardStats?.deliveryFees?.lbp || 0} LBP`
                    }
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Badge variant="outline" className="bg-emerald-50/30 text-emerald-800 py-0 px-1.5">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+5%</span>
                    </Badge>
                    <span className="text-muted-foreground">vs. last week</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[250px] mt-6">
                {/* Placeholder for the main revenue chart */}
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Advanced revenue chart loading...</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/10 bg-card/30 backdrop-blur-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span>View Full Report</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-card/30 backdrop-blur-md border-b border-border/10 pb-2">
              <CardTitle className="text-lg font-semibold flex justify-between items-center">
                <span>Performance Metrics</span>
                <Badge variant="outline" className="font-normal">Today</Badge>
              </CardTitle>
              <CardDescription>
                Key operational indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 px-3">
              <div className="space-y-5">
                <MetricItem 
                  label="Delivery Efficiency"
                  value={94}
                  target={90}
                  unit="%"
                  status="success"
                />
                <MetricItem 
                  label="On-time Rate" 
                  value={87} 
                  target={95}
                  unit="%"
                  status="warning"
                />
                <MetricItem 
                  label="Cash Collection" 
                  value={99} 
                  target={99}
                  unit="%"
                  status="success"
                />
                <MetricItem 
                  label="Customer Satisfaction" 
                  value={4.8} 
                  target={4.5}
                  unit="/5"
                  status="success"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/10 bg-card/30 backdrop-blur-md">
              <Button variant="ghost" size="sm" className="w-full">View All Metrics</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="delivery" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="delivery" className="rounded-full text-base">
              Delivery Performance
            </TabsTrigger>
            <TabsTrigger value="financial" className="rounded-full text-base">
              Financial Summary
            </TabsTrigger>
            <TabsTrigger value="regional" className="rounded-full text-base">
              Regional Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-4 animate-in fade-in-50">
            <DeliveryPerformance />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 animate-in fade-in-50">
            <FinancialSummary />
          </TabsContent>

          <TabsContent value="regional" className="space-y-4 animate-in fade-in-50">
            <Card className="overflow-hidden">
              <CardHeader className="bg-card/30 backdrop-blur-md border-b border-border/10 pb-2">
                <CardTitle className="text-xl font-semibold">Regional Distribution</CardTitle>
                <CardDescription>Orders and performance by geographic region</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <TopRegionsChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  chartData?: { date: string; value: number }[];
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend = 0,
  trendLabel = "vs previous",
  variant = "default",
  chartData,
  isLoading = false
}) => {
  // Determine color scheme based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'from-emerald-500/5 to-emerald-900/5 border-emerald-500/10';
      case 'danger':
        return 'from-rose-500/5 to-rose-900/5 border-rose-500/10';
      case 'warning':
        return 'from-amber-500/5 to-amber-900/5 border-amber-500/10';
      default:
        return 'from-topspeed-500/5 to-topspeed-900/5 border-topspeed-500/10';
    }
  };

  const getTrendColor = () => {
    if (trend === 0) return 'text-muted-foreground';
    if (variant === 'danger') {
      return trend > 0 ? 'text-rose-500' : 'text-emerald-500';
    }
    return trend > 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  const getTrendIcon = () => {
    if (trend === 0) return null;
    return trend > 0 ? 
      <TrendingUp className="h-3 w-3 mr-1" /> : 
      <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "overflow-hidden border backdrop-blur-lg", 
        getVariantClasses(),
        "bg-gradient-to-br"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "p-2 rounded-lg",
              variant === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
              variant === 'danger' ? 'bg-rose-500/10 text-rose-500' :
              variant === 'warning' ? 'bg-amber-500/10 text-amber-500' :
              'bg-topspeed-500/10 text-topspeed-500'
            )}>
              {icon}
            </div>
            
            {trend !== 0 && (
              <div className={cn("flex items-center text-xs font-medium", getTrendColor())}>
                {getTrendIcon()}
                {trend > 0 ? '+' : ''}{Math.abs(trend)}%
                <span className="ml-1 text-muted-foreground text-[10px]">{trendLabel}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="text-2xl font-bold">{isLoading ? '--' : value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          
          {chartData && chartData.length > 0 && (
            <div className="mt-4 h-10">
              <Sparkline 
                data={chartData} 
                isLoading={isLoading} 
                color={
                  variant === 'success' ? '#10b981' :
                  variant === 'danger' ? '#e11d48' :
                  variant === 'warning' ? '#f59e0b' :
                  '#ea384d'
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Metric Item Component
interface MetricItemProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  status: 'success' | 'warning' | 'danger';
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, target, unit, status }) => {
  const percentage = (value / target) * 100;
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'danger': return 'bg-rose-500';
      default: return 'bg-topspeed-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{value}{unit}</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full", getStatusColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Target: {target}{unit}</span>
        <span className={cn(
          "font-medium",
          status === 'success' ? 'text-emerald-500' :
          status === 'warning' ? 'text-amber-500' :
          'text-rose-500'
        )}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
