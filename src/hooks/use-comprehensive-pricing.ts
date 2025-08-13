import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getZonePricing,
  createZonePricing,
  updateZonePricing,
  deleteZonePricing,
  getGlobalPackageExtras,
  updateGlobalPackageExtra,
  calculateComprehensiveDeliveryFee,
  batchUpdateZonePricing,
  type ZonePricing,
  type GlobalPackageExtra,
  type PricingCalculationResult
} from '@/services/comprehensive-pricing';

// Zone Pricing Hooks
export function useZonePricing() {
  return useQuery({
    queryKey: ['zone-pricing'],
    queryFn: getZonePricing
  });
}

export function useCreateZonePricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ governorateId, feeUsd, feeLbp }: {
      governorateId: string;
      feeUsd: number;
      feeLbp: number;
    }) => createZonePricing(governorateId, feeUsd, feeLbp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-pricing'] });
      toast.success('Zone pricing created successfully');
    },
    onError: (error) => {
      console.error('Error creating zone pricing:', error);
      toast.error('Failed to create zone pricing');
    }
  });
}

export function useUpdateZonePricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: {
      id: string;
      updates: { fee_usd?: number; fee_lbp?: number };
    }) => updateZonePricing(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-pricing'] });
      toast.success('Zone pricing updated successfully');
    },
    onError: (error) => {
      console.error('Error updating zone pricing:', error);
      toast.error('Failed to update zone pricing');
    }
  });
}

export function useDeleteZonePricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteZonePricing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-pricing'] });
      toast.success('Zone pricing deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting zone pricing:', error);
      toast.error('Failed to delete zone pricing');
    }
  });
}

export function useBatchUpdateZonePricing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Array<{
      governorate_id: string;
      fee_usd: number;
      fee_lbp: number;
    }>) => batchUpdateZonePricing(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-pricing'] });
      toast.success('Zone pricing updated successfully');
    },
    onError: (error) => {
      console.error('Error batch updating zone pricing:', error);
      toast.error('Failed to update zone pricing');
    }
  });
}

// Global Package Extras Hooks
export function useGlobalPackageExtras() {
  return useQuery({
    queryKey: ['global-package-extras'],
    queryFn: getGlobalPackageExtras
  });
}

export function useUpdateGlobalPackageExtra() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ packageType, extraUsd, extraLbp }: {
      packageType: 'Parcel' | 'Document' | 'Bulky';
      extraUsd: number;
      extraLbp: number;
    }) => updateGlobalPackageExtra(packageType, extraUsd, extraLbp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-package-extras'] });
      toast.success('Package extra updated successfully');
    },
    onError: (error) => {
      console.error('Error updating package extra:', error);
      toast.error('Failed to update package extra');
    }
  });
}

// Comprehensive delivery fee calculation hook
export function useComprehensiveDeliveryFee(
  clientId?: string,
  governorateId?: string,
  cityId?: string,
  packageType?: 'Parcel' | 'Document' | 'Bulky'
) {
  return useQuery({
    queryKey: ['comprehensive-delivery-fee', clientId, governorateId, cityId, packageType],
    queryFn: () => calculateComprehensiveDeliveryFee(clientId, governorateId, cityId, packageType),
    enabled: !!(clientId || governorateId), // Enable when we have at least client or location
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true
  });
}