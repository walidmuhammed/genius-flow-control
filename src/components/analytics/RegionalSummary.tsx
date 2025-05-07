
import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { GeographicalStats } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils/format';
import { Progress } from '@/components/ui/progress';

interface RegionalSummaryProps {
  data?: GeographicalStats['regions'];
  isLoading?: boolean;
}

export default function RegionalSummary({ data, isLoading = false }: RegionalSummaryProps) {
  // Find most active governorate (by total orders)
  const mostActiveGovernorate = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    return data.reduce((prev, current) => 
      current.totalOrders > prev.totalOrders ? current : prev
    );
  }, [data]);

  // Calculate total orders by region
  const totalOrdersByRegion = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .map(region => ({
        name: region.name,
        orders: region.totalOrders,
        percentage: data.reduce((sum, r) => sum + r.totalOrders, 0) > 0 
          ? (region.totalOrders / data.reduce((sum, r) => sum + r.totalOrders, 0)) * 100
          : 0
      }));
  }, [data]);
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-semibold">Regional Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Most Active Governorate */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Most Active Governorate Today
              </h3>
              
              {mostActiveGovernorate ? (
                <div className="bg-primary/5 rounded-md p-3 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-md p-2">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-lg">{mostActiveGovernorate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(mostActiveGovernorate.totalOrders)} orders | {Math.round(mostActiveGovernorate.successRate)}% success rate
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-muted-foreground bg-muted/50 rounded-md">
                  No data available
                </div>
              )}
            </div>
            
            {/* Distribution by Region */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Order Distribution by Region
              </h3>
              
              {totalOrdersByRegion.length > 0 ? (
                <div className="space-y-3">
                  {totalOrdersByRegion.slice(0, 5).map((region, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{region.name}</span>
                        <span className="font-medium">{formatNumber(region.orders)}</span>
                      </div>
                      <Progress value={region.percentage} className="h-2" />
                      <div className="text-xs text-right text-muted-foreground">
                        {Math.round(region.percentage)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No regional data available
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
