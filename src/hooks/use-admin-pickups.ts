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
    queryFn: async () => {
      const data = await getAdminPickupsWithClients();
      
      // Apply filters
      let filteredData = data;
      
      if (filters?.status && filters.status !== 'all') {
        filteredData = filteredData.filter(pickup => 
          pickup.status.toLowerCase() === filters.status?.toLowerCase()
        );
      }
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredData = filteredData.filter(pickup =>
          pickup.pickup_id?.toLowerCase().includes(search) ||
          pickup.client_business_name.toLowerCase().includes(search) ||
          pickup.client_name.toLowerCase().includes(search) ||
          pickup.location.toLowerCase().includes(search) ||
          pickup.contact_person.toLowerCase().includes(search)
        );
      }
      
      return filteredData;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
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