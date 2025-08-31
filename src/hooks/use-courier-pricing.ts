import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getCourierPricingDefaults,
  getCourierPricingOverrides,
  updateCourierPricingDefaults,
  createCourierPricingOverride,
  updateCourierPricingOverride,
  calculateCourierFee,
  CourierPricingDefaults,
  CourierPricingOverride
} from "@/services/courier-pricing";
import { toast } from "sonner";

export function useCourierPricingDefaults() {
  return useQuery({
    queryKey: ['courier-pricing-defaults'],
    queryFn: getCourierPricingDefaults
  });
}

export function useCourierPricingOverrides(courierId?: string) {
  return useQuery({
    queryKey: ['courier-pricing-overrides', courierId],
    queryFn: () => getCourierPricingOverrides(courierId)
  });
}

export function useUpdateCourierPricingDefaults() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Omit<CourierPricingDefaults, 'id' | 'created_at' | 'updated_at'>>; 
    }) => updateCourierPricingDefaults(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-pricing-defaults'] });
      toast.success("Pricing defaults updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pricing defaults: ${error.message}`);
    }
  });
}

export function useCreateCourierPricingOverride() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (override: Omit<CourierPricingOverride, 'id' | 'created_at' | 'updated_at'>) => 
      createCourierPricingOverride(override),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-pricing-overrides'] });
      toast.success("Courier pricing override created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating pricing override: ${error.message}`);
    }
  });
}

export function useUpdateCourierPricingOverride() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Omit<CourierPricingOverride, 'id' | 'created_at' | 'updated_at'>>; 
    }) => updateCourierPricingOverride(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courier-pricing-overrides'] });
      toast.success("Pricing override updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pricing override: ${error.message}`);
    }
  });
}

export function useCalculateCourierFee() {
  return useMutation({
    mutationFn: ({ 
      courierId, 
      packageType, 
      governorateId, 
      orderStatus = 'Successful' 
    }: {
      courierId: string;
      packageType: string;
      governorateId?: string;
      orderStatus?: string;
    }) => calculateCourierFee(courierId, packageType, governorateId, orderStatus),
    onError: (error) => {
      toast.error(`Error calculating courier fee: ${error.message}`);
    }
  });
}