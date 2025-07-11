
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCouriers, 
  getCourierById, 
  createCourier, 
  updateCourier, 
  deleteCourier,
  getCourierOrders,
  getCourierPickups,
  uploadCourierFile,
  Courier 
} from "@/services/couriers";
import { toast } from "sonner";

export function useCouriers() {
  return useQuery({
    queryKey: ['couriers'],
    queryFn: getCouriers
  });
}

export function useCourier(id: string | undefined) {
  return useQuery({
    queryKey: ['courier', id],
    queryFn: () => id ? getCourierById(id) : Promise.resolve(null),
    enabled: !!id
  });
}

export function useCreateCourier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courier: Omit<Courier, 'id' | 'created_at'>) => 
      createCourier(courier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success("Courier created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating courier: ${error.message}`);
    }
  });
}

export function useUpdateCourier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Omit<Courier, 'id' | 'created_at'>> }) => 
      updateCourier(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      queryClient.invalidateQueries({ queryKey: ['courier', variables.id] });
      toast.success("Courier updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating courier: ${error.message}`);
    }
  });
}

export function useDeleteCourier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCourier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success("Courier deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting courier: ${error.message}`);
    }
  });
}

export function useCourierOrders(courierId: string | undefined) {
  return useQuery({
    queryKey: ['courier-orders', courierId],
    queryFn: () => courierId ? getCourierOrders(courierId) : Promise.resolve([]),
    enabled: !!courierId
  });
}

export function useCourierPickups(courierName: string | undefined) {
  return useQuery({
    queryKey: ['courier-pickups', courierName],
    queryFn: () => courierName ? getCourierPickups(courierName) : Promise.resolve([]),
    enabled: !!courierName
  });
}

export function useUploadCourierFile() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File, type: 'avatar' | 'id_photo' | 'license_photo' }) => 
      uploadCourierFile(file, type),
    onError: (error) => {
      toast.error(`Error uploading file: ${error.message}`);
    }
  });
}
