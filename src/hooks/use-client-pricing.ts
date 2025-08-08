import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getClientDefaults,
  getClientDefault,
  createOrUpdateClientDefault,
  deleteClientDefault,
  getClientZoneRules,
  createClientZoneRule,
  updateClientZoneRule,
  deleteClientZoneRule,
  getClientPackageExtras,
  createOrUpdateClientPackageExtra,
  deleteClientPackageExtra,
  getClientPricingConfiguration,
  getAllClientPricingConfigurations,
  type ClientPricingDefault,
  type ClientZoneRule,
  type ClientPackageExtra,
} from '@/services/client-pricing';
import { supabase } from '@/integrations/supabase/client';


// Client Default Pricing Hooks
export const useClientDefaults = () => {
  return useQuery({
    queryKey: ['pricing', 'client-defaults'],
    queryFn: getClientDefaults,
  });
};

export const useClientDefault = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['pricing', 'client-default', clientId],
    queryFn: () => clientId ? getClientDefault(clientId) : Promise.resolve(null),
    enabled: !!clientId,
  });
};

export const useCreateOrUpdateClientDefault = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, pricing }: { 
      clientId: string; 
      pricing: Pick<ClientPricingDefault, 'default_fee_usd' | 'default_fee_lbp'> 
    }) => createOrUpdateClientDefault(clientId, pricing),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-default', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configuration', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client default pricing updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating client default pricing: ${error.message}`);
    },
  });
};

export const useDeleteClientDefault = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClientDefault,
    onSuccess: (_, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-default', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configuration', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client default pricing deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting client default pricing: ${error.message}`);
    },
  });
};

// Client Zone Rules Hooks
export const useClientZoneRules = (clientId?: string) => {
  return useQuery({
    queryKey: ['pricing', 'client-zone-rules', clientId],
    queryFn: () => getClientZoneRules(clientId),
  });
};

export const useCreateClientZoneRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createClientZoneRule,
    onSuccess: (_, rule) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-zone-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configuration', rule.client_id] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client zone rule created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating client zone rule: ${error.message}`);
    },
  });
};

export const useUpdateClientZoneRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: Partial<Pick<ClientZoneRule, 'governorate_ids' | 'fee_usd' | 'fee_lbp' | 'rule_name'>>
    }) => updateClientZoneRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-zone-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client zone rule updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating client zone rule: ${error.message}`);
    },
  });
};

export const useDeleteClientZoneRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteClientZoneRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-zone-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client zone rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting client zone rule: ${error.message}`);
    },
  });
};

// Client Package Extras Hooks
export const useClientPackageExtras = (clientId?: string) => {
  return useQuery({
    queryKey: ['pricing', 'client-package-extras', clientId],
    queryFn: () => getClientPackageExtras(clientId),
  });
};

export const useCreateOrUpdateClientPackageExtra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, packageType, pricing }: { 
      clientId: string; 
      packageType: 'Parcel' | 'Document' | 'Bulky';
      pricing: Pick<ClientPackageExtra, 'extra_fee_usd' | 'extra_fee_lbp'>
    }) => createOrUpdateClientPackageExtra(clientId, packageType, pricing),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-package-extras', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configuration', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client package extra updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating client package extra: ${error.message}`);
    },
  });
};

export const useDeleteClientPackageExtra = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, packageType }: { clientId: string; packageType: string }) => 
      deleteClientPackageExtra(clientId, packageType),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-package-extras', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configuration', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client package extra deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting client package extra: ${error.message}`);
    },
  });
};

// Complete Client Configuration Hooks
export const useClientPricingConfiguration = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['pricing', 'client-configuration', clientId],
    queryFn: () => clientId ? getClientPricingConfiguration(clientId) : Promise.resolve(null),
    enabled: !!clientId,
  });
};

export const useAllClientPricingConfigurations = () => {
  return useQuery({
    queryKey: ['pricing', 'client-configurations'],
    queryFn: getAllClientPricingConfigurations,
  });
};

// Atomic delete for entire client pricing configuration (calls RPC)
export const useDeleteClientPricingConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase.rpc('delete_client_pricing_configuration', { p_client_id: clientId });
      if (error) throw error;
    },
    onSuccess: (_data, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configuration', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-default', clientId] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-zone-rules'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'client-package-extras'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'calculate'] });
      toast.success('Client pricing configuration deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting client pricing configuration: ${error.message}`);
    },
  });
};