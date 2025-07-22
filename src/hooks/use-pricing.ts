import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getGlobalPricing,
  updateGlobalPricing,
  getClientPricingOverrides,
  createClientPricingOverride,
  updateClientPricingOverride,
  deleteClientPricingOverride,
  getZonePricingRules,
  createZonePricingRule,
  updateZonePricingRule,
  deleteZonePricingRule,
  getPackageTypePricing,
  createPackageTypePricing,
  updatePackageTypePricing,
  deletePackageTypePricing,
  getPricingChangeLogs,
  getPricingKPIs,
  calculateDeliveryFee,
  type GlobalPricing,
  type ClientPricingOverride,
  type ZonePricingRule,
  type PackageTypePricing,
} from '@/services/pricing';

// Global Pricing Hooks
export const useGlobalPricing = () => {
  return useQuery({
    queryKey: ['pricing', 'global'],
    queryFn: getGlobalPricing,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useUpdateGlobalPricing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateGlobalPricing,
    onSuccess: () => {
      // Invalidate all pricing-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      // Also invalidate specific delivery fee calculations to refresh them
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Global pricing updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating global pricing: ${error.message}`);
    },
  });
};

// Client Pricing Override Hooks
export const useClientPricingOverrides = () => {
  return useQuery({
    queryKey: ['pricing', 'client-overrides'],
    queryFn: getClientPricingOverrides,
  });
};

export const useCreateClientPricingOverride = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClientPricingOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client pricing override created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating client pricing override: ${error.message}`);
    },
    onSettled: () => {
      // Always refresh data after mutation attempt
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    }
  });
};

export const useUpdateClientPricingOverride = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Pick<ClientPricingOverride, 'fee_usd' | 'fee_lbp' | 'governorate_id' | 'city_id' | 'package_type'>> 
    }) => updateClientPricingOverride(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client pricing override updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating client pricing override: ${error.message}`);
    },
  });
};

export const useDeleteClientPricingOverride = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClientPricingOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client pricing override deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting client pricing override: ${error.message}`);
    },
  });
};

// Zone Pricing Rule Hooks
export const useZonePricingRules = () => {
  return useQuery({
    queryKey: ['pricing', 'zone-rules'],
    queryFn: getZonePricingRules,
  });
};

export const useCreateZonePricingRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createZonePricingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Zone pricing rule created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating zone pricing rule: ${error.message}`);
    },
  });
};

export const useUpdateZonePricingRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Pick<ZonePricingRule, 'fee_usd' | 'fee_lbp' | 'is_active' | 'package_type'>> 
    }) => updateZonePricingRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Zone pricing rule updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating zone pricing rule: ${error.message}`);
    },
  });
};

export const useDeleteZonePricingRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteZonePricingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Zone pricing rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting zone pricing rule: ${error.message}`);
    },
  });
};

// Package Type Pricing Hooks
export const usePackageTypePricing = () => {
  return useQuery({
    queryKey: ['pricing', 'package-types'],
    queryFn: getPackageTypePricing,
  });
};

export const useCreatePackageTypePricing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPackageTypePricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Package type pricing created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating package type pricing: ${error.message}`);
    },
  });
};

export const useUpdatePackageTypePricing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Pick<PackageTypePricing, 'fee_usd' | 'fee_lbp' | 'is_active'>> 
    }) => updatePackageTypePricing(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Package type pricing updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating package type pricing: ${error.message}`);
    },
  });
};

export const useDeletePackageTypePricing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePackageTypePricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Package type pricing deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting package type pricing: ${error.message}`);
    },
  });
};

// Change Logs Hook
export const usePricingChangeLogs = (limit: number = 50) => {
  return useQuery({
    queryKey: ['pricing', 'change-logs', limit],
    queryFn: () => getPricingChangeLogs(limit),
  });
};

// KPIs Hook
export const usePricingKPIs = () => {
  return useQuery({
    queryKey: ['pricing', 'kpis'],
    queryFn: getPricingKPIs,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Calculate Delivery Fee Hook with enhanced debugging
export const useCalculateDeliveryFee = (
  clientId: string | undefined,
  governorateId?: string,
  cityId?: string,
  packageType?: 'Parcel' | 'Document' | 'Bulky'
) => {
  return useQuery({
    queryKey: ['pricing', 'calculate', clientId, governorateId, cityId, packageType],
    queryFn: async () => {
      console.log('🎯 useCalculateDeliveryFee query function called with:', {
        clientId,
        governorateId,
        cityId,
        packageType
      });
      
      if (!clientId) {
        console.log('❌ No clientId provided, cannot calculate delivery fee');
        return null;
      }
      
      const result = await calculateDeliveryFee(clientId, governorateId, cityId, packageType);
      console.log('📊 useCalculateDeliveryFee result:', result);
      return result;
    },
    enabled: !!clientId,
    staleTime: 0, // Always fetch fresh data for accurate pricing
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};
