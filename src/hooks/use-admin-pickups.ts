import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAdminPickupStats, 
  getAdminPickupsWithClients, 
  updatePickupStatus, 
  assignCourierToPickup,
  getAvailableCouriers,
  AdminPickupStats,
  AdminPickupWithClient 
} from "@/services/admin-pickups";
import { toast } from "sonner";

export function useAdminPickupStats() {
  return useQuery<AdminPickupStats>({
    queryKey: ['admin-pickup-stats'],
    queryFn: getAdminPickupStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminPickupsWithClients(filters?: { status?: string; search?: string }) {
  return useQuery<AdminPickupWithClient[]>({
    queryKey: ['admin-pickups-with-clients', filters],
    queryFn: () => getAdminPickupsWithClients({
      status: filters?.status,
      search: filters?.search,
      limit: 100 // Reasonable limit for performance
    }),
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 30000, // Refresh every 30 seconds instead of 15
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });
}

export function useAvailableCouriers() {
  return useQuery({
    queryKey: ['available-couriers'],
    queryFn: getAvailableCouriers
  });
}

export function useUpdatePickupStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pickupId, status }: { pickupId: string; status: string }) =>
      updatePickupStatus(pickupId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pickup-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pickups-with-clients'] });
      toast.success("Pickup status updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pickup status: ${error.message}`);
    }
  });
}

export function useAssignCourierToPickup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pickupId, courierName, courierPhone }: { 
      pickupId: string; 
      courierName: string; 
      courierPhone?: string; 
    }) => assignCourierToPickup(pickupId, courierName, courierPhone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pickup-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pickups-with-clients'] });
      toast.success("Courier assigned successfully");
    },
    onError: (error) => {
      toast.error(`Error assigning courier: ${error.message}`);
    }
  });
}