import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCourierPickupStats, 
  getCourierPickupsWithDetails, 
  updateCourierPickupStatus,
  CourierPickupStats,
  CourierPickupWithClient 
} from "@/services/courier-pickups";
import { toast } from "sonner";

export function useCourierPickupStats() {
  return useQuery<CourierPickupStats>({
    queryKey: ['courier-pickup-stats'],
    queryFn: getCourierPickupStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCourierPickups(filters?: { 
  status?: string; 
  search?: string; 
  dateFrom?: string; 
  dateTo?: string; 
  packageType?: string; 
}) {
  return useQuery<CourierPickupWithClient[]>({
    queryKey: ['courier-pickups', filters],
    queryFn: () => getCourierPickupsWithDetails({
      status: filters?.status,
      search: filters?.search,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      packageType: filters?.packageType,
      limit: 100
    }),
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchInterval: false, // Disable automatic refetching for better performance
    refetchOnWindowFocus: false,
  });
}

export function useCourierPickupsByStatus(status: string) {
  return useQuery<CourierPickupWithClient[]>({
    queryKey: ['courier-pickups-by-status', status],
    queryFn: () => getCourierPickupsWithDetails({ status, limit: 100 }),
    staleTime: 10000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateCourierPickupStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pickupId, status, reason }: { 
      pickupId: string; 
      status: string; 
      reason?: string; 
    }) => updateCourierPickupStatus(pickupId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-pickup-stats'] });
      queryClient.invalidateQueries({ queryKey: ['courier-pickups'] });
      queryClient.invalidateQueries({ queryKey: ['courier-pickups-by-status'] });
      toast.success("Pickup status updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pickup status: ${error.message}`);
    }
  });
}