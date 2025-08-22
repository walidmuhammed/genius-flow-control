import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientPayout {
  id: string;
  order_id: string;
  client_id: string;
  collected_amount_usd: number;
  collected_amount_lbp: number;
  delivery_fee_usd: number;
  delivery_fee_lbp: number;
  net_payout_usd: number;
  net_payout_lbp: number;
  payout_status: 'Pending' | 'In Progress' | 'Paid';
  invoice_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  order?: {
    id: string;
    order_id: number;
    reference_number: string;
    type: string;
    package_type: string;
    customer?: {
      name: string;
      phone: string;
      city_name?: string;
      governorate_name?: string;
    };
  };
  client?: {
    id: string;
    full_name?: string;
    business_name?: string;
    phone?: string;
  };
}

export interface GroupedClientPayouts {
  client: {
    id: string;
    full_name?: string;
    business_name?: string;
    phone?: string;
  };
  payouts: ClientPayout[];
  totalPendingUSD: number;
  totalPendingLBP: number;
  orderCount: number;
}

// Fetch all client payouts with order and client details
export function useClientPayouts() {
  return useQuery({
    queryKey: ['client-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_payouts')
        .select(`
          *,
          order:order_id(
            id,
            order_id,
            reference_number,
            type,
            package_type,
            customer:customer_id(
              name,
              phone,
              cities:city_id(name),
              governorates:governorate_id(name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client payouts:', error);
        throw error;
      }

      return data?.map(payout => ({
        ...payout,
        order: payout.order ? {
          ...payout.order,
          customer: payout.order.customer ? {
            ...payout.order.customer,
            city_name: payout.order.customer.cities?.name,
            governorate_name: payout.order.customer.governorates?.name
          } : undefined
        } : undefined
      })) as ClientPayout[] || [];
    }
  });
}

// Fetch client payouts grouped by client
export function useGroupedClientPayouts() {
  return useQuery({
    queryKey: ['grouped-client-payouts'],
    queryFn: async () => {
      // First fetch payouts with order details
      const { data: payouts, error: payoutsError } = await supabase
        .from('client_payouts')
        .select(`
          *,
          order:order_id(
            id,
            order_id,
            reference_number,
            type,
            package_type,
            customer:customer_id(
              name,
              phone,
              cities:city_id(name),
              governorates:governorate_id(name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (payoutsError) {
        console.error('Error fetching client payouts:', payoutsError);
        throw payoutsError;
      }

      // Get unique client IDs
      const clientIds = [...new Set(payouts?.map(p => p.client_id) || [])];
      
      // Fetch client details
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select('id, full_name, business_name, phone')
        .in('id', clientIds);

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw clientsError;
      }

      // Group payouts by client
      const grouped: Record<string, GroupedClientPayouts> = {};

      payouts?.forEach(payout => {
        if (!grouped[payout.client_id]) {
          const client = clients?.find(c => c.id === payout.client_id);
          grouped[payout.client_id] = {
            client: client || { id: payout.client_id },
            payouts: [],
            totalPendingUSD: 0,
            totalPendingLBP: 0,
            orderCount: 0
          };
        }

        const group = grouped[payout.client_id];
        group.payouts.push({
          ...payout,
          order: payout.order ? {
            ...payout.order,
            customer: payout.order.customer ? {
              ...payout.order.customer,
              city_name: payout.order.customer.cities?.name,
              governorate_name: payout.order.customer.governorates?.name
            } : undefined
          } : undefined,
          client: group.client
        } as ClientPayout);

        // Add to totals if status is Pending
        if (payout.payout_status === 'Pending') {
          group.totalPendingUSD += payout.net_payout_usd || 0;
          group.totalPendingLBP += payout.net_payout_lbp || 0;
        }
        group.orderCount++;
      });

      return Object.values(grouped);
    }
  });
}

// Fetch client payouts grouped by client (filtered - excluding paid orders)
export function useGroupedFilteredClientPayouts() {
  return useQuery({
    queryKey: ['grouped-filtered-client-payouts'],
    queryFn: async () => {
      // First fetch payouts with order details, excluding paid payouts and paid orders
      const { data: payouts, error: payoutsError } = await supabase
        .from('client_payouts')
        .select(`
          *,
          order:order_id(
            id,
            order_id,
            reference_number,
            type,
            package_type,
            status,
            invoice_id,
            payment_status,
            customer:customer_id(
              name,
              phone,
              cities:city_id(name),
              governorates:governorate_id(name)
            )
          )
        `)
        .in('payout_status', ['Pending', 'In Progress'])
        .order('created_at', { ascending: false });

      if (payoutsError) {
        console.error('Error fetching filtered client payouts:', payoutsError);
        throw payoutsError;
      }

      // Filter out payouts for orders that are already invoiced or paid
      const filteredPayouts = payouts?.filter(payout => {
        const order = payout.order as any;
        // Exclude orders that already have an invoice_id or are paid
        return order && !order.invoice_id && order.payment_status !== 'paid';
      }) || [];

      console.log('🔍 Total payouts fetched:', payouts?.length);
      console.log('🔍 Filtered payouts (excluding invoiced/paid):', filteredPayouts.length);

      // Get unique client IDs from filtered payouts
      const clientIds = [...new Set(filteredPayouts.map(p => p.client_id))];
      
      if (clientIds.length === 0) {
        return {};
      }
      
      // Fetch client details
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select('id, full_name, business_name, phone')
        .in('id', clientIds);

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw clientsError;
      }

      // Group payouts by client
      const grouped: Record<string, GroupedClientPayouts> = {};

      filteredPayouts.forEach(payout => {
        if (!grouped[payout.client_id]) {
          const client = clients?.find(c => c.id === payout.client_id);
          grouped[payout.client_id] = {
            client: client || { id: payout.client_id },
            payouts: [],
            totalPendingUSD: 0,
            totalPendingLBP: 0,
            orderCount: 0
          };
        }

        const group = grouped[payout.client_id];
        group.payouts.push({
          ...payout,
          order: payout.order ? {
            ...payout.order,
            customer: payout.order.customer ? {
              ...payout.order.customer,
              city_name: payout.order.customer.cities?.name,
              governorate_name: payout.order.customer.governorates?.name
            } : undefined
          } : undefined,
          client: group.client
        } as ClientPayout);

        // Add to totals if status is Pending
        if (payout.payout_status === 'Pending') {
          group.totalPendingUSD += payout.net_payout_usd || 0;
          group.totalPendingLBP += payout.net_payout_lbp || 0;
        }
        group.orderCount++;
      });

      return grouped;
    }
  });
}

// Update payout status
export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      payoutIds, 
      status, 
      invoiceId 
    }: { 
      payoutIds: string[], 
      status: 'Pending' | 'In Progress' | 'Paid',
      invoiceId?: string 
    }) => {
      const updates: any = { 
        payout_status: status,
        updated_at: new Date().toISOString()
      };
      
      if (invoiceId) {
        updates.invoice_id = invoiceId;
      }

      const { data, error } = await supabase
        .from('client_payouts')
        .update(updates)
        .in('id', payoutIds)
        .select();

      if (error) {
        console.error('Error updating payout status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['grouped-client-payouts'] });
      toast.success('Payout status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating payout status:', error);
      toast.error('Failed to update payout status');
    }
  });
}