import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminClientKPIs, 
  getAdminClients, 
  getClientDetails, 
  createAdminClient,
  updateClientStatus,
  type AdminClientData,
  type AdminClientKPIs
} from '@/services/admin-clients';
import { toast } from 'sonner';

export const useAdminClientKPIs = () => {
  return useQuery({
    queryKey: ['admin-client-kpis'],
    queryFn: getAdminClientKPIs,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useAdminClients = () => {
  return useQuery({
    queryKey: ['admin-clients'],
    queryFn: getAdminClients,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useClientDetails = (clientId: string | null) => {
  return useQuery({
    queryKey: ['client-details', clientId],
    queryFn: () => clientId ? getClientDetails(clientId) : null,
    enabled: !!clientId,
  });
};

export const useCreateAdminClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAdminClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-client-kpis'] });
      toast.success("Client created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error creating client: ${error.message}`);
    }
  });
};

export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clientId, status }: { clientId: string, status: 'active' | 'suspended' | 'pending' }) => 
      updateClientStatus(clientId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      toast.success("Client status updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating client status: ${error.message}`);
    }
  });
};