
import { useQuery } from '@tanstack/react-query';
import { getInvoices, getClientInvoices, getInvoiceWithOrders } from '@/services/invoices';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useInvoices = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      // Check if user is admin by looking at their role
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user?.id)
        .single();
      
      if (profile?.user_type === 'admin') {
        return getInvoices();
      } else {
        return getClientInvoices();
      }
    },
    enabled: !!user?.id,
  });
};

export const useInvoiceWithOrders = (invoiceId: string | null) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoiceId ? getInvoiceWithOrders(invoiceId) : null,
    enabled: !!invoiceId,
  });
};
