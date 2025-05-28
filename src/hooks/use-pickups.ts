
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getPickups, 
  getPickupById, 
  createPickup, 
  updatePickup, 
  getPickupsByStatus,
  Pickup 
} from "@/services/pickups";
import { toast } from "sonner";

export function usePickups() {
  return useQuery({
    queryKey: ['pickups'],
    queryFn: getPickups
  });
}

export function usePickupsByStatus(status: Pickup['status'] | undefined) {
  return useQuery({
    queryKey: ['pickups', 'status', status],
    queryFn: () => status ? getPickupsByStatus(status) : Promise.resolve([]),
    enabled: !!status
  });
}

export function usePickup(id: string | undefined) {
  return useQuery({
    queryKey: ['pickup', id],
    queryFn: () => id ? getPickupById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useCreatePickup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pickup: Omit<Pickup, 'id' | 'pickup_id' | 'created_at' | 'updated_at'>) => 
      createPickup(pickup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      toast.success("Pickup created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating pickup: ${error.message}`);
    }
  });
}

export function useUpdatePickup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Omit<Pickup, 'id' | 'pickup_id' | 'created_at' | 'updated_at'>> }) => 
      updatePickup(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickup', variables.id] });
      toast.success("Pickup updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pickup: ${error.message}`);
    }
  });
}
