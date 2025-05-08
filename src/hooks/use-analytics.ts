
import { useQuery } from '@tanstack/react-query';
import { 
  getDashboardStats, 
  getSparklineData,
  getFinancialStats,
  getGeographicalStats,
  getDeliveryPerformanceStats,
  getSalesInsightsStats
} from '@/services/analytics';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useSparklineData(metric: 'orders' | 'successful' | 'failed' | 'cash') {
  return useQuery({
    queryKey: ['sparklineData', metric],
    queryFn: () => getSparklineData(metric),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useFinancialStats(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return useQuery({
    queryKey: ['financialStats', period],
    queryFn: () => getFinancialStats(period),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useGeographicalStats() {
  return useQuery({
    queryKey: ['geographicalStats'],
    queryFn: getGeographicalStats,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useDeliveryPerformanceStats(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
  return useQuery({
    queryKey: ['deliveryPerformanceStats', period],
    queryFn: () => getDeliveryPerformanceStats(period),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useSalesInsightsStats() {
  return useQuery({
    queryKey: ['salesInsightsStats'],
    queryFn: getSalesInsightsStats,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}
