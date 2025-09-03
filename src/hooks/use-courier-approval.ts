import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useApproveCourier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courierId: string) => {
      const { data, error } = await supabase.rpc('approve_courier', {
        p_courier_id: courierId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success("Courier approved successfully");
    },
    onError: (error) => {
      toast.error(`Error approving courier: ${error.message}`);
    }
  });
}

export function useRejectCourier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courierId: string) => {
      const { error } = await supabase
        .from('couriers')
        .update({ status: 'inactive' })
        .eq('id', courierId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success("Courier application rejected");
    },
    onError: (error) => {
      toast.error(`Error rejecting courier: ${error.message}`);
    }
  });
}